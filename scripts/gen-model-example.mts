/**
 * Generează PDF-ul unui template din datele demo + rasterizează pagina 1 în PNG.
 * Rezultat: modele_cv/generate/<id>.pdf + <id>.png (pentru comparație cu modelul).
 * Rulare: npx tsx scripts/gen-model-example.mts <id> [<id> ...]
 *   sau fără argumente = toate template-urile din TemplateId.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { renderCVPDF } from "@/lib/pdf-templates/render";
import { DEMO_CV } from "./demo-cv-data";
import type { TemplateId } from "@/lib/types/cv";

const require = createRequire(import.meta.url);
// dependență tranzitivă (pnpm) — invizibilă pentru tsc, rezolvată la runtime
interface DemoCanvas {
  width: number;
  height: number;
  getContext(kind: "2d"): unknown;
  toBuffer(mime: "image/png"): Buffer;
}
const { createCanvas } = require("@napi-rs/canvas") as {
  createCanvas: (w: number, h: number) => DemoCanvas;
};

const OUT = "c:/Users/Armaghedon/Desktop/cv_project/modele_cv/generate";
mkdirSync(OUT, { recursive: true });

const PDFJS = pathToFileURL(
  process.cwd() +
    "/node_modules/.pnpm/pdfjs-dist@5.4.296/node_modules/pdfjs-dist/legacy/build/pdf.mjs"
).href;
const pdfjs = await import(PDFJS);

class NodeCanvasFactory {
  create(width: number, height: number) {
    const canvas = createCanvas(Math.ceil(width), Math.ceil(height));
    return { canvas, context: canvas.getContext("2d") };
  }
  reset(cc: { canvas: { width: number; height: number } }, width: number, height: number) {
    cc.canvas.width = Math.ceil(width);
    cc.canvas.height = Math.ceil(height);
  }
  destroy(cc: { canvas: { width: number; height: number } }) {
    cc.canvas.width = 0;
    cc.canvas.height = 0;
  }
}

async function rasterizePage1(pdf: Buffer, scale = 2): Promise<Buffer> {
  const doc = await pdfjs.getDocument({
    data: new Uint8Array(pdf),
    canvasFactory: new NodeCanvasFactory(),
    disableFontFace: true,
  }).promise;
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale });
  const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
  const context = canvas.getContext("2d");
  await page.render({ canvasContext: context, viewport }).promise;
  return canvas.toBuffer("image/png");
}

const ids = (process.argv.slice(2).length
  ? process.argv.slice(2)
  : ([
      "classic", "modern", "elegant", "compact", "minimal",
      "meridian", "velvet", "riviera", "flamingo", "atlantic", "petrol", "manhattan",
      "blush", "sage", "graphite", "cobalt", "amber", "sterling", "sapphire",
    ] as string[])) as TemplateId[];

for (const id of ids) {
  const pdf = await renderCVPDF(DEMO_CV, id);
  writeFileSync(path.join(OUT, `${id}.pdf`), pdf);
  const png = await rasterizePage1(pdf);
  writeFileSync(path.join(OUT, `${id}.png`), png);
  console.log(`✅ ${id}: PDF ${(pdf.length / 1024).toFixed(0)}KB + PNG ${(png.length / 1024).toFixed(0)}KB`);
}
