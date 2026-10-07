import { NextRequest, NextResponse } from "next/server";
import { recordApiError } from "@/lib/telemetry";
import { verifyCreemWebhook, parseCreemEvent, handleCreemPaid } from "@/lib/creem/server";

/**
 * Webhook Creem — sursa DURABILĂ de adevăr pentru plăți + livrarea CV-ului.
 *
 * checkout.completed:
 *   1. verifică semnătura `creem-signature` (HMAC-SHA256 pe corpul brut)
 *   2. marchează plata (idempotent pe checkoutId) + trimite emailul cu PDF
 *
 * Ca la Paddle: doar 2xx = livrat. Non-2xx face Creem să reîncerce, iar
 * marcarea/livrarea sunt idempotente, deci retry-ul e sigur.
 */
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const signature = req.headers.get("creem-signature") ?? "";
  const rawBody = await req.text();

  if (!signature || !rawBody) {
    return NextResponse.json({ error: "Missing signature or body" }, { status: 401 });
  }
  if (!verifyCreemWebhook(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const parsed = parseCreemEvent(rawBody);
    // alte evenimente (sau fără sessionId): no-op, dar tot 200
    if (parsed) {
      await handleCreemPaid(parsed.sessionId, parsed.checkoutId);
    }
    return NextResponse.json({ received: true });
  } catch (e) {
    await recordApiError("/api/creem/webhook", 500, e);
    console.error("[creem-webhook] eroare:", e);
    // non-2xx = retry (plata/livrarea sunt idempotente)
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
