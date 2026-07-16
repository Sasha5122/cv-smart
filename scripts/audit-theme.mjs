/** Audit vizual al temei Framework pe TOATE ecranele (AI mock-uit). */
import { chromium } from "@playwright/test";

const QUESTIONS = [1, 2, 3, 4, 5].map((i) => ({
  id: `q${i}`, question: `Întrebarea de test numărul ${i} despre experiența ta?`, expected_info: "d",
}));
const BULLETS = [
  "Operarea casei de marcat și servirea clienților, cu flux de 200–300 de clienți pe zi.",
  "Aranjarea mărfii la raft și întocmirea etichetelor.",
  "Recepția mărfii și verificarea conformității livrărilor cu avizul.",
  "Verificarea termenelor de valabilitate ale produselor.",
  "Menținerea curățeniei în magazin.",
  "Preluarea responsabilității de tură în absența șefei.",
  "Gestionarea reclamațiilor simple ale clienților.",
].map((text, i) => ({ id: `b${i + 1}`, text, category: "responsabilitate_core" }));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.route("**/api/ai/correct-text", (r) => r.fulfill({ json: { corrected: r.request().postDataJSON().text } }));
await page.route("**/api/ai/research", (r) => r.fulfill({ json: { ok: true } }));
await page.route("**/api/ai/summary", (r) => r.fulfill({ json: { summary: "Vânzător cu experiență în operarea casei de marcat și servirea unui flux mare de clienți." } }));
await page.route("**/api/cv/analyze", (r) => r.fulfill({ json: { sessionId: "audit", questions: QUESTIONS } }));
await page.route("**/api/cv/generate-bullets", (r) => r.fulfill({ json: { bullets: BULLETS, regenerated: false, droppedCount: 0 } }));
await page.route("**/api/cv/select-bullets", (r, req) => {
  const ids = req.postDataJSON().selectedIds;
  r.fulfill({ json: { selected: BULLETS.filter((b) => ids.includes(b.id)) } });
});
await page.route("**/api/ai/generate-skills", (r) =>
  r.fulfill({ json: { hardSkills: ["Casă de marcat", "Recepție marfă"], softwareTools: ["POS"], softSkills: ["Seriozitate"] } })
);

const shot = (n) => page.screenshot({ path: `.screens/th-${n}.png` });

await page.goto("http://localhost:3000/creare-cv", { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.removeItem("cv-smart-progress"));
await page.reload({ waitUntil: "networkidle" });
await page.getByPlaceholder(/copy-paste la descrierea/i).fill("Căutăm vânzător, casa de marcat, ture.");
await page.getByRole("button", { name: "Continuă", exact: true }).click();
await page.waitForTimeout(400);
await shot("02-foto");
await page.getByText("Nu am fotografie potrivită").click();
await page.getByLabel(/prenume/i).fill("Elena");
await page.getByLabel(/nume de familie/i).fill("Stanciu");
await page.getByLabel(/email/i).fill("elena@gmail.com");
await page.getByLabel(/telefon/i).fill("0722314558");
await page.getByLabel(/oraș/i).first().fill("Cluj-Napoca");
// modal străinătate deschis
await page.getByRole("button", { name: /Locuiești în afara României/ }).click();
await page.getByRole("dialog").getByRole("button", { name: /Țara/ }).click();
await page.waitForTimeout(300);
await shot("03-modal-tara");
await page.keyboard.press("Escape"); // închide dropdown + modal (Escape e global pe modal)
await page.waitForTimeout(300);
await page.getByRole("button", { name: /Continuă/ }).click();

// Experiență
await page.getByRole("heading", { name: /Povestește-ne/ }).waitFor();
await page.getByLabel(/funcția/i).fill("Vânzător");
await page.getByRole("button", { name: "anul", exact: true }).click();
await page.waitForTimeout(300);
await shot("04-perioada-dropdown");
await page.getByRole("listbox").getByRole("option", { name: "2022", exact: true }).click();
await page.getByPlaceholder(/povesti unui prieten/i).fill("lucrez la casa si servesc clientii, pun marfa pe raft");
await shot("05-exp-input");
await page.getByRole("button", { name: /Analizează/ }).click();
await page.getByRole("heading", { name: /5 întrebări/ }).waitFor({ timeout: 10000 });
const areas = page.locator("textarea");
await areas.nth(0).fill("da");
await areas.nth(1).fill("da");
await areas.nth(2).fill("da");
await shot("06-intrebari");
await page.getByRole("button", { name: /Generează descrierile/ }).click();
await page.getByText(/descrieri generate/).waitFor({ timeout: 10000 });
for (let i = 0; i < 4; i++) await page.getByText(BULLETS[i].text).click();
await page.waitForTimeout(300);
await shot("07-selectie");
await page.getByRole("button", { name: /Finalizează/ }).click();
await page.getByRole("heading", { name: /Joburile tale/ }).waitFor();
await shot("08-rezumat-job");
await page.getByRole("button", { name: /Continuă/ }).click();

// Educație + dialog
await page.getByRole("button", { name: /Adaugă educație/ }).click();
await page.waitForTimeout(300);
await shot("09-educatie-dialog");
await page.locator("select").selectOption({ index: 1 });
await page.getByPlaceholder(/Universitatea Babeș-Bolyai/).fill("Liceul Teoretic");
await page.getByRole("button", { name: "anul", exact: true }).click();
await page.getByRole("listbox").getByRole("option", { name: "2010", exact: true }).click();
await page.getByTestId("btn-save-education").click();
await page.waitForTimeout(300);
await page.getByRole("button", { name: "Continuă", exact: false }).click();

// Abilități
await page.getByRole("heading", { name: "Abilități" }).waitFor();
await page.waitForTimeout(500);
const cbs = page.locator("input[type='checkbox']");
for (let i = 0; i < 3; i++) await cbs.nth(i).check().catch(() => {});
await shot("10-abilitati");
await page.getByRole("button", { name: /Continuă/ }).click();

// Limbi
await page.getByRole("heading", { name: /Limbi străine/ }).waitFor();
await page.getByRole("button", { name: "Limbă" }).click();
await page.getByRole("listbox").getByRole("option", { name: "Engleză" }).click();
await page.getByRole("button", { name: "Adaugă", exact: true }).click();
await shot("11-limbi");
await page.getByRole("button", { name: /Continuă/ }).click();

// Permis — inclusiv „Nu" pentru border-ul slate
await page.getByRole("heading", { name: /Permis/ }).waitFor();
await page.getByRole("button", { name: "✅ Da" }).click();
await page.getByRole("button", { name: "B", exact: true }).click();
await shot("12-permis");
await page.getByRole("button", { name: /Continuă/ }).click();

// Hobby
await page.getByRole("heading", { name: /Hobby-uri/ }).waitFor();
await page.getByLabel(/Ce faci în timpul liber/).fill("fotbal");
await page.getByRole("button", { name: /Adaugă/ }).click();
await page.waitForTimeout(400);
await shot("13-hobby");
await page.getByRole("button", { name: /Generează CV-ul/ }).click();

// Final
await page.getByRole("heading", { name: /CV-ul tău e gata/ }).waitFor();
await page.waitForTimeout(600);
await shot("14-final");
await page.getByRole("button", { name: /Descarcă PDF/ }).scrollIntoViewIfNeeded();
await shot("15-final-butoane");
await browser.close();
console.log("✅ audit temă complet — .screens/th-*.png");
