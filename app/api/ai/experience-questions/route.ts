import { NextRequest, NextResponse } from "next/server";
import { extractJSON, FAST_MODEL } from "@/lib/ai/client";

const FALLBACK: string[] = [
  "Care erau principalele tale responsabilități zilnice în acest rol?",
  "Ce rezultate concrete sau realizări ești mândru că le-ai obținut? (ex: cifre, procente, proiecte finalizate)",
  "Ce instrumente, programe sau echipamente foloseai în mod regulat?",
  "Câți clienți, colegi sau proiecte gestionai simultan?",
  "Care a fost cea mai mare provocare întâlnită și cum ai rezolvat-o?",
];

export async function POST(req: NextRequest) {
  try {
    const { jobTitle, company, period } = await req.json();

    const questions = await extractJSON<string[]>({
      model: FAST_MODEL,
      system: `Ești un recrutor senior specializat în piața muncii din România.
Generează exact 5 întrebări deschise în română pentru un candidat care a lucrat ca "${jobTitle}" la "${company}" (${period}).

Obiectiv: obținerea de informații detaliate și specifice pentru un CV profesional.

Reguli pentru întrebări:
- Specifice pentru rolul de "${jobTitle}" — nu generice
- Acoperă: responsabilități concrete, rezultate măsurabile, unelte/sisteme folosite, structura echipei, provocări depășite
- Scurte, clare, conversaționale
- Formulate astfel încât candidatul să ofere detalii bogate
- Dacă jobul implică clienți: întreabă despre numărul/tipul lor
- Dacă jobul implică cifre/KPI: întreabă despre targeturi și realizări

Răspunde EXCLUSIV cu un array JSON de 5 stringuri. Fără alt text.`,
      userMessage: `Job: ${jobTitle} la ${company}, perioada: ${period}`,
      fallback: FALLBACK,
    });

    const result = Array.isArray(questions) ? questions.slice(0, 6) : FALLBACK;
    return NextResponse.json({ questions: result });
  } catch {
    return NextResponse.json({ questions: FALLBACK });
  }
}
