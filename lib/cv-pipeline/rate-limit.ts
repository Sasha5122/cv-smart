/**
 * Rate limiting simplu, in-memory, per IP (aplicația nu are auth — sesiuni guest).
 * Suficient pentru MVP single-instance; la scalare se mută pe Redis/Upstash.
 */

const buckets = new Map<string, number[]>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  ip: string,
  bucket: string,
  max: number,
  windowMs: number
): RateLimitResult {
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const timestamps = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (timestamps.length >= max) {
    const oldest = Math.min(...timestamps);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((oldest + windowMs - now) / 1000),
    };
  }

  timestamps.push(now);
  buckets.set(key, timestamps);
  return {
    allowed: true,
    remaining: max - timestamps.length,
    retryAfterSeconds: 0,
  };
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || "local";
}
