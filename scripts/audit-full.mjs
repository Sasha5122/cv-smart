/** AUDIT complet cap-coadă, ca un utilizator real din România.
 *  FĂRĂ mock-uri — AI-ul real, PDF real. Screenshot la fiecare ecran. */
import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const consoleErrors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text().slice(0, 200));
});
page.on("pageerror", (err) => consoleErrors.push("PAGEERROR: " + String(err).slice(0, 200)));

const shot = (name) => page.screenshot({ path: `.screens/audit-${name}.png`, fullPage: false });
const log = (m) => console.log(`[audit] ${m}`);

// ── Pasul 1: Job vizat ──────────────────────────────────────────
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
log(`redirect / → ${page.url()}`);
await shot("01-pas1-gol");

const JD = `Angajăm Vânzător/Lucrător comercial – magazin alimentar, Cluj-Napoca
Cerințe: experiență minimă în comerț, seriozitate, disponibilitate program în ture.
Responsabilități: servirea clienților la casa de marcat, aranjarea și etichetarea mărfii,
recepția mărfii, verificarea termenelor de valabilitate, menținerea curățeniei.
Oferim: salariu motivant, bonuri de masă, program stabil.`;
await page.getByPlaceholder(/copy-paste la descrierea/i).fill(JD);
await shot("02-pas1-completat");
await page.getByRole("button", { name: "Continuă", exact: true }).click();

// ── Pasul 2: Fotografie ─────────────────────────────────────────
await page.waitForTimeout(800);
await shot("03-pas2-foto");
await page.getByText("Nu am fotografie potrivită").click();

// ── Pasul 3: Contact — întâi validarea cu câmpuri goale ────────
await page.getByRole("heading", { name: "Date de contact" }).waitFor();
await page.getByRole("button", { name: /Continuă/ }).click();
await page.waitForTimeout(400);
await shot("04-contact-erori-validare");
await page.getByLabel(/prenume/i).fill("Andrei");
await page.getByLabel(/nume de familie/i).fill("Munteanu");
await page.getByLabel(/email/i).fill("andrei.munteanu91@gmail.com");
await page.getByLabel(/telefon/i).fill("0745123456");
await page.getByLabel(/oraș/i).first().fill("Cluj-Napoca");
await page.getByRole("button", { name: /alege județul/ }).click();
await page.getByPlaceholder("Caută...").fill("cluj");
await page.getByRole("option", { name: "Cluj", exact: true }).click();
await page.getByPlaceholder("ex: Str. Mihai Eminescu").fill("Str. Fabricii");
await page.getByPlaceholder("ex: 12").fill("7");
await shot("05-contact-completat");
await page.getByRole("button", { name: /Continuă/ }).click();

// ── Pasul 4: Experiență — AI REAL ───────────────────────────────
await page.getByRole("heading", { name: /Povestește-ne ce faci/ }).waitFor();
await shot("06-experienta-gol");
await page.getByLabel(/funcția/i).fill("vanzator");
await page.getByLabel(/compania/i).fill("Profi City");
// corectare AI reală pe blur (vanzator → Vânzător)
await page.getByLabel(/compania/i).click();
await page.waitForTimeout(3500);
const titleVal = await page.getByLabel(/funcția/i).inputValue();
log(`corectare AI titlu: "vanzator" → "${titleVal}"`);
await page.getByRole("button", { name: "anul", exact: true }).click();
await page.getByRole("listbox").getByRole("option", { name: "2022", exact: true }).click();
await page.getByLabel(/localitatea/i).fill("cluj-napoca");
await page
  .getByPlaceholder(/povesti unui prieten/i)
  .fill(
    "lucrez la casa de marcat si servesc clientii, pun marfa pe rafturi si fac etichete, primesc marfa cand vine si verific daca e tot ce scrie pe aviz, ma uit la termene sa nu fie produse expirate, fac curatenie in magazin la inchidere. cand e sefa libera raman eu responsabil pe tura"
  );
await page.waitForTimeout(3000);
await shot("07-experienta-completat");
log("trimit la AI real (analyze)...");
await page.getByRole("button", { name: /Analizează/ }).click();
await page.waitForTimeout(1500);
await shot("08-experienta-loading");
await page.getByRole("heading", { name: /5 întrebări/ }).waitFor({ timeout: 90000 });
await shot("09-intrebari-ai-real");

const areas = page.locator("textarea");
await areas.nth(0).fill("cam 200-300 de clienti pe zi trec pe la casa mea");
await areas.nth(1).fill("suntem 6 in magazin, 3 pe tura");
await areas.nth(2).fill("da, raman responsabil pe tura de vreo 2 ori pe saptamana, inchid casa si fac monetarul");
await shot("10-intrebari-raspunse");
log("generez bulleturile (AI real)...");
await page.getByRole("button", { name: /Generează descrierile/ }).click();
await page.getByText(/descrieri generate/).waitFor({ timeout: 120000 });
await shot("11-selectie-bullets-ai-real");

