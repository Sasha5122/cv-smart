/**
 * Capturi pentru README (docs/images/*.png), luate de pe site-ul live cu
 * Chromium headless — nu pornește serverul dev. Rulare: node scripts/shoot-readme.mjs
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE ?? "https://www.cvexpres.ro";
const host = new URL(BASE).hostname;
const out = "docs/images";
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
await ctx.addCookies([{ name: "NEXT_LOCALE", value: "en", domain: host, path: "/" }]);
const page = await ctx.newPage();
const shot = async (path, file) => {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${out}/${file}` });
  console.log("saved", file);
};
await shot("/", "landing-en.png");
await shot("/creare-cv", "wizard-en.png");
await shot("/demo/admin?lang=en", "demo-admin-en.png");
await page.getByTestId("admin-tab-eval").click();
await page.waitForTimeout(800);
await page.screenshot({ path: `${out}/demo-admin-evaluation-en.png` });
console.log("saved demo-admin-evaluation-en.png");
await browser.close();
