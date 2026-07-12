/** Verifică logo-ul în sidebar + faviconul servit. */
import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3000/creare-cv", { waitUntil: "networkidle" });

// faviconul e servit?
const iconRes = await page.request.get("http://localhost:3000/icon.svg");
console.log("GET /icon.svg:", iconRes.status(), iconRes.headers()["content-type"]);
const appleRes = await page.request.get("http://localhost:3000/apple-icon.png");
console.log("GET /apple-icon.png:", appleRes.status(), appleRes.headers()["content-type"]);
// link-ul rel=icon există în <head>?
const iconLink = await page.locator("link[rel='icon']").first().getAttribute("href");
console.log("link rel=icon:", iconLink);

await page.screenshot({ path: ".screens/40-logo-sidebar.png" });
// mobil
await page.setViewportSize({ width: 412, height: 915 });
await page.waitForTimeout(400);
await page.screenshot({ path: ".screens/41-logo-mobil.png" });
await browser.close();
console.log("done");
