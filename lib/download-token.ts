import crypto from "node:crypto";

/**
 * Token semnat pentru re-descărcarea CV-ului — valabil 30 de zile de la plată.
 * Fără JWT: HMAC-SHA256 simplu pe `sessionId.expiry`, comparat constant-time.
 * Format URL-safe: `<sessionId>.<expiryMs>.<hmacHex>`
 */

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 zile

function secret(): string {
  const s = process.env.DOWNLOAD_TOKEN_SECRET;
  if (!s) throw new Error("DOWNLOAD_TOKEN_SECRET lipsește");
  return s;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

export function createDownloadToken(sessionId: string, now = Date.now()): string {
  const expiry = now + TOKEN_TTL_MS;
  const payload = `${sessionId}.${expiry}`;
  return `${payload}.${sign(payload)}`;
}

export type TokenCheck =
  | { ok: true; sessionId: string }
  | { ok: false; reason: "invalid" | "expired" };

export function verifyDownloadToken(token: string, now = Date.now()): TokenCheck {
  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, reason: "invalid" };
  const [sessionId, expiryStr, sig] = parts;
  const expiry = Number(expiryStr);
  if (!sessionId || !Number.isFinite(expiry) || !/^[0-9a-f]{64}$/.test(sig)) {
    return { ok: false, reason: "invalid" };
  }
  const expected = sign(`${sessionId}.${expiry}`);
  const sigBuf = Buffer.from(sig, "hex");
  const expBuf = Buffer.from(expected, "hex");
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return { ok: false, reason: "invalid" };
  }
  if (now > expiry) return { ok: false, reason: "expired" };
  return { ok: true, sessionId };
}
