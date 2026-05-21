import { NextRequest, NextResponse } from "next/server";
import { chat, SMART_MODEL } from "@/lib/ai/client";

export async function POST(req: NextRequest) {
  try {
    const { rawText, jobTitle } = await req.json() as { rawText: string; jobTitle: string };

    if (!rawText?.trim()) {
      return NextResponse.json({ responsibility: null });
    }

    const result = await chat({
      model: SMART_MODEL,
      system: `Ești specialist senior în redactarea CV-urilor profesionale pentru piața muncii din România.

Candidatul a lucrat ca "${jobTitle}" și descrie informal o activitate pe care o făcea.

SARCINA TA: Analizează INTENȚIA și rescrie complet ca bullet point profesional de CV. NU copia niciun cuvânt original — transformă total în limbaj de CV.

PROCES:
1. Înțelege CE activitate descrie (indiferent cât e de informal, greșit gramatical sau vag)
2. Rescrie complet în română corectă, profesională, specifică domeniului "${jobTitle}"
3. Adaugă context profesional relevant dacă lipsește (ex: "conform legislației în vigoare", "în termenele stabilite", "cu respectarea standardelor")
4. Dacă sunt cifre, instrumente sau detalii concrete menționate — integrează-le și amplifică impactul

FORMAT OBLIGATORIU:
- Începe cu substantiv verbal: Gestionarea / Coordonarea / Monitorizarea / Întocmirea / Verificarea / Asigurarea / Elaborarea / Urmărirea / Procesarea / Administrarea / Reconcilierea / Planificarea / Optimizarea — alege cel mai potrivit
- O singură propoziție clară, fără punct la final
- INTERZIS: verb conjugat (Gestionam, Coordonam etc.), limbaj vag, calchieri din engleză

EXEMPLE:
"raspundeam la telefon" → "Răspunderea la solicitările telefonice ale clienților și rezolvarea promptă a acestora"
"faceam facturi" → "Întocmirea și emiterea facturilor fiscale în conformitate cu legislația în vigoare"
"am un excel cu scadente" → "Monitorizarea scadențelor fiscale printr-un sistem propriu de evidență, cu asigurarea depunerii la termen a tuturor obligațiilor"
"ma ocupam de angajati" → "Coordonarea activității echipei și monitorizarea performanțelor individuale ale angajaților"

Răspunde DOAR cu bullet point-ul final. Niciun alt text, nicio explicație.`,
      messages: [{ role: "user", content: rawText.trim() }],
    });

    const responsibility = result.trim() || null;
    return NextResponse.json({ responsibility });
  } catch {
    return NextResponse.json({ responsibility: null });
  }
}
