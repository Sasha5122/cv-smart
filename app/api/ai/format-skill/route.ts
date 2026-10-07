import { NextRequest, NextResponse } from "next/server";
import { recordApiError } from "@/lib/telemetry";
import { chat, FAST_MODEL } from "@/lib/ai/client";
import { checkRateLimit, clientIp } from "@/lib/cv-pipeline/rate-limit";
import { readJsonLimited, BODY_LIMITS } from "@/lib/http-guards";

export async function POST(req: NextRequest) {
  try {
    const limit = await checkRateLimit(clientIp(req), "format-skill", 60, 60 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Prea multe cereri." }, { status: 429 });
    }
    const { skill } = await readJsonLimited<{ skill?: string }>(req, BODY_LIMITS.TINY);
    if (!skill?.trim()) return NextResponse.json({ corrected: skill ?? "" });

    const corrected = await chat({
      stage: "format-skill",
      sessionId: null,
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
  } catch (e) {
    await recordApiError("/api/ai/format-skill", 502, e);
    return NextResponse.json({ corrected: "" });
  }
}
