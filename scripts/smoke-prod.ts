/** Smoke-test al configurației de PRODUCȚIE (PIPELINE_PROD_CONFIG + variant liber). */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const envPath = join(process.cwd(), ".env.local");
for (const line of readFileSync(envPath, "utf-8").split(/\r?\n/)) {
  const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

import { MATRIX_CASES } from "./test-cases";

async function main() {
  const { runRecruiterQuestions, runBulletsFromContext } = await import(
    "../lib/cv-pipeline/stages"
  );
  const { PIPELINE_PROD_CONFIG } = await import("../lib/openai");
  const idx = Number(process.argv.find((a) => a.startsWith("--case="))?.split("=")[1] ?? "1") - 1;
  const tc = MATRIX_CASES[idx];
  let cost = 0;
  const onUsage = (u: { costUSD: number }) => (cost += u.costUSD);

  const questions = await runRecruiterQuestions(
    {
      jobTitle: tc.jobTitle,
      company: tc.company,
      period: tc.period,
      industry: tc.industry,
      yearsExperience: tc.years,
      rawText: tc.raw,
    },
    { variant: "liber", config: PIPELINE_PROD_CONFIG.call1, onUsage }
  );
  console.log(`ÎNTREBĂRI (${tc.name}):`);
  questions.forEach((q, i) => console.log(`  ${i + 1}. ${q.question}`));

  const interview = questions.map((q, i) => ({ question: q.question, answer: tc.answers[i] ?? "" }));
  const r = await runBulletsFromContext(
    { jobTitle: tc.jobTitle, company: tc.company, period: tc.period, rawText: tc.raw, interview },
    { variant: "liber", config: PIPELINE_PROD_CONFIG.call2, onUsage }
  );

  console.log(`\nBULLETS (prod gpt-5.4, liber) · cost total job: ${(cost * 100).toFixed(2)}¢ · picate=${r.firstPassInvalid} eliminate=${r.dropped.length}\n`);
  r.bullets.forEach((b, i) => console.log(`  ${i + 1}. ${b.text}`));
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
