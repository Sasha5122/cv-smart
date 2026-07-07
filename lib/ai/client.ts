/**
 * Client AI al aplicației — rulează pe OpenAI.
 * Interfața (chat / chatStream / extractJSON) este stabilă: rutele API
 * o folosesc identic, indiferent de providerul de dedesubt.
 */
import { openai, OPENAI_MODEL } from "@/lib/openai";

/**
 * Prioritatea actuală e calitatea → ambele aliasuri merg pe gpt-5.5.
 * Optimizarea pe modele mai ieftine (ex. gpt-5.4-mini pentru task-uri
 * rapide) se face mai târziu, schimbând doar aceste constante.
 *
 * NOTĂ: gpt-5.5 nu suportă `temperature` (doar default 1) — parametrul
 * din ChatOptions este ignorat intenționat.
 */
export const SMART_MODEL = OPENAI_MODEL;
export const FAST_MODEL = OPENAI_MODEL;

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
}

export interface ExtractOptions<T = unknown> {
  model?: string;
  system: string;
  userMessage: string;
  schema?: string;
  maxTokens?: number;
  fallback: T;
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
  const response = await openai.chat.completions.create({
    model: opts.model ?? SMART_MODEL,
    max_completion_tokens: opts.maxTokens ?? 2048,
    messages: toOpenAIMessages(opts),
  });
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
  const systemPrompt = `${opts.system}

IMPORTANT: Răspunde EXCLUSIV cu JSON valid, fără markdown, fără explicații. Nu folosi \`\`\`json\`\`\`.`;

  // json_object forțează un OBIECT la top-level → îl activăm doar când
  // fallback-ul nu e array (unele rute așteaptă array-uri, ex. string[]).
  const expectsArray = Array.isArray(opts.fallback);

  try {
    const response = await openai.chat.completions.create({
      model: opts.model ?? SMART_MODEL,
      max_completion_tokens: opts.maxTokens ?? 2048,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: opts.userMessage },
      ],
      ...(expectsArray
        ? {}
        : { response_format: { type: "json_object" as const } }),
    });

    const text = response.choices[0]?.message?.content?.trim() ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!jsonMatch) return opts.fallback;
    return JSON.parse(jsonMatch[0]) as T;
  } catch {
    return opts.fallback;
  }
}
