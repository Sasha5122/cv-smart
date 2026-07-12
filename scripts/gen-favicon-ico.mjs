/** Generează app/favicon.ico din icon.svg (PNG 32×32 împachetat în container ICO). */
import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync } from "fs";

const svg = readFileSync("app/icon.svg", "utf8");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 32, height: 32 } });
await page.setContent(
  `<body style="margin:0">${svg.replace('width="64" height="64"', 'width="32" height="32"')}</body>`
);
const png = await page.locator("svg").screenshot();
await browser.close();

// container ICO cu o singură imagine PNG (suportat de toate browserele moderne)
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // rezervat
header.writeUInt16LE(1, 2); // tip: icon
header.writeUInt16LE(1, 4); // 1 imagine
const entry = Buffer.alloc(16);
entry.writeUInt8(32, 0); // lățime
entry.writeUInt8(32, 1); // înălțime
entry.writeUInt8(0, 2); // paletă
entry.writeUInt8(0, 3); // rezervat
entry.writeUInt16LE(1, 4); // planuri
entry.writeUInt16LE(32, 6); // biți/pixel
entry.writeUInt32LE(png.length, 8); // dimensiunea datelor
entry.writeUInt32LE(22, 12); // offset (6 + 16)
writeFileSync("app/favicon.ico", Buffer.concat([header, entry, png]));
console.log(`✅ app/favicon.ico generat (${6 + 16 + png.length} bytes)`);
