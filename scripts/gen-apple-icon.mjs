/** Randează faviconul SVG la 180×180 PNG → app/apple-icon.png */
import { chromium } from "@playwright/test";
import { readFileSync } from "fs";

const svg = readFileSync("app/icon.svg", "utf8");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 180, height: 180 } });
await page.setContent(
  `<body style="margin:0">${svg.replace('width="64" height="64"', 'width="180" height="180"')}</body>`
);
await page.locator("svg").screenshot({ path: "app/apple-icon.png" });
await browser.close();
console.log("✅ app/apple-icon.png generat");
