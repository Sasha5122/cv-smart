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
      system: `Ești specialist în redactarea CV-urilor profesionale pentru piața muncii din România.

Candidatul a lucrat ca "${jobTitle}" și vrea să adauge o responsabilitate suplimentară pe CV.

SARCINA TA: Reformulează ce a scris candidatul într-un singur bullet point profesional de CV.

REGULI OBLIGATORII:
1. Începe ÎNTOTDEAUNA cu substantiv verbal (Gestionarea, Coordonarea, Asigurarea, Elaborarea, Monitorizarea, Întocmirea, Verificarea, Realizarea, Pregătirea, Menținerea, Urmărirea, Răspunderea, Procesarea, Administrarea etc.)
2. Ton profesional, concis, specific
3. Dacă candidatul a menționat cifre sau instrumente concrete, păstrează-le
4. O singură propoziție, fără punct la final
5. Niciodată verb conjugat la trecut (Gestionam, Coordonam etc.)

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
