import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  timeout: 120_000, // o cerere agățată nu blochează pipeline-ul (rutele au maxDuration 60-90s)
  maxRetries: 1,
});

/**
 * Modelul default al aplicației (rutele de producție).
 * Pipeline-ul CV acceptă config per apel — vezi CallConfig/PipelineConfig.
 *
 * NOTĂ: gpt-5.5 NU suportă `temperature` (doar default 1 — verificat empiric).
 */
export const OPENAI_MODEL = "gpt-5.5";

export type ReasoningEffort = "minimal" | "low" | "medium" | "high";

/** Config pentru UN apel AI (model + adâncimea reasoning-ului). */
export interface CallConfig {
  model: string;
  /** omis dacă modelul nu suportă parametrul */
  reasoning_effort?: ReasoningEffort;
}

/** Config pentru întregul pipeline (matricea de test C0–C8). */
export interface PipelineConfig {
  name: string; // ex. "C3_mini_54"
  call1: CallConfig; // întrebările recrutorului
  call2: CallConfig; // bullet points
}

/**
 * Configurația de PRODUCȚIE a pipeline-ului — decizia userului după
 * matricea de test (iul 2026): gpt-5.4 pe ambele apeluri (config C2,
 * ~33% din costul gpt-5.5, calitate echivalentă la evaluarea oarbă).
 * Notă: gpt-5.4 respinge `reasoning_effort` — se rulează default.
 */
export const PIPELINE_PROD_CONFIG: PipelineConfig = {
  name: "prod_54_full",
  call1: { model: "gpt-5.4" },
  call2: { model: "gpt-5.4" },
};

/** Prețuri de referință USD / 1M tokeni (din instrucțiunea de test).
 * Cached input ≈ 10% din prețul de input. Reasoning = output. */
export const MODEL_PRICES: Record<string, { input: number; output: number }> = {
  "gpt-5.5": { input: 5.0, output: 30.0 },
  "gpt-5.4": { input: 2.5, output: 15.0 },
  "gpt-5.4-mini": { input: 0.75, output: 4.5 },
  "gpt-5.4-nano": { input: 0.2, output: 1.25 },
  "gpt-5.1": { input: 1.25, output: 10.0 },
};

export interface CallUsage {
  stage: string;
  model: string;
  promptTokens: number;
  cachedTokens: number;
  completionTokens: number;
  reasoningTokens: number;
  costUSD: number;
  /** câte re-încercări au fost necesare pentru JSON valid */
  jsonRetries: number;
  /** modelul a respins parametrul reasoning_effort */
  effortRejected: boolean;
}

export function computeCostUSD(
  model: string,
  promptTokens: number,
  cachedTokens: number,
  completionTokens: number
): number {
  const p = MODEL_PRICES[model] ?? MODEL_PRICES["gpt-5.5"];
  const uncached = Math.max(0, promptTokens - cachedTokens);
  return (
    (uncached * p.input + cachedTokens * p.input * 0.1 + completionTokens * p.output) /
    1_000_000
  );
}

export interface StructuredCallOptions {
  /** Etichetă pentru logging (ex: "apel1-intrebari") */
  stage: string;
  systemPrompt: string;
  userContent: string;
  schemaName: string;
  /** JSON Schema strict: toate obiectele au additionalProperties:false + required complet */
  jsonSchema: Record<string, unknown>;
  model?: string;
  reasoningEffort?: ReasoningEffort;
  maxCompletionTokens?: number;
  /** telemetrie per apel (usage + cost) */
  onUsage?: (usage: CallUsage) => void;
}

export class StructuredCallError extends Error {
  constructor(
    message: string,
    public readonly stage: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "StructuredCallError";
  }
}

/**
 * Apel OpenAI cu Structured Outputs (response_format json_schema, strict:true).
 * - retry O SINGURĂ DATĂ la JSON invalid / refuz / eroare de rețea
 * - dacă modelul respinge `reasoning_effort`, reia automat fără parametru
 * - loghează + raportează usage complet (prompt/cached/completion/reasoning + cost)
 */
