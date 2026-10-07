/**
 * Matricea de evaluare a modelelor (iul 2026) — sursa: results/summary.md.
 * 9 configurații × 4 cazuri sintetice, varianta de prompt „liber”.
 * Cost/job = media apel1 + apel2 + regenerări; cached input taxat la 10%.
 */
export interface BenchmarkRow {
  config: string;
  call1: string;
  call2: string;
  costCents: number;
  pctOfBaseline: number;
  /** validare cifre: picate la prima trecere / eliminate definitiv */
  numbersFailed: number;
  numbersDropped: number;
  nominalForm: string;
  jsonRetries: number;
  reasoningTokens: number;
  inventionScore: number;
  production?: boolean;
}

export const BENCHMARK_ROWS: BenchmarkRow[] = [
  { config: "C0_baseline_55", call1: "gpt-5.5", call2: "gpt-5.5", costCents: 6.47, pctOfBaseline: 100, numbersFailed: 2, numbersDropped: 0, nominalForm: "28/28", jsonRetries: 0, reasoningTokens: 681, inventionScore: 6 },
  { config: "C1_55_effort_min", call1: "gpt-5.5 (effort minimal)", call2: "gpt-5.5 (effort minimal)", costCents: 5.91, pctOfBaseline: 91, numbersFailed: 1, numbersDropped: 1, nominalForm: "27/27", jsonRetries: 0, reasoningTokens: 632, inventionScore: 5 },
  { config: "C2_54_full", call1: "gpt-5.4", call2: "gpt-5.4", costCents: 2.14, pctOfBaseline: 33, numbersFailed: 3, numbersDropped: 0, nominalForm: "28/28", jsonRetries: 0, reasoningTokens: 0, inventionScore: 5, production: true },
  { config: "C3_mini_54", call1: "gpt-5.4-mini", call2: "gpt-5.4", costCents: 1.38, pctOfBaseline: 21, numbersFailed: 1, numbersDropped: 0, nominalForm: "28/28", jsonRetries: 0, reasoningTokens: 0, inventionScore: 5 },
  { config: "C4_mini_full", call1: "gpt-5.4-mini", call2: "gpt-5.4-mini", costCents: 0.57, pctOfBaseline: 9, numbersFailed: 1, numbersDropped: 1, nominalForm: "27/27", jsonRetries: 0, reasoningTokens: 0, inventionScore: 6 },
  { config: "C5_51_full", call1: "gpt-5.1", call2: "gpt-5.1", costCents: 1.31, pctOfBaseline: 20, numbersFailed: 2, numbersDropped: 0, nominalForm: "28/28", jsonRetries: 0, reasoningTokens: 0, inventionScore: 7 },
  { config: "C6_mini_51", call1: "gpt-5.4-mini", call2: "gpt-5.1", costCents: 0.95, pctOfBaseline: 15, numbersFailed: 2, numbersDropped: 0, nominalForm: "28/28", jsonRetries: 0, reasoningTokens: 0, inventionScore: 7 },
  { config: "C7_nano_54", call1: "gpt-5.4-nano", call2: "gpt-5.4", costCents: 1.3, pctOfBaseline: 20, numbersFailed: 2, numbersDropped: 0, nominalForm: "28/28", jsonRetries: 0, reasoningTokens: 0, inventionScore: 5 },
  { config: "C8_51_54", call1: "gpt-5.1", call2: "gpt-5.4", costCents: 1.66, pctOfBaseline: 26, numbersFailed: 1, numbersDropped: 0, nominalForm: "28/28", jsonRetries: 0, reasoningTokens: 0, inventionScore: 5 },
];

export const BENCHMARK_NOTES = {
  decision:
    "Decizie: C2 (gpt-5.4 pe ambele apeluri) — ~33% din costul gpt-5.5, calitate echivalentă la evaluarea oarbă side-by-side.",
  surprise:
    "Surpriză: API-ul a respins silențios reasoning_effort pentru gpt-5.5 → C1 a rulat identic cu C0. Detectat doar pentru că respingerea e logată (effortRejected).",
  method:
    "Metodă: 4 cazuri sintetice (contabil fără/cu anunț, răspunsuri sărace, șofer profesionist), un singur config per rulare, metrici: cost, retry JSON, validare cifre, formă nominală, euristică de invenție.",
};
