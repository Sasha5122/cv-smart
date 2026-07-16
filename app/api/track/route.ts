import { NextRequest, NextResponse } from "next/server";
import { trackEvent } from "@/lib/db/queries";
import { checkRateLimit, clientIp } from "@/lib/cv-pipeline/rate-limit";
import { readJsonLimited, BODY_LIMITS } from "@/lib/http-guards";

export const dynamic = "force-dynamic";

/** Înregistrează pasul atins de utilizator (pentru statistici în admin).
 *  Best-effort: nu blochează niciodată wizard-ul. */
export async function POST(req: NextRequest) {
  try {
    const limit = await checkRateLimit(clientIp(req), "track", 120, 60 * 60 * 1000);
    if (!limit.allowed) return NextResponse.json({ ok: true }); // silențios
    const { sessionId, step } = await readJsonLimited<{
      sessionId?: string;
      step?: number;
    }>(req, BODY_LIMITS.TINY);
    if (typeof sessionId === "string" && typeof step === "number" && step >= 1 && step <= 10) {
      await trackEvent(sessionId, "step_reached", { step });
    }
  } catch {
    // silențios — tracking-ul nu are voie să deranjeze userul
  }
  return NextResponse.json({ ok: true });
}
