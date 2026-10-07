/**
 * Test manual + A/B al pipeline-ului AI (fără DB).
 *
 * Variante de prompt: "strict" (reguli detaliate + few-shot) vs "liber"
 * (doar 3 reguli obligatorii — restul e judecata modelului).
 *
 * Rulare:
 *   ... test-pipeline.ts --case=N [--variant=strict|liber] [--no-jd]  — o rulare
 *   ... test-pipeline.ts --ab --case=N                                — A/B pe cazul N
 *   ... test-pipeline.ts --case=5 --lang=en                           — pipeline-ul în engleză
 * Cazuri: 1 contabil CU anunț · 2 contabil colocvial FĂRĂ anunț ·
 *         3 răspunsuri sărace · 4 șofer profesionist (alt domeniu)
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { MATRIX_CASES } from "./test-cases";

// Încarcă .env.local ÎNAINTE de importul clientului OpenAI
const envPath = join(process.cwd(), ".env.local");
for (const line of readFileSync(envPath, "utf-8").split(/\r?\n/)) {
  const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const SAMPLE_JD = `Căutăm Contabil Senior pentru biroul nostru din București.
Cerințe: experiență minim 3 ani în contabilitate completă, cunoștințe solide de legislație fiscală (declarații D112, D300, D394), experiență cu programe de contabilitate (Saga constituie avantaj), atenție la detalii, capacitate de a gestiona un portofoliu de clienți multipli. Responsabilități: înregistrarea documentelor contabile, întocmirea și depunerea declarațiilor fiscale, închideri lunare, comunicare directă cu clienții și cu ANAF, verificarea lucrărilor colegilor juniori.`;

interface TestCase {
  name: string;
  jobTitle: string;
  industry: string;
  years: number;
  raw: string;
  answers: string[];
  jd?: string;
}

const CASES: Record<string, TestCase> = {
  // cazul în engleză (pipeline-ul cu --lang=en)
  "5": MATRIX_CASES.find((c) => c.slug === "caz5_warehouse_en")!,
  "1": {
    name: "Contabil CU anunț țintă",
    jobTitle: "Contabil",
    industry: "Contabilitate / Servicii financiare",
    years: 5,
    jd: SAMPLE_JD,
    raw: `ma ocup de contabilitatea primara si declaratii pentru mai multe firme mici. bag facturi in program, fac pontaje si salarii pentru angajatii clientilor, depun declaratii la anaf in fiecare luna. tin legatura cu clientii pe mail si telefon cand au nevoie de acte sau cand au probleme cu anaf. la inchidere de luna fac balante si verific conturile. am invatat singura saga si acum lucrez repede in el.`,
    answers: [
      "procesez cam 300 de facturi pe luna in total si fac declaratiile D112, D300 si D394 pentru 12 firme",
      "lucrez zilnic in Saga si Excel, depun prin SPV, si la doi clienti folosesc SmartBill pentru facturare",
      "coordonez o colega junioara, ii verific lucrarile si am invatat-o sa depuna declaratii singura",
      "am reusit sa anulez o amenda de 8000 lei dupa ce am refacut si redepus declaratiile unui client, si am scurtat inchiderea de luna de la 10 zile la 6 zile",
      "firma de contabilitate cu 6 angajati, clientii sunt SRL-uri mici din retail si constructii",
    ],
  },
  "2": {
    name: "Contabil colocvial, FĂRĂ anunț (testul de registru)",
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
  },
  "3": {
    name: "Răspunsuri SĂRACE (testul de invenție)",
    jobTitle: "Contabil",
    industry: "Financiar & Contabilitate",
    years: 3,
    raw: `lucrez la o firma unde ma ocup de contabilitate de la facturi pana la declaratii. bag lunar cam 900-1000 de facturi de furnizori si vreo 350-400 emise catre clienti, plus vreo 600 de nir-uri si 700-800 bonuri de consum. fac declaratiile lunare d112, d300, d394 si d390 doar cand avem operatiuni intracomunitare, si verific jurnalele de tva. la inchidere de luna fac verificari de solduri pe furnizori, stocuri si casa-banca, punctaje si note de corectie. lucrez in saga si excel cu vlookup, pivot si sumif. tin legatura cu anaf cand sunt controale sau cereri si mai ajut hr-ul cu pontajele. suntem 4 in echipa financiar-contabila.`,
    answers: ["nu stiu exact", "", "nimic special", "nu imi amintesc cifre", ""],
  },
  "4": {
    name: "Șofer profesionist (alt domeniu — testul de adaptare)",
    jobTitle: "Șofer profesionist",
    industry: "Transport & Logistică",
    years: 8,
    raw: `sunt sofer de tir de vreo 8 ani, am categoria C si CE si atestat de marfa. fac curse internationale, mai mult germania, olanda si belgia, cam 3 saptamani plecat si o saptamana acasa. duc marfa generala pe prelata, cateodata si frig. imi fac singur documentele de transport, cmr, si ma descurc cu descarcatul la rampe. am grija de camion, verific uleiul, presiunea, si anunt din timp daca e ceva de reparat. n-am avut accidente din vina mea si nici amenzi mari. patronul ma trimite pe cursele mai lungi ca stie ca nu fac probleme.`,
    answers: [
      "cam 10-11 mii de km pe luna, camion volvo fh de 460 de cai cu cutie automata",
      "am card de tahograf si respect timpii de condus, 4 ore jumate si pauza, nu am avut nicio amenda pe tahograf in 8 ani",
      "incarc si descarc cu liftul din spate cand e cazul, si stiu sa asigur marfa cu chingi si colturi, am facut si adr acum 2 ani dar nu l-am folosit inca",
      "vorbesc putina germana si engleza cat sa ma inteleg la rampe si cu politia",
      "am lucrat la 2 firme in 8 ani, la actuala sunt de 5 ani, avem vreo 15 camioane si 20 de soferi",
    ],
  },
};

type Variant = "strict" | "liber";

const LANG = (process.argv.find((a) => a.startsWith("--lang="))?.split("=")[1] === "en" ? "en" : "ro") as "ro" | "en";

async function runOne(tc: TestCase, variant: Variant, withJD: boolean) {
  const { runRecruiterQuestions, runBulletsFromContext } = await import(
    "../lib/cv-pipeline/stages"
  );
  const jd = withJD ? tc.jd : undefined;

  const t1 = Date.now();
  const questions = await runRecruiterQuestions(
    {
      jobTitle: tc.jobTitle,
      industry: tc.industry,
      yearsExperience: tc.years,
      rawText: tc.raw,
      jobDescription: jd,
    },
    { variant, language: LANG }
  );
  const q_s = ((Date.now() - t1) / 1000).toFixed(1);

  const interview = questions.map((q, i) => ({
    question: q.question,
    answer: tc.answers[i] ?? "",
  }));

  const t2 = Date.now();
  const result = await runBulletsFromContext(
    { jobTitle: tc.jobTitle, rawText: tc.raw, interview, jobDescription: jd },
    { variant, language: LANG }
  );
  const b_s = ((Date.now() - t2) / 1000).toFixed(1);

  return { questions, result, q_s, b_s };
}

function printRun(
  label: string,
  run: Awaited<ReturnType<typeof runOne>>
) {
  console.log(`\n──── ${label} ────`);
  console.log(`ÎNTREBĂRI (${run.q_s}s):`);
  run.questions.forEach((q, i) => console.log(`  ${i + 1}. ${q.question}`));
  console.log(
    `\nBULLETS (${run.b_s}s) · validare: ${run.result.firstPassInvalid} picate la prima trecere, ${run.result.dropped.length} eliminate final:`
  );
  run.result.bullets.forEach((b, i) => console.log(`  ${i + 1}. ${b.text}`));
  if (run.result.dropped.length > 0) {
    run.result.dropped.forEach((d) =>
      console.log(`  ✗ ELIMINAT: "${d.bullet.text}" — ${d.problem}`)
    );
  }
}

async function main() {
  const hr = (t: string) =>
    console.log(`\n${"═".repeat(72)}\n  ${t}\n${"═".repeat(72)}`);

  const caseArg = process.argv.find((a) => a.startsWith("--case="))?.split("=")[1] ?? "1";
  const tc = CASES[caseArg];
  if (!tc) throw new Error(`Caz necunoscut: ${caseArg} (valide: 1-5)`);
  const withJD = Boolean(tc.jd) && !process.argv.includes("--no-jd");

  if (process.argv.includes("--ab")) {
    hr(`A/B — CAZUL ${caseArg}: ${tc.name} ${withJD ? "(cu anunț)" : "(fără anunț)"}`);
    const strict = await runOne(tc, "strict", withJD);
    printRun("VARIANTA STRICT", strict);
    const liber = await runOne(tc, "liber", withJD);
    printRun("VARIANTA LIBER", liber);
    console.log(
      `\nVALIDARE — strict: ${strict.result.firstPassInvalid} picate/${strict.result.dropped.length} eliminate · liber: ${liber.result.firstPassInvalid} picate/${liber.result.dropped.length} eliminate`
    );
  } else {
    const variant = (process.argv
      .find((a) => a.startsWith("--variant="))
      ?.split("=")[1] ?? "strict") as Variant;
    hr(`CAZUL ${caseArg}: ${tc.name} · variant=${variant} ${withJD ? "(cu anunț)" : "(fără anunț)"}`);
    printRun(`VARIANTA ${variant.toUpperCase()}`, await runOne(tc, variant, withJD));
  }

  console.log("\n✅ Gata.\n");
}

main().catch((e) => {
  console.error("\n❌ Pipeline eșuat:", e);
  process.exit(1);
});
