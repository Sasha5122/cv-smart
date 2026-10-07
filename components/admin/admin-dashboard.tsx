"use client";
import { Fragment, useMemo, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/ui/logo";
import { HBars, Heatmap, LineChart } from "@/components/admin/charts";
import type { AdminDataset, AdminMode, AdminSessionRow } from "@/lib/admin/types";
import { BENCHMARK_ROWS } from "@/lib/admin/benchmark";
import { ADMIN_STRINGS, useAdminLocale, type AdminLocale, type AdminStrings } from "@/lib/admin/i18n";
import {
  computeDaily,
  computeErrorsByRoute,
  computeFunnel,
  computeHeatmap,
  computeQuality,
  computeSessionMetrics,
  computeStages,
  computeSummary,
  filterByPeriod,
  slowestCalls,
  toCsv,
  type PeriodDays,
  type SessionMetrics,
} from "@/lib/admin/metrics";

/* ────────────────────────────────────────────────────────────────
   Panoul de administrare — componentă comună pentru /admin (date
   reale, anonimizate pe server) și /demo/admin (date generate).
   Nicio informație personală nu ajunge aici: doar „Utilizator #…”.
   Limba: română implicit, engleză ca opțiune (RO | EN în header).
   ──────────────────────────────────────────────────────────────── */

const CARD: CSSProperties = {
  backgroundColor: "#fff",
  border: "1px solid var(--hairline)",
  borderRadius: 14,
  padding: "22px 24px",
  marginBottom: 22,
};

const TH: CSSProperties = {
  textAlign: "left",
  fontSize: 11.5,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "var(--muted-foreground)",
  padding: "8px 10px",
  borderBottom: "1px solid var(--hairline)",
  whiteSpace: "nowrap",
};
const THR: CSSProperties = { ...TH, textAlign: "right" };

const TD: CSSProperties = {
  fontSize: 13.5,
  padding: "10px 10px",
  borderBottom: "1px solid var(--hairline)",
  verticalAlign: "top",
};
const NUM: CSSProperties = { ...TD, fontVariantNumeric: "tabular-nums", textAlign: "right", whiteSpace: "nowrap" };

const PILL_BTN: CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  padding: "8px 18px",
  borderRadius: "var(--radius-pill)",
  border: "1px solid var(--hairline-strong)",
  backgroundColor: "#fff",
  color: "var(--foreground)",
  cursor: "pointer",
  textDecoration: "none",
};
const PILL_ACTIVE: CSSProperties = { backgroundColor: "var(--ink)", color: "#fff", borderColor: "var(--ink)" };

const subscribeNoop = () => () => {};

/* ── formatare dependentă de limbă ────────────────────────────── */
function makeFormatters(t: AdminStrings) {
  const nf = new Intl.NumberFormat(t.intl);
  const fmtInt = (v: number) => nf.format(Math.round(v));
  const fmtPct = (v: number, digits = 1) => `${(v * 100).toFixed(digits)}%`;
  const fmtUSD = (v: number) => (v < 1 ? `${(v * 100).toFixed(2)} ¢` : `$${v.toFixed(2)}`);
  const fmtEUR = (v: number) => (t.locale === "ro" ? `${v.toFixed(2).replace(".", ",")} €` : `€${v.toFixed(2)}`);
  const fmtMs = (v: number) => {
    if (v >= 60_000) return `${Math.floor(v / 60_000)} min ${Math.round((v % 60_000) / 1000)} s`;
    if (v >= 1000) return `${(v / 1000).toFixed(1)} s`;
    return `${Math.round(v)} ms`;
  };
  const fmtDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString(t.intl, { dateStyle: "short", timeStyle: "short" });
    } catch {
      return iso;
    }
  };
  return { fmtInt, fmtPct, fmtUSD, fmtEUR, fmtMs, fmtDate };
}
type Fmt = ReturnType<typeof makeFormatters>;

