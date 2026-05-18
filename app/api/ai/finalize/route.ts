import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/ai/client";
import { updateSessionStatus } from "@/lib/db/queries";
import type { ChatMessage } from "@/lib/types/cv";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, draft, revisions } = await req.json() as {
      sessionId: string;
      draft: string;
      revisions: ChatMessage[];
    };

    const revisionsText = revisions
      .filter((m) => m.role === "user")
      .map((m) => `- ${m.content}`)
      .join("\n");

    const response = await chat({
      system: `Ești un editor expert de CV-uri în română.
Aplici modificările cerute cu precizie, păstrând stilul și structura originală.
Returnezi CV-ul complet actualizat + un mesaj scurt de confirmare.
Format: {updatedDraft: "...", message: "Am aplicat modificarea: ..."}`,
      messages: [
        {
          role: "user",
          content: `CV curent:\n${draft}\n\nModificări cerute:\n${revisionsText}\n\nAplică modificările și returnează JSON.`,
        },
      ],
    });

    // Try JSON parse
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.updatedDraft) {
          await updateSessionStatus(sessionId, "draft_generated", { draft_cv: parsed.updatedDraft });
          return NextResponse.json(parsed);
        }
      } catch { /* ignore */ }
    }

    // Fallback: treat whole response as updated draft
    return NextResponse.json({
      updatedDraft: response,
      message: "Am aplicat modificările tale.",
    });
  } catch (error) {
    console.error("Finalize error:", error);
    return NextResponse.json({ error: "Eroare la finalizare" }, { status: 500 });
  }
}
