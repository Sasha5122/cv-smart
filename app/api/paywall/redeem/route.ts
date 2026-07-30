import { NextRequest, NextResponse } from "next/server";
import { paywallEnabled } from "@/lib/payments/server";
import {
  getSession,
  hasEventForTransaction,
  isSessionPaid,
  markSessionPaid,
  trackEvent,
} from "@/lib/db/queries";
import { deliverCvByEmail } from "@/lib/delivery";
import { checkRateLimit, clientIp } from "@/lib/cv-pipeline/rate-limit";
import { readJsonLimited, BODY_LIMITS } from "@/lib/http-guards";

/**
 * Cod promo (testeri/prieteni): un cod predefinit în env `PROMO_CODES`
 * deblochează sesiunea EXACT ca o plată reală — status plătit, event
 * `payment_completed` (metodă: promo_code) și emailul de livrare cu PDF.
 *
 * Anti-brute-force: 10 încercări/oră per IP; mesaj de eroare generic.
 * Idempotent: transaction_id determinist `promo_<sessionId>` — a doua
 * revendicare pe aceeași sesiune nu retrimite emailul.
 */
export const maxDuration = 30;

function validCodes(): Set<string> {
  return new Set(
    (process.env.PROMO_CODES ?? "")
      .split(",")
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean)
  );
}

export async function POST(req: NextRequest) {
  try {
    const limit = await checkRateLimit(clientIp(req), "promo-redeem", 10, 60 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Prea multe încercări. Revino peste o oră." },
        { status: 429 }
      );
    }
    if (!paywallEnabled()) {
      return NextResponse.json({ error: "Plata nu e activă." }, { status: 400 });
    }

    const body = await readJsonLimited<Record<string, unknown>>(req, BODY_LIMITS.TINY);
    const sessionId = String(body.sessionId ?? "").trim();
    const code = String(body.code ?? "").trim().toUpperCase();
    if (!sessionId || !code) {
      return NextResponse.json({ error: "Date lipsă." }, { status: 400 });
    }
    if (!validCodes().has(code)) {
      return NextResponse.json({ error: "Cod invalid sau expirat." }, { status: 400 });
    }

    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Sesiune negăsită." }, { status: 404 });
    }

    const transactionId = `promo_${sessionId}`;

    // marcarea plății — idempotent (a doua revendicare nu dublează nimic)
    const alreadyPaid = await isSessionPaid(session).catch(() => false);
    if (!alreadyPaid && !(await hasEventForTransaction("payment_completed", transactionId))) {
      await trackEvent(sessionId, "payment_completed", {
        transaction_id: transactionId,
        method: "promo_code",
        code,
        total: "0",
        currency: "EUR",
      });
    }
    await markSessionPaid(sessionId);

    // livrarea pe email — aceeași ca la plata reală; best-effort:
    // dacă emailul pică, deblocarea rămâne (userul poate descărca din pagină)
    let emailSent = false;
    try {
      const outcome = await deliverCvByEmail(sessionId, transactionId);
      emailSent = outcome === "sent" || outcome === "already-sent";
    } catch (e) {
      console.error("[promo-redeem] emailul de livrare a picat:", e);
    }

    return NextResponse.json({ ok: true, emailSent });
  } catch (e) {
    console.error("[promo-redeem] eroare:", e);
    return NextResponse.json({ error: "Eroare internă." }, { status: 500 });
  }
}