export async function callStructured<T>(opts: StructuredCallOptions): Promise<T> {
  const model = opts.model ?? OPENAI_MODEL;
  let jsonRetries = 0;
  let effortRejected = false;
  let includeEffort = Boolean(opts.reasoningEffort);

  const attempt = async (retryFeedback?: {
    previousRaw: string;
    error: string;
  }): Promise<T> => {
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: opts.systemPrompt },
      { role: "user", content: opts.userContent },
    ];
    if (retryFeedback) {
      messages.push(
        { role: "assistant", content: retryFeedback.previousRaw || "(gol)" },
        {
          role: "user",
          content: `Răspunsul anterior a fost invalid: ${retryFeedback.error}. Corectează și răspunde STRICT conform schemei JSON cerute, nimic altceva.`,
        }
      );
    }

    const doRequest = async () =>
      openai.chat.completions.create({
        model,
        messages,
        max_completion_tokens: opts.maxCompletionTokens ?? 8192,
        ...(includeEffort && opts.reasoningEffort
          ? { reasoning_effort: opts.reasoningEffort }
          : {}),
        response_format: {
          type: "json_schema",
          json_schema: {
            name: opts.schemaName,
            strict: true,
            schema: opts.jsonSchema,
          },
        },
      });

    let response;
    try {
      response = await doRequest();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      // modelul nu suportă reasoning_effort → reia fără, o singură dată
      if (includeEffort && /reasoning_effort|reasoning\.effort|unsupported/i.test(msg)) {
        includeEffort = false;
        effortRejected = true;
        console.warn(`[cv-pipeline][${opts.stage}] ${model} a respins reasoning_effort → reiau fără`);
        response = await doRequest();
      } else {
        throw e;
      }
    }

    const usage = response.usage;
    const promptTokens = usage?.prompt_tokens ?? 0;
    const cachedTokens = usage?.prompt_tokens_details?.cached_tokens ?? 0;
    const completionTokens = usage?.completion_tokens ?? 0;
    const reasoningTokens =
      usage?.completion_tokens_details?.reasoning_tokens ?? 0;
    const costUSD = computeCostUSD(model, promptTokens, cachedTokens, completionTokens);

    console.log(
      `[cv-pipeline][${opts.stage}] model=${response.model} prompt=${promptTokens} (cached=${cachedTokens}) completion=${completionTokens} (reasoning=${reasoningTokens}) cost=$${costUSD.toFixed(4)}`
    );
    opts.onUsage?.({
      stage: opts.stage,
      model,
      promptTokens,
      cachedTokens,
      completionTokens,
      reasoningTokens,
      costUSD,
      jsonRetries,
      effortRejected,
    });

    const choice = response.choices[0];
    if (choice.message.refusal) {
      throw new Error(`Model refusal: ${choice.message.refusal}`);
    }
    const raw = choice.message.content ?? "";
    try {
      return JSON.parse(raw) as T;
    } catch {
      const err = new Error(`JSON invalid la parse (${raw.slice(0, 120)}...)`);
      (err as Error & { raw?: string }).raw = raw;
      throw err;
    }
  };

  try {
    return await attempt();
  } catch (firstError) {
    const msg =
      firstError instanceof Error ? firstError.message : String(firstError);
    const raw = (firstError as Error & { raw?: string })?.raw ?? "";
    jsonRetries = 1;
    console.warn(`[cv-pipeline][${opts.stage}] retry după eroare: ${msg}`);
    try {
      return await attempt({ previousRaw: raw, error: msg });
    } catch (secondError) {
      const msg2 =
        secondError instanceof Error ? secondError.message : String(secondError);
      throw new StructuredCallError(
        `Etapa "${opts.stage}" a eșuat după retry: ${msg2}`,
        opts.stage,
        secondError
      );
    }
  }
}
