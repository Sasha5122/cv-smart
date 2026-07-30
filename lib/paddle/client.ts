"use client";
/**
 * Paddle.js — inițializare unică în browser, condusă de SERVER:
 * config-ul (enabled/token/priceId/paid) vine din GET /api/paywall/status,
 * astfel clientul și serverul nu pot avea păreri diferite despre paywall.
 */
import { initializePaddle, type Paddle } from "@paddle/paddle-js";

export interface PaywallStatus {
  enabled: boolean;
  paid: boolean;
  /** furnizorul activ; „creem" folosește redirect, „paddle" overlay */
  provider?: "creem" | "paddle";
  clientToken?: string;
  priceId?: string;
  environment?: "sandbox" | "production";
}

/** Handler-ul curent pentru evenimentele de checkout (setat de componenta activă). */
type PaddleEvent = { name?: string; data?: { transaction_id?: string } };
let checkoutHandler: ((event: PaddleEvent) => void) | null = null;

export function setCheckoutHandler(fn: ((event: PaddleEvent) => void) | null) {
  checkoutHandler = fn;
}

/** Starea paywall + plata sesiunii, de la server. La eroare: paywall oprit
 *  (mai bine un download liber decât un user blocat fără buton de plată). */
export async function fetchPaywallStatus(sessionId: string): Promise<PaywallStatus> {
  try {
    const res = await fetch(`/api/paywall/status?sessionId=${encodeURIComponent(sessionId)}`);
    if (!res.ok) return { enabled: false, paid: false };
    return (await res.json()) as PaywallStatus;
  } catch {
    return { enabled: false, paid: false };
  }
}

let paddlePromise: Promise<Paddle | undefined> | null = null;

export function getPaddleClient(status: PaywallStatus): Promise<Paddle | undefined> {
  if (!paddlePromise) {
    if (!status.clientToken) return Promise.resolve(undefined);
    paddlePromise = initializePaddle({
      token: status.clientToken,
      environment: status.environment === "production" ? "production" : "sandbox",
      eventCallback: (event) => checkoutHandler?.(event as PaddleEvent),
    }).catch(() => {
      paddlePromise = null; // permite retry la următoarea deschidere
      return undefined;
    });
  }
  return paddlePromise;
}
