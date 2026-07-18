/**
 * Paddle server-side — instanță unică SDK + verificarea plății.
 *
 * Sursa de adevăr pentru „a plătit?" e dublă, în ordinea asta:
 *  1. webhook `transaction.completed` → status sesiune = "paid" (durabil, retried)
 *  2. verificare directă a tranzacției prin API (fallback imediat după checkout,
 *     când webhook-ul încă n-a ajuns sau persistența e indisponibilă)
 */
import { Environment, LogLevel, Paddle } from "@paddle/paddle-node-sdk";

let instance: Paddle | null = null;

export function getPaddle(): Paddle {
  if (instance) return instance;
  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) throw new Error("PADDLE_API_KEY lipsește");
  instance = new Paddle(apiKey, {
    environment:
      process.env.PADDLE_ENV === "production" ? Environment.production : Environment.sandbox,
    logLevel: LogLevel.error,
  });
  return instance;
}

/**
 * Paywall-ul se aprinde doar când checkout-ul e configurat COMPLET — inclusiv
 * cheile de care are nevoie clientul. UNICA definiție; clientul o primește
 * prin GET /api/paywall/status, deci client și server nu pot diverge.
 */
export function paywallEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_PAYWALL_ENABLED === "true" &&
    Boolean(process.env.NEXT_PUBLIC_PADDLE_PRICE_ID) &&
    Boolean(process.env.PADDLE_API_KEY) &&
    Boolean(process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN)
  );
}

/** Config incomplet (unele chei setate, altele nu) — de semnalat zgomotos. */
export function paywallMisconfigured(): boolean {
  if (process.env.NEXT_PUBLIC_PAYWALL_ENABLED !== "true") return false;
  const keys = [
    process.env.NEXT_PUBLIC_PADDLE_PRICE_ID,
    process.env.PADDLE_API_KEY,
    process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
  ];
  return keys.some(Boolean) !== keys.every(Boolean) || !keys.every(Boolean);
}

/**
 * Confirmă prin API-ul Paddle că tranzacția e plătită ȘI aparține sesiunii.
 * `custom_data.sessionId` e setat de client la deschiderea checkout-ului —
 * fără potrivire, o tranzacție reală dar străină nu deblochează alt CV.
 */
export async function verifyPaidTransaction(
  transactionId: string,
  sessionId: string
): Promise<boolean> {
  if (!/^txn_[a-z0-9]+$/.test(transactionId)) return false;
  try {
    const txn = await getPaddle().transactions.get(transactionId);
    const paidStatuses = ["completed", "paid"];
    const custom = (txn.customData ?? {}) as Record<string, unknown>;
    return paidStatuses.includes(txn.status) && custom.sessionId === sessionId;
  } catch {
    return false;
  }
}
