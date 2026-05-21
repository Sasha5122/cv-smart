import { NextRequest, NextResponse } from "next/server";
import { extractJSON, SMART_MODEL } from "@/lib/ai/client";

export async function POST(req: NextRequest) {
  try {
    const { rawText, jobTitle } = await req.json() as { rawText: string; jobTitle: string };

    if (!rawText?.trim()) {
      return NextResponse.json({ responsibility: null });
    }

    const result = await extractJSON<string>({
      model: SMART_MODEL,
      system: `Ești specialist senior în redactarea CV-urilor profesionale pentru piața muncii din România.

Candidatul a lucrat ca "${jobTitle}" și vrea să adauge o responsabilitate pe CV, dar a scris-o în limbaj colocvial, incorect gramatical sau vag.

SARCINA TA: Analizează INTENȚIA din ce a scris candidatul și creează un bullet point profesional de CV complet nou. NU copia cuvintele originale — rescrie total în limbaj de CV.

PROCES OBLIGATORIU:
1. Înțelege CE activitate descrie candidatul (indiferent cât de informal sau greșit e scris)
2. Identifică verbul/acțiunea principală
3. Rescrie complet în română corectă, profesională, specifică domeniului "${jobTitle}"
4. Adaugă context profesional relevant dacă lipsește din text (ex: "cu clienții", "conform legislației", "în termenele stabilite")
5. Dacă sunt cifre sau instrumente menționate, integrează-le natural

FORMAT OBLIGATORIU:
- Începe cu substantiv verbal: Gestionarea / Coordonarea / Asigurarea / Elaborarea / Monitorizarea / Întocmirea / Verificarea / Realizarea / Pregătirea / Menținerea / Urmărirea / Răspunderea / Procesarea / Administrarea / Reconcilierea / Analiza / Planificarea / Optimizarea — alege cel mai potrivit pentru activitate
- O singură propoziție clară, fără punct la final
- INTERZIS: verb conjugat (Gestionam, Coordonam etc.), limbaj vag ("lucruri", "activități diverse"), calchieri din engleză

EXEMPLE de transformare:
"raspundeam la telefon" → "Răspunderea la solicitările telefonice ale clienților și rezolvarea acestora în timp util"
"faceam facturi" → "Întocmirea și emiterea facturilor fiscale în conformitate cu legislația în vigoare"
"ma ocupam de angajati" → "Coordonarea echipei și monitorizarea performanțelor individuale ale angajaților"
"verificam stocurile" → "Verificarea periodică a stocurilor și reconcilierea acestora cu evidența contabilă"

Răspunde EXCLUSIV cu un JSON string (nu array, nu obiect — doar stringul responsabilității). Fără alt text.`,
      userMessage: rawText.trim(),
      fallback: "",
    });

    const responsibility = typeof result === "string" && result.trim() ? result.trim() : null;
    return NextResponse.json({ responsibility });
  } catch {
    return NextResponse.json({ responsibility: null });
  }
}
