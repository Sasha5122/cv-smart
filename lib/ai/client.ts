import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export const SMART_MODEL = "claude-sonnet-4-6";
export const FAST_MODEL = "claude-haiku-4-5-20251001";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  model?: string;
  system?: string;
  messages: ChatMessage[];
  maxTokens?: number;
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

export async function chat(opts: ChatOptions): Promise<string> {
  const response = await anthropic.messages.create({
    model: opts.model ?? SMART_MODEL,
    max_tokens: opts.maxTokens ?? 2048,
    system: opts.system,
    messages: opts.messages,
  });

  const block = response.content[0];
  return block.type === "text" ? block.text : "";
}

export async function chatStream(
  opts: ChatOptions,
  onChunk: (chunk: string) => void
): Promise<string> {
  let fullText = "";

  const stream = anthropic.messages.stream({
    model: opts.model ?? SMART_MODEL,
    max_tokens: opts.maxTokens ?? 2048,
    system: opts.system,
    messages: opts.messages,
  });

  for await (const chunk of stream) {
    if (
      chunk.type === "content_block_delta" &&
      chunk.delta.type === "text_delta"
    ) {
      fullText += chunk.delta.text;
      onChunk(chunk.delta.text);
    }
  }

  return fullText;
}

export async function extractJSON<T>(opts: ExtractOptions<T>): Promise<T> {
  const systemPrompt = `${opts.system}

IMPORTANT: Răspunde EXCLUSIV cu JSON valid, fără markdown, fără explicații. Nu folosi \`\`\`json\`\`\`.`;

  try {
    const response = await anthropic.messages.create({
      model: opts.model ?? SMART_MODEL,
      max_tokens: opts.maxTokens ?? 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: opts.userMessage }],
    });

    const block = response.content[0];
    const text = block.type === "text" ? block.text.trim() : "";
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!jsonMatch) return opts.fallback;
    return JSON.parse(jsonMatch[0]) as T;
  } catch {
    return opts.fallback;
  }
}
