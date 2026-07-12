/** Verificare vizuală: educație cu dropdown-uri + cursuri, rezumat REAL la final. */
import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.route("**/api/ai/correct-text", (r) =>
  r.fulfill({ json: { corrected: r.request().postDataJSON().text } })
);
await page.route("**/api/ai/research", (r) => r.fulfill({ json: { ok: true } }));
await page.route("**/api/ai/generate-skills", (r) =>
  r.fulfill({ json: { hardSkills: ["Casă de marcat", "Recepție marfă"], softwareTools: [], softSkills: ["Seriozitate"] } })
);
// summary = AI REAL (fără mock)

const shot = (n) => page.screenshot({ path: `.screens/fix-${n}.png` });

await page.goto("http://localhost:3000/creare-cv", { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.removeItem("cv-smart-progress"));
await page.reload({ waitUntil: "networkidle" });
await shot("01-pas1-fara-inapoi");

await page.getByText(/Nu am un anunț/).click();
await page.getByText("Nu am fotografie potrivită").click();
await page.getByLabel(/prenume/i).fill("Elena");
await page.getByLabel(/nume de familie/i).fill("Stanciu");
await page.getByLabel(/email/i).fill("elena@gmail.com");
await page.getByLabel(/telefon/i).fill("0722314558");
await page.getByLabel(/oraș/i).first().fill("Cluj-Napoca");
await page.getByRole("button", { name: /Continuă/ }).click();
await page.getByText(/prefer să scriu descrierile manual/i).click();
await page.getByLabel(/funcția/i).fill("Vânzător");
await page.getByLabel(/compania/i).fill("Profi City");
await page.getByRole("button", { name: "anul", exact: true }).click();
await page.getByRole("listbox").getByRole("option", { name: "2022", exact: true }).click();
await page
  .getByLabel(/responsabilit/i)
  .fill("Operarea casei de marcat și servirea clienților, cu flux de 200–300 de clienți pe zi\nRecepția mărfii și verificarea conformității livrărilor cu avizul\nPreluarea responsabilității de tură în absența șefei");
await page.getByRole("button", { name: /Salvează jobul/ }).click();
await page.getByRole("button", { name: /Continuă/ }).click();

// Educație — dialog cu dropdown-uri de perioadă
await page.getByRole("button", { name: /Adaugă educație/ }).click();
await page.locator("select").selectOption({ index: 1 }); // Liceu — prima opțiune reală (index 0 = placeholder disabled)
await page.getByPlaceholder(/Universitatea Babeș-Bolyai/).fill("Liceul Tehnologic Aurel Vlaicu");
await page.getByRole("button", { name: "anul", exact: true }).click();
await shot("02-educatie-dropdown-an");
await page.getByRole("listbox").getByRole("option", { name: "2007", exact: true }).click();
await page.getByRole("button", { name: "Prezent", exact: true }).click();
await page.getByRole("listbox").getByRole("option", { name: "2011", exact: true }).click();
await shot("03-educatie-dialog-complet");
await page.getByTestId("btn-save-education").click();
await page.waitForTimeout(300);
// curs
await page.getByPlaceholder(/Operator stivuitor ISCIR/).fill("Curs igienă alimentară");
await page.getByPlaceholder("anul").fill("2021");
await page.getByRole("button", { name: /Adaugă cursul/ }).click();
await page.waitForTimeout(300);
await shot("04-educatie-cu-curs");
await page.getByRole("button", { name: "Continuă", exact: false }).click();

// → final
await page.getByRole("heading", { name: "Abilități" }).waitFor();
await page.waitForTimeout(400);
const cb = page.locator("input[type='checkbox']");
for (let i = 0; i < 3; i++) await cb.nth(i).check().catch(() => {});
await page.getByRole("button", { name: /Continuă/ }).click();
await page.getByRole("button", { name: /Continuă/ }).click();
await page.getByRole("button", { name: /Continuă/ }).click();
await page.getByRole("heading", { name: /Hobby-uri/ }).waitFor();
await page.getByRole("button", { name: /Generează CV-ul/ }).click();
await page.getByRole("heading", { name: /CV-ul tău e gata/ }).waitFor();
// așteaptă rezumatul REAL
await page.waitForTimeout(15000);
await shot("05-final-cu-rezumat-real");
const summaryText = await page
  .getByTestId("final-cv-sheet")
  .textContent()
  .then((t) => (t?.includes("Rezumat") ? "✅ Rezumatul apare în CV" : "❌ fără rezumat"));
console.log(summaryText);
await browser.close();
