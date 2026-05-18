import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/ai/client";
import { getSession, updateSessionStatus } from "@/lib/db/queries";
import type { CVData } from "@/lib/types/cv";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, cvData, jobDescription } = await req.json() as {
      sessionId: string;
      cvData: CVData;
      jobDescription: string;
    };

    const session = await getSession(sessionId);
    const idealProfile = session?.ideal_profile;

    const personalSection = [
      `${cvData.personal?.firstName ?? ""} ${cvData.personal?.lastName ?? ""}`.trim(),
      cvData.personal?.email,
      cvData.personal?.phone,
      [cvData.personal?.city, cvData.personal?.county].filter(Boolean).join(", "),
    ].filter(Boolean).join(" | ");

    const draft = await chat({
      system: `Ești un expert în redactarea CV-urilor profesionale pentru piața românească.
Generezi CV-uri ATS-friendly, cu diacritice perfecte (ă, â, î, ș, ț).
Folosești cuvintele cheie din job description când e disponibil.
Nu inventezi informații — reformulezi profesional ce primești.
Structura: DATE PERSONALE → REZUMAT → EXPERIENȚĂ → EDUCAȚIE → COMPETENȚE → LIMBI → CALIFICĂRI → HOBBY-URI.`,
      messages: [
        {
          role: "user",
          content: `Generează un CV profesional complet în română cu datele de mai jos.
${jobDescription ? `\nJob vizat: ${jobDescription}` : ""}
${idealProfile ? `\nCuvinte cheie pentru ATS: ${(idealProfile as {atsKeywords?: string[]}).atsKeywords?.join(", ")}` : ""}

DATE CANDIDAT:
${JSON.stringify(cvData, null, 2)}

Generează CV-ul ca text formatat, secțiuni separate cu linie goală, NU markdown bold sau italic.`,
        },
      ],
      maxTokens: 3000,
    });

    await updateSessionStatus(sessionId, "draft_generated", { draft_cv: draft });

    return NextResponse.json({ draft });
  } catch (error) {
    console.error("Generate draft error:", error);
    return NextResponse.json({ error: "Eroare la generare" }, { status: 500 });
  }
}
