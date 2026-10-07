/**
 * Metrici de evaluare calculate din AdminDataset — funcții pure, fără I/O.
 * Aceleași calcule rulează peste datele reale (/admin) și peste demo (/demo/admin).
 */
import { AI_STAGE_ORDER, type AdminDataset, type AdminAiCall, type AdminError, type AdminValidation, type AiStageKey } from "./types";

/** Prețul produsului în EUR și un curs orientativ pentru comparația cu costul AI (USD). */
export const PRICE_EUR = 9.99;
export const USD_PER_EUR = 1.08;

export type PeriodDays = 7 | 30 | 0;

const DAY = 24 * 60 * 60 * 1000;

export function filterByPeriod(ds: AdminDataset, days: PeriodDays, nowMs = Date.now()): AdminDataset {
  if (days === 0) return ds;
  const cutoff = new Date(nowMs - days * DAY).toISOString();
  const sessionIds = new Set(ds.sessions.filter((s) => s.updatedAt >= cutoff).map((s) => s.id));
  return {
    ...ds,
    sessions: ds.sessions.filter((s) => sessionIds.has(s.id)),
    aiCalls: ds.aiCalls.filter((c) => c.createdAt >= cutoff),
    validations: ds.validations.filter((v) => v.createdAt >= cutoff),
    errors: ds.errors.filter((e) => e.createdAt >= cutoff),
    messages: ds.messages.filter((m) => m.createdAt >= cutoff),
  };
}

export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx];
}

// ---------------------------------------------------------------------------

export interface SummaryMetrics {
  sessions: number;
  /** sesiuni care au trecut de prima pagină */
  engaged: number;
  cvs: number;
  paid: number;
  revenueEUR: number;
  aiCalls: number;
  aiCostUSD: number;
  /** cost AI total / CV-uri livrate (include și sesiunile abandonate) */
  costPerCvUSD: number;
  /** cost AI mediu pentru o sesiune care a folosit AI */
  costPerAiSessionUSD: number;
  tokens: number;
  cachedShare: number;
  errors: number;
  /** erori / (apeluri AI + erori) */
  errorRate: number;
  /** cât din preț consumă AI-ul, pentru un CV livrat */
  aiShareOfPrice: number;
  conversionToCv: number;
  conversionToPaid: number;
}

export function computeSummary(ds: AdminDataset): SummaryMetrics {
  const sessions = ds.sessions.length;
  const engaged = ds.sessions.filter((s) => (s.lastStep ?? 0) >= 2 || s.generated).length;
  const cvs = ds.sessions.filter((s) => s.generated).length;
  const paid = ds.sessions.filter((s) => s.paid === true).length;
  const aiCostUSD = ds.aiCalls.reduce((s, c) => s + c.costUSD, 0);
  const tokens = ds.aiCalls.reduce((s, c) => s + c.promptTokens + c.completionTokens, 0);
  const cached = ds.aiCalls.reduce((s, c) => s + c.cachedTokens, 0);
  const prompt = ds.aiCalls.reduce((s, c) => s + c.promptTokens, 0);
  const aiSessions = new Set(ds.aiCalls.map((c) => c.sessionId).filter(Boolean)).size;
  const errors = ds.errors.length;
  const costPerCvUSD = cvs > 0 ? aiCostUSD / cvs : 0;
  return {
    sessions,
    engaged,
    cvs,
    paid,
    revenueEUR: paid * PRICE_EUR,
    aiCalls: ds.aiCalls.length,
    aiCostUSD,
    costPerCvUSD,
    costPerAiSessionUSD: aiSessions > 0 ? aiCostUSD / aiSessions : 0,
    tokens,
    cachedShare: prompt > 0 ? cached / prompt : 0,
    errors,
    errorRate: ds.aiCalls.length + errors > 0 ? errors / (ds.aiCalls.length + errors) : 0,
    aiShareOfPrice: costPerCvUSD / (PRICE_EUR * USD_PER_EUR),
    conversionToCv: engaged > 0 ? cvs / engaged : 0,
    conversionToPaid: engaged > 0 ? paid / engaged : 0,
  };
}

// ---------------------------------------------------------------------------

export interface FunnelStep {
  key: string;
  label: string;
  count: number;
  pctOfStart: number;
  pctOfPrev: number;
}

