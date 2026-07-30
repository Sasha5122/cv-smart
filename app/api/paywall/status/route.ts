import { NextRequest, NextResponse } from "next/server";
import { paywallEnabled, paywallMisconfigured, paymentProvider } from "@/lib/payments/server";
import { getSession, isSessionPaid } from "@/lib/db/queries";

/**
 * UNICA sursă de adevăr pentru starea paywall-ului, consumată de client:
 *  - enabled + config-ul public de checkout (token, priceId) — clientul nu-și
 *    mai calculează singur starea din env la build, deci nu poate diverge
 *  - paid — reconcilierea cu serverul: webhook-ul a marcat plata? (rezolvă
 *    cazul „am plătit, am dat refresh/alt device → mi se cere iar plata")
 */
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const enabled = paywallEnabled();
  if (paywallMisconfigured()) {
    console.error(
      "[paywall] CONFIG INCOMPLET: verifică NEXT_PUBLIC_PAYWALL_ENABLED, NEXT_PUBLIC_PADDLE_PRICE_ID, PADDLE_API_KEY, NEXT_PUBLIC_PADDLE_CLIENT_TOKEN"
    );
  }
  if (!enabled) {
    return NextResponse.json({ enabled: false, paid: false });
  }

  let paid = false;
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (sessionId) {
    const session = await getSession(sessionId).catch(() => null);
    paid = await isSessionPaid(session).catch(() => false);
  }

  const provider = paymentProvider();
  // Creem: checkout prin redirect (fără token de client). Paddle: overlay,
  // deci clientul primește token + priceId ca să inițializeze Paddle.js.
  if (provider === "creem") {
    return NextResponse.json({ enabled: true, paid, provider });
  }

  return NextResponse.json({
    enabled: true,
    paid,
    provider,
    clientToken: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
    priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID,
    environment: process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? "production" : "sandbox",
  });
}
