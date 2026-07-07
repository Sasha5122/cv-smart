import { NextRequest, NextResponse } from "next/server";
import { extractJSON, SMART_MODEL } from "@/lib/ai/client";
import type { CVData } from "@/lib/types/cv";

const FALLBACK = {
  hardSkills: ["Competențe analitice", "Gestionarea proiectelor", "Atenție la detalii", "Organizare și planificare"],
  softwareTools: ["Microsoft Office", "Google Workspace", "Email profesional"],
  softSkills: ["Comunicare eficientă", "Lucru în echipă", "Adaptabilitate"],
};

export async function POST(req: NextRequest) {
  try {
    const cvData: CVData = await req.json();

    const experienceSummary = cvData.experience
      .map((exp) => [
        `Rol: ${exp.title} la ${exp.company} (${exp.period})`,
        exp.responsibilities.length > 0 ? `Responsabilități: ${exp.responsibilities.join("; ")}` : "",
      ].filter(Boolean).join("\n"))
      .join("\n\n");

    const educationSummary = cvData.education
      .map((edu) => `${edu.level}${edu.field ? ` în ${edu.field}` : ""} — ${edu.institution}`)
      .join(", ");

    const result = await extractJSON<typeof FALLBACK>({
      model: SMART_MODEL,
      system: `Ești un expert în resurse umane specializat în CV-uri profesionale pentru piața din România.

Analizează COMPLET profilul candidatului și generează o listă exhaustivă de abilități profesionale în 3 categorii distincte.

${cvData.targetTitle ? `Job vizat: ${cvData.targetTitle}\n` : ""}${experienceSummary ? `\nExperiență profesională:\n${experienceSummary}\n` : ""}${educationSummary ? `\nEducație: ${educationSummary}\n` : ""}

REGULI DE GENERARE:
1. Extrage abilități SPECIFICE direct din responsabilitățile și experiența candidatului
2. Completează cu abilități tipice și necesare pentru rolul respectiv
3. Formulări concise (2-4 cuvinte), fără virgule sau fraze lungi
4. Fiecare abilitate — unică, fără duplicate între categorii

CATEGORII ȘI VOLUME:
- hardSkills: competențe tehnice și de specialitate (generează 13-15 iteme)
- softwareTools: software, platforme, instrumente digitale (generează 8-10 iteme)
- softSkills: competențe interpersonale și comportamentale (generează 6-8 iteme)

Răspunde EXCLUSIV cu JSON valid fără text adițional:
{"hardSkills":["..."],"softwareTools":["..."],"softSkills":["..."]}`,
      userMessage: "Generează abilități profesionale complete bazate pe profilul furnizat.",
      fallback: FALLBACK,
    });

    const valid =
      Array.isArray(result?.hardSkills) && result.hardSkills.length > 0 &&
      Array.isArray(result?.softwareTools) &&
      Array.isArray(result?.softSkills);

    return NextResponse.json(valid ? result : FALLBACK);
  } catch {
    return NextResponse.json(FALLBACK);
  }
}
