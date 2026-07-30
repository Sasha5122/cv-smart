import { createHmac, timingSafeEqual } from "node:crypto";
import {
  getSession,
  hasEventForTransaction,
  isSessionPaid,
  markSessionPaid,
  trackEvent,
} from "@/lib/db/queries";
import { deliverCvByEmail } from "@/lib/delivery";

/**
 * Creem (Merchant of Record) — integrare server-side pentru plăți unice.
 *
 * Model: checkout HOSTED prin redirect (Creem nu are overlay). Fluxul:
 *  1. creăm o sesiune de checkout via API → primim `checkout_url`
 *  2. redirectăm userul acolo; `request_id` = sessionId ne leagă plata de CV
 *  3. la revenire (success_url) confirmăm IMEDIAT comanda prin API (retrieve)
 *  4. webhook-ul `checkout.completed` e sursa DURABILĂ (idempotent pe checkoutId)
 *
 * Sursa de adevăr „a plătit?": statusul sesiunii în DB (marcat de webhook SAU
 * de confirmarea la revenire) — exact ca la Paddle, deci restul aplicației
 * (gating PDF, livrare email) rămâne neschimbat.
 */

export function creemConfigured(): boolean {
  return Boolean(process.env.CREEM_API_KEY) && Boolean(process.env.CREEM_PRODUCT_ID);
}

/** Sandbox implicit; producția DOAR când CREEM_ENV=production. */
function creemBaseUrl(): string {
  return process.env.CREEM_ENV === "production"
    ? "https://api.creem.io"
    : "https://test-api.creem.io";
}

function apiKey(): string {
  const key = process.env.CREEM_API_KEY;
  if (!key) throw new Error("CREEM_API_KEY lipsește");
  return key;
}

interface CreemCheckout {
  id: string;
  checkout_url: string;
  status?: string;
  request_id?: string;
  metadata?: Record<string, unknown>;
  customer?: { email?: string } | null;
}

/**
 * Creează o sesiune de checkout și întoarce URL-ul de redirect.
 * `request_id` = sessionId: leagă plata de CV și e cheie de idempotență
 * (un CV = o plată → o sesiune de checkout per CV).
 */
export async function createCreemCheckout(opts: {
  sessionId: string;
  successUrl: string;
  email?: string;
}): Promise<{ checkoutUrl: string; checkoutId: string }> {
  const res = await fetch(`${creemBaseUrl()}/v1/checkouts`, {
    method: "POST",
    headers: { "x-api-key": apiKey(), "Content-Type": "application/json" },
    body: JSON.stringify({
      product_id: process.env.CREEM_PRODUCT_ID,
      request_id: opts.sessionId,
      success_url: opts.successUrl,
      metadata: { sessionId: opts.sessionId },
      ...(opts.email ? { customer: { email: opts.email } } : {}),
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Creem create checkout ${res.status}: ${detail.slice(0, 300)}`);
  }
  const data = (await res.json()) as CreemCheckout;
  if (!data.checkout_url) throw new Error("Creem: răspuns fără checkout_url");
  return { checkoutUrl: data.checkout_url, checkoutId: data.id };
}

/** Interoghează o comandă/checkout după id — folosit la confirmarea imediată.
 *  ID-ul de checkout Creem e de forma `ch_...` (uneori `chk_...`). */
export async function retrieveCreemCheckout(checkoutId: string): Promise<CreemCheckout | null> {
  if (!/^ch[a-z]?_[a-zA-Z0-9]+$/.test(checkoutId)) return null;
  try {
    const res = await fetch(
      `${creemBaseUrl()}/v1/checkouts?checkout_id=${encodeURIComponent(checkoutId)}`,
      { headers: { "x-api-key": apiKey() } }
    );
    if (!res.ok) return null;
    return (await res.json()) as CreemCheckout;
  } catch {
    return null;
  }
}

/** „completed"/„paid" = plată confirmată. */
function isCompleted(status?: string): boolean {
  return status === "completed" || status === "paid";
}

/** sessionId din event/checkout: întâi request_id, apoi metadata.sessionId. */
function sessionIdOf(obj: CreemCheckout | undefined): string | null {
  if (!obj) return null;
  if (typeof obj.request_id === "string" && obj.request_id) return obj.request_id;
  const meta = obj.metadata as Record<string, unknown> | undefined;
  const fromMeta = meta?.sessionId;
  return typeof fromMeta === "string" && fromMeta ? fromMeta : null;
}

/**
 * Handler PARTAJAT de webhook și de confirmarea la revenire: marchează plata
 * (idempotent pe checkoutId) și livrează CV-ul pe email. Sigur la apeluri
 * concurente/dublate — exact ca la Paddle.
 */
export async function handleCreemPaid(sessionId: string, checkoutId: string): Promise<void> {
  if (!(await hasEventForTransaction("payment_completed", checkoutId))) {
    await trackEvent(sessionId, "payment_completed", {
      provider: "creem",
      checkout_id: checkoutId,
    });
  }
  await markSessionPaid(sessionId);
  const outcome = await deliverCvByEmail(sessionId, checkoutId);
  if (outcome === "no-data" || outcome === "no-email") {
    console.error(`[creem] livrare imposibilă (${outcome}) pentru sesiunea ${sessionId}`);
  }
}

/**
 * Confirmare IMEDIATĂ la revenirea pe success_url: interoghează comanda prin
 * API și, dacă e plătită ȘI aparține sesiunii, o marchează + livrează.
 * Verificarea prin API e mai sigură decât semnătura din URL (fără ambiguități).
 */
export async function confirmCreemCheckout(
  sessionId: string,
  checkoutId: string
): Promise<boolean> {
  // scurtătură: dacă webhook-ul a marcat deja plata, gata
  const session = await getSession(sessionId).catch(() => null);
  if (await isSessionPaid(session).catch(() => false)) return true;

  const checkout = await retrieveCreemCheckout(checkoutId);
  if (!checkout || !isCompleted(checkout.status)) return false;
  if (sessionIdOf(checkout) !== sessionId) return false; // comandă străină

  await handleCreemPaid(sessionId, checkoutId);
  return true;
}

/** Verifică semnătura webhook-ului: HMAC-SHA256(raw body, secret) în hex. */
export function verifyCreemWebhook(rawBody: string, signature: string): boolean {
  const secret = process.env.CREEM_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    const a = Buffer.from(signature, "hex");
    const b = Buffer.from(expected, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

interface CreemWebhookEvent {
  eventType?: string;
  type?: string;
  object?: CreemCheckout;
}

/** Extrage (sessionId, checkoutId) dintr-un event checkout.completed. */
export function parseCreemEvent(
  raw: string
): { sessionId: string; checkoutId: string } | null {
  let event: CreemWebhookEvent;
  try {
    event = JSON.parse(raw) as CreemWebhookEvent;
  } catch {
    return null;
  }
  const kind = event.eventType ?? event.type;
  if (kind !== "checkout.completed") return null;
  const obj = event.object;
  const sessionId = sessionIdOf(obj);
  const checkoutId = obj?.id;
  if (!sessionId || !checkoutId) return null;
  return { sessionId, checkoutId };
}
