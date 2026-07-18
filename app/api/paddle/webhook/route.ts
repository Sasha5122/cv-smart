import { NextRequest, NextResponse } from "next/server";
import { EventName, type TransactionCompletedEvent } from "@paddle/paddle-node-sdk";
import { getPaddle } from "@/lib/paddle/server";
import { hasEventForTransaction, markSessionPaid, trackEvent } from "@/lib/db/queries";
import { deliverCvByEmail } from "@/lib/delivery";

/**
 * Webhook Paddle — sursa durabilă de adevăr pentru plăți + livrarea CV-ului.
 *
 * transaction.completed:
 *   1. înregistrează plata (event `payment_completed` — IDEMPOTENT pe
 *      transaction_id, în tabela events) + status best-effort
 *   2. trimite emailul cu PDF atașat prin lib/delivery (idempotent,
 *      cu claim anti-duplicat pentru retry-urile concurente)
 *
 * Reguli de livrare Paddle: doar 2xx = livrat; orice altceva se reia.
 * Dacă doar emailul pică, plata rămâne înregistrată iar non-2xx-ul face
 * Paddle să reîncerce → emailul se retrimite automat (claim-ul expiră).
 */
export const maxDuration = 30;

async function handleTransactionCompleted(event: TransactionCompletedEvent) {
  const custom = (event.data.customData ?? {}) as Record<string, unknown>;
  const sessionId = typeof custom.sessionId === "string" ? custom.sessionId : null;
  const transactionId = event.data.id;
  if (!sessionId) {
    // tranzacție fără sesiune atașată (ex. creată manual în dashboard) — nimic de făcut
    console.warn(`[paddle-webhook] transaction.completed fără sessionId: ${transactionId}`);
    return;
  }

  // 1. plata — evenimentul e sursa de adevăr (idempotent pe transaction_id),
  //    statusul e scurtătura best-effort
  if (!(await hasEventForTransaction("payment_completed", transactionId))) {
    await trackEvent(sessionId, "payment_completed", {
      paddle_event_id: event.eventId,
      transaction_id: transactionId,
      total: event.data.details?.totals?.total,
      currency: event.data.currencyCode,
    });
  }
  await markSessionPaid(sessionId);

  // 2. livrarea pe email — idempotentă per tranzacție (lib/delivery)
  const outcome = await deliverCvByEmail(sessionId, transactionId);
  if (outcome === "no-data" || outcome === "no-email") {
    // retrimiterea nu ar rezolva nimic — logăm și confirmăm cu 200
    console.error(`[paddle-webhook] livrare imposibilă (${outcome}) pentru sesiunea ${sessionId}`);
  }
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("paddle-signature") ?? "";
  const rawBody = await req.text();
  const secret = process.env.PADDLE_WEBHOOK_SECRET ?? "";

  if (!signature || !rawBody || !secret) {
    return NextResponse.json({ error: "Missing signature, body or secret" }, { status: 401 });
  }

  try {
    // verifică HMAC-ul pe corpul BRUT — aruncă la semnătură invalidă
    const event = await getPaddle().webhooks.unmarshal(rawBody, secret, signature);

    if (event?.eventType === EventName.TransactionCompleted) {
      await handleTransactionCompleted(event as TransactionCompletedEvent);
    }
    // alte evenimente abonate: no-op, dar tot 200 (altfel Paddle reîncearcă la nesfârșit)

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("[paddle-webhook] eroare:", e);
    // non-2xx = Paddle reîncearcă; acoperă secretul rotit ȘI emailul picat
    // (plata e deja înregistrată idempotent, deci retry-ul e sigur)
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
