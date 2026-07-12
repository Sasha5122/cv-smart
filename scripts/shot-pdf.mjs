/** Deschide PDF-urile generate în viewerul Chromium și face screenshot. */
import { chromium } from "@playwright/test";
import { pathToFileURL } from "url";
import path from "path";

const templates = process.argv[2]
  ? [process.argv[2]]
  : ["classic", "modern", "elegant", "compact", "minimal"];

const browser = await chromium.launch({ headless: false, args: ["--window-position=2000,2000"] });
const page = await browser.newPage({ viewport: { width: 1000, height: 1350 } });

for (const t of templates) {
  const pdfPath = path.resolve(`.screens/sample-cv-${t}.pdf`);
  await page.goto(pathToFileURL(pdfPath).href);
  await page.waitForTimeout(2200);
  await page.screenshot({ path: `.screens/pdf-${t}.png` });
  console.log(`📸 pdf-${t}.png`);
}
await browser.close();
