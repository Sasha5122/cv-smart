import { NextRequest, NextResponse } from "next/server";
import { extractJSON, FAST_MODEL } from "@/lib/ai/client";
import { getCachedProfile, upsertCachedProfile, updateIdealProfile } from "@/lib/db/queries";
import { normalizeRole } from "@/lib/utils";
import { checkRateLimit, clientIp } from "@/lib/cv-pipeline/rate-limit";
import { readJsonLimited, BODY_LIMITS } from "@/lib/http-guards";
import type { IdealProfile } from "@/lib/types/cv";

export async function POST(req: NextRequest) {
  try {
    const limit = await checkRateLimit(clientIp(req), "ai-research", 20, 60 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Prea multe cereri." }, { status: 429 });
    }
    const parsed = await readJsonLimited<{ sessionId?: string; jobDescription?: string }>(
      req,
      BODY_LIMITS.TEXT
    );
    const sessionId = String(parsed.sessionId ?? "");
    const jobDescription = String(parsed.jobDescription ?? "");

    // Extract role from job description
    const intent = await extractJSON<{ role: string; industry: string; seniority: string }>({
      model: FAST_MODEL,
      system: `Extrage rolul, industria și seniority-ul din descrierea jobului. JSON strict: {"role": "...", "industry": "...", "seniority": "junior|mid|senior"}`,
      userMessage: jobDescription,
      fallback: { role: "necunoscut", industry: "general", seniority: "mid" },
    });

    const roleKey = normalizeRole(intent.role);

    // Check cache
    const cached = await getCachedProfile(roleKey);
    if (cached) {
      await updateIdealProfile(sessionId, cached.profile_data as IdealProfile);
      return NextResponse.json({ profile: cached.profile_data, cached: true });
    }

    // Generate new profile
    const profile = await extractJSON<IdealProfile>({
      model: FAST_MODEL,
      system: `Ești un expert HR român. Generează profilul ideal pentru rolul dat.
JSON strict: {"role": "...", "industry": "...", "seniority": "...", "responsibilities": [...], "hardSkills": [...], "softSkills": [...], "atsKeywords": [...]}

Toate listele au 5-8 itemi. Focusat pe piața românească.`,
      userMessage: `Rol: ${intent.role}, Industrie: ${intent.industry}, Seniority: ${intent.seniority}`,
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
    console.error("Research error:", error);
    return NextResponse.json({ error: "Eroare la research" }, { status: 500 });
  }
}
