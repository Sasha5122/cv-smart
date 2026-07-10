/** Verifică fonturile PDF: fișiere TTF valide + glifele diacriticelor românești. */
import { readFileSync } from "fs";
import { pathToFileURL } from "url";
// fontkit e dependență tranzitivă a @react-pdf/renderer (pnpm o izolează)
const mod = await import(
  pathToFileURL(
    process.cwd() + "/node_modules/.pnpm/fontkit@2.0.4/node_modules/fontkit/dist/module.mjs"
  ).href
);
const fontkit = mod.default ?? mod;

const DIACRITICE = "ăâîșțĂÂÎȘȚ";
const files = ["Lato-Regular.ttf", "Lato-Bold.ttf", "Lato-Italic.ttf", "Lato-Black.ttf"];

let ok = true;
for (const f of files) {
  const font = fontkit.create(readFileSync(`lib/pdf-templates/fonts/${f}`));
  const missing = [...DIACRITICE].filter((ch) => !font.hasGlyphForCodePoint(ch.codePointAt(0)));
  console.log(
    `${f}: ${font.familyName} ${font.subfamilyName}, ${font.numGlyphs} glife — ` +
      (missing.length ? `❌ LIPSESC: ${missing.join(" ")}` : "✅ toate diacriticele")
  );
  if (missing.length) ok = false;
}
process.exit(ok ? 0 : 1);
