import { NextRequest, NextResponse } from "next/server";
import { recordApiError } from "@/lib/telemetry";
import { paywallEnabled, paymentProvider } from "@/lib/payments/server";
import { confirmCreemCheckout } from "@/lib/creem/server";
import { checkRateLimit, clientIp } from "@/lib/cv-pipeline/rate-limit";
import { readJsonLimited, BODY_LIMITS } from "@/lib/http-guards";

/**
 * Confirmarea IMEDIATĂ la revenirea din checkout (success_url).
 * Verifică comanda prin API-ul Creem și, dacă e plătită și aparține sesiunii,
 * o marchează + livrează — fără să aștepte webhook-ul (care e backup-ul durabil).
 * Idempotent: dacă webhook-ul a lovit deja, întoarce direct `paid: true`.
 */
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const limit = await checkRateLimit(clientIp(req), "creem-confirm", 30, 60 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Prea multe încercări." }, { status: 429 });
    }
    if (!paywallEnabled() || paymentProvider() !== "creem") {
      return NextResponse.json({ paid: false }, { status: 400 });
    }

    const body = await readJsonLimited<Record<string, unknown>>(req, BODY_LIMITS.TINY);
    const sessionId = String(body.sessionId ?? "").trim();
    const checkoutId = String(body.checkoutId ?? "").trim();
    if (!sessionId || !checkoutId) {
      return NextResponse.json({ error: "Date lipsă." }, { status: 400 });
    }

    const paid = await confirmCreemCheckout(sessionId, checkoutId);
    return NextResponse.json({ paid });
  } catch (e) {
    await recordApiError("/api/creem/confirm", 500, e);
    console.error("[creem-confirm] eroare:", e);
    return NextResponse.json({ paid: false }, { status: 500 });
  }
}
