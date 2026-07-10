/** Sweep vizual: parcurge wizard-ul cu AI mock-uit și face screenshot la fiecare ecran. */
import { chromium } from "@playwright/test";

const QUESTIONS = [1, 2, 3, 4, 5].map((i) => ({
  id: `q${i}`,
  question: `Întrebarea de test numărul ${i} despre experiența ta?`,
  expected_info: "detalii",
}));
const BULLETS = [
  "Întocmirea și depunerea lunară a declarațiilor D112, D300 și D394 pentru 12 firme.",
  "Procesarea a circa 300 de facturi lunar pentru portofoliul de clienți.",
  "Scurtarea închiderii de lună de la 10 la 6 zile prin reorganizarea verificărilor.",
  "Soluționarea unui control ANAF, inclusiv anularea unei amenzi de 8000 lei.",
  "Coordonarea unei colege junioare, cu verificarea lucrărilor contabile.",
  "Utilizarea zilnică a programelor Saga, Excel și SmartBill.",
  "Menținerea comunicării directe cu clienții pe mail și telefon.",
].map((text, i) => ({ id: `b${i + 1}`, text, category: "responsabilitate_core" }));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.route("**/api/ai/correct-text", (r) =>
  r.fulfill({ json: { corrected: r.request().postDataJSON().text } })
);
await page.route("**/api/ai/research", (r) => r.fulfill({ json: { ok: true } }));
await page.route("**/api/cv/analyze", (r) =>
  r.fulfill({ json: { sessionId: "sweep", questions: QUESTIONS } })
);
await page.route("**/api/cv/generate-bullets", (r) =>
  r.fulfill({ json: { bullets: BULLETS, regenerated: false, droppedCount: 0 } })
);
await page.route("**/api/cv/select-bullets", (r, req) => {
  const ids = req.postDataJSON().selectedIds;
  r.fulfill({ json: { selected: BULLETS.filter((b) => ids.includes(b.id)) } });
});
await page.route("**/api/ai/generate-skills", (r) =>
  r.fulfill({
    json: {
      hardSkills: ["Contabilitate primară", "Declarații fiscale", "Salarizare"],
      softwareTools: ["Saga", "Excel"],
      softSkills: ["Atenție la detalii"],
    },
  })
);

const shot = (name) => page.screenshot({ path: `.screens/sweep-${name}.png` });

await page.goto("http://localhost:3000/creare-cv", { waitUntil: "networkidle" });
await shot("01-job-vizat");

// Pas 1 → JD + continuă
await page.getByPlaceholder(/copy-paste la descrierea/i).fill("Căutăm Contabil Senior: D112, D300, Saga.");
await page.getByRole("button", { name: "Continuă", exact: true }).click();
await page.getByText("Nu am fotografie potrivită").click();

// Contact
await page.getByRole("heading", { name: "Date de contact" }).waitFor();
await page.getByLabel(/prenume/i).fill("Elena");
await page.getByLabel(/nume de familie/i).fill("Stanciu");
await page.getByLabel(/email/i).fill("elena.stanciu@gmail.com");
await shot("03-contact");
// județ dropdown deschis
await page.getByRole("button", { name: /alege județul/ }).click();
await shot("03b-judet-deschis");
await page.getByRole("option", { name: "București" }).click();
// modal străinătate
await page.getByRole("button", { name: /Locuiești în afara României/ }).click();
await page.getByRole("dialog").getByRole("button", { name: /Țara/ }).click();
await page.getByPlaceholder("Caută...").fill("germa");
await shot("03c-modal-tara");
await page.getByRole("option", { name: "Germania" }).click();
await page.getByPlaceholder("numărul de telefon").fill("1512 345678");
await page.getByLabel(/adresa/i).fill("Hauptstraße 12, Berlin");
await shot("03d-modal-complet");
await page.getByRole("dialog").getByRole("button", { name: "OK" }).click();
await shot("03e-rezumat-strainatate");
await page.getByRole("button", { name: /Continuă/ }).click();

// Experiență — input
await page.getByRole("heading", { name: /Povestește-ne ce faci/ }).waitFor();
await page.getByLabel(/funcția/i).fill("Contabil");
await page.getByLabel(/compania/i).fill("SC ContExpert SRL");
await page.getByRole("button", { name: "anul", exact: true }).click();
await shot("04b-perioada-dropdown");
await page.getByRole("listbox").getByRole("option", { name: "2021", exact: true }).click();
await page.getByPlaceholder(/povesti unui prieten/i).fill(
  "ma ocup de contabilitate primara si declaratii pentru firme mici. bag facturi, fac salarii, depun declaratii la anaf."
);
await shot("04-experienta-input");
await page.getByRole("button", { name: /Analizează/ }).click();

// Întrebări
await page.getByText("0/5 răspunsuri").waitFor();
const areas = page.locator("textarea");
await areas.nth(0).fill("procesez 300 de facturi pe luna");
await areas.nth(1).fill("folosesc Saga si Excel");
await areas.nth(2).fill("coordonez o colega juniora");
await shot("05-intrebari");
await page.getByRole("button", { name: /Generează descrierile/ }).click();

// Selecție
await page.getByText("7 descrieri generate").waitFor();
for (let i = 0; i < 7; i++) await page.getByText(BULLETS[i].text).click();
await shot("06-selectie-toate");
await page.getByRole("button", { name: /Finalizează/ }).click();

// Rezumat + editare inline
await page.getByRole("heading", { name: /Joburile tale/ }).waitFor();
await shot("07-rezumat-joburi");
await page.getByRole("button", { name: /Continuă/ }).click();

// Educație (skip) → Abilități → Limbi
await page.getByRole("button", { name: /Sari peste/ }).click();
await page.getByRole("heading", { name: "Abilități" }).waitFor();
await page.waitForTimeout(400);
await shot("08-abilitati");
await page.getByRole("button", { name: /Continuă/ }).click();

// Limbi
await page.getByRole("heading", { name: /Limbi străine/ }).waitFor();
await page.getByRole("button", { name: "Limbă" }).click();
await shot("09b-limbi-dropdown");
await page.getByRole("listbox").getByRole("option").first().click();
await page.getByRole("button", { name: "Adaugă", exact: true }).click();
await shot("09-limbi");
await page.getByRole("button", { name: /Continuă/ }).click();

// Permis
await page.getByRole("heading", { name: /Permis & Calificări/ }).waitFor();
await page.getByRole("button", { name: "✅ Da" }).click();
await page.getByRole("button", { name: "B", exact: true }).click();
await page.getByRole("button", { name: "CE", exact: true }).click();
await shot("10-permis");
await page.getByRole("button", { name: /Continuă/ }).click();

// Hobby-uri
await page.getByRole("heading", { name: /Hobby-uri & Pasiuni/ }).waitFor();
await page.getByLabel(/Ce faci în timpul liber/).fill("citesc carti de istorie");
await page.getByRole("button", { name: /Adaugă/ }).click();
await page.waitForTimeout(300);
await shot("11-hobbyuri");

console.log("✅ sweep complet — vezi .screens/sweep-*.png");
await browser.close();
