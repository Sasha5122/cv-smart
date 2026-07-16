import { NextRequest, NextResponse } from "next/server";
import { callStructured, StructuredCallError } from "@/lib/openai";
import { checkRateLimit, clientIp } from "@/lib/cv-pipeline/rate-limit";
import { readJsonLimited, BODY_LIMITS } from "@/lib/http-guards";
import type { CVData } from "@/lib/types/cv";

export const maxDuration = 30;

/**
 * Rezumatul profesional (2-3 fraze) — generat automat la pasul final,
 * din datele deja completate. Model ieftin, apel unic per CV.
 */
const SUMMARY_MODEL = "gpt-5.4-mini";

const SCHEMA = {
  type: "object",
  properties: { summary: { type: "string" } },
  required: ["summary"],
  additionalProperties: false,
};

const SYSTEM = `Ești un recrutor român cu experiență. Scrii REZUMATUL PROFESIONAL (profilul) de la începutul unui CV — 2-3 fraze care fac angajatorul să citească mai departe.

REGULI OBLIGATORII:
- FIDELITATE: folosești DOAR informațiile primite; nu inventa cifre, competențe sau vechime
- STIL IMPERSONAL/ELIPTIC, fără verbe conjugate la vreo persoană: construcții nominale și participiale — „Experiență în...", „Obișnuit cu...", „Specializat în...", „Responsabil de...". INTERZIS atât persoana I („lucrez", „gestionez"), cât și persoana a III-a („lucrează", „gestionează")
- concret, nu găunos: pornește de la meseria + punctele forte reale (volume, responsabilități, unelte); evită clișeele goale („persoană dinamică, orientată spre rezultate")
- dacă primești și anunțul jobului țintă, aliniază formularea la cerințele lui — fără să inventezi potriviri
- română corectă cu diacritice; maxim 3 fraze
Răspunzi STRICT în formatul JSON cerut.

EXEMPLU DE STIL CORECT: „Contabil cu 6 ani de experiență în contabilitate completă, cu gestionarea lunară a declarațiilor fiscale pentru 12 firme. Utilizare zilnică a programelor SAGA și Excel, cu relație directă cu ANAF. Obișnuit cu coordonarea colegilor juniori și cu volume mari de lucru."`;

export async function POST(req: NextRequest) {
  try {
    const limit = await checkRateLimit(clientIp(req), "ai-summary", 30, 60 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Prea multe cereri." }, { status: 429 });
    }

    const body = await readJsonLimited<Record<string, unknown>>(req, BODY_LIMITS.CV_DATA);
    const cvData = body.cvData as CVData;
    const jobDescription = String(body.jobDescription ?? "").trim();
    if (!cvData?.experience?.length) {
      return NextResponse.json({ summary: "" });
    }

    const experience = cvData.experience
      .map(
        (e) =>
          `${e.title} la ${e.company} (${e.period})\n${e.responsibilities.join("\n")}`
      )
      .join("\n\n");
    const skills = (cvData.skills ?? []).map((s) => s.name).join(", ");
    const education = (cvData.education ?? [])
      .map((e) => `${e.level}${e.field ? ` — ${e.field}` : ""}${e.institution ? ` (${e.institution})` : ""}`)
      .join("; ");
    // certificările și calificările cântăresc mult într-un rezumat
    const courses = (cvData.courses ?? [])
      .map((c) => `${c.name}${c.year ? ` (${c.year})` : ""}`)
      .join("; ");
    const qualifications = (cvData.qualifications ?? "").trim();

    const userContent = [
      "EXPERIENȚA CANDIDATULUI:",
      experience,
      skills ? `\nCOMPETENȚE: ${skills}` : "",
      education ? `\nEDUCAȚIE: ${education}` : "",
      courses ? `\nCURSURI ȘI CERTIFICĂRI: ${courses}` : "",
      qualifications ? `\nCALIFICĂRI: ${qualifications}` : "",
      jobDescription ? `\nANUNȚUL JOBULUI ȚINTĂ:\n<<<\n${jobDescription}\n>>>` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const result = await callStructured<{ summary: string }>({
      stage: "cv-summary",
      systemPrompt: SYSTEM,
      userContent,
      schemaName: "cv_summary",
      jsonSchema: SCHEMA,
      model: SUMMARY_MODEL,
      maxCompletionTokens: 2048,
    });

    return NextResponse.json({ summary: result.summary?.trim() ?? "" });
  } catch (e) {
    if (e instanceof StructuredCallError) console.warn(`[summary] ${e.message}`);
    // best-effort: fără rezumat e mai bine decât cu eroare blocantă
    return NextResponse.json({ summary: "" });
  }
}
