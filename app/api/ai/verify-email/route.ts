import { NextRequest, NextResponse } from "next/server";
import { extractJSON, FAST_MODEL } from "@/lib/ai/client";

export async function POST(req: NextRequest) {
  try {
    const { email, firstName, lastName } = await req.json();

    const result = await extractJSON<{
      ok: boolean;
      suggestion?: string;
      alternatives?: string[];
    }>({
      model: FAST_MODEL,
      system: `Ești un verificator de adrese email profesionale.
Analizezi dacă emailul este profesional pentru un CV.
Răspunde cu JSON strict: {"ok": boolean, "suggestion": "string sau null", "alternatives": ["email1", "email2"]}

Un email e neprofesional dacă: conține porecle, numere inutile >3, cuvinte slang, pseudonime ridicole.
Exemple neprofesionale: batausu79@, cuteboy@, diavolu@, razboinicul@
Exemple profesionale: ion.popescu@, i.popescu@, ionpopescu@, popescu.ion@

Dacă e neprofesional, sugerează alternative bazate pe firstName și lastName.`,
      userMessage: `Email: ${email}, Prenume: ${firstName ?? ""}, Nume: ${lastName ?? ""}`,
      fallback: { ok: true },
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ ok: true });
  }
}
