import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/ai/client";
import { CHAT_PROMPTS } from "@/lib/prompts/chat-prompts";
import type { ChatMessage } from "@/lib/types/cv";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, step, message, history } = await req.json() as {
      sessionId: string;
      step: string;
      message: string;
      history: ChatMessage[];
    };

    const systemPrompt = CHAT_PROMPTS[step as keyof typeof CHAT_PROMPTS];
    if (!systemPrompt) {
      return NextResponse.json({ error: "Step necunoscut" }, { status: 400 });
    }

    const isExtractPartial = message === "EXTRACT_PARTIAL";

    const messages: ChatMessage[] = isExtractPartial
      ? [
          ...history,
          {
            role: "user",
            content:
              "INSTRUCȚIE SISTEM: Extrage toate datele colectate până acum și returnează JSON. Format: {done: true, data: {...}, message: 'Am salvat datele.'}",
          },
        ]
      : history;

    const response = await chat({
      system: systemPrompt,
      messages,
    });

    // Try to parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*"done"\s*:\s*true[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return NextResponse.json(parsed);
      } catch { /* continue */ }
    }

    return NextResponse.json({ message: response, done: false });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Eroare server" }, { status: 500 });
  }
}
