/**
 * Rapoarte suplimentare din docs/evaluation/results/*.json (fără apeluri AI):
 *  - docs/evaluation/results/costs.md            — costuri MĂSURATE, defalcate apel#1/apel#2 + reasoning
 *  - docs/evaluation/results/comparison_caz4.md  — comparație oarbă caz 4 (șofer)
 *  - docs/evaluation/results/comparison_caz3.md  — comparație oarbă caz 3 + verdictul validatorului
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIR = join(process.cwd(), "docs", "evaluation", "results");
const ORDER = ["C0_baseline_55","C1_55_effort_min","C2_54_full","C3_mini_54","C4_mini_full","C5_51_full","C6_mini_51","C7_nano_54","C8_51_54"];

const load = (cfg, caz) => {
  try { return JSON.parse(readFileSync(join(DIR, cfg, caz + ".json"), "utf8")); }
  catch { return null; }
};
const CASES = ["caz1_contabil_fara_anunt","caz2_contabil_cu_anunt","caz3_raspunsuri_sarace","caz4_sofer_profesionist"];

/* ── 1. costs.md ── */
let md = `# Costuri MĂSURATE per configurație (medie pe 4 cazuri, variantă liber)\n\n`;
md += `| Config | Cost/job (¢) | Apel #1 (¢) | Apel #2+regen (¢) | Reasoning ap.1 | Reasoning ap.2 | Cached in | Regenerări |\n|---|---|---|---|---|---|---|---|\n`;
for (const cfg of ORDER) {
  let c1=0,c2=0,r1=0,r2=0,cached=0,regens=0,n=0;
  for (const caz of CASES) {
    const r = load(cfg, caz);
    if (!r || r.error) continue;
    n++;
    for (const u of r.usage) {
      if (u.stage.startsWith("apel1")) { c1+=u.costUSD; r1+=u.reasoningTokens; }
      else { c2+=u.costUSD; r2+=u.reasoningTokens; if(u.stage.includes("regen")) regens++; }
      cached += u.cachedTokens;
    }
  }
  if (!n) continue;
  md += `| ${cfg} | ${((c1+c2)/n*100).toFixed(2)} | ${(c1/n*100).toFixed(2)} | ${(c2/n*100).toFixed(2)} | ${Math.round(r1/n)} | ${Math.round(r2/n)} | ${Math.round(cached/n)} | ${regens} |\n`;
}
md += `\nReasoning = tokeni de gândire invizibilă (facturați ca output). Regenerări = apeluri suplimentare cauzate de validarea cifrelor (numărate pe toate cele 4 cazuri).\n`;

/* C0 vs C1 direct */
md += `\n## C0 vs C1 — defalcare pe cazuri (a meritat „effort minimal”?)\n\n| Caz | C0 cost (¢) | C0 reasoning | C1 cost (¢) | C1 reasoning | effort respins? |\n|---|---|---|---|---|---|\n`;
for (const caz of CASES) {
  const a = load("C0_baseline_55", caz), b = load("C1_55_effort_min", caz);
  if (!a || !b || a.error || b.error) continue;
  md += `| ${caz} | ${(a.metrics.costUSD*100).toFixed(2)} | ${a.metrics.reasoningTokens} | ${(b.metrics.costUSD*100).toFixed(2)} | ${b.metrics.reasoningTokens} | ${b.metrics.effortRejected ? "DA → a rulat ca C0" : "nu"} |\n`;
}
writeFileSync(join(DIR, "costs.md"), md);

/* ── 2 & 3. comparații oarbe caz4 și caz3 ── */
function blindComparison(caz, title, withVerdict) {
  let out = `# Comparație oarbă — ${title}\n\nBullet-urile fiecărei configurații, fără numele modelelor.\n`;
  for (const cfg of ORDER) {
    const r = load(cfg, caz);
    const label = cfg.split("_")[0];
    out += `\n## ${label}\n\n`;
    if (!r || r.error) { out += `_(eșuat: ${r?.error?.slice(0,80) ?? "lipsă"})_\n`; continue; }
    if (withVerdict) {
      out += `**Verdict validator:** ${r.metrics.firstPassInvalid} picate la prima validare · ${r.metrics.firstPassInvalid>0 ? "regenerare DA" : "regenerare NU"} · ${r.metrics.dropped} eliminate definitiv · ${r.metrics.bulletsTotal} bullets livrate\n\n`;
    }
    r.bullets.forEach((b,i)=> out += `${i+1}. ${b.text}\n`);
  }
  return out;
}
writeFileSync(join(DIR, "comparison_caz4.md"), blindComparison("caz4_sofer_profesionist", "Caz 4 (șofer profesionist — alt domeniu)", false));
writeFileSync(join(DIR, "comparison_caz3.md"), blindComparison("caz3_raspunsuri_sarace", "Caz 3 (răspunsuri sărace) + verdictul validatorului", true));

/* ── opțional: întrebări C0 vs C7 la caz4 ── */
let q = `# Întrebări Caz 4 — C0 vs C7 (apel #1)\n`;
for (const cfg of ["C0_baseline_55","C7_nano_54"]) {
  const r = load(cfg, "caz4_sofer_profesionist");
  q += `\n## ${cfg.split("_")[0]}\n\n`;
  (r?.questions ?? []).forEach((x,i)=> q += `${i+1}. ${x.question}\n`);
}
writeFileSync(join(DIR, "questions_caz4_C0_vs_C7.md"), q);

console.log("Scrise: results/costs.md, comparison_caz4.md, comparison_caz3.md, questions_caz4_C0_vs_C7.md");
