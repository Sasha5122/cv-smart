/** Sweep vizual pentru issues2: preview lat A4, adresă completă, permis,
 *  medie/lucrare, limbi vizibile, pasul final. */
import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });

await page.route("**/api/ai/correct-text", (r) =>
  r.fulfill({ json: { corrected: r.request().postDataJSON().text } })
);
await page.route("**/api/ai/research", (r) => r.fulfill({ json: { ok: true } }));
await page.route("**/api/ai/generate-skills", (r) =>
  r.fulfill({
    json: {
      hardSkills: ["Vânzare consultativă", "Gestionare stocuri"],
      softwareTools: ["Casa de marcat", "Excel"],
      softSkills: ["Comunicare"],
    },
  })
);
await page.route("**/api/pdf/**", (r) =>
  r.fulfill({ body: Buffer.from("%PDF-1.4 test"), contentType: "application/pdf" })
);

const shot = (name) => page.screenshot({ path: `.screens/sweep2-${name}.png` });

await page.goto("http://localhost:3000/creare-cv", { waitUntil: "networkidle" });
await page.getByText(/Nu am un anunț/).click();
await page.getByText("Nu am fotografie potrivită").click();

// Contact — adresa completă România
await page.getByLabel(/prenume/i).fill("Elena");
await page.getByLabel(/nume de familie/i).fill("Stanciu");
await page.getByLabel(/email/i).fill("elena.stanciu@gmail.com");
await page.getByLabel(/telefon/i).fill("0722314558");
await page.getByLabel(/oraș/i).first().fill("Cluj-Napoca");
await page.getByRole("button", { name: /alege județul/ }).click();
await page.getByPlaceholder("Caută...").fill("cluj");
await page.getByRole("option", { name: "Cluj", exact: true }).click();
await page.getByPlaceholder("ex: Str. Mihai Eminescu").fill("Str. Mihai Eminescu");
await page.getByPlaceholder("ex: 12").fill("12");
await page.getByPlaceholder("ex: 4A").fill("4A");
await page.waitForTimeout(300);
await shot("01-contact-adresa-ro");
await page.getByRole("button", { name: /Continuă/ }).click();

// Experiență — manual, rapid
await page.getByText(/prefer să scriu descrierile manual/i).click();
await page.getByLabel(/funcția/i).fill("Vânzător");
await page.getByLabel(/compania/i).fill("Profi");
await page.getByRole("button", { name: "anul", exact: true }).click();
await page.getByRole("listbox").getByRole("option", { name: "2021", exact: true }).click();
await page
  .getByLabel(/responsabilit/i)
  .fill("Servirea clienților la casă\nAranjarea mărfii la raft\nGestionarea stocurilor din depozit");
await page.getByRole("button", { name: /Salvează jobul/ }).click();
await page.getByRole("button", { name: /Continuă/ }).click();

// Educație — cu medie + lucrare
await page.getByRole("button", { name: /Adaugă educație/ }).click();
await page.locator("select").selectOption({ index: 1 });
await page.getByPlaceholder(/Universitatea Babeș-Bolyai/).fill("Universitatea Babeș-Bolyai");
await page.getByPlaceholder("ex: 2018 – 2022").fill("2018 – 2022");
await page.getByPlaceholder(/Titlul lucrării de licență/).fill("Optimizarea proceselor logistice");
await page.getByPlaceholder("ex: 9.50").fill("9.50");
await page.getByTestId("btn-save-education").click();
await page.waitForTimeout(300);
await shot("02-educatie-medie-lucrare");
await page.getByRole("button", { name: "Continuă", exact: false }).click();

// Abilități → Limbi
await page.getByRole("heading", { name: "Abilități" }).waitFor();
await page.waitForTimeout(400);
await page.getByRole("button", { name: /Continuă/ }).click();
await page.getByRole("heading", { name: /Limbi străine/ }).waitFor();
await page.getByRole("button", { name: "Limbă" }).click();
await page.getByRole("listbox").getByRole("option", { name: "Engleză" }).click();
await page.getByRole("button", { name: "Adaugă", exact: true }).click();
await page.getByRole("button", { name: "Limbă" }).click();
await page.getByRole("listbox").getByRole("option", { name: "Germană" }).click();
await page.getByRole("button", { name: "Adaugă", exact: true }).click();
await page.waitForTimeout(300);
await shot("03-limbi-in-preview");

// Permis + calificări
await page.getByRole("button", { name: /Continuă/ }).click();
await page.getByRole("heading", { name: /Permis & Calificări/ }).waitFor();
await page.getByRole("button", { name: "✅ Da" }).click();
await page.getByRole("button", { name: "B", exact: true }).click();
await page.getByRole("button", { name: "CE", exact: true }).click();
await page
  .getByPlaceholder(/Operator stivuitor autorizat ISCIR/)
  .fill("Operator stivuitor autorizat ISCIR");
// derulează foaia de preview la capăt ca să se vadă permisul + limbile
await page
  .locator(".wizard-preview [style*='overflow-y']")
  .evaluate((el) => el.scrollTo({ top: el.scrollHeight }));
await page.waitForTimeout(300);
await shot("04-permis-in-preview");

// Hobby → pasul final
await page.getByRole("button", { name: /Continuă/ }).click();
await page.getByRole("heading", { name: /Hobby-uri/ }).waitFor();
await page.getByLabel(/Ce faci în timpul liber/).fill("fotbal");
await page.getByRole("button", { name: /Adaugă/ }).click();
await page.waitForTimeout(300);
await page.getByRole("button", { name: /Generează CV-ul/ }).click();
await page.getByRole("heading", { name: /CV-ul tău e gata/ }).waitFor();
await page.waitForTimeout(300);
await shot("05-pas-final");

console.log("✅ sweep2 complet");
await browser.close();
