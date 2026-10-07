"use client";
import { useMemo, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/ui/logo";
import { HBars, Heatmap, LineChart } from "@/components/admin/charts";
import { AI_STAGE_LABELS, type AdminDataset, type AdminMode } from "@/lib/admin/types";
import { BENCHMARK_NOTES, BENCHMARK_ROWS } from "@/lib/admin/benchmark";
import {
  computeDaily,
  computeErrorsByRoute,
  computeFunnel,
  computeHeatmap,
  computeQuality,
  computeStages,
  computeSummary,
  filterByPeriod,
  slowestCalls,
  toCsv,
  type PeriodDays,
} from "@/lib/admin/metrics";

/* ────────────────────────────────────────────────────────────────
   Panoul de administrare — componentă comună pentru /admin (date
   reale, anonimizate pe server) și /demo/admin (date generate).
   Nicio informație personală nu ajunge aici: doar „Utilizator #…”.
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

const STEP_LABELS: Record<number, string> = {
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

const nf = new Intl.NumberFormat("ro-RO");
const fmtInt = (v: number) => nf.format(Math.round(v));
const fmtPct = (v: number, digits = 1) => `${(v * 100).toFixed(digits)}%`;
const fmtUSD = (v: number) => (v < 1 ? `${(v * 100).toFixed(2)} ¢` : `$${v.toFixed(2)}`);
const fmtEUR = (v: number) => `${v.toFixed(2).replace(".", ",")} €`;
const fmtMs = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)} s` : `${Math.round(v)} ms`);
function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ro-RO", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return iso;
  }
}
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

const subscribeNoop = () => () => {};

export function AdminDashboard({ data, mode, onReload }: AdminDashboardProps) {
  const [tab, setTab] = useState<Tab>("overview");
  const [period, setPeriod] = useState<PeriodDays>(30);
  // datele/orele depind de fusul orar al browserului → le randăm după hidratare
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);

  const cvs = data.sessions.filter((s) => s.generated);
  const sessions = data.sessions.filter((s) => !s.generated);

  return (
    <main style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 20px 80px" }}>
      {mode === "demo" && (
        <div
          data-testid="admin-demo-banner"
          style={{ ...CARD, padding: "12px 18px", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", background: "var(--wash)", borderColor: "var(--brand-200, #f8c2a7)" }}
        >
          <strong style={{ fontSize: 13.5 }}>Demo cu date generate.</strong>
          <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Nicio sesiune de aici nu e reală; cifrele folosesc modelele și formula de cost din producție. Admin-ul real e protejat cu parolă.
          </span>
          <a href="https://github.com/Sasha5122/cv-smart" target="_blank" rel="noreferrer" style={{ ...PILL_BTN, marginLeft: "auto" }}>
            Codul pe GitHub
          </a>
        </div>
      )}

      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "var(--foreground)" }}>
          <LogoMark size={28} on="light" />
          <span style={{ fontWeight: 700, fontSize: 17 }}>CVexpres — Admin{mode === "demo" ? " · Demo" : ""}</span>
        </Link>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 12.5, color: "var(--muted-foreground)" }}>
            Retenție: {data.retentionDays} zile{mode === "real" ? ` · Șterse automat acum: ${data.deletedCount}` : ""}
          </span>
          {onReload && (
            <button onClick={onReload} style={PILL_BTN}>
              Reîncarcă
            </button>
          )}
          <Link href="/" style={PILL_BTN}>
            ← Pagina principală
          </Link>
        </div>
      </header>

      <nav style={{ display: "flex", gap: 8, marginBottom: 20 }} aria-label="Secțiuni admin">
        {(
          [
            ["overview", "Prezentare generală"],
            ["eval", "Evaluare"],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            data-testid={`admin-tab-${key}`}
            onClick={() => setTab(key)}
            aria-pressed={tab === key}
            style={{
              ...PILL_BTN,
              backgroundColor: tab === key ? "var(--ink)" : "#fff",
              color: tab === key ? "#fff" : "var(--foreground)",
              borderColor: tab === key ? "var(--ink)" : "var(--hairline-strong)",
            }}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === "overview" ? (
        <>
          <section style={CARD} data-testid="admin-cvs">
            <SectionTitle sub={`Se șterg automat la ${data.retentionDays} de zile de la ultima activitate, conform Termenilor și condițiilor.`}>
              CV-uri generate ({cvs.length})
            </SectionTitle>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={TH}>Utilizator</th>
                    <th style={TH}>Design</th>
                    <th style={TH}>Plătit</th>
                    <th style={TH}>Generat la</th>
                    {mode === "real" && <th style={TH}>PDF</th>}
                  </tr>
                </thead>
                <tbody>
                  {cvs.length === 0 && (
                    <tr>
                      <td style={TD} colSpan={5}>
                        Niciun CV generat încă.
                      </td>
                    </tr>
                  )}
                  {cvs.map((s) => (
                    <tr key={s.id}>
                      <td style={{ ...TD, fontWeight: 600 }}>{s.label}</td>
                      <td style={TD}>{s.template ?? "classic"}</td>
                      <td style={TD}>{s.paid === null ? "— (plăți inactive)" : s.paid ? "Da" : "Nu"}</td>
                      <td style={TD}>{mounted ? fmtDate(s.updatedAt) : "…"}</td>
                      {mode === "real" && (
                        <td style={TD}>
                          <a href={`/api/pdf/${s.id}`} style={{ color: "var(--primary)", fontWeight: 600 }}>
                            Descarcă
                          </a>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section style={CARD} data-testid="admin-sessions">
            <SectionTitle sub="Unde s-a oprit fiecare utilizator care nu a ajuns la descărcare.">
              Sesiuni fără CV generat ({sessions.length})
            </SectionTitle>
            <div style={{ overflowX: "auto", maxHeight: 520 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={TH}>Utilizator</th>
                    <th style={TH}>Ultimul pas atins</th>
                    <th style={TH}>Plătit</th>
                    <th style={TH}>Ultima activitate</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.length === 0 && (
                    <tr>
                      <td style={TD} colSpan={4}>
                        Nicio sesiune în lucru.
                      </td>
                    </tr>
                  )}
                  {sessions.map((s) => (
                    <tr key={s.id}>
                      <td style={{ ...TD, fontWeight: 600 }}>{s.label}</td>
                      <td style={TD}>{s.lastStep ? `Pasul ${s.lastStep} — ${STEP_LABELS[s.lastStep] ?? ""}` : "A deschis wizard-ul"}</td>
                      <td style={TD}>{s.paid === null ? "— (plăți inactive)" : s.paid ? "Da" : "Nu"}</td>
                      <td style={TD}>{mounted ? fmtDate(s.updatedAt) : "…"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section style={CARD} data-testid="admin-messages">
            <SectionTitle>Mesaje din pagina de contact ({data.messages.length})</SectionTitle>
            {data.messages.length === 0 && <p style={{ fontSize: 13.5, color: "var(--muted-foreground)" }}>Niciun mesaj încă.</p>}
            {data.messages.map((m) => (
              <div key={m.id} style={{ border: "1px solid var(--hairline)", borderRadius: 10, padding: "14px 16px", marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{m.label}</span>
                  <span style={{ fontSize: 12.5, color: "var(--muted-foreground)" }}>{mounted ? fmtDate(m.createdAt) : "…"}</span>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{m.message}</p>
              </div>
            ))}
          </section>
        </>
      ) : (
        <Evaluation data={data} period={period} setPeriod={setPeriod} mounted={mounted} />
      )}
    </main>
  );
}

/* ────────────────────────────────────────────────────────────────
   Tab-ul Evaluare
   ──────────────────────────────────────────────────────────────── */

function Evaluation({
  data,
  period,
  setPeriod,
  mounted,
}: {
  data: AdminDataset;
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
  const recentErrors = ds.errors.slice(0, 20);

  const exportSessions = () =>
    downloadCsv(
      `sesiuni-${period || "toate"}z.csv`,
      toCsv(ds.sessions.map((s) => ({ utilizator: s.label, status: s.status, generat: s.generated, platit: s.paid, template: s.template, ultimul_pas: s.lastStep, creat: s.createdAt, actualizat: s.updatedAt })))
    );
  const exportCalls = () =>
    downloadCsv(
      `apeluri-ai-${period || "toate"}z.csv`,
      toCsv(ds.aiCalls.map((c) => ({ utilizator: c.label, etapa: c.stageKey, model: c.model, prompt: c.promptTokens, cached: c.cachedTokens, completion: c.completionTokens, reasoning: c.reasoningTokens, cost_usd: c.costUSD.toFixed(6), durata_ms: c.durationMs, json_retries: c.jsonRetries, effort_rejected: c.effortRejected, la: c.createdAt })))
    );

  return (
    <div data-testid="admin-eval">
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>Perioada:</span>
        {(
          [
            [7, "7 zile"],
            [30, "30 zile"],
            [0, "Tot"],
          ] as [PeriodDays, string][]
        ).map(([d, label]) => (
          <button
            key={d}
            data-testid={`admin-period-${d}`}
            onClick={() => setPeriod(d)}
            aria-pressed={period === d}
            style={{ ...PILL_BTN, padding: "6px 14px", backgroundColor: period === d ? "var(--ink)" : "#fff", color: period === d ? "#fff" : "var(--foreground)", borderColor: period === d ? "var(--ink)" : "var(--hairline-strong)" }}
          >
            {label}
          </button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={exportSessions} style={{ ...PILL_BTN, padding: "6px 14px" }} data-testid="admin-export-sessions">
            Export sesiuni CSV
          </button>
          <button onClick={exportCalls} style={{ ...PILL_BTN, padding: "6px 14px" }} data-testid="admin-export-calls">
            Export apeluri AI CSV
          </button>
        </div>
      </div>

      {/* Sumar */}
      <section style={CARD} data-testid="admin-eval-summary">
        <SectionTitle sub="Sesiuni = wizard-uri deschise. Angajate = au trecut de prima pagină. Costul AI include și sesiunile abandonate, ca să fie onest.">
          Sumar
        </SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
          <Tile label="Sesiuni" value={fmtInt(summary.sessions)} hint={`${fmtInt(summary.engaged)} angajate`} testId="tile-sessions" />
          <Tile label="CV-uri generate" value={fmtInt(summary.cvs)} hint={`${fmtPct(summary.conversionToCv)} din angajate`} testId="tile-cvs" />
          <Tile label="Plăți" value={fmtInt(summary.paid)} hint={`${fmtPct(summary.conversionToPaid)} din angajate`} testId="tile-paid" />
          <Tile label="Venit" value={fmtEUR(summary.revenueEUR)} hint="9,99 € per CV" />
          <Tile label="Cost AI total" value={fmtUSD(summary.aiCostUSD)} hint={`${fmtInt(summary.aiCalls)} apeluri · ${fmtInt(summary.tokens)} tokeni`} testId="tile-ai-cost" />
          <Tile label="Cost AI / CV livrat" value={fmtUSD(summary.costPerCvUSD)} hint={`${fmtPct(summary.aiShareOfPrice, 2)} din preț`} />
          <Tile label="Cost / sesiune cu AI" value={fmtUSD(summary.costPerAiSessionUSD)} hint={`${fmtPct(summary.cachedShare)} tokeni din cache`} />
          <Tile label="Erori" value={fmtInt(summary.errors)} hint={`rată ${fmtPct(summary.errorRate, 2)}`} testId="tile-errors" />
        </div>
      </section>

      {/* Funnel */}
      <section style={CARD} data-testid="admin-eval-funnel">
        <SectionTitle sub="Câți utilizatori au atins fiecare pas. Procentul mic = față de pasul anterior.">Funnel pe pași</SectionTitle>
        <HBars
          rows={funnel.map((f) => ({
            label: f.label,
            value: f.count,
            hint: `${fmtInt(f.count)} · ${fmtPct(f.pctOfStart, 0)}${f.key.startsWith("step-1") ? "" : ` (${fmtPct(f.pctOfPrev, 0)})`}`,
            highlight: f.key === "generated" || f.key === "paid",
          }))}
        />
      </section>

      {/* Serii zilnice */}
      <section style={CARD} data-testid="admin-eval-daily">
        <SectionTitle sub="Pe zile, în perioada selectată.">Activitate și cost pe zile</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 22 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Sesiuni începute</div>
            <LineChart points={daily.map((d) => ({ x: d.day.slice(5), y: d.sessions }))} format={fmtInt} color="var(--ink)" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Cost AI (USD)</div>
            <LineChart points={daily.map((d) => ({ x: d.day.slice(5), y: d.costUSD }))} format={fmtUSD} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>CV-uri generate</div>
            <LineChart points={daily.map((d) => ({ x: d.day.slice(5), y: d.cvs }))} format={fmtInt} color="var(--green)" />
          </div>
        </div>
      </section>

      {/* Costuri și latență per etapă */}
      <section style={CARD} data-testid="admin-eval-stages">
        <SectionTitle sub="Fiecare etapă AI: volum, tokeni, cost și latență (p50 / p95). Cached input e taxat la 10%.">Etapele AI: cost și latență</SectionTitle>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={TH}>Etapă</th>
                <th style={TH}>Model</th>
                <th style={{ ...TH, textAlign: "right" }}>Apeluri</th>
                <th style={{ ...TH, textAlign: "right" }}>Prompt</th>
                <th style={{ ...TH, textAlign: "right" }}>Cached</th>
                <th style={{ ...TH, textAlign: "right" }}>Output</th>
                <th style={{ ...TH, textAlign: "right" }}>Cost total</th>
                <th style={{ ...TH, textAlign: "right" }}>Cost / apel</th>
                <th style={{ ...TH, textAlign: "right" }}>p50</th>
                <th style={{ ...TH, textAlign: "right" }}>p95</th>
              </tr>
            </thead>
            <tbody>
              {stages.length === 0 && (
                <tr>
                  <td style={TD} colSpan={10}>
                    Niciun apel AI în perioada selectată.
                  </td>
                </tr>
              )}
              {stages.map((s) => (
                <tr key={s.stageKey}>
                  <td style={{ ...TD, fontWeight: 600 }}>{AI_STAGE_LABELS[s.stageKey]}</td>
                  <td style={TD}>{s.models.join(", ")}</td>
                  <td style={NUM}>{fmtInt(s.calls)}</td>
                  <td style={NUM}>{fmtInt(s.promptTokens)}</td>
                  <td style={NUM}>{fmtInt(s.cachedTokens)}</td>
                  <td style={NUM}>{fmtInt(s.completionTokens)}</td>
                  <td style={NUM}>{fmtUSD(s.costUSD)}</td>
                  <td style={NUM}>{fmtUSD(s.avgCostUSD)}</td>
                  <td style={NUM}>{fmtMs(s.p50Ms)}</td>
                  <td style={NUM}>{fmtMs(s.p95Ms)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {slow.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Cele mai lente 5 apeluri</div>
            <HBars rows={slow.map((c) => ({ label: `${AI_STAGE_LABELS[c.stageKey]} · ${c.label ?? "—"}`, value: c.durationMs, hint: fmtMs(c.durationMs) }))} color="var(--ink)" />
          </div>
        )}
      </section>

      {/* Calitate pipeline */}
      <section style={CARD} data-testid="admin-eval-quality">
        <SectionTitle sub="Validarea cifrelor e făcută în cod, nu de AI: fiecare număr dintr-un bullet trebuie să existe în ce a scris utilizatorul. Dacă nu, o regenerare țintită, apoi eliminare.">
          Calitatea pipeline-ului
        </SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
          <Tile label="Seturi validate" value={fmtInt(quality.validations)} />
          <Tile label="Rată regenerare" value={fmtPct(quality.regenRate)} hint={`${fmtInt(quality.firstPassInvalidTotal)} bullet-uri cu cifre inexistente la prima trecere`} />
          <Tile label="Bullet-uri eliminate" value={fmtInt(quality.droppedTotal)} hint="după regenerare, tot invalide" />
          <Tile label="Bullet-uri / set" value={quality.avgFinalCount.toFixed(2)} hint="din 7 generate" />
          <Tile label="Retry JSON" value={fmtInt(quality.jsonRetries)} hint="răspunsuri reluate pentru JSON invalid" />
          <Tile label="reasoning_effort respins" value={fmtInt(quality.effortRejected)} hint="apeluri reluate fără parametru" />
        </div>
      </section>

      {/* Erori */}
      <section style={CARD} data-testid="admin-eval-errors">
        <SectionTitle sub="Erorile prinse în rutele API (timeouts OpenAI, validare insuficientă, poze neprocesabile, webhook-uri respinse).">Erori</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(240px, 1fr) minmax(320px, 2fr)", gap: 22 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Pe rută</div>
            {byRoute.length === 0 ? (
              <p style={{ fontSize: 13.5, color: "var(--muted-foreground)" }}>Nicio eroare în perioada selectată.</p>
            ) : (
              <HBars rows={byRoute.map((r) => ({ label: r.route, value: r.count, hint: `${r.count} · ${r.statuses}` }))} color="var(--red)" />
            )}
          </div>
          <div style={{ overflowX: "auto" }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Ultimele {recentErrors.length}</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={TH}>Când</th>
                  <th style={TH}>Rută</th>
                  <th style={TH}>Status</th>
                  <th style={TH}>Utilizator</th>
                  <th style={TH}>Mesaj</th>
                </tr>
              </thead>
              <tbody>
                {recentErrors.map((e) => (
                  <tr key={e.id}>
                    <td style={{ ...TD, whiteSpace: "nowrap" }}>{mounted ? fmtDate(e.createdAt) : "…"}</td>
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

      {/* Benchmark */}
      <section style={CARD} data-testid="admin-eval-benchmark">
        <SectionTitle sub={BENCHMARK_NOTES.method}>Benchmark modele (iul 2026)</SectionTitle>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={TH}>Config</th>
                <th style={TH}>Apel 1</th>
                <th style={TH}>Apel 2</th>
                <th style={{ ...TH, textAlign: "right" }}>Cost / job</th>
                <th style={{ ...TH, textAlign: "right" }}>% din C0</th>
                <th style={{ ...TH, textAlign: "right" }}>Cifre picate / eliminate</th>
                <th style={{ ...TH, textAlign: "right" }}>Formă nominală</th>
                <th style={{ ...TH, textAlign: "right" }}>Reasoning</th>
                <th style={{ ...TH, textAlign: "right" }}>Invenție</th>
              </tr>
            </thead>
            <tbody>
              {BENCHMARK_ROWS.map((r) => (
                <tr key={r.config} style={r.production ? { background: "var(--green-soft)" } : undefined}>
                  <td style={{ ...TD, fontWeight: 700 }}>
                    {r.config}
                    {r.production && <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: "var(--green-strong)" }}>PRODUCȚIE</span>}
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
          <strong>{BENCHMARK_NOTES.decision}</strong>
        </p>
        <p style={{ fontSize: 13.5, marginTop: 6, lineHeight: 1.6, color: "var(--muted-foreground)" }}>{BENCHMARK_NOTES.surprise}</p>
      </section>

      {/* Heatmap */}
      <section style={CARD} data-testid="admin-eval-heatmap">
        <SectionTitle sub="Sesiuni începute pe zi a săptămânii × oră (ora locală a browserului).">Când vin utilizatorii</SectionTitle>
        {heat.length > 0 ? <Heatmap grid={heat} /> : <p style={{ fontSize: 13 }}>…</p>}
      </section>
    </div>
  );
}
