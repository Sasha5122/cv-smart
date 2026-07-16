/** Vizitează frame.work și extrage tokenii de design reali:
 *  culorile butoanelor, formele, fundalurile, fonturile. */
import { chromium } from "@playwright/test";

const browser = await chromium.launch({ headless: false, args: ["--window-position=2000,2000"] });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  locale: "en-US",
});
const page = await ctx.newPage();
await page.goto("https://web.archive.org/web/2025/https://frame.work/", { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForTimeout(12000);
await page.screenshot({ path: ".screens/fw-home.png" });

const styleOf = async (locator) => {
  const el = locator.first();
  if ((await el.count()) === 0) return null;
  return el.evaluate((n) => {
    const cs = getComputedStyle(n);
    return {
      text: (n.textContent ?? "").trim().slice(0, 30),
      background: cs.backgroundColor,
      color: cs.color,
      borderRadius: cs.borderRadius,
      border: cs.border,
      fontFamily: cs.fontFamily.slice(0, 60),
      fontWeight: cs.fontWeight,
      fontSize: cs.fontSize,
      padding: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
    };
  });
};

// butoanele principale (Configure now / orange) și secundare (Learn more)
console.log("── body ──");
console.log(await page.evaluate(() => {
  const cs = getComputedStyle(document.body);
  return { background: cs.backgroundColor, color: cs.color, fontFamily: cs.fontFamily.slice(0, 80) };
}));

console.log("── toate butoanele/link-butoanele vizibile (primele 10) ──");
const btns = page.locator("a,button").filter({ hasText: /configure|learn more|shop|buy|pre-order/i });
const count = Math.min(await btns.count(), 10);
for (let i = 0; i < count; i++) {
  const info = await btns.nth(i).evaluate((n) => {
    const cs = getComputedStyle(n);
    const r = n.getBoundingClientRect();
    if (r.width === 0) return null;
    return {
      text: (n.textContent ?? "").trim().slice(0, 24),
      bg: cs.backgroundColor,
      color: cs.color,
      radius: cs.borderRadius,
      border: cs.borderTopWidth + " " + cs.borderTopColor,
      fontWeight: cs.fontWeight,
      fontSize: cs.fontSize,
      pad: `${cs.paddingTop} ${cs.paddingRight}`,
      h: Math.round(r.height),
    };
  });
  if (info) console.log(info);
}

// fundaluri de secțiuni (dark hero + cream)
console.log("── fundaluri secțiuni ──");
console.log(await page.evaluate(() => {
  const seen = new Map();
  document.querySelectorAll("section, div[class*='hero'], main > div").forEach((el) => {
    const bg = getComputedStyle(el).backgroundColor;
    const r = el.getBoundingClientRect();
    if (bg !== "rgba(0, 0, 0, 0)" && r.height > 200 && r.width > 800) {
      seen.set(bg, (seen.get(bg) ?? 0) + 1);
    }
  });
  return [...seen.entries()];
}));

// heading-uri (culoarea accent orange din titluri)
console.log("── heading hero ──");
console.log(await styleOf(page.locator("h1")));

await browser.close();
