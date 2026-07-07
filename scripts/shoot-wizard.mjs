/**
 * Navighează prin wizard până la pasul Experiență și fotografiază
 * ecranele pipeline-ului AI. Rulare: node scripts/shoot-wizard.mjs [--full]
 */
import { chromium } from "@playwright/test";

const BASE = "http://localhost:3000";
const FULL = process.argv.includes("--full"); // rulează și AI-ul real

const RAW_TEXT =
  "ma ocup de contabilitatea primara si declaratii pentru mai multe firme mici. bag facturi in program, fac pontaje si salarii pentru angajatii clientilor, depun declaratii la anaf in fiecare luna. tin legatura cu clientii pe mail si telefon cand au nevoie de acte. la inchidere de luna fac balante si verific conturile. am invatat singura saga si lucrez repede in el.";

const JD = `Căutăm Contabil Senior. Cerințe: minim 3 ani experiență, declarații D112, D300, D394, program Saga, gestionare portofoliu clienți, verificarea lucrărilor colegilor juniori.`;

const ANSWERS = [
  "procesez cam 300 de facturi pe luna si fac D112, D300, D394 pentru 12 firme",
  "Saga si Excel zilnic, depun prin SPV, la doi clienti folosesc SmartBill",
  "coordonez o colega junioara, ii verific lucrarile",
  "am anulat o amenda de 8000 lei refacand declaratiile, si am scurtat inchiderea de luna de la 10 la 6 zile",
  "firma mica de contabilitate, 6 angajati, clienti din retail si constructii",
];

const shot = (page, name) =>
  page.screenshot({ path: `.screens/${name}.png`, animations: "disabled" });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

