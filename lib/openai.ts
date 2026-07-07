import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/**
 * Modelul folosit pentru TOATE etapele AI ale pipeline-ului CV.
 * Un singur loc de schimbat când optimizăm costul per etapă.
 *
 * NOTĂ: gpt-5.5 NU suportă parametrul `temperature` (doar valoarea default 1
 * — verificat empiric, API-ul răspunde 400). Controlul determinismului se
 * face prin prompturi stricte + Structured Outputs (json_schema strict).
 */
export const OPENAI_MODEL = "gpt-5.5";

export interface StructuredCallOptions {
  /** Etichetă pentru logging (ex: "etapa1-extraction") */
  stage: string;
  systemPrompt: string;
  userContent: string;
  /** Numele schemei (cerut de OpenAI json_schema) */
  schemaName: string;
  /** JSON Schema strict: toate obiectele au additionalProperties:false + required complet */
  jsonSchema: Record<string, unknown>;
  model?: string;
  maxCompletionTokens?: number;
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
 * - retry O SINGURĂ DATĂ la JSON invalid / refuz / eroare de rețea,
 *   cu mesajul de eroare inclus în retry
 * - loghează token usage per call (monitorizare cost)
 * - aruncă StructuredCallError la eșec final (gestionată elegant în UI)
 */
export async function callStructured<T>(opts: StructuredCallOptions): Promise<T> {
  const model = opts.model ?? OPENAI_MODEL;

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

    const response = await openai.chat.completions.create({
      model,
      messages,
      max_completion_tokens: opts.maxCompletionTokens ?? 8192,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: opts.schemaName,
          strict: true,
          schema: opts.jsonSchema,
        },
      },
    });

    const usage = response.usage;
    console.log(
      `[cv-pipeline][${opts.stage}] model=${response.model} prompt=${usage?.prompt_tokens} completion=${usage?.completion_tokens} (reasoning=${usage?.completion_tokens_details?.reasoning_tokens ?? 0}) total=${usage?.total_tokens}`
    );

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
    const raw =
      (firstError as Error & { raw?: string })?.raw ?? "";
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
