/** Deschide PDF-ul generat în viewerul Chromium și face screenshot. */
import { chromium } from "@playwright/test";
import { pathToFileURL } from "url";
import path from "path";

const pdfPath = path.resolve(".screens/sample-cv.pdf");
const browser = await chromium.launch({ headless: false, args: ["--window-position=2000,2000"] });
const page = await browser.newPage({ viewport: { width: 1000, height: 1350 } });
await page.goto(pathToFileURL(pdfPath).href);
await page.waitForTimeout(2500);
await page.screenshot({ path: ".screens/36-pdf-page1.png" });
// pagina 2 (dacă există) — derulează
await page.keyboard.press("End");
await page.waitForTimeout(800);
await page.screenshot({ path: ".screens/36-pdf-end.png" });
await browser.close();
console.log("done");
