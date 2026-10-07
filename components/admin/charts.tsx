"use client";
import type { CSSProperties } from "react";

/* ────────────────────────────────────────────────────────────────
   Grafice minimale pentru panoul de admin — fără dependențe.
   Bare orizontale (funnel / etape), linie (serii zilnice), heatmap.
   Toate folosesc token-urile de culoare din globals.css.
   ──────────────────────────────────────────────────────────────── */

export interface BarRow {
  label: string;
  value: number;
  /** text mic la dreapta (ex. „72% · 103”) */
  hint?: string;
  highlight?: boolean;
}

export function HBars({
  rows,
  max,
  color = "var(--primary)",
  testId,
}: {
  rows: BarRow[];
  max?: number;
  color?: string;
  testId?: string;
}) {
  const top = max ?? Math.max(1, ...rows.map((r) => r.value));
  return (
    <div data-testid={testId} style={{ display: "grid", gap: 8 }}>
      {rows.map((r) => (
        <div key={r.label} style={{ display: "grid", gridTemplateColumns: "150px 1fr auto", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 12.5, color: r.highlight ? "var(--ink)" : "var(--muted-foreground)", fontWeight: r.highlight ? 700 : 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {r.label}
          </span>
          <div style={{ height: 14, background: "var(--muted)", borderRadius: 7, overflow: "hidden" }}>
            <div
              style={{
                width: `${Math.max(1.5, (r.value / top) * 100)}%`,
                height: "100%",
                background: r.highlight ? "var(--green)" : color,
                borderRadius: 7,
                transition: "width .4s ease",
              }}
            />
          </div>
          <span style={{ fontSize: 12.5, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", color: "var(--ink)" }}>
            {r.hint ?? r.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export interface LinePoint {
  x: string;
  y: number;
}

export function LineChart({
  points,
  height = 140,
  color = "var(--primary)",
  format = (v: number) => String(v),
  testId,
  labels = { max: "max", total: "total" },
}: {
  points: LinePoint[];
  height?: number;
  color?: string;
  format?: (v: number) => string;
  testId?: string;
  labels?: { max: string; total: string };
}) {
  const W = 600;
  const H = height;
  const padX = 6;
  const padY = 10;
  const max = Math.max(1e-9, ...points.map((p) => p.y));
  const n = Math.max(1, points.length - 1);
  const xy = points.map((p, i) => {
    const x = padX + (i / n) * (W - padX * 2);
    const y = H - padY - (p.y / max) * (H - padY * 2);
    return [x, y] as const;
  });
  const path = xy.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${path} L${xy[xy.length - 1]?.[0] ?? padX},${H - padY} L${padX},${H - padY} Z`;
  const first = points[0]?.x ?? "";
  const last = points[points.length - 1]?.x ?? "";
  return (
    <div data-testid={testId}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--muted-foreground)", marginBottom: 4 }}>
        <span>{labels.max} {format(max)}</span>
        <span>{labels.total} {format(points.reduce((s, p) => s + p.y, 0))}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height, display: "block" }} role="img" aria-label="grafic">
        <path d={area} fill={color} opacity={0.12} />
        <path d={path} fill="none" stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke" />
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--muted-foreground)", marginTop: 4 }}>
        <span>{first}</span>
        <span>{last}</span>
      </div>
    </div>
  );
}

const DEFAULT_DAY_LABELS = ["Du", "Lu", "Ma", "Mi", "Jo", "Vi", "Sâ"];

export function Heatmap({ grid, testId, dayLabels }: { grid: number[][]; testId?: string; dayLabels?: string[] }) {
  const DAY_LABELS = dayLabels ?? DEFAULT_DAY_LABELS;
  const max = Math.max(1, ...grid.flat());
  const cell: CSSProperties = { aspectRatio: "1 / 1", borderRadius: 3, minWidth: 0 };
  return (
    <div data-testid={testId} style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: 4 }}>
      <div />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(24, 1fr)", gap: 3, fontSize: 10, color: "var(--muted-foreground)" }}>
        {Array.from({ length: 24 }, (_, h) => (
          <span key={h} style={{ textAlign: "center" }}>{h % 3 === 0 ? h : ""}</span>
        ))}
      </div>
      {grid.map((row, d) => (
        <div key={d} style={{ display: "contents" }}>
          <span style={{ fontSize: 11, color: "var(--muted-foreground)", alignSelf: "center" }}>{DAY_LABELS[d]}</span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(24, 1fr)", gap: 3 }}>
            {row.map((v, h) => (
              <div
                key={h}
                title={`${DAY_LABELS[d]} ${h}:00 — ${v}`}
                style={{ ...cell, background: v === 0 ? "var(--muted)" : `rgba(244, 90, 39, ${0.18 + 0.82 * (v / max)})` }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
