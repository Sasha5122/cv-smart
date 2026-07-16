import { NextRequest, NextResponse } from "next/server";
import { extractJSON } from "@/lib/ai/client";
import { getSession } from "@/lib/db/queries";
import { checkRateLimit, clientIp } from "@/lib/cv-pipeline/rate-limit";
import { readJsonLimited, BODY_LIMITS } from "@/lib/http-guards";
import type { CVData } from "@/lib/types/cv";

/** Sarcină simplă de listare — gpt-5.4 e suficient (5.5 era supradimensionat). */
const SKILLS_MODEL = "gpt-5.4";

interface SkillsResult {
  hardSkills: string[];
  softwareTools: string[];
  softSkills: string[];
}

export async function POST(req: NextRequest) {
  try {
    const limit = await checkRateLimit(clientIp(req), "generate-skills", 20, 60 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Prea multe cereri." }, { status: 429 });
    }
    const body = await readJsonLimited<Record<string, unknown>>(req, BODY_LIMITS.CV_DATA);
    // formă nouă: { cvData, jobDescription?, sessionId? }; formă veche: cvData direct
    const cvData = (body.cvData ?? body) as CVData;
    const jobDescription: string = String(body.jobDescription ?? "").trim();
    const sessionId: string = String(body.sessionId ?? "");

    // cuvintele-cheie ATS calculate de research la Pasul 1 (dacă există)
    let atsKeywords: string[] = [];
    if (sessionId) {
      try {
        const session = await getSession(sessionId);
        const profile = session?.ideal_profile as { atsKeywords?: string[] } | null;
        if (Array.isArray(profile?.atsKeywords)) atsKeywords = profile.atsKeywords;
      } catch {
        // best-effort — abilitățile se generează și fără profilul ideal
      }
    }

    const experienceSummary = (cvData.experience ?? [])
      .map((exp) => [
        `Rol: ${exp.title} la ${exp.company} (${exp.period})`,
        exp.responsibilities.length > 0 ? `Responsabilități: ${exp.responsibilities.join("; ")}` : "",
      ].filter(Boolean).join("\n"))
      .join("\n\n");

    const educationSummary = (cvData.education ?? [])
      .map((edu) => `${edu.level}${edu.field ? ` în ${edu.field}` : ""} — ${edu.institution}`)
      .join(", ");

    const jdBlock = jobDescription
      ? `\nANUNȚUL JOBULUI ȚINTĂ (candidatul aplică la acest job):\n<<<\n${jobDescription}\n>>>\n`
      : "";
    const atsBlock = atsKeywords.length
      ? `\nCUVINTE-CHEIE ATS identificate pentru rolul vizat: ${atsKeywords.join(", ")}\n`
      : "";

    const result = await extractJSON<SkillsResult | null>({
      model: SKILLS_MODEL,
      system: `Ești un expert în resurse umane specializat în CV-uri profesionale pentru piața din România.

Analizează COMPLET profilul candidatului și generează o listă exhaustivă de abilități profesionale în 3 categorii distincte.

${experienceSummary ? `\nExperiență profesională:\n${experienceSummary}\n` : ""}${educationSummary ? `\nEducație: ${educationSummary}\n` : ""}${jdBlock}${atsBlock}
REGULI DE GENERARE:
1. Extrage abilități SPECIFICE direct din responsabilitățile și experiența candidatului
2. Completează cu abilități tipice pentru rolul respectiv — dar doar plauzibile pentru profilul lui; nu sugera competențe fără nicio legătură cu experiența descrisă
3. ANCORARE PE ANUNȚ: dacă primești anunțul jobului țintă, prioritizează abilitățile care corespund cerințelor lui și folosește exact vocabularul anunțului atunci când experiența candidatului le susține — recrutorii și sistemele ATS caută exact acele cuvinte. Pune-le primele în fiecare categorie. Nu inventa potriviri: o cerință din anunț fără acoperire în experiență NU devine abilitate sugerată.
4. Integrează cuvintele-cheie ATS primite, în categoriile potrivite, când profilul candidatului le susține
5. Formulări concise (2-4 cuvinte), fără virgule sau fraze lungi
6. Fiecare abilitate — unică, fără duplicate între categorii

CATEGORII ȘI VOLUME:
- hardSkills: competențe tehnice și de specialitate (generează 13-15 iteme)
- softwareTools: software, platforme, instrumente digitale (generează 8-10 iteme)
- softSkills: competențe interpersonale și comportamentale (generează 6-8 iteme)

Răspunde EXCLUSIV cu JSON valid fără text adițional:
{"hardSkills":["..."],"softwareTools":["..."],"softSkills":["..."]}`,
      userMessage: "Generează abilități profesionale complete bazate pe profilul furnizat.",
      // fără dicționar de rezervă: dacă AI-ul pică, eșuăm vizibil —
      // userul primește buton de reîncercare, nu abilități generice
      fallback: null,
    });

    const valid =
      Array.isArray(result?.hardSkills) && result.hardSkills.length > 0 &&
      Array.isArray(result?.softwareTools) &&
      Array.isArray(result?.softSkills);

    if (!valid) {
      return NextResponse.json(
        { error: "Generarea abilităților a eșuat. Încearcă din nou." },
        { status: 502 }
      );
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Generarea abilităților a eșuat. Încearcă din nou." },
      { status: 502 }
    );
  }
}