function downloadCsv(name: string, csv: string) {
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function Tile({ label, value, hint, testId }: { label: string; value: string; hint?: string; testId?: string }) {
  return (
    <div data-testid={testId} style={{ border: "1px solid var(--hairline)", borderRadius: 12, padding: "14px 16px", background: "var(--card)" }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-foreground)" }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4, fontVariantNumeric: "tabular-nums", color: "var(--ink)" }}>{value}</div>
      {hint && <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>{hint}</div>}
    </div>
  );
}

function SectionTitle({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{children}</h2>
      {sub && <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 14 }}>{sub}</p>}
    </>
  );
}

export interface AdminDashboardProps {
  data: AdminDataset;
  mode: AdminMode;
  onReload?: () => void;
}

type Tab = "overview" | "eval";

export function AdminDashboard({ data, mode, onReload }: AdminDashboardProps) {
  const [locale, setLocale] = useAdminLocale();
  const t = ADMIN_STRINGS[locale];
  const f = useMemo(() => makeFormatters(t), [t]);
  const [tab, setTab] = useState<Tab>("overview");
  const [period, setPeriod] = useState<PeriodDays>(30);
  // datele/orele depind de fusul orar al browserului → le randăm după hidratare
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const perSession = useMemo(() => computeSessionMetrics(data), [data]);

  const cvs = data.sessions.filter((s) => s.generated);
  const sessions = data.sessions.filter((s) => !s.generated);

  return (
    <main style={{ maxWidth: 1240, margin: "0 auto", padding: "28px 20px 80px" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "var(--foreground)" }}>
          <LogoMark size={28} on="light" />
          <span style={{ fontWeight: 700, fontSize: 17 }}>{t.title}</span>
        </Link>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 12.5, color: "var(--muted-foreground)" }}>
            {t.retention(data.retentionDays)}
            {mode === "real" ? ` · ${t.deletedNow(data.deletedCount)}` : ""}
          </span>
          <LangToggle locale={locale} onChange={setLocale} />
          {onReload && (
            <button onClick={onReload} style={PILL_BTN}>
              {t.reload}
            </button>
          )}
          <Link href="/" style={PILL_BTN}>
            {t.home}
          </Link>
        </div>
      </header>

      <nav style={{ display: "flex", gap: 8, marginBottom: 20 }} aria-label="Admin">
        {(
          [
            ["overview", t.tabs.overview],
            ["eval", t.tabs.eval],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button key={key} data-testid={`admin-tab-${key}`} onClick={() => setTab(key)} aria-pressed={tab === key} style={{ ...PILL_BTN, ...(tab === key ? PILL_ACTIVE : {}) }}>
            {label}
          </button>
        ))}
      </nav>

      {tab === "overview" ? (
        <Overview data={data} mode={mode} t={t} f={f} mounted={mounted} perSession={perSession} cvs={cvs} sessions={sessions} />
      ) : (
        <Evaluation data={data} t={t} f={f} period={period} setPeriod={setPeriod} mounted={mounted} />
      )}
    </main>
  );
}