try {
  await page.goto(`${BASE}/creare-cv`, { waitUntil: "networkidle" });

  // Pas 1 — JD
  await page.getByPlaceholder(/copy-paste la descrierea/i).fill(JD);
  await page.waitForTimeout(400);
  await shot(page, "10-step1-jd");
  await page.getByRole("button", { name: "Continuă", exact: true }).click();

  // Pas 2 — Fotografie (skip)
  await page.waitForTimeout(600);
  await page.getByText(/doar dacă nu ai poză|sari peste|continuă fără/i).first().click().catch(async () => {
    await page.getByRole("button", { name: /^Continuă$/ }).click();
  });

  // Pas 3 — Contact (nume, prenume, email, telefon, oraș — toate obligatorii)
  await page.waitForTimeout(600);
  await page.getByLabel(/prenume/i).fill("Elena");
  await page.getByLabel(/nume de familie/i).fill("Stanciu");
  await page.getByLabel(/email/i).fill("elena.stanciu@gmail.com");
  await page.getByLabel(/telefon/i).fill("0722314558");
  await page.getByLabel(/oraș/i).first().fill("București");
  await page.waitForTimeout(200);
  await shot(page, "11-step3-contact");
  await page.getByRole("button", { name: /Continuă/ }).click();

  // Pas Experiență — ecran INPUT
  await page.waitForTimeout(800);
  await shot(page, "12-exp-input-gol");

  await page.getByLabel(/funcția/i).fill("Contabil");
  await page.getByLabel(/compania/i).fill("SC ContExpert SRL");
  await page.getByLabel(/perioada/i).fill("2021 – prezent");
  await page.getByLabel(/localitatea/i).fill("București");
  await page.locator("select").selectOption({ label: "Financiar & Contabilitate" });
  await page.getByLabel(/ani în acest rol/i).fill("5");
  await page.getByPlaceholder(/povesti unui prieten/i).fill(RAW_TEXT);
  await page.waitForTimeout(300);
  await shot(page, "13-exp-input-completat");

  if (!FULL) {
    // ── Ruta MANUALĂ (nu necesită tabela pipeline) + pașii următori ──
    await page.getByText(/prefer să scriu descrierile manual/i).click();
    await page.waitForTimeout(500);
    await page.getByLabel(/funcția/i).fill("Contabil");
    await page.getByLabel(/compania/i).fill("SC ContExpert SRL");
    await page.getByLabel(/perioada/i).fill("2021 – prezent");
    await page.getByLabel(/responsabilităţi|responsabilități/i).fill(
      [
        "Întocmit și depus lunar declarațiile D112, D300 și D394 pentru 12 firme",
        "Procesat circa 300 de facturi lunar pentru SRL-uri din retail și construcții",
        "Scurtat închiderea de lună de la 10 la 6 zile",
        "Coordonat o colegă junioară, cu verificarea lucrărilor contabile",
        "Utilizat zilnic Saga, Excel și SmartBill",
      ].join("\n")
    );
    await page.waitForTimeout(200);
    await shot(page, "14m-exp-manual");
    await page.getByRole("button", { name: /Salvează jobul/ }).click();
    await page.waitForTimeout(600);
    await shot(page, "15m-exp-summary");
    await page.getByRole("button", { name: /^Continuă$/ }).click();

    // Educație — stare inițială
    await page.waitForTimeout(800);
    await shot(page, "16m-educatie");
    // încearcă să continui fără intrări (dacă e permis)
    const eduNext = page.getByRole("button", { name: /Continuă/ }).last();
    if (await eduNext.isEnabled().catch(() => false)) {
      await eduNext.click();
    } else {
      console.log("(educație cere date — mă opresc aici)");
      await browser.close();
      process.exit(0);
    }

    // Abilități — AI se declanșează la mount
    await page.waitForTimeout(1200);
    await shot(page, "17m-abilitati-loading");
    await page
      .getByText(/selectează|alege|abilităț/i)
      .first()
      .waitFor({ timeout: 60000 })
      .catch(() => {});
    await page.waitForTimeout(2500);
    await shot(page, "18m-abilitati");

    console.log("✅ Rută manuală + pași următori fotografiați.");
    await browser.close();
    process.exit(0);
  }

  // Analizează → întrebări (AI real)
  await page.getByRole("button", { name: /Analizează/ }).click();
  await page.waitForTimeout(1500);
  await shot(page, "14-exp-analyzing");
  await page.getByText(/\d\/5 răspunsuri/i).first().waitFor({ timeout: 90000 });
  await page.waitForTimeout(400);
  await shot(page, "15-exp-questions");

  // Răspunde la întrebări
  const areas = page.locator("textarea");
  const count = await areas.count();
  for (let i = 0; i < Math.min(count, ANSWERS.length); i++) {
    await areas.nth(i).fill(ANSWERS[i]);
  }
  await page.waitForTimeout(300);
  await shot(page, "16-exp-questions-answered");

  // Generează → selecție
  await page.getByRole("button", { name: /Generează descrierile/ }).click();
  await page.waitForTimeout(1500);
  await shot(page, "17-exp-generating");
  await page.getByText(/descrieri generate/i).first().waitFor({ timeout: 150000 });
  await page.waitForTimeout(400);
  await shot(page, "18-exp-select");

  // Selectează primele 5
  const cards = page.locator("button", { hasText: /.{40,}/ }).filter({ has: page.locator("svg, span") });
  const bulletButtons = page.locator('button:has(span[aria-hidden])');
  const n = await bulletButtons.count();
  for (let i = 0; i < Math.min(5, n); i++) {
    await bulletButtons.nth(i).click();
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(300);
  await shot(page, "19-exp-selected");

  // Finalizează → summary
  await page.getByRole("button", { name: /Finalizează jobul/ }).click();
  await page.getByText(/Joburile tale/i).waitFor({ timeout: 30000 });
  await page.waitForTimeout(500);
  await shot(page, "20-exp-summary");

  console.log("✅ Flux complet fotografiat.");
} catch (e) {
  await shot(page, "99-error-state");
  console.error("❌", e.message);
  process.exit(1);
} finally {
  await browser.close();
}
