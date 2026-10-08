import { NextRequest, NextResponse } from "next/server";
import { recordApiError } from "@/lib/telemetry";
import { chat, FAST_MODEL } from "@/lib/ai/client";
import { checkRateLimit, clientIp } from "@/lib/cv-pipeline/rate-limit";
import { readJsonLimited, BODY_LIMITS } from "@/lib/http-guards";
import { toLocale } from "@/lib/i18n/locale";

export async function POST(req: NextRequest) {
  try {
    const limit = await checkRateLimit(clientIp(req), "format-skill", 60, 60 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Prea multe cereri." }, { status: 429 });
    }
    const { skill, language: languageRaw } = await readJsonLimited<{
      skill?: string;
      language?: unknown;
    }>(req, BODY_LIMITS.TINY);
    if (!skill?.trim()) return NextResponse.json({ corrected: skill ?? "" });
    const language = toLocale(languageRaw);

    const corrected = await chat({
      stage: "format-skill",
      sessionId: null,
      model: FAST_MODEL,
      system:
        language === "en"
          ? "You are an expert in writing professional CVs in English."
          : "Ești un expert în redactarea CV-urilor profesionale în limba română.",
      messages: [
        {
          role: "user",
          content:
            language === "en"
              ? `Correct the grammar and wording of this skill so it can be included in a professional CV. Answer ONLY with the corrected skill (2-4 words), no explanations, no quotation marks, no full stop at the end:\n\n${skill.trim()}`
              : `Corectează gramatica și formularea acestei abilități pentru a fi inclusă într-un CV profesional. Răspunde DOAR cu abilitatea corectată (2-4 cuvinte), fără explicații, fără ghilimele, fără punct la final:\n\n${skill.trim()}`,
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
