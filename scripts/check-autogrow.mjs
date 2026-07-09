/** Verifică auto-grow-ul textarea-ului de la pasul 1 (JD). */
import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3000/creare-cv", { waitUntil: "networkidle" });

const ta = page.getByPlaceholder(/copy-paste la descrierea/i);
const h0 = (await ta.boundingBox()).height;

const paragraf =
  "Căutăm coleg pentru echipa noastră de vânzări, cu experiență în retail și relații cu clienții. ";
await ta.fill(paragraf.repeat(15)); // ~230 cuvinte — peste inaltimea minima
await page.waitForTimeout(300);
const h1 = (await ta.boundingBox()).height;

await ta.fill(paragraf.repeat(40)); // ~600 cuvinte — peste limită
await page.waitForTimeout(300);
const h2 = (await ta.boundingBox()).height;
const overflow = await ta.evaluate((el) => el.style.overflowY);

await page.screenshot({ path: ".screens/31-autogrow.png" });
console.log(`gol: ${h0}px → ~100 cuvinte: ${h1}px → ~600 cuvinte: ${h2}px (overflow: ${overflow})`);
console.log(h1 > h0 && h2 > h1 && h2 <= 565 && overflow === "auto" ? "✅ auto-grow OK, plafonat cu scroll" : "❌ ceva nu e ok");
await browser.close();