// selectează primele 4
const bulletButtons = page.locator("button").filter({ has: page.locator("span[aria-hidden]") });
const bulletTexts = await page.locator("ul, div").filter({ hasText: /./ }).count();
for (let i = 0; i < 4; i++) {
  await page.locator("button[style*='text-align']").nth(i).click().catch(() => {});
}
await page.waitForTimeout(400);
await shot("12-selectie-4-bifate");
await page.getByRole("button", { name: /Finalizează/ }).click();
await page.getByRole("heading", { name: /Joburile tale/ }).waitFor({ timeout: 15000 });
await shot("13-rezumat-job");
await page.getByRole("button", { name: /Continuă/ }).click();

// ── Pasul 5: Educație ───────────────────────────────────────────
await page.getByRole("heading", { name: /Educație/ }).waitFor();
await shot("14-educatie-gol");
await page.getByRole("button", { name: /Adaugă educație/ }).click();
await shot("15-educatie-dialog");
await page.locator("select").selectOption({ index: 2 });
await page.getByPlaceholder(/Universitatea Babeș-Bolyai/).fill("Liceul Tehnologic Aurel Vlaicu");
await page.getByPlaceholder("ex: Cluj-Napoca").last().fill("Cluj-Napoca");
await page.getByPlaceholder("ex: 2018 – 2022").fill("2007 – 2011");
await page.getByTestId("btn-save-education").click();
await page.waitForTimeout(400);
await page.getByRole("button", { name: "Continuă", exact: false }).click();

// ── Pasul 6: Abilități — AI REAL ────────────────────────────────
await page.getByRole("heading", { name: "Abilități" }).waitFor();
await shot("16-abilitati-loading");
await page.waitForTimeout(100);
// așteaptă pool-ul real
await page
  .locator("input[type='checkbox']")
  .first()
  .waitFor({ timeout: 90000 })
  .catch(() => {});
await page.waitForTimeout(600);
await shot("17-abilitati-ai-real");
const checkboxes = page.locator("input[type='checkbox']");
const total = await checkboxes.count();
log(`abilități sugerate (checkbox-uri): ${total}`);
for (let i = 0; i < Math.min(6, total); i++) await checkboxes.nth(i).check();
await shot("18-abilitati-bifate");
await page.getByRole("button", { name: /Continuă/ }).click();

// ── Pasul 7: Limbi ──────────────────────────────────────────────
await page.getByRole("heading", { name: /Limbi străine/ }).waitFor();
await page.getByRole("button", { name: "Limbă" }).click();
await page.getByRole("listbox").getByRole("option", { name: "Engleză" }).click();
await page.getByRole("button", { name: "Nivel" }).click();
await page.getByRole("listbox").getByRole("option", { name: /A2/ }).click();
await page.getByRole("button", { name: "Adaugă", exact: true }).click();
await shot("19-limbi");
await page.getByRole("button", { name: /Continuă/ }).click();

// ── Pasul 8: Permis ─────────────────────────────────────────────
await page.getByRole("heading", { name: /Permis/ }).waitFor();
await page.getByRole("button", { name: "✅ Da" }).click();
await page.getByRole("button", { name: "B", exact: true }).click();
await shot("20-permis");
await page.getByRole("button", { name: /Continuă/ }).click();

// ── Pasul 9: Hobby-uri — AI REAL ────────────────────────────────
await page.getByRole("heading", { name: /Hobby-uri/ }).waitFor();
await page.getByLabel(/Ce faci în timpul liber/).fill("ma uit la meciuri si joc fotbal duminica cu baietii");
await page.getByRole("button", { name: /Adaugă/ }).click();
await page.waitForTimeout(6000);
await shot("21-hobby-ai-real");
await page.getByRole("button", { name: /Generează CV-ul/ }).click();

// ── Pasul 10: Finalizare + PDF real ─────────────────────────────
await page.getByRole("heading", { name: /CV-ul tău e gata/ }).waitFor({ timeout: 15000 });
await shot("22-final-clasic");
await page.getByTestId("template-modern").click();
await page.waitForTimeout(400);
await shot("23-final-modern");
const dl = page.waitForEvent("download");
await page.getByRole("button", { name: /Descarcă PDF/ }).click();
const download = await dl;
log(`PDF descărcat: ${download.suggestedFilename()}`);
await page.waitForTimeout(800);
await shot("24-dupa-descarcare");

// ── Test critic: REFRESH la mijlocul completării ────────────────
log("test refresh (F5) — se pierd datele?");
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(800);
await shot("25-dupa-refresh");
const backToStart = await page
  .getByRole("heading", { name: "Ce job vrei să obții?" })
  .isVisible()
  .catch(() => false);
log(`după refresh: ${backToStart ? "❌ ARUNCAT LA PASUL 1, datele pierdute" : "✓ starea păstrată"}`);

console.log("\n── erori în consolă ──");
console.log(consoleErrors.length ? consoleErrors.join("\n") : "(niciuna)");
await browser.close();
log("audit desktop complet");
