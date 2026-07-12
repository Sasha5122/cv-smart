/** Audit mobil (Pixel 7) + testul butonului Înapoi de pe pasul 1. */
import { chromium, devices } from "@playwright/test";

const browser = await chromium.launch();

// ── Înapoi pe pasul 1 → pierde anunțul? ─────────────────────────
const p1 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await p1.route("**/api/ai/research", (r) => r.fulfill({ json: { ok: true } }));
await p1.goto("http://localhost:3000/creare-cv", { waitUntil: "networkidle" });
await p1.getByPlaceholder(/copy-paste la descrierea/i).fill("Anunț de test pentru verificare");
await p1.getByRole("button", { name: /Înapoi/ }).click();
await p1.waitForTimeout(2500);
const jdAfter = await p1
  .getByPlaceholder(/copy-paste la descrierea/i)
  .inputValue()
  .catch(() => "(pagina nu mai are câmpul)");
console.log(`[audit] Înapoi pe pasul 1 → url=${p1.url()} → anunțul="${jdAfter}"`);
await p1.close();

// ── Tur mobil ───────────────────────────────────────────────────
const ctx = await browser.newContext({ ...devices["Pixel 7"] });
const page = await ctx.newPage();
await page.route("**/api/ai/correct-text", (r) =>
  r.fulfill({ json: { corrected: r.request().postDataJSON().text } })
);
await page.route("**/api/ai/research", (r) => r.fulfill({ json: { ok: true } }));
await page.route("**/api/ai/generate-skills", (r) =>
  r.fulfill({ json: { hardSkills: ["Servire clienți"], softwareTools: ["Casă de marcat"], softSkills: ["Seriozitate"] } })
);
const shot = (n) => page.screenshot({ path: `.screens/audit-m-${n}.png` });

await page.goto("http://localhost:3000/creare-cv", { waitUntil: "networkidle" });
await shot("01-pas1");
await page.getByText(/Nu am un anunț/).click();
await page.getByText("Nu am fotografie potrivită").click();
await page.getByRole("heading", { name: "Date de contact" }).waitFor();
await shot("02-contact");
await page.getByLabel(/prenume/i).fill("Ion");
await page.getByLabel(/nume de familie/i).fill("Pop");
await page.getByLabel(/email/i).fill("ion.pop@gmail.com");
await page.getByLabel(/telefon/i).fill("0745123456");
await page.getByLabel(/oraș/i).first().fill("Turda");
await page.getByRole("button", { name: /Continuă/ }).click();
await page.getByRole("heading", { name: /Povestește-ne/ }).waitFor();
await shot("03-experienta");
// scroll jos să vedem butoanele
await page.getByRole("button", { name: /Analizează/ }).scrollIntoViewIfNeeded();
await shot("04-experienta-jos");
// manual path → final rapid
await page.getByText(/prefer să scriu descrierile manual/i).click();
await page.getByLabel(/funcția/i).fill("Vânzător");
await page.getByLabel(/responsabilit/i).fill("Servirea clienților\nAranjarea mărfii");
await page.getByRole("button", { name: /Salvează jobul/ }).click();
await page.getByRole("button", { name: /Continuă/ }).click();
await page.getByRole("button", { name: /Sari peste/ }).click();
await page.getByRole("heading", { name: "Abilități" }).waitFor();
await page.getByRole("button", { name: /Continuă/ }).click();
await page.getByRole("button", { name: /Continuă/ }).click();
await page.getByRole("button", { name: /Continuă/ }).click();
await page.getByRole("heading", { name: /Hobby-uri/ }).waitFor();
await page.getByRole("button", { name: /Generează CV-ul/ }).click();
await page.getByRole("heading", { name: /CV-ul tău e gata/ }).waitFor();
await shot("05-final");
await page.getByTestId("template-modern").click();
await page.waitForTimeout(400);
await shot("06-final-modern");
await browser.close();
console.log("[audit] mobil complet");