const STEP_NAMES: Record<number, string> = {
  1: "Contact",
  2: "Poză",
  3: "Unde aplici",
  4: "Experiență",
  5: "Educație",
  6: "Abilități",
  7: "Limbi",
  8: "Permis",
  9: "Hobby-uri",
  10: "Finalizare",
};

export function computeFunnel(ds: AdminDataset): FunnelStep[] {
  const rows: { key: string; label: string; count: number }[] = [];
  for (let step = 1; step <= 10; step++) {
    const count = ds.sessions.filter((s) => (s.lastStep ?? 0) >= step || (s.generated && step <= 10)).length;
    rows.push({ key: `step-${step}`, label: `${step}. ${STEP_NAMES[step]}`, count });
  }
  rows.push({ key: "generated", label: "CV generat", count: ds.sessions.filter((s) => s.generated).length });
  rows.push({ key: "paid", label: "Plătit", count: ds.sessions.filter((s) => s.paid === true).length });
  const start = rows[0]?.count ?? 0;
  return rows.map((r, i) => ({
    ...r,
    pctOfStart: start > 0 ? r.count / start : 0,
    pctOfPrev: i === 0 ? 1 : rows[i - 1].count > 0 ? r.count / rows[i - 1].count : 0,
  }));
}

// ---------------------------------------------------------------------------

export interface StageMetrics {
  stageKey: AiStageKey;
  calls: number;
  models: string[];
  promptTokens: number;
  cachedTokens: number;
  completionTokens: number;
  reasoningTokens: number;
  costUSD: number;
  avgCostUSD: number;
  p50Ms: number;
  p95Ms: number;
  jsonRetries: number;
  effortRejected: number;
}

export function computeStages(ds: AdminDataset): StageMetrics[] {
  const groups = new Map<AiStageKey, AdminAiCall[]>();
  for (const c of ds.aiCalls) {
    const list = groups.get(c.stageKey) ?? [];
    list.push(c);
    groups.set(c.stageKey, list);
  }
  return AI_STAGE_ORDER.filter((k) => groups.has(k)).map((stageKey) => {
    const calls = groups.get(stageKey)!;
    const costUSD = calls.reduce((s, c) => s + c.costUSD, 0);
    const durations = calls.map((c) => c.durationMs);
    return {
      stageKey,
      calls: calls.length,
      models: [...new Set(calls.map((c) => c.model))],
      promptTokens: calls.reduce((s, c) => s + c.promptTokens, 0),
      cachedTokens: calls.reduce((s, c) => s + c.cachedTokens, 0),
      completionTokens: calls.reduce((s, c) => s + c.completionTokens, 0),
      reasoningTokens: calls.reduce((s, c) => s + c.reasoningTokens, 0),
      costUSD,
      avgCostUSD: costUSD / calls.length,
      p50Ms: percentile(durations, 50),
      p95Ms: percentile(durations, 95),
      jsonRetries: calls.reduce((s, c) => s + c.jsonRetries, 0),
      effortRejected: calls.filter((c) => c.effortRejected).length,
    };
  });
}

// ---------------------------------------------------------------------------

export interface DailyPoint {
  day: string; // YYYY-MM-DD
  sessions: number;
  cvs: number;
  paid: number;
  costUSD: number;
  errors: number;
}

