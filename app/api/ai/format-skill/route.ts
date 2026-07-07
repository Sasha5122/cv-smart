import { NextRequest, NextResponse } from "next/server";
import { chat, FAST_MODEL } from "@/lib/ai/client";

export async function POST(req: NextRequest) {
  try {
    const { skill } = await req.json();
    if (!skill?.trim()) return NextResponse.json({ corrected: skill ?? "" });

    const corrected = await chat({
      model: FAST_MODEL,
      system: "Ești un expert în redactarea CV-urilor profesionale în limba română.",
      messages: [
        {
          role: "user",
          content: `Corectează gramatica și formularea acestei abilități pentru a fi inclusă într-un CV profesional. Răspunde DOAR cu abilitatea corectată (2-4 cuvinte), fără explicații, fără ghilimele, fără punct la final:\n\n${skill.trim()}`,
        },
      ],
      maxTokens: 50,
    });

    return NextResponse.json({ corrected: corrected.trim() || skill.trim() });
  } catch {
    return NextResponse.json({ corrected: "" });
  }
}
