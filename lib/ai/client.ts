/**
 * Client AI al aplicației — rulează pe OpenAI.
 * Interfața (chat / chatStream / extractJSON) este stabilă: rutele API
 * o folosesc identic, indiferent de providerul de dedesubt.
 */
import { openai, OPENAI_MODEL } from "@/lib/openai";
import { computeCostUSD } from "@/lib/ai-pricing";
import { recordAiCall } from "@/lib/telemetry";

/**
 * Prioritatea actuală e calitatea → ambele aliasuri merg pe gpt-5.5.
 * Optimizarea pe modele mai ieftine (ex. gpt-5.4-mini pentru task-uri
 * rapide) se face mai târziu, schimbând doar aceste constante.
 *
 * NOTĂ: gpt-5.5 nu suportă `temperature` (doar default 1) — parametrul
 * din ChatOptions este ignorat intenționat.
 */
export const SMART_MODEL = OPENAI_MODEL;
export const FAST_MODEL = "gpt-5.4-mini";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  model?: string;
  system?: string;
  messages: ChatMessage[];
  maxTokens?: number;
  /** ignorat pe gpt-5.5 (nu suportă temperature) */
  temperature?: number;
  /** telemetrie: numele etapei → apelul se înregistrează ca `ai_call` */
  stage?: string;
  sessionId?: string | null;
}

export interface ExtractOptions<T = unknown> {
  model?: string;
  system: string;
  userMessage: string;
  schema?: string;
  maxTokens?: number;
  fallback: T;
  /** telemetrie: numele etapei → apelul se înregistrează ca `ai_call` */
  stage?: string;
  sessionId?: string | null;
  /** limba instrucțiunii de format JSON (ro implicit) */
  language?: "ro" | "en";
}

/** Forma minimă a răspunsului de care are nevoie telemetria. */
interface UsageLike {
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    prompt_tokens_details?: { cached_tokens?: number } | null;
    completion_tokens_details?: { reasoning_tokens?: number } | null;
  } | null;
}

async function reportUsage(
  opts: { stage?: string; sessionId?: string | null },
  model: string,
  response: UsageLike,
  startedAt: number
): Promise<void> {
  if (!opts.stage) return;
  const u = response.usage;
  const promptTokens = u?.prompt_tokens ?? 0;
  const cachedTokens = u?.prompt_tokens_details?.cached_tokens ?? 0;
  const completionTokens = u?.completion_tokens ?? 0;
  const reasoningTokens = u?.completion_tokens_details?.reasoning_tokens ?? 0;
  await recordAiCall({
    sessionId: opts.sessionId ?? null,
    stage: opts.stage,
    model,
    promptTokens,
    cachedTokens,
    completionTokens,
    reasoningTokens,
    costUSD: computeCostUSD(model, promptTokens, cachedTokens, completionTokens),
    durationMs: Date.now() - startedAt,
    jsonRetries: 0,
    effortRejected: false,
  });
}

function toOpenAIMessages(
  opts: Pick<ChatOptions, "system" | "messages">
): { role: "system" | "user" | "assistant"; content: string }[] {
  const messages: { role: "system" | "user" | "assistant"; content: string }[] =
    [];
  if (opts.system) messages.push({ role: "system", content: opts.system });
  for (const m of opts.messages) messages.push(m);
  return messages;
}

export async function chat(opts: ChatOptions): Promise<string> {
  const model = opts.model ?? SMART_MODEL;
  const t0 = Date.now();
  const response = await openai.chat.completions.create({
    model,
    max_completion_tokens: opts.maxTokens ?? 2048,
    messages: toOpenAIMessages(opts),
  });
  await reportUsage(opts, model, response, t0);
  return response.choices[0]?.message?.content ?? "";
}

export async function chatStream(
  opts: ChatOptions,
  onChunk: (chunk: string) => void
): Promise<string> {
  let fullText = "";

  const stream = await openai.chat.completions.create({
    model: opts.model ?? SMART_MODEL,
    max_completion_tokens: opts.maxTokens ?? 2048,
    messages: toOpenAIMessages(opts),
    stream: true,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) {
      fullText += delta;
      onChunk(delta);
    }
  }

  return fullText;
}

export async function extractJSON<T>(opts: ExtractOptions<T>): Promise<T> {
  const jsonRule =
    opts.language === "en"
      ? "IMPORTANT: Reply ONLY with valid JSON, no markdown, no explanations. Do not use ```json```."
      : "IMPORTANT: Răspunde EXCLUSIV cu JSON valid, fără markdown, fără explicații. Nu folosi ```json```.";
  const systemPrompt = `${opts.system}

${jsonRule}`;

  // json_object forțează un OBIECT la top-level → îl activăm doar când
  // fallback-ul nu e array (unele rute așteaptă array-uri, ex. string[]).
  const expectsArray = Array.isArray(opts.fallback);

  const model = opts.model ?? SMART_MODEL;
  const t0 = Date.now();
  try {
    const response = await openai.chat.completions.create({
      model,
      max_completion_tokens: opts.maxTokens ?? 2048,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: opts.userMessage },
      ],
      ...(expectsArray
        ? {}
        : { response_format: { type: "json_object" as const } }),
    });

    await reportUsage(opts, model, response, t0);
    const text = response.choices[0]?.message?.content?.trim() ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!jsonMatch) return opts.fallback;
    return JSON.parse(jsonMatch[0]) as T;
  } catch {
    return opts.fallback;
  }
}
