/**
 * Rate limiting per IP (aplicația nu are auth — sesiuni guest).
 *
 * În producție (Vercel = multe instanțe serverless) contorul trebuie să fie
 * PARTAJAT, altfel fiecare instanță numără separat și limita devine fictivă.
 * Dacă UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN sunt setate,
 * folosim Upstash Redis (REST, fereastră fixă INCR+EXPIRE — zero dependințe).
 * Fără ele, cădem pe contorul in-memory (suficient local / single-instance).
 *
 * Politica e fail-open: dacă Redis nu răspunde, cererea trece — o pană de
 * Redis nu are voie să blocheze userii reali.
 */

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/* ── fallback in-memory ────────────────────────────────────────── */

const buckets = new Map<string, number[]>();

function checkMemory(key: string, max: number, windowMs: number): RateLimitResult {
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
  return { allowed: true, remaining: max - timestamps.length, retryAfterSeconds: 0 };
}

/* ── Upstash Redis (REST) ──────────────────────────────────────── */

async function checkUpstash(
  key: string,
  max: number,
  windowMs: number
): Promise<RateLimitResult> {
  const windowSec = Math.ceil(windowMs / 1000);
  const windowId = Math.floor(Date.now() / windowMs);
  const redisKey = `rl:${key}:${windowId}`;

  // pipeline: INCR + EXPIRE într-un singur round-trip
  const res = await fetch(`${UPSTASH_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", redisKey],
      ["EXPIRE", redisKey, String(windowSec), "NX"],
    ]),
    signal: AbortSignal.timeout(2000),
  });
  if (!res.ok) throw new Error(`upstash ${res.status}`);
  const data = (await res.json()) as { result: number }[];
  const count = Number(data[0]?.result ?? 0);

  if (count > max) {
    const windowEnd = (windowId + 1) * windowMs;
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((windowEnd - Date.now()) / 1000)),
    };
  }
  return { allowed: true, remaining: max - count, retryAfterSeconds: 0 };
}

/* ── API public ────────────────────────────────────────────────── */

export async function checkRateLimit(
  ip: string,
  bucket: string,
  max: number,
  windowMs: number
): Promise<RateLimitResult> {
  const key = `${bucket}:${ip}`;
  if (UPSTASH_URL && UPSTASH_TOKEN) {
    try {
      return await checkUpstash(key, max, windowMs);
    } catch {
      // fail-open: pană de Redis → nu blocăm userii; contorul local preia
      return checkMemory(key, max, windowMs);
    }
  }
  return checkMemory(key, max, windowMs);
}

/** Doar CITEȘTE contorul, fără să-l incrementeze — pentru bugete de
 *  „încercări eșuate" (ex. login): blocarea se verifică înainte, dar
 *  consumul se înregistrează doar la eșec. */
export async function peekRateLimit(
  ip: string,
  bucket: string,
  max: number,
  windowMs: number
): Promise<boolean> {
  const key = `${bucket}:${ip}`;
  if (UPSTASH_URL && UPSTASH_TOKEN) {
    try {
      const windowId = Math.floor(Date.now() / windowMs);
      const res = await fetch(`${UPSTASH_URL}/get/rl:${key}:${windowId}`, {
        headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
        signal: AbortSignal.timeout(2000),
      });
      if (!res.ok) throw new Error(`upstash ${res.status}`);
      const { result } = (await res.json()) as { result: string | null };
      return Number(result ?? 0) < max; // true = mai are voie
    } catch {
      // fail-open + verificare locală
    }
  }
  const now = Date.now();
  const timestamps = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  return timestamps.length < max;
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || "local";
}

/** Răspuns standard 429 pentru rutele care refuză prin rate limit. */
export function rateLimitHeaders(limit: RateLimitResult): HeadersInit {
  return { "Retry-After": String(limit.retryAfterSeconds) };
}