function dayKey(iso: string): string {
  const d = new Date(iso);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function computeDaily(ds: AdminDataset, days: number, nowMs = Date.now()): DailyPoint[] {
  const map = new Map<string, DailyPoint>();
  const span = days === 0 ? 30 : days;
  for (let i = span - 1; i >= 0; i--) {
    const key = dayKey(new Date(nowMs - i * DAY).toISOString());
    map.set(key, { day: key, sessions: 0, cvs: 0, paid: 0, costUSD: 0, errors: 0 });
  }
  const bump = (iso: string, fn: (p: DailyPoint) => void) => {
    const p = map.get(dayKey(iso));
    if (p) fn(p);
  };
  for (const s of ds.sessions) {
    bump(s.createdAt, (p) => {
      p.sessions++;
      if (s.generated) p.cvs++;
      if (s.paid) p.paid++;
    });
  }
  for (const c of ds.aiCalls) bump(c.createdAt, (p) => (p.costUSD += c.costUSD));
  for (const e of ds.errors) bump(e.createdAt, (p) => p.errors++);
  return [...map.values()];
}

// ---------------------------------------------------------------------------

export interface QualityMetrics {
  validations: number;
  regenRate: number;
  firstPassInvalidTotal: number;
  droppedTotal: number;
  avgFinalCount: number;
  jsonRetries: number;
  effortRejected: number;
}

export function computeQuality(ds: AdminDataset): QualityMetrics {
  const v = ds.validations;
  return {
    validations: v.length,
    regenRate: v.length > 0 ? v.filter((x) => x.regenerated).length / v.length : 0,
    firstPassInvalidTotal: v.reduce((s, x) => s + x.firstPassInvalid, 0),
    droppedTotal: v.reduce((s, x) => s + x.dropped, 0),
    avgFinalCount: v.length > 0 ? v.reduce((s, x) => s + x.finalCount, 0) / v.length : 0,
    jsonRetries: ds.aiCalls.reduce((s, c) => s + c.jsonRetries, 0),
    effortRejected: ds.aiCalls.filter((c) => c.effortRejected).length,
  };
}

// ---------------------------------------------------------------------------

export interface RouteErrors {
  route: string;
  count: number;
  statuses: string;
}

export function computeErrorsByRoute(ds: AdminDataset): RouteErrors[] {
  const map = new Map<string, AdminError[]>();
  for (const e of ds.errors) map.set(e.route, [...(map.get(e.route) ?? []), e]);
  return [...map.entries()]
    .map(([route, list]) => ({
      route,
      count: list.length,
      statuses: [...new Set(list.map((e) => e.status))].sort().join(", "),
    }))
    .sort((a, b) => b.count - a.count);
}

export function slowestCalls(ds: AdminDataset, n = 5): AdminAiCall[] {
  return [...ds.aiCalls].sort((a, b) => b.durationMs - a.durationMs).slice(0, n);
}

/** 7 zile × 24 ore — numărul de sesiuni începute (ora locală a celui care privește). */
export function computeHeatmap(ds: AdminDataset): number[][] {
  const grid = Array.from({ length: 7 }, () => Array<number>(24).fill(0));
  for (const s of ds.sessions) {
    const d = new Date(s.createdAt);
    grid[d.getDay()][d.getHours()]++;
  }
  return grid;
}

// ---------------------------------------------------------------------------

export function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}

// ---------------------------------------------------------------------------

/** Metricile unei singure sesiuni (rând în tabelele din Prezentare generală). */
export interface SessionMetrics {
  aiCalls: number;
  costUSD: number;
  tokens: number;
  /** suma duratelor apelurilor AI */
  aiTimeMs: number;
  /** de la prima la ultima activitate */
  timeInWizardMs: number;
  errors: number;
  regenerations: number;
  /** bullet-uri valide din ultimul set validat (null = fără set) */
  validBullets: number | null;
  calls: AdminAiCall[];
  errorList: AdminError[];
}

export function computeSessionMetrics(ds: AdminDataset): Map<string, SessionMetrics> {
  const map = new Map<string, SessionMetrics>();
  const get = (id: string, created?: string, updated?: string) => {
    let m = map.get(id);
    if (!m) {
      m = { aiCalls: 0, costUSD: 0, tokens: 0, aiTimeMs: 0, timeInWizardMs: 0, errors: 0, regenerations: 0, validBullets: null, calls: [], errorList: [] };
      map.set(id, m);
    }
    if (created && updated) m.timeInWizardMs = Math.max(0, Date.parse(updated) - Date.parse(created));
    return m;
  };
  for (const s of ds.sessions) get(s.id, s.createdAt, s.updatedAt);
  for (const c of ds.aiCalls) {
    if (!c.sessionId) continue;
    const m = get(c.sessionId);
    m.aiCalls++;
    m.costUSD += c.costUSD;
    m.tokens += c.promptTokens + c.completionTokens;
    m.aiTimeMs += c.durationMs;
    m.calls.push(c);
  }
  for (const e of ds.errors) {
    if (!e.sessionId) continue;
    const m = get(e.sessionId);
    m.errors++;
    m.errorList.push(e);
  }
  const latestValidation = new Map<string, AdminValidation>();
  for (const v of ds.validations) {
    if (!v.sessionId) continue;
    const prev = latestValidation.get(v.sessionId);
    if (!prev || v.createdAt > prev.createdAt) latestValidation.set(v.sessionId, v);
    if (v.regenerated) get(v.sessionId).regenerations++;
  }
  for (const [id, v] of latestValidation) get(id).validBullets = v.finalCount;
  for (const m of map.values()) {
    m.calls.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    m.errorList.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }
  return map;
}
