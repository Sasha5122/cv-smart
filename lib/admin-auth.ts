import { createHash } from "node:crypto";

/** Parola de admin — poate fi suprascrisă prin variabila de mediu
 *  ADMIN_PASSWORD (recomandat în producție). */
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "***REMOVED-ADMIN-PASSWORD***";

export const ADMIN_COOKIE = "cvx_admin";

/** Tokenul stocat în cookie — hash, nu parola în clar. */
export function adminToken(): string {
  return createHash("sha256").update(`cvx:${ADMIN_PASSWORD}`).digest("hex");
}

export function isValidPassword(password: unknown): boolean {
  return typeof password === "string" && password === ADMIN_PASSWORD;
}

export function isValidToken(token: string | undefined): boolean {
  return Boolean(token && token === adminToken());
}
