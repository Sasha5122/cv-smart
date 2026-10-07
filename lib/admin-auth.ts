import { createHash } from "node:crypto";

/** Parola de admin vine EXCLUSIV din variabila de mediu ADMIN_PASSWORD.
 *  Fără ea, panoul de administrare este dezactivat (orice login eșuează).
 *  Nu există fallback hardcodat — o parolă în cod ajunge în istoricul git. */
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";

export const ADMIN_COOKIE = "cvx_admin";

export function adminConfigured(): boolean {
  return ADMIN_PASSWORD.length > 0;
}

/** Tokenul stocat în cookie — hash, nu parola în clar. */
export function adminToken(): string {
  return createHash("sha256").update(`cvx:${ADMIN_PASSWORD}`).digest("hex");
}

export function isValidPassword(password: unknown): boolean {
  return adminConfigured() && typeof password === "string" && password === ADMIN_PASSWORD;
}

export function isValidToken(token: string | undefined): boolean {
  return adminConfigured() && Boolean(token && token === adminToken());
}