function LangToggle({ locale, onChange }: { locale: AdminLocale; onChange: (l: AdminLocale) => void }) {
  return (
    <div data-testid="admin-lang" role="group" aria-label="Language" style={{ display: "inline-flex", border: "1px solid var(--hairline-strong)", borderRadius: "var(--radius-pill)", overflow: "hidden" }}>
      {(["ro", "en"] as AdminLocale[]).map((l) => (
        <button
          key={l}
          data-testid={`admin-lang-${l}`}
          onClick={() => onChange(l)}
          aria-pressed={locale === l}
          style={{
            fontSize: 12.5,
            fontWeight: 700,
            padding: "7px 12px",
            border: "none",
            cursor: "pointer",
            backgroundColor: locale === l ? "var(--ink)" : "#fff",
            color: locale === l ? "#fff" : "var(--foreground)",
          }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Prezentare generală: CV-uri, sesiuni, mesaje — cu metrici per rând
   ──────────────────────────────────────────────────────────────── */

function Overview({
  data,
  mode,
  t,
  f,
  mounted,
  perSession,
  cvs,
  sessions,
}: {
  data: AdminDataset;
  mode: AdminMode;
  t: AdminStrings;
  f: Fmt;
  mounted: boolean;
  perSession: Map<string, SessionMetrics>;
  cvs: AdminSessionRow[];
  sessions: AdminSessionRow[];
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const toggle = (id: string) => setExpanded((cur) => (cur === id ? null : id));
  const paidText = (p: boolean | null) => (p === null ? t.paid.inactive : p ? t.paid.yes : t.paid.no);

  const metricCells = (s: AdminSessionRow) => {
    const m = perSession.get(s.id);
    return (
      <>
        <td style={NUM}>{m ? f.fmtUSD(m.costUSD) : "—"}</td>
        <td style={NUM}>{m ? f.fmtInt(m.aiCalls) : "—"}</td>
        <td style={NUM}>{m ? f.fmtInt(m.tokens) : "—"}</td>
        <td style={NUM}>{m ? f.fmtMs(m.aiTimeMs) : "—"}</td>
        <td style={NUM}>{m ? f.fmtMs(m.timeInWizardMs) : "—"}</td>
        <td style={{ ...NUM, color: m && m.errors > 0 ? "var(--red)" : undefined, fontWeight: m && m.errors > 0 ? 700 : undefined }}>{m ? f.fmtInt(m.errors) : "—"}</td>
      </>
    );
  };
  const metricHeaders = (
    <>
      <th style={THR}>{t.cols.aiCost}</th>
      <th style={THR}>{t.cols.aiCalls}</th>
      <th style={THR}>{t.cols.tokens}</th>
      <th style={THR}>{t.cols.aiTime}</th>
      <th style={THR}>{t.cols.timeInWizard}</th>
      <th style={THR}>{t.cols.errors}</th>
    </>
  );

  const rowStyle = (id: string): CSSProperties => ({ cursor: "pointer", background: expanded === id ? "var(--muted)" : undefined });

  return (
    <>
      <section style={CARD} data-testid="admin-cvs">
        <SectionTitle sub={t.cvs.sub(data.retentionDays)}>{t.cvs.title(cvs.length)}</SectionTitle>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={TH}>{t.cols.user}</th>
                <th style={TH}>{t.cols.design}</th>
                <th style={TH}>{t.cols.paid}</th>
                <th style={TH}>{t.cols.generatedAt}</th>
                {metricHeaders}
                <th style={THR}>{t.cols.validBullets}</th>
                {mode === "real" && <th style={TH}>{t.cols.pdf}</th>}
              </tr>
            </thead>
            <tbody>
              {cvs.length === 0 && (
                <tr>
                  <td style={TD} colSpan={12}>
                    {t.cvs.none}
                  </td>
                </tr>
              )}
              {cvs.map((s) => {
                const m = perSession.get(s.id);
                return (
                  <Fragment key={s.id}>
                    <tr data-testid="admin-cv-row" onClick={() => toggle(s.id)} style={rowStyle(s.id)}>
                      <td style={{ ...TD, fontWeight: 600, whiteSpace: "nowrap" }}>{s.label}</td>
                      <td style={TD}>{s.template ?? "classic"}</td>
                      <td style={TD}>{paidText(s.paid)}</td>
                      <td style={{ ...TD, whiteSpace: "nowrap" }}>{mounted ? f.fmtDate(s.updatedAt) : "…"}</td>
                      {metricCells(s)}
                      <td style={NUM}>{m?.validBullets != null ? `${m.validBullets}/7` : "—"}</td>
                      {mode === "real" && (
                        <td style={TD}>
                          <a href={`/api/pdf/${s.id}`} onClick={(e) => e.stopPropagation()} style={{ color: "var(--primary)", fontWeight: 600 }}>
                            {t.cols.download}
                          </a>
                        </td>
                      )}
                    </tr>
                    {expanded === s.id && <DetailsRow colSpan={12} metrics={m} t={t} f={f} mounted={mounted} />}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section style={CARD} data-testid="admin-sessions">
        <SectionTitle sub={t.sessions.sub}>{t.sessions.title(sessions.length)}</SectionTitle>
        <div style={{ overflowX: "auto", maxHeight: 560 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={TH}>{t.cols.user}</th>
                <th style={TH}>{t.cols.lastStep}</th>
                <th style={TH}>{t.cols.paid}</th>
                <th style={TH}>{t.cols.lastActivity}</th>
                {metricHeaders}
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 && (
                <tr>
                  <td style={TD} colSpan={10}>
                    {t.sessions.none}
                  </td>
                </tr>
              )}
              {sessions.map((s) => (
                <Fragment key={s.id}>
                  <tr data-testid="admin-session-row" onClick={() => toggle(s.id)} style={rowStyle(s.id)}>
                    <td style={{ ...TD, fontWeight: 600, whiteSpace: "nowrap" }}>{s.label}</td>
                    <td style={TD}>{s.lastStep ? t.sessions.step(s.lastStep, t.steps[s.lastStep] ?? "") : t.sessions.opened}</td>
                    <td style={TD}>{paidText(s.paid)}</td>
                    <td style={{ ...TD, whiteSpace: "nowrap" }}>{mounted ? f.fmtDate(s.updatedAt) : "…"}</td>
                    {metricCells(s)}
                  </tr>
                  {expanded === s.id && <DetailsRow colSpan={10} metrics={perSession.get(s.id)} t={t} f={f} mounted={mounted} />}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={CARD} data-testid="admin-messages">
        <SectionTitle>{t.messages.title(data.messages.length)}</SectionTitle>
        {data.messages.length === 0 && <p style={{ fontSize: 13.5, color: "var(--muted-foreground)" }}>{t.messages.none}</p>}
        {data.messages.map((m) => (
          <div key={m.id} style={{ border: "1px solid var(--hairline)", borderRadius: 10, padding: "14px 16px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{m.label}</span>
              <span style={{ fontSize: 12.5, color: "var(--muted-foreground)" }}>{mounted ? f.fmtDate(m.createdAt) : "…"}</span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{m.message}</p>
          </div>
        ))}
      </section>
    </>
  );
}

function DetailsRow({ colSpan, metrics, t, f, mounted }: { colSpan: number; metrics: SessionMetrics | undefined; t: AdminStrings; f: Fmt; mounted: boolean }) {
  return (
    <tr data-testid="admin-session-details">
      <td colSpan={colSpan} style={{ ...TD, background: "var(--muted)", padding: "12px 16px 16px" }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-foreground)", marginBottom: 8 }}>{t.details.title}</div>
        {!metrics || metrics.calls.length === 0 ? (
          <p style={{ fontSize: 13 }}>{t.details.noCalls}</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 8 }}>
            <thead>
              <tr>
                <th style={TH}>{t.cols.when}</th>
                <th style={TH}>{t.cols.stage}</th>
                <th style={TH}>{t.cols.model}</th>
                <th style={THR}>{t.cols.prompt}</th>
                <th style={THR}>{t.cols.cached}</th>
                <th style={THR}>{t.cols.output}</th>
                <th style={THR}>{t.cols.cost}</th>
                <th style={THR}>{t.cols.duration}</th>
              </tr>
            </thead>
            <tbody>
              {metrics.calls.map((c) => (
                <tr key={c.id}>
                  <td style={{ ...TD, whiteSpace: "nowrap" }}>{mounted ? f.fmtDate(c.createdAt) : "…"}</td>
                  <td style={TD}>{t.stages[c.stageKey]}</td>
                  <td style={TD}>{c.model}</td>
                  <td style={NUM}>{f.fmtInt(c.promptTokens)}</td>
                  <td style={NUM}>{f.fmtInt(c.cachedTokens)}</td>
                  <td style={NUM}>{f.fmtInt(c.completionTokens)}</td>
                  <td style={NUM}>{f.fmtUSD(c.costUSD)}</td>
                  <td style={NUM}>{f.fmtMs(c.durationMs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {metrics && metrics.errorList.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--red)", marginBottom: 6 }}>{t.details.errors}</div>
            {metrics.errorList.map((e) => (
              <div key={e.id} style={{ fontSize: 13, marginBottom: 4 }}>
                <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--muted-foreground)" }}>{mounted ? f.fmtDate(e.createdAt) : "…"}</span> · <strong>{e.status}</strong> {e.route} — {e.message}
              </div>
            ))}
          </div>
        )}
      </td>
    </tr>
  );
}

/* ────────────────────────────────────────────────────────────────
   Tab-ul Evaluare
   ──────────────────────────────────────────────────────────────── */

function Evaluation({
  data,
  t,
  f,
  period,
  setPeriod,
  mounted,
}: {
  data: AdminDataset;
  t: AdminStrings;
  f: Fmt;
  period: PeriodDays;
  setPeriod: (p: PeriodDays) => void;
  mounted: boolean;
}) {
  const ds = useMemo(() => filterByPeriod(data, period), [data, period]);
  const summary = useMemo(() => computeSummary(ds), [ds]);
  const funnel = useMemo(() => computeFunnel(ds), [ds]);
  const stages = useMemo(() => computeStages(ds), [ds]);
  const quality = useMemo(() => computeQuality(ds), [ds]);
  const byRoute = useMemo(() => computeErrorsByRoute(ds), [ds]);
  const daily = useMemo(() => (mounted ? computeDaily(ds, period) : []), [ds, period, mounted]);
  const heat = useMemo(() => (mounted ? computeHeatmap(ds) : []), [ds, mounted]);
  const slow = useMemo(() => slowestCalls(ds, 5), [ds]);
  const perSession = useMemo(() => computeSessionMetrics(ds), [ds]);
  const recentErrors = ds.errors.slice(0, 20);
  const stepLabel = (key: string, label: string) => {
    const m = /^step-(\d+)$/.exec(key);
    if (m) return `${m[1]}. ${t.steps[Number(m[1])] ?? ""}`;
    return key === "generated" ? t.eval.tiles.cvs : key === "paid" ? t.eval.tiles.paid : label;
  };

  const exportSessions = () =>
    downloadCsv(
      `sessions-${period || "all"}d.csv`,
      toCsv(
        ds.sessions.map((s) => {
          const m = perSession.get(s.id);
          return {
            user: s.label,
            status: s.status,
            generated: s.generated,
            paid: s.paid,
            template: s.template,
            last_step: s.lastStep,
            ai_cost_usd: m ? m.costUSD.toFixed(6) : "",
            ai_calls: m?.aiCalls ?? 0,
            tokens: m?.tokens ?? 0,
            ai_time_ms: m?.aiTimeMs ?? 0,
            time_in_wizard_ms: m?.timeInWizardMs ?? 0,
            errors: m?.errors ?? 0,
            valid_bullets: m?.validBullets ?? "",
            created_at: s.createdAt,
            updated_at: s.updatedAt,
          };
        })
      )
    );
  const exportCalls = () =>
    downloadCsv(
      `ai-calls-${period || "all"}d.csv`,
      toCsv(ds.aiCalls.map((c) => ({ user: c.label, stage: c.stageKey, model: c.model, prompt: c.promptTokens, cached: c.cachedTokens, completion: c.completionTokens, reasoning: c.reasoningTokens, cost_usd: c.costUSD.toFixed(6), duration_ms: c.durationMs, json_retries: c.jsonRetries, effort_rejected: c.effortRejected, at: c.createdAt })))
    );

  return (
    <div data-testid="admin-eval">
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>{t.eval.period}</span>
        {(
          [
            [7, t.eval.periods.d7],
            [30, t.eval.periods.d30],
            [0, t.eval.periods.all],
          ] as [PeriodDays, string][]
        ).map(([d, label]) => (
          <button key={d} data-testid={`admin-period-${d}`} onClick={() => setPeriod(d)} aria-pressed={period === d} style={{ ...PILL_BTN, padding: "6px 14px", ...(period === d ? PILL_ACTIVE : {}) }}>
            {label}
          </button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={exportSessions} style={{ ...PILL_BTN, padding: "6px 14px" }} data-testid="admin-export-sessions">
            {t.eval.exportSessions}
          </button>
          <button onClick={exportCalls} style={{ ...PILL_BTN, padding: "6px 14px" }} data-testid="admin-export-calls">
            {t.eval.exportCalls}
          </button>
        </div>
      </div>

      <section style={CARD} data-testid="admin-eval-summary">
        <SectionTitle sub={t.eval.summary.sub}>{t.eval.summary.title}</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
          <Tile label={t.eval.tiles.sessions} value={f.fmtInt(summary.sessions)} hint={t.eval.tiles.engaged(f.fmtInt(summary.engaged))} testId="tile-sessions" />
          <Tile label={t.eval.tiles.cvs} value={f.fmtInt(summary.cvs)} hint={t.eval.tiles.ofEngaged(f.fmtPct(summary.conversionToCv))} testId="tile-cvs" />
          <Tile label={t.eval.tiles.paid} value={f.fmtInt(summary.paid)} hint={t.eval.tiles.ofEngaged(f.fmtPct(summary.conversionToPaid))} testId="tile-paid" />
          <Tile label={t.eval.tiles.revenue} value={f.fmtEUR(summary.revenueEUR)} hint={t.eval.tiles.perCv} />
          <Tile label={t.eval.tiles.aiCost} value={f.fmtUSD(summary.aiCostUSD)} hint={t.eval.tiles.callsTokens(f.fmtInt(summary.aiCalls), f.fmtInt(summary.tokens))} testId="tile-ai-cost" />
          <Tile label={t.eval.tiles.costPerCv} value={f.fmtUSD(summary.costPerCvUSD)} hint={t.eval.tiles.ofPrice(f.fmtPct(summary.aiShareOfPrice, 2))} />
          <Tile label={t.eval.tiles.costPerSession} value={f.fmtUSD(summary.costPerAiSessionUSD)} hint={t.eval.tiles.cachedShare(f.fmtPct(summary.cachedShare))} />
          <Tile label={t.eval.tiles.errors} value={f.fmtInt(summary.errors)} hint={t.eval.tiles.errorRate(f.fmtPct(summary.errorRate, 2))} testId="tile-errors" />
        </div>
      </section>

      <section style={CARD} data-testid="admin-eval-funnel">
        <SectionTitle sub={t.eval.funnel.sub}>{t.eval.funnel.title}</SectionTitle>
        <HBars
          rows={funnel.map((fs) => ({
            label: stepLabel(fs.key, fs.label),
            value: fs.count,
            hint: `${f.fmtInt(fs.count)} · ${f.fmtPct(fs.pctOfStart, 0)}${fs.key === "step-1" ? "" : ` (${f.fmtPct(fs.pctOfPrev, 0)})`}`,
            highlight: fs.key === "generated" || fs.key === "paid",
          }))}
        />
      </section>

      <section style={CARD} data-testid="admin-eval-daily">
        <SectionTitle sub={t.eval.daily.sub}>{t.eval.daily.title}</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 22 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{t.eval.daily.sessions}</div>
            <LineChart points={daily.map((d) => ({ x: d.day.slice(5), y: d.sessions }))} format={f.fmtInt} color="var(--ink)" labels={t.eval.chart} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{t.eval.daily.cost}</div>
            <LineChart points={daily.map((d) => ({ x: d.day.slice(5), y: d.costUSD }))} format={f.fmtUSD} labels={t.eval.chart} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{t.eval.daily.cvs}</div>
            <LineChart points={daily.map((d) => ({ x: d.day.slice(5), y: d.cvs }))} format={f.fmtInt} color="var(--green)" labels={t.eval.chart} />
          </div>
        </div>
      </section>

      <section style={CARD} data-testid="admin-eval-stages">
        <SectionTitle sub={t.eval.stages.sub}>{t.eval.stages.title}</SectionTitle>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={TH}>{t.cols.stage}</th>
                <th style={TH}>{t.cols.model}</th>
                <th style={THR}>{t.cols.calls}</th>
                <th style={THR}>{t.cols.prompt}</th>
                <th style={THR}>{t.cols.cached}</th>
                <th style={THR}>{t.cols.output}</th>
                <th style={THR}>{t.cols.costTotal}</th>
                <th style={THR}>{t.cols.costPerCall}</th>
                <th style={THR}>p50</th>
                <th style={THR}>p95</th>
              </tr>
            </thead>
            <tbody>
              {stages.length === 0 && (
                <tr>
                  <td style={TD} colSpan={10}>
                    {t.eval.stages.none}
                  </td>
                </tr>
              )}
              {stages.map((s) => (
                <tr key={s.stageKey}>
                  <td style={{ ...TD, fontWeight: 600 }}>{t.stages[s.stageKey]}</td>
                  <td style={TD}>{s.models.join(", ")}</td>
                  <td style={NUM}>{f.fmtInt(s.calls)}</td>
                  <td style={NUM}>{f.fmtInt(s.promptTokens)}</td>
                  <td style={NUM}>{f.fmtInt(s.cachedTokens)}</td>
                  <td style={NUM}>{f.fmtInt(s.completionTokens)}</td>
                  <td style={NUM}>{f.fmtUSD(s.costUSD)}</td>
                  <td style={NUM}>{f.fmtUSD(s.avgCostUSD)}</td>
                  <td style={NUM}>{f.fmtMs(s.p50Ms)}</td>
                  <td style={NUM}>{f.fmtMs(s.p95Ms)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {slow.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{t.eval.stages.slowest}</div>
            <HBars rows={slow.map((c) => ({ label: `${t.stages[c.stageKey]} · ${c.label ?? "—"}`, value: c.durationMs, hint: f.fmtMs(c.durationMs) }))} color="var(--ink)" />
          </div>
        )}
      </section>

      <section style={CARD} data-testid="admin-eval-quality">
        <SectionTitle sub={t.eval.quality.sub}>{t.eval.quality.title}</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
          <Tile label={t.eval.quality.validated} value={f.fmtInt(quality.validations)} />
          <Tile label={t.eval.quality.regenRate} value={f.fmtPct(quality.regenRate)} hint={t.eval.quality.regenHint(f.fmtInt(quality.firstPassInvalidTotal))} />
          <Tile label={t.eval.quality.dropped} value={f.fmtInt(quality.droppedTotal)} hint={t.eval.quality.droppedHint} />
          <Tile label={t.eval.quality.perSet} value={quality.avgFinalCount.toFixed(2)} hint={t.eval.quality.perSetHint} />
          <Tile label={t.eval.quality.jsonRetries} value={f.fmtInt(quality.jsonRetries)} hint={t.eval.quality.jsonHint} />
          <Tile label={t.eval.quality.effort} value={f.fmtInt(quality.effortRejected)} hint={t.eval.quality.effortHint} />
        </div>
      </section>

      <section style={CARD} data-testid="admin-eval-errors">
        <SectionTitle sub={t.eval.errors.sub}>{t.eval.errors.title}</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(240px, 1fr) minmax(320px, 2fr)", gap: 22 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{t.eval.errors.byRoute}</div>
            {byRoute.length === 0 ? (
              <p style={{ fontSize: 13.5, color: "var(--muted-foreground)" }}>{t.eval.errors.none}</p>
            ) : (
              <HBars rows={byRoute.map((r) => ({ label: r.route, value: r.count, hint: `${r.count} · ${r.statuses}` }))} color="var(--red)" />
            )}
          </div>
          <div style={{ overflowX: "auto" }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{t.eval.errors.latest(recentErrors.length)}</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={TH}>{t.cols.when}</th>
                  <th style={TH}>{t.cols.route}</th>
                  <th style={TH}>{t.cols.status}</th>
                  <th style={TH}>{t.cols.user}</th>
                  <th style={TH}>{t.cols.message}</th>
                </tr>
              </thead>
              <tbody>
                {recentErrors.map((e) => (
                  <tr key={e.id}>
                    <td style={{ ...TD, whiteSpace: "nowrap" }}>{mounted ? f.fmtDate(e.createdAt) : "…"}</td>
                    <td style={{ ...TD, whiteSpace: "nowrap" }}>{e.route}</td>
                    <td style={{ ...TD, color: e.status >= 500 ? "var(--red)" : "var(--ink)", fontWeight: 600 }}>{e.status}</td>
                    <td style={{ ...TD, whiteSpace: "nowrap" }}>{e.label ?? "—"}</td>
                    <td style={{ ...TD, fontSize: 12.5, color: "var(--muted-foreground)" }}>{e.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section style={CARD} data-testid="admin-eval-benchmark">
        <SectionTitle sub={t.eval.benchmark.method}>{t.eval.benchmark.title}</SectionTitle>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={TH}>{t.cols.config}</th>
                <th style={TH}>{t.cols.call1}</th>
                <th style={TH}>{t.cols.call2}</th>
                <th style={THR}>{t.cols.costPerJob}</th>
                <th style={THR}>{t.cols.pctOfBaseline}</th>
                <th style={THR}>{t.cols.numbersFailedDropped}</th>
                <th style={THR}>{t.cols.nominalForm}</th>
                <th style={THR}>{t.cols.reasoning}</th>
                <th style={THR}>{t.cols.invention}</th>
              </tr>
            </thead>
            <tbody>
              {BENCHMARK_ROWS.map((r) => (
                <tr key={r.config} style={r.production ? { background: "var(--green-soft)" } : undefined}>
                  <td style={{ ...TD, fontWeight: 700, whiteSpace: "nowrap" }}>
                    {r.config}
                    {r.production && <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: "var(--green-strong)" }}>{t.eval.benchmark.production}</span>}
                  </td>
                  <td style={TD}>{r.call1}</td>
                  <td style={TD}>{r.call2}</td>
                  <td style={NUM}>{r.costCents.toFixed(2)} ¢</td>
                  <td style={NUM}>{r.pctOfBaseline}%</td>
                  <td style={NUM}>
                    {r.numbersFailed} / {r.numbersDropped}
                  </td>
                  <td style={NUM}>{r.nominalForm}</td>
                  <td style={NUM}>{r.reasoningTokens}</td>
                  <td style={NUM}>{r.inventionScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 13.5, marginTop: 14, lineHeight: 1.6 }}>
          <strong>{t.eval.benchmark.decision}</strong>
        </p>
        <p style={{ fontSize: 13.5, marginTop: 6, lineHeight: 1.6, color: "var(--muted-foreground)" }}>{t.eval.benchmark.surprise}</p>
      </section>

      <section style={CARD} data-testid="admin-eval-heatmap">
        <SectionTitle sub={t.eval.heatmap.sub}>{t.eval.heatmap.title}</SectionTitle>
        {heat.length > 0 ? <Heatmap grid={heat} dayLabels={t.eval.heatmap.days} /> : <p style={{ fontSize: 13 }}>…</p>}
      </section>
    </div>
  );
}
