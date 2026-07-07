/**
 * Test manual al pipeline-ului AI (fără DB): rulează cele 2 apeluri
 * și afișează output-ul fiecăruia în consolă.
 *
 *  Apel #1 — întrebările recrutorului
 *  Apel #2 — 7 bullet points din context unic + validare anti-halucinare
 *
 * Rulare:  node node_modules/tsx/dist/cli.mjs scripts/test-pipeline.ts
 *   --case=2   cazul „registru colocvial” (reconstruit după userul real)
 *   --no-jd    fără anunț țintă (CV general)
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Încarcă .env.local ÎNAINTE de importul clientului OpenAI
const envPath = join(process.cwd(), ".env.local");
for (const line of readFileSync(envPath, "utf-8").split(/\r?\n/)) {
  const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const CASE1 = {
  jobTitle: "Contabil",
  industry: "Contabilitate / Servicii financiare",
  years: 5,
  raw: `ma ocup de contabilitatea primara si declaratii pentru mai multe firme mici. bag facturi in program, fac pontaje si salarii pentru angajatii clientilor, depun declaratii la anaf in fiecare luna. tin legatura cu clientii pe mail si telefon cand au nevoie de acte sau cand au probleme cu anaf. la inchidere de luna fac balante si verific conturile. am invatat singura saga si acum lucrez repede in el.`,
  answers: [
    "procesez cam 300 de facturi pe luna in total si fac declaratiile D112, D300 si D394 pentru 12 firme",
    "lucrez zilnic in Saga si Excel, depun prin SPV, si la doi clienti folosesc SmartBill pentru facturare",
    "coordonez o colega junioara, ii verific lucrarile si am invatat-o sa depuna declaratii singura",
    "am reusit sa anulez o amenda de 8000 lei dupa ce am refacut si redepus declaratiile unui client, si am scurtat inchiderea de luna de la 10 zile la 6 zile",
    "firma de contabilitate cu 6 angajati, clientii sunt SRL-uri mici din retail si constructii",
  ],
};

/** Cazul real al userului (reconstruit): colocvial, cu „vreo/cam”,
 * inventar de volume, caveats conversaționale — testul de registru. */
const CASE2 = {
  jobTitle: "Contabil",
  industry: "Financiar & Contabilitate",
  years: 3,
  raw: `lucrez la o firma unde ma ocup de contabilitate de la facturi pana la declaratii. bag lunar cam 900-1000 de facturi de furnizori si vreo 350-400 emise catre clienti, plus vreo 600 de nir-uri si 700-800 bonuri de consum. fac declaratiile lunare d112, d300, d394 si d390 doar cand avem operatiuni intracomunitare, si verific jurnalele de tva. la inchidere de luna fac verificari de solduri pe furnizori, stocuri si casa-banca, punctaje si note de corectie. lucrez in saga si excel cu vlookup, pivot si sumif. tin legatura cu anaf cand sunt controale sau cereri si mai ajut hr-ul cu pontajele. suntem 4 in echipa financiar-contabila.`,
  answers: [
    "am gasit si rezolvat o diferenta de vreo 38 de mii de lei pe contul de furnizori, am verificat luna cu luna, am facut corectii si am confirmat punctajul cu furnizorii",
    "dupa chestia asta contabilul sef imi da mie toate reconcilierile mai dificile",
    "declaratiile le intocmesc si le depun eu cap coada, singura, de vreo 3 ani",
    "in saga fac tot: facturi, nir-uri, bonuri de consum, jurnale tva, fise de cont",
    "pregatesc documentele cand vin controale de la anaf si fac pontajele pentru hr",
  ],
};

const CASE = process.argv.includes("--case=2") ? CASE2 : CASE1;

const SAMPLE_JD = `Căutăm Contabil Senior pentru biroul nostru din București.
Cerințe: experiență minim 3 ani în contabilitate completă, cunoștințe solide de legislație fiscală (declarații D112, D300, D394), experiență cu programe de contabilitate (Saga constituie avantaj), atenție la detalii, capacitate de a gestiona un portofoliu de clienți multipli. Responsabilități: înregistrarea documentelor contabile, întocmirea și depunerea declarațiilor fiscale, închideri lunare, comunicare directă cu clienții și cu ANAF, verificarea lucrărilor colegilor juniori.`;

async function main() {
  const withJD = !process.argv.includes("--no-jd");
  const { runRecruiterQuestions, runBulletsFromContext } = await import(
    "../lib/cv-pipeline/stages"
  );

  const hr = (title: string) =>
    console.log(`\n${"═".repeat(70)}\n  ${title}\n${"═".repeat(70)}`);

  console.log(
    `\n▶ Pipeline test — ${CASE.jobTitle}, ${CASE.years} ani ${withJD ? "(CU anunț țintă)" : "(FĂRĂ anunț — CV general)"}`
  );

  // ---------- Apel #1 ----------
  hr("APEL #1 — Întrebările recrutorului");
  const t1 = Date.now();
  const questions = await runRecruiterQuestions({
    jobTitle: CASE.jobTitle,
    industry: CASE.industry,
    yearsExperience: CASE.years,
    rawText: CASE.raw,
    jobDescription: withJD ? SAMPLE_JD : undefined,
  });
  console.log(`(${((Date.now() - t1) / 1000).toFixed(1)}s)`);
  questions.forEach((q, i) =>
    console.log(`  ${i + 1}. ${q.question}\n     (urmărește: ${q.expected_info})`)
  );

  // ---------- Răspunsuri simulate ----------
  hr("RĂSPUNSURILE CANDIDATULUI (simulate)");
  const interview = questions.map((q, i) => ({
    question: q.question,
    answer: CASE.answers[i] ?? "",
  }));
  interview.forEach((p, i) => console.log(`  ${i + 1}. ${p.answer}`));

  // ---------- Apel #2 ----------
  hr("APEL #2 — 7 bullet points (context unic) + validare anti-halucinare");
  const t2 = Date.now();
  const result = await runBulletsFromContext({
    jobTitle: CASE.jobTitle,
    rawText: CASE.raw,
    interview,
    jobDescription: withJD ? SAMPLE_JD : undefined,
  });
  console.log(
    `(${((Date.now() - t2) / 1000).toFixed(1)}s) regenerat=${result.regenerated} eliminate=${result.dropped.length}`
  );
  result.bullets.forEach((b, i) => {
    console.log(`\n  ${i + 1}. ${b.text}`);
    console.log(`     (${b.category})`);
  });
  if (result.dropped.length > 0) {
    console.log("\nELIMINATE (au picat validarea de 2 ori):");
    for (const d of result.dropped) {
      console.log(`  ✗ "${d.bullet.text}" — ${d.problem}`);
    }
  }

  console.log("\n✅ Pipeline complet.\n");
}

main().catch((e) => {
  console.error("\n❌ Pipeline eșuat:", e);
  process.exit(1);
});
