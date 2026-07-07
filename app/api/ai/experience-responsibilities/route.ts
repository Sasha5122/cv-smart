import { NextRequest, NextResponse } from "next/server";
import { extractJSON, SMART_MODEL } from "@/lib/ai/client";

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
      model: SMART_MODEL,
      system: `Ești un specialist senior în resurse umane și redactare de CV-uri profesionale pentru piața muncii din România, cu experiență de 15 ani în recrutare corporativă.

CONTEXT: Candidatul a lucrat ca "${jobTitle}" la "${company}" (${period}).

${userInfo ? `INFORMAȚII FURNIZATE DE CANDIDAT:\n${userInfo}\n\n` : ""}INSTRUCȚIUNI DE CALITATE — CITEȘTE CU ATENȚIE:

**Regula #1 — Specifică, nu generică**
GREȘIT: "Gestionarea activităților zilnice"
CORECT: "Gestionarea unui portofoliu de clienți și coordonarea livrărilor în termenele agreate"

**Regula #2 — Folosește informațiile candidatului ca prioritate**
Extrage TOATE cifrele, instrumentele, sistemele, tipurile de clienți, volumele de muncă menționate și include-le în bullet points.
Dacă candidatul a menționat "15 firme client" → scrie "pentru un portofoliu de 15 companii client"
Dacă a menționat un program/soft → include-l explicit

**Regula #3 — Terminologie de industrie**
Folosește termeni profesioniști specifici domeniului "${jobTitle}". Evită cuvinte vagi: "activități", "sarcini", "lucruri", "aspecte".

**Regula #4 — Impact și responsabilitate vizibilă**
Unde e posibil, arată scopul acțiunii sau rezultatul:
NU: "Întocmirea rapoartelor"
DA: "Întocmirea rapoartelor financiare lunare și transmiterea lor către management și autorități"

**Regula #5 — Format obligatoriu**
Fiecare bullet TREBUIE să înceapă cu substantiv verbal (forma cu -rea/-area/-irea):
Gestionarea, Coordonarea, Asigurarea, Elaborarea, Monitorizarea, Întocmirea, Verificarea,
Realizarea, Pregătirea, Menținerea, Urmărirea, Implementarea, Optimizarea, Raportarea,
Administrarea, Procesarea, Reconcilierea, Analiza, Planificarea, Supervizarea...
NICIODATĂ verb conjugat (Gestionam, Coordonam etc.)

**Regula #6 — Diversitate**
Nu repeta același tip de activitate. Acoperă: responsabilități tehnice/operaționale, relații cu stakeholderi, raportare/documentație, coordonare, calitate/conformitate.

GENEREAZĂ 13-15 bullet points, ordonate de la cele mai specifice (bazate pe info candidat) la cele mai generale (tipice rolului).

Răspunde EXCLUSIV cu un array JSON de stringuri. Fără alt text.`,
      userMessage: "Generează responsabilități.",
      fallback: FALLBACK,
    });

    const result = Array.isArray(responsibilities) && responsibilities.length > 0 ? responsibilities.slice(0, 16) : FALLBACK;
    return NextResponse.json({ responsibilities: result });
  } catch {
    return NextResponse.json({ responsibilities: FALLBACK });
  }
}
