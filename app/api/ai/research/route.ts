import { NextRequest, NextResponse } from "next/server";
import { recordApiError } from "@/lib/telemetry";
import { extractJSON, FAST_MODEL } from "@/lib/ai/client";
import { getCachedProfile, upsertCachedProfile, updateIdealProfile } from "@/lib/db/queries";
import { normalizeRole } from "@/lib/utils";
import { checkRateLimit, clientIp } from "@/lib/cv-pipeline/rate-limit";
import { readJsonLimited, BODY_LIMITS } from "@/lib/http-guards";
import { toLocale } from "@/lib/i18n/locale";
import type { IdealProfile } from "@/lib/types/cv";

const INTENT_SYSTEM_EN = `Extract the role, the industry and the seniority from the job description. Strict JSON: {"role": "...", "industry": "...", "seniority": "junior|mid|senior"}`;

const PROFILE_SYSTEM_EN = `You are an expert HR professional. Generate the ideal profile for the given role.
Strict JSON: {"role": "...", "industry": "...", "seniority": "...", "responsibilities": [...], "hardSkills": [...], "softSkills": [...], "atsKeywords": [...]}

Every list has 5-8 items, written in English.`;

export async function POST(req: NextRequest) {
  try {
    const limit = await checkRateLimit(clientIp(req), "ai-research", 20, 60 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Prea multe cereri." }, { status: 429 });
    }
    const parsed = await readJsonLimited<{
      sessionId?: string;
      jobDescription?: string;
      language?: unknown;
    }>(req, BODY_LIMITS.TEXT);
    const sessionId = String(parsed.sessionId ?? "");
    const jobDescription = String(parsed.jobDescription ?? "");
    const language = toLocale(parsed.language);

    // Extract role from job description
    const intent = await extractJSON<{ role: string; industry: string; seniority: string }>({
      language,
      stage: "research-intent",
      sessionId,
      model: FAST_MODEL,
      system:
        language === "en"
          ? INTENT_SYSTEM_EN
          : `Extrage rolul, industria și seniority-ul din descrierea jobului. JSON strict: {"role": "...", "industry": "...", "seniority": "junior|mid|senior"}`,
      userMessage: jobDescription,
      fallback:
        language === "en"
          ? { role: "unknown", industry: "general", seniority: "mid" }
          : { role: "necunoscut", industry: "general", seniority: "mid" },
    });

    // profilurile în engleză au cheie de cache separată (nu se amestecă cu cele în română)
    const roleKey =
      language === "en" ? `${normalizeRole(intent.role)}__en` : normalizeRole(intent.role);

    // Check cache
    const cached = await getCachedProfile(roleKey);
    if (cached) {
      await updateIdealProfile(sessionId, cached.profile_data as IdealProfile);
      return NextResponse.json({ profile: cached.profile_data, cached: true });
    }

    // Generate new profile
    const profile = await extractJSON<IdealProfile>({
      language,
      stage: "research-profile",
      sessionId,
      model: FAST_MODEL,
      system:
        language === "en"
          ? PROFILE_SYSTEM_EN
          : `Ești un expert HR român. Generează profilul ideal pentru rolul dat.
JSON strict: {"role": "...", "industry": "...", "seniority": "...", "responsibilities": [...], "hardSkills": [...], "softSkills": [...], "atsKeywords": [...]}

Toate listele au 5-8 itemi. Focusat pe piața românească.`,
      userMessage:
        language === "en"
          ? `Role: ${intent.role}, Industry: ${intent.industry}, Seniority: ${intent.seniority}`
          : `Rol: ${intent.role}, Industrie: ${intent.industry}, Seniority: ${intent.seniority}`,
      fallback: {
        role: intent.role,
        industry: intent.industry,
        seniority: intent.seniority,
        responsibilities: [],
        hardSkills: [],
        softSkills: [],
        atsKeywords: [],
      },
    });

    await upsertCachedProfile(roleKey, intent.role, intent.industry, profile);
    await updateIdealProfile(sessionId, profile);

    return NextResponse.json({ profile, cached: false });
  } catch (error) {
    await recordApiError("/api/ai/research", 500, error);
    console.error("Research error:", error);
    return NextResponse.json({ error: "Eroare la research" }, { status: 500 });
  }
}
