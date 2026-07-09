/**
 * Matrice de test: 9 configurații de modele × 4 cazuri (variantă LIBER).
 *
 * Rulare:
 *   ... test-model-matrix.ts --config=C0        — o configurație (4 cazuri)
 *   ... test-model-matrix.ts --report           — regenerează comparison.md + summary.md
 * Artefacte: results/<config>/<caz>.json · results/comparison.md · results/summary.md
 */
import { mkdirSync, readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

// Încarcă .env.local ÎNAINTE de importul clientului OpenAI
const envPath = join(process.cwd(), ".env.local");
for (const line of readFileSync(envPath, "utf-8").split(/\r?\n/)) {
  const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

import { MATRIX_CASES, TestCase } from "./test-cases";
import type { PipelineConfig, CallUsage } from "../lib/openai";

const VARIANT = "liber" as const; // decizia userului pentru toată matricea

const CONFIGS: PipelineConfig[] = [
  { name: "C0_baseline_55", call1: { model: "gpt-5.5" }, call2: { model: "gpt-5.5" } },
  {
    name: "C1_55_effort_min",
    call1: { model: "gpt-5.5", reasoning_effort: "minimal" },
    call2: { model: "gpt-5.5", reasoning_effort: "minimal" },
  },
  {
    name: "C2_54_full",
    call1: { model: "gpt-5.4", reasoning_effort: "minimal" },
    call2: { model: "gpt-5.4", reasoning_effort: "minimal" },
  },
  { name: "C3_mini_54", call1: { model: "gpt-5.4-mini" }, call2: { model: "gpt-5.4" } },
  { name: "C4_mini_full", call1: { model: "gpt-5.4-mini" }, call2: { model: "gpt-5.4-mini" } },
  { name: "C5_51_full", call1: { model: "gpt-5.1" }, call2: { model: "gpt-5.1" } },
  { name: "C6_mini_51", call1: { model: "gpt-5.4-mini" }, call2: { model: "gpt-5.1" } },
  { name: "C7_nano_54", call1: { model: "gpt-5.4-nano" }, call2: { model: "gpt-5.4" } },
  { name: "C8_51_54", call1: { model: "gpt-5.1" }, call2: { model: "gpt-5.4" } },
];

const RESULTS_DIR = join(process.cwd(), "results");

/* ── metrici obiective ─────────────────────────────────────────── */

function firstWord(text: string): string {
  return (text.trim().split(/\s+/)[0] ?? "").replace(/[^A-Za-zĂÂÎȘȚăâîșț-]/g, "");
}
/** substantiv verbal: primul cuvânt se termină în -rea (area/irea/erea/urea…) */
function isNominalized(text: string): boolean {
  return /rea$/i.test(firstWord(text));
}
function wordCount(text: string): number {
  return text.trim().split(/\s+/).length;
}

/** Euristică invenție (caz 3): tokeni de conținut (≥6 litere) din bullet
 * al căror prefix de 5 litere NU apare în sursă. Aproximativă — evaluarea
 * reală e cea oarbă, pe fișierele salvate. */
function inventionScore(bullet: string, sourceText: string): number {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/[ăâ]/g, "a")
      .replace(/î/g, "i")
      .replace(/ș/g, "s")
      .replace(/ț/g, "t");
  const src = norm(sourceText);
  const tokens = norm(bullet).match(/[a-z]{6,}/g) ?? [];
  const generic = new Set([
    "pentru", "inclusiv", "precum", "aproximativ", "gestionarea", "intocmirea",
    "efectuarea", "operarea", "verificarea", "coordonarea", "asigurarea",
    "realizarea", "utilizarea", "mentinerea", "activitatea", "profesionala",
    "lunara", "lunare", "zilnica", "curente",
  ]);
  let unknown = 0;
  for (const t of tokens) {
    if (generic.has(t)) continue;
    if (!src.includes(t.slice(0, 5))) unknown++;
  }
  return unknown;
}

/* ── rulare ────────────────────────────────────────────────────── */

interface RunRecord {
  config: string;
  case: string;
  questions: { id: string; question: string }[];
  bullets: { id: string; text: string; category: string }[];
  usage: CallUsage[];
  metrics: {
    costUSD: number;
    promptTokens: number;
    cachedTokens: number;
    completionTokens: number;
    reasoningTokens: number;
    jsonRetries: number;
    effortRejected: boolean;
    firstPassInvalid: number;
    dropped: number;
    nominalizedOK: number;
    bulletsTotal: number;
    avgWords: number;
    inventionFlags: number;
  };
  durations: { call1_s: number; call2_s: number };
  error?: string;
}

async function runCase(cfg: PipelineConfig, tc: TestCase): Promise<RunRecord> {
  const { runRecruiterQuestions, runBulletsFromContext } = await import(
    "../lib/cv-pipeline/stages"
  );
  const usage: CallUsage[] = [];
  const onUsage = (u: CallUsage) => usage.push(u);

  const t1 = Date.now();
  const questions = await runRecruiterQuestions(
    {
      jobTitle: tc.jobTitle,
      industry: tc.industry,
      yearsExperience: tc.years,
      rawText: tc.raw,
      jobDescription: tc.jd,
    },
    { variant: VARIANT, config: cfg.call1, onUsage }
  );
  const call1_s = (Date.now() - t1) / 1000;

  const interview = questions.map((q, i) => ({
    question: q.question,
    answer: tc.answers[i] ?? "",
  }));

  const t2 = Date.now();
  const result = await runBulletsFromContext(
    { jobTitle: tc.jobTitle, rawText: tc.raw, interview, jobDescription: tc.jd },
    { variant: VARIANT, config: cfg.call2, onUsage }
  );
  const call2_s = (Date.now() - t2) / 1000;

  const sourceText = [tc.raw, ...tc.answers].join(" ");
  const bullets = result.bullets;
  const sum = (k: keyof CallUsage) =>
    usage.reduce((a, u) => a + (u[k] as number), 0);

  return {
    config: cfg.name,
    case: tc.slug,
    questions: questions.map((q) => ({ id: q.id, question: q.question })),
    bullets,
    usage,
    metrics: {
      costUSD: usage.reduce((a, u) => a + u.costUSD, 0),
      promptTokens: sum("promptTokens"),
      cachedTokens: sum("cachedTokens"),
      completionTokens: sum("completionTokens"),
      reasoningTokens: sum("reasoningTokens"),
      jsonRetries: Math.max(...usage.map((u) => u.jsonRetries), 0),
      effortRejected: usage.some((u) => u.effortRejected),
      firstPassInvalid: result.firstPassInvalid,
      dropped: result.dropped.length,
      nominalizedOK: bullets.filter((b) => isNominalized(b.text)).length,
      bulletsTotal: bullets.length,
      avgWords:
        Math.round(
          (bullets.reduce((a, b) => a + wordCount(b.text), 0) /
            Math.max(bullets.length, 1)) * 10
        ) / 10,
      inventionFlags: bullets.filter((b) => inventionScore(b.text, sourceText) >= 2)
        .length,
    },
    durations: { call1_s: Math.round(call1_s * 10) / 10, call2_s: Math.round(call2_s * 10) / 10 },
  };
}

async function runConfig(cfg: PipelineConfig) {
  const dir = join(RESULTS_DIR, cfg.name);
  mkdirSync(dir, { recursive: true });
  console.log(`\n════ ${cfg.name} · call1=${cfg.call1.model}${cfg.call1.reasoning_effort ? `(${cfg.call1.reasoning_effort})` : ""} call2=${cfg.call2.model}${cfg.call2.reasoning_effort ? `(${cfg.call2.reasoning_effort})` : ""} ════`);

  for (const tc of MATRIX_CASES) {
    process.stdout.write(`  ${tc.slug} ... `);
    try {
      const rec = await runCase(cfg, tc);
      writeFileSync(join(dir, `${tc.slug}.json`), JSON.stringify(rec, null, 2));
      console.log(
        `OK $${rec.metrics.costUSD.toFixed(4)} · reasoning=${rec.metrics.reasoningTokens} · nominal ${rec.metrics.nominalizedOK}/${rec.metrics.bulletsTotal} · picate=${rec.metrics.firstPassInvalid}`
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      writeFileSync(
        join(dir, `${tc.slug}.json`),
        JSON.stringify({ config: cfg.name, case: tc.slug, error: msg }, null, 2)
      );
      console.log(`EȘUAT: ${msg.slice(0, 120)}`);
    }
  }
}

/* ── raport agregat ────────────────────────────────────────────── */

function loadAll(): RunRecord[] {
  const out: RunRecord[] = [];
  if (!existsSync(RESULTS_DIR)) return out;
  for (const cfgDir of readdirSync(RESULTS_DIR, { withFileTypes: true })) {
    if (!cfgDir.isDirectory()) continue;
    for (const f of readdirSync(join(RESULTS_DIR, cfgDir.name))) {
      if (f.endsWith(".json")) {
        out.push(
          JSON.parse(readFileSync(join(RESULTS_DIR, cfgDir.name, f), "utf-8"))
        );
      }
    }
  }
  return out;
}

function buildReport() {
  const all = loadAll();
  const byConfig = new Map<string, RunRecord[]>();
  for (const r of all) {
    byConfig.set(r.config, [...(byConfig.get(r.config) ?? []), r]);
  }
  const ordered = CONFIGS.map((c) => c.name).filter((n) => byConfig.has(n));

  // ── summary.md ──
  const c0 = byConfig.get("C0_baseline_55") ?? [];
  const c0Cost =
    c0.filter((r) => !r.error).reduce((a, r) => a + r.metrics.costUSD, 0) /
    Math.max(c0.filter((r) => !r.error).length, 1);

  let md = `# Matrice modele — sumar (variantă: ${VARIANT})\n\n`;
  md += `| Config | Cost/job (¢) | % din C0 | Validare cifre (picate/eliminate) | Formă nominală | JSON retries | Reasoning tokens | Invenție (caz3, euristic) | Erori |\n|---|---|---|---|---|---|---|---|---|\n`;

  for (const name of ordered) {
    const recs = byConfig.get(name)!;
    const ok = recs.filter((r) => !r.error);
    const errs = recs.filter((r) => r.error).length;
    const avg = (fn: (r: RunRecord) => number) =>
      ok.length ? ok.reduce((a, r) => a + fn(r), 0) / ok.length : 0;
    const cost = avg((r) => r.metrics.costUSD);
    const caz3 = ok.find((r) => r.case === "caz3_raspunsuri_sarace");
    md += `| ${name} | ${(cost * 100).toFixed(2)} | ${c0Cost ? Math.round((cost / c0Cost) * 100) : "?"}% | ${ok.reduce((a, r) => a + r.metrics.firstPassInvalid, 0)}/${ok.reduce((a, r) => a + r.metrics.dropped, 0)} | ${ok.reduce((a, r) => a + r.metrics.nominalizedOK, 0)}/${ok.reduce((a, r) => a + r.metrics.bulletsTotal, 0)} | ${ok.reduce((a, r) => a + r.metrics.jsonRetries, 0)} | ${Math.round(avg((r) => r.metrics.reasoningTokens))} | ${caz3 ? caz3.metrics.inventionFlags : "—"} | ${errs || ""} |\n`;
  }
  md += `\nCost/job = medie pe cele 4 cazuri (apel1+apel2+regenerări). Cached input taxat la 10%.\n`;
  writeFileSync(join(RESULTS_DIR, "summary.md"), md);

  // ── comparison.md (orb, caz 1) ──
  let cmp = `# Comparație oarbă — Caz 1 (contabil fără anunț)\n\nBullet-urile fiecărei configurații, fără numele modelelor.\n`;
  for (const name of ordered) {
    const rec = byConfig.get(name)!.find((r) => r.case === "caz1_contabil_fara_anunt");
    const label = name.split("_")[0]; // doar C0..C8
    cmp += `\n## ${label}\n\n`;
    if (!rec || rec.error) {
      cmp += `_(eșuat)_\n`;
      continue;
    }
    rec.bullets.forEach((b, i) => (cmp += `${i + 1}. ${b.text}\n`));
  }
  writeFileSync(join(RESULTS_DIR, "comparison.md"), cmp);

  console.log(`\n${md}\nScris: results/summary.md + results/comparison.md`);
}

/* ── main ──────────────────────────────────────────────────────── */

async function main() {
  if (process.argv.includes("--report")) {
    buildReport();
    return;
  }
  const cfgArg = process.argv.find((a) => a.startsWith("--config="))?.split("=")[1];
  const toRun = cfgArg
    ? CONFIGS.filter((c) => c.name.startsWith(cfgArg))
    : CONFIGS;
  if (toRun.length === 0) throw new Error(`Config necunoscut: ${cfgArg}`);
  for (const cfg of toRun) {
    await runConfig(cfg); // secvențial — rate limits
  }
  buildReport();
}

main()
  .then(() => process.exit(0)) // SDK-ul ține handle-uri deschise — ieșire explicită
  .catch((e) => {
    console.error("❌", e);
    process.exit(1);
  });
