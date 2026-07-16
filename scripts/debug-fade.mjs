/** Diagnostic: de ce rămân întrebările semi-transparente? */
import { chromium } from "@playwright/test";

const QUESTIONS = [1, 2, 3, 4, 5].map((i) => ({
  id: `q${i}`, question: `Întrebarea ${i}?`, expected_info: "d",
}));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.route("**/api/ai/correct-text", (r) => r.fulfill({ json: { corrected: r.request().postDataJSON().text } }));
await page.route("**/api/ai/research", (r) => r.fulfill({ json: { ok: true } }));
await page.route("**/api/cv/analyze", (r) => r.fulfill({ json: { sessionId: "x", questions: QUESTIONS } }));

await page.goto("http://localhost:3000/creare-cv", { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.removeItem("cv-smart-progress"));
await page.reload({ waitUntil: "networkidle" });
await page.getByText(/Nu am un anunț/).click();
await page.getByText("Nu am fotografie potrivită").click();
await page.getByLabel(/prenume/i).fill("A");
await page.getByLabel(/nume de familie/i).fill("B");
await page.getByLabel(/email/i).fill("a@b.co");
await page.getByLabel(/telefon/i).fill("0722314558");
await page.getByLabel(/oraș/i).first().fill("Cluj");
await page.getByRole("button", { name: /Continuă/ }).click();
await page.getByLabel(/funcția/i).fill("Vânzător");
await page.getByPlaceholder(/povesti unui prieten/i).fill("text");
await page.getByRole("button", { name: /Analizează/ }).click();
await page.getByRole("heading", { name: /5 întrebări/ }).waitFor();

const probe = async (label) => {
  const states = await page.evaluate(() => {
    const items = [...document.querySelectorAll(".animate-fade-in")].filter((el) =>
      el.textContent?.includes("Întrebarea")
    );
    return items.map((el) => {
      const anims = el.getAnimations();
      return {
        opacity: getComputedStyle(el).opacity,
        anim: anims.map((a) => `${a.playState}@${Math.round(a.currentTime ?? -1)}ms delay=${a.effect?.getTiming().delay}`).join(","),
      };
    });
  });
  console.log(`── ${label}:`);
  states.forEach((s, i) => console.log(`  Q${i + 1}: opacity=${s.opacity} [${s.anim}]`));
};

await probe("imediat după afișare");
await page.waitForTimeout(3000);
await probe("după 3 secunde");
// tastează într-un răspuns
await page.locator("textarea").nth(0).fill("raspuns test");
await page.waitForTimeout(500);
await probe("după tastare în Q1");
await browser.close();
