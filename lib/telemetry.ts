/**
 * Telemetrie de produs — scrisă în tabela `events` existentă (fără schemă nouă).
 *
 *  - ai_call           usage + cost + durată per apel AI
 *  - api_error         erorile prinse în blocurile catch ale rutelor API
 *  - validation_result rezultatul validării cifrelor (anti-halucinare)
 *
 * Toate apelurile sunt best-effort: nu aruncă niciodată, au timeout scurt și
 * nu blochează răspunsul către utilizator. Un sessionId care nu e UUID devine
 * null (coloana e FK nullable), ca să nu pierdem evenimentul.
 */
import { supabaseAdmin } from "@/lib/db/supabase";
import type { CallUsage } from "@/lib/openai";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const WRITE_TIMEOUT_MS = 1500;

function asSessionId(value: unknown): string | null {
  return typeof value === "string" && UUID_RE.test(value) ? value : null;
}

function telemetryEnabled(): boolean {
  return process.env.TELEMETRY_DISABLED !== "1";
}

async function insertEvent(
  eventName: string,
  sessionId: unknown,
  properties: Record<string, unknown>
): Promise<void> {
  if (!telemetryEnabled()) return;
  try {
    const write = supabaseAdmin.from("events").insert({
      session_id: asSessionId(sessionId),
      event_name: eventName,
      properties,
    });
    const timeout = new Promise<void>((resolve) => setTimeout(resolve, WRITE_TIMEOUT_MS));
    await Promise.race([write.then(() => undefined), timeout]);
  } catch {
    // silențios — telemetria nu are voie să deranjeze utilizatorul
  }
}

export interface AiCallRecord extends CallUsage {
  sessionId?: string | null;
}

/** Un apel AI finalizat (din callStructured sau lib/ai/client). */
export function recordAiCall(u: AiCallRecord): Promise<void> {
  return insertEvent("ai_call", u.sessionId, {
    stage: u.stage,
    model: u.model,
    promptTokens: u.promptTokens,
    cachedTokens: u.cachedTokens,
    completionTokens: u.completionTokens,
    reasoningTokens: u.reasoningTokens,
    costUSD: Number(u.costUSD.toFixed(6)),
    durationMs: u.durationMs ?? 0,
    jsonRetries: u.jsonRetries,
    effortRejected: u.effortRejected,
  });
}

/** O eroare prinsă într-o rută API. `err` poate fi orice (Error, string, obiect). */
export function recordApiError(
  route: string,
  status: number,
  err: unknown,
  sessionId?: string | null
): Promise<void> {
  const message =
    err instanceof Error ? `${err.name}: ${err.message}` : typeof err === "string" ? err : String(err ?? "");
  return insertEvent("api_error", sessionId, {
    route,
    status,
    message: message.slice(0, 300),
  });
}

/** Rezultatul validării cifrelor pentru un set de bullet-uri. */
export function recordValidation(
  sessionId: string | null | undefined,
  v: { firstPassInvalid: number; regenerated: boolean; dropped: number; finalCount: number }
): Promise<void> {
  return insertEvent("validation_result", sessionId, v);
}
