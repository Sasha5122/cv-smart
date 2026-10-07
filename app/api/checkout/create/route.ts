import { NextRequest, NextResponse } from "next/server";
import { recordApiError } from "@/lib/telemetry";
import { paywallEnabled, paymentProvider } from "@/lib/payments/server";
import { createCreemCheckout } from "@/lib/creem/server";
import { checkRateLimit, clientIp } from "@/lib/cv-pipeline/rate-limit";
import { readJsonLimited, BODY_LIMITS } from "@/lib/http-guards";

/**
 * Creează o sesiune de checkout Creem și întoarce URL-ul de redirect.
 * Clientul (pasul final) apelează asta, apoi face redirect la `url`.
 * `success_url` aduce userul înapoi pe /creare-cv, unde progresul se
 * restaurează din localStorage și confirmăm plata (vezi /api/creem/confirm).
 */
export const maxDuration = 30;

function siteOrigin(req: NextRequest): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, "");
  return req.nextUrl.origin;
}

export async function POST(req: NextRequest) {
  try {
    const limit = await checkRateLimit(clientIp(req), "checkout-create", 20, 60 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Prea multe încercări." }, { status: 429 });
    }
    if (!paywallEnabled() || paymentProvider() !== "creem") {
      return NextResponse.json({ error: "Checkout indisponibil." }, { status: 400 });
    }

    const body = await readJsonLimited<Record<string, unknown>>(req, BODY_LIMITS.TINY);
    const sessionId = String(body.sessionId ?? "").trim();
    const email = typeof body.email === "string" ? body.email.trim() : undefined;
    if (!sessionId) {
      return NextResponse.json({ error: "Sesiune lipsă." }, { status: 400 });
    }

    const successUrl = `${siteOrigin(req)}/creare-cv?creem=return`;
    const { checkoutUrl } = await createCreemCheckout({ sessionId, successUrl, email });
    return NextResponse.json({ url: checkoutUrl });
  } catch (e) {
    await recordApiError("/api/checkout/create", 500, e);
    console.error("[checkout-create] eroare:", e);
    return NextResponse.json({ error: "Nu am putut porni plata." }, { status: 500 });
  }
}
