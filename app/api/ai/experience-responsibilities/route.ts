import { NextRequest, NextResponse } from "next/server";
import { extractJSON, FAST_MODEL } from "@/lib/ai/client";

interface QnA { question: string; answer: string; }

const FALLBACK: string[] = [
  "Gestionarea activităților zilnice specifice rolului",
  "Colaborarea cu echipa pentru atingerea obiectivelor",
  "Asigurarea calității și respectarea termenelor",
  "Comunicarea cu clienții/partenerii în mod profesional",
  "Contribuirea la îmbunătățirea proceselor interne",
];

export async function POST(req: NextRequest) {
  try {
    const { jobTitle, company, period, rawDescription, qna } = await req.json() as {
      jobTitle: string;
      company: string;
      period: string;
      rawDescription: string;
      qna: QnA[];
    };

    const userInfo = [
      rawDescription?.trim() && `Descriere proprie: "${rawDescription.trim()}"`,
      ...qna
        .filter((qa) => qa.answer?.trim())
        .map((qa, i) => `Î${i + 1}: ${qa.question}\nR: ${qa.answer.trim()}`),
    ]
      .filter(Boolean)
      .join("\n\n");

    const responsibilities = await extractJSON<string[]>({
      model: FAST_MODEL,
      system: `Ești expert în redactarea CV-urilor profesionale pentru piața muncii din România.

Candidatul a lucrat ca "${jobTitle}" la "${company}" (${period}).

${userInfo ? `INFORMAȚII FURNIZATE DE CANDIDAT:\n${userInfo}\n\n` : ""}SARCINA TA:
1. Reformulează informațiile candidatului în limbaj profesional de CV (concis, impactant)
2. Completează cu 8-10 responsabilități tipice pentru rolul de "${jobTitle}" pe care candidatul probabil le-a îndeplinit
3. Dacă candidatul a menționat cifre sau procente, păstrează-le
4. Fiecare bullet: o propoziție scurtă, începe cu substantiv verbal (Gestionarea, Coordonarea, Asigurarea, Elaborarea, Monitorizarea, Întocmirea, Verificarea, Realizarea, Pregătirea, Menținerea, Urmărirea...)
5. Total: 12-15 bullet points
6. Scrie în română, natural și profesional
7. IMPORTANT: folosește ÎNTOTDEAUNA forma de substantiv verbal (cu -rea/-area/-irea la sfârșit), NU forma de verb conjugat (niciodată Gestionam, Coordonam etc.)

Răspunde EXCLUSIV cu un array JSON de stringuri. Fără alt text.`,
      userMessage: `Job: ${jobTitle} la ${company}, ${period}`,
      fallback: FALLBACK,
    });

    const result = Array.isArray(responsibilities) ? responsibilities.slice(0, 16) : FALLBACK;
    return NextResponse.json({ responsibilities: result });
  } catch {
    return NextResponse.json({ responsibilities: FALLBACK });
  }
}
