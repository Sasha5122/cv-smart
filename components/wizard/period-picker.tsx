"use client";
import { Select } from "@/components/ui/select";
import { pickMessages, useMessages } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/locale";
import { PERIOD_PICKER_MESSAGES } from "@/lib/i18n/wizard/period-picker";

/* ────────────────────────────────────────────────────────────────
   Selector de perioadă comun (Experiență, Educație): an + lună
   opțională pentru „De când" / „Până când"; la „Până când" prima
   opțiune e „Prezent" (și default-ul).
   ──────────────────────────────────────────────────────────────── */

export interface PeriodValue {
  startYear: string;
  startMonth: string;
  endYear: string;
  endMonth: string;
}

export const EMPTY_PERIOD: PeriodValue = {
  startYear: "",
  startMonth: "",
  endYear: "Prezent",
  endMonth: "",
};

export const MONTHS = [
  "ianuarie", "februarie", "martie", "aprilie", "mai", "iunie",
  "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie",
];
const CURRENT_YEAR = new Date().getFullYear();
export const YEARS = Array.from({ length: CURRENT_YEAR - 1974 }, (_, i) =>
  String(CURRENT_YEAR - i)
);

/** Compune textul perioadei din dropdown-uri (luna e opțională). */
export function buildPeriod(v: PeriodValue, locale: Locale = "ro"): string {
  const m = pickMessages(PERIOD_PICKER_MESSAGES, locale);
  const monthLabel = (stored: string) => {
    const idx = MONTHS.indexOf(stored);
    return idx >= 0 ? m.months[idx] : stored;
  };
  const start = v.startYear
    ? v.startMonth
      ? `${monthLabel(v.startMonth)} ${v.startYear}`
      : v.startYear
    : "";
  const end =
    v.endYear === "Prezent"
      ? m.presentInPeriod
      : v.endYear
        ? v.endMonth
          ? `${monthLabel(v.endMonth)} ${v.endYear}`
          : v.endYear
        : "";
  if (start && end) return `${start} – ${end}`;
  if (start) return `${start} – ${m.presentInPeriod}`;
  return "";
}

interface Props {
  value: PeriodValue;
  onChange: (field: keyof PeriodValue, val: string) => void;
  /** etichete personalizabile (ex. „De când" / „Până când") */
  fromLabel?: string;
  toLabel?: string;
}

export function PeriodPicker({
  value,
  onChange,
  fromLabel,
  toLabel,
}: Props) {
  const t = useMessages(PERIOD_PICKER_MESSAGES);
  const fromText = fromLabel ?? t.from;
  const toText = toLabel ?? t.to;
  const monthOptions = [
    { value: "", label: t.monthOptional },
    ...MONTHS.map((m, i) => ({ value: m, label: t.months[i] })),
  ];
  const isPresent = value.endYear === "Prezent";

  return (
    // auto-fit + minmax: pe ecrane înguste coloanele se stivuiesc în loc să
    // iasă din pagină (overflow orizontal pe mobil)
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 14,
        marginBottom: 18,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>
          {fromText}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.2fr)", gap: 8 }}>
          <Select
            value={value.startYear}
            onChange={(v) => onChange("startYear", v)}
            options={YEARS}
            placeholder={t.year}
          />
          <Select
            value={value.startMonth}
            onChange={(v) => onChange("startMonth", v)}
            options={monthOptions}
            placeholder={t.monthOptional}
          />
        </div>
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>
          {toText}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.2fr)", gap: 8 }}>
          <Select
            value={value.endYear}
            onChange={(v) => {
              onChange("endYear", v);
              if (v === "Prezent") onChange("endMonth", "");
            }}
            options={[{ value: "Prezent", label: t.present }, ...YEARS]}
            placeholder={t.year}
          />
          <Select
            value={value.endMonth}
            onChange={(v) => onChange("endMonth", v)}
            options={monthOptions}
            placeholder={t.monthOptional}
            disabled={isPresent}
          />
        </div>
      </div>
    </div>
  );
}
