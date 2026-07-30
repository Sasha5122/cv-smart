import {
  paywallEnabled as paddleEnabled,
  paywallMisconfigured as paddleMisconfigured,
} from "@/lib/paddle/server";
import { creemConfigured } from "@/lib/creem/server";

/**
 * Stratul care abstractizează furnizorul de plată. Comutatorul e
 * `PAYMENT_PROVIDER` (creem | paddle, implicit paddle pentru compatibilitate).
 * Rutele de paywall (status, pdf, redeem) importă de AICI, nu direct din
 * lib/paddle — așa schimbăm providerul fără să atingem logica de business.
 */

export type PaymentProvider = "creem" | "paddle";

export function paymentProvider(): PaymentProvider {
  return process.env.PAYMENT_PROVIDER === "creem" ? "creem" : "paddle";
}

/** Paywall pornit = flag public ON + furnizorul curent configurat complet. */
export function paywallEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_PAYWALL_ENABLED !== "true") return false;
  return paymentProvider() === "creem" ? creemConfigured() : paddleEnabled();
}

/** Config incomplet — de semnalat zgomotos în loguri. */
export function paywallMisconfigured(): boolean {
  if (process.env.NEXT_PUBLIC_PAYWALL_ENABLED !== "true") return false;
  if (paymentProvider() === "creem") {
    // creem: fie ambele chei prezente, fie niciuna
    const keys = [process.env.CREEM_API_KEY, process.env.CREEM_PRODUCT_ID];
    return keys.some(Boolean) && !keys.every(Boolean);
  }
  return paddleMisconfigured();
}
