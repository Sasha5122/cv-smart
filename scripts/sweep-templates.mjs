/** Screenshot al pasului final cu fiecare design selectat. */
import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } });

await page.route("**/api/ai/correct-text", (r) =>
  r.fulfill({ json: { corrected: r.request().postDataJSON().text } })
);
await page.route("**/api/ai/research", (r) => r.fulfill({ json: { ok: true } }));
await page.route("**/api/ai/generate-skills", (r) =>
  r.fulfill({
    json: {
      hardSkills: ["Contabilitate primară", "Declarații fiscale"],
      softwareTools: ["Saga", "Excel"],
      softSkills: ["Atenție la detalii"],
    },
  })
);

await page.goto("http://localhost:3000/creare-cv", { waitUntil: "networkidle" });
await page.getByText(/Nu am un anunț/).click();
await page.getByText("Nu am fotografie potrivită").click();
await page.getByLabel(/prenume/i).fill("Elena");
await page.getByLabel(/nume de familie/i).fill("Stanciu");
await page.getByLabel(/email/i).fill("elena.stanciu@gmail.com");
await page.getByLabel(/telefon/i).fill("0722314558");
await page.getByLabel(/oraș/i).first().fill("Cluj-Napoca");
await page.getByPlaceholder("ex: Str. Mihai Eminescu").fill("Str. Mihai Eminescu");
await page.getByPlaceholder("ex: 12").fill("12");
await page.getByRole("button", { name: /Continuă/ }).click();
await page.getByText(/prefer să scriu descrierile manual/i).click();
await page.getByLabel(/funcția/i).fill("Contabil");
await page.getByLabel(/compania/i).fill("SC ContExpert SRL");
await page.getByRole("button", { name: "anul", exact: true }).click();
await page.getByRole("listbox").getByRole("option", { name: "2021", exact: true }).click();
await page
  .getByLabel(/responsabilit/i)
  .fill(
    "Întocmirea și depunerea lunară a declarațiilor D112, D300 și D394\nProcesarea a circa 300 de facturi lunar în Saga\nGestionarea relației cu ANAF și clienții"
  );
await page.getByRole("button", { name: /Salvează jobul/ }).click();
await page.getByRole("button", { name: /Continuă/ }).click();
// Educație cu medie+lucrare
await page.getByRole("button", { name: /Adaugă educație/ }).click();
await page.locator("select").selectOption({ index: 1 });
await page.getByPlaceholder(/Universitatea Babeș-Bolyai/).fill("Universitatea Babeș-Bolyai");
await page.getByPlaceholder("ex: 2018 – 2022").fill("2016 – 2019");
await page.getByPlaceholder(/Titlul lucrării de licență/).fill("Optimizarea proceselor contabile");
await page.getByPlaceholder("ex: 9.50").fill("9.50");
await page.getByTestId("btn-save-education").click();
await page.getByRole("button", { name: "Continuă", exact: false }).click();
// Abilități — bifează câteva
await page.getByRole("heading", { name: "Abilități" }).waitFor();
await page.waitForTimeout(400);
for (const sk of ["Contabilitate primară", "Declarații fiscale", "Saga", "Excel", "Atenție la detalii"]) {
  await page.getByText(sk, { exact: true }).first().click().catch(() => {});
}
await page.getByRole("button", { name: /Continuă/ }).click();
// Limbi
await page.getByRole("heading", { name: /Limbi străine/ }).waitFor();
await page.getByRole("button", { name: "Limbă" }).click();
await page.getByRole("listbox").getByRole("option", { name: "Engleză" }).click();
await page.getByRole("button", { name: "Adaugă", exact: true }).click();
await page.getByRole("button", { name: /Continuă/ }).click();
// Permis
await page.getByRole("heading", { name: /Permis/ }).waitFor();
await page.getByRole("button", { name: "✅ Da" }).click();
await page.getByRole("button", { name: "B", exact: true }).click();
await page.getByPlaceholder(/Operator stivuitor/).fill("Stagiar CECCAR (anul 2)");
await page.getByRole("button", { name: /Continuă/ }).click();
// Hobby → final
await page.getByRole("heading", { name: /Hobby-uri/ }).waitFor();
await page.getByLabel(/Ce faci în timpul liber/).fill("alergare montana");
await page.getByRole("button", { name: /Adaugă/ }).click();
await page.waitForTimeout(300);
await page.getByRole("button", { name: /Generează CV-ul/ }).click();
await page.getByRole("heading", { name: /CV-ul tău e gata/ }).waitFor();

for (const t of ["classic", "modern", "elegant", "compact", "minimal"]) {
  await page.getByTestId(`template-${t}`).click();
  await page.waitForTimeout(350);
  await page.screenshot({ path: `.screens/tpl-${t}.png`, fullPage: false });
  console.log(`📸 tpl-${t}.png`);
}
await browser.close();
