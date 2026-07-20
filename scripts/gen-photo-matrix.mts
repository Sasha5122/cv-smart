/**
 * Matricea de teste foto: fiecare poză reală din „modele_cv/poze per teste"
 * trece prin EXACT pipeline-ul aplicației (smartSquareCrop) și e randată în
 * FIECARE model nou de CV. În plus, fiecare model e generat și FĂRĂ poză
 * (cazul userului care nu încarcă poză).
 *
 * Rezultat: modele_cv/finddings/generate-poze/
 *   poza-1/<model>.png+pdf … poza-N/<model>.png+pdf
 *   fara-poza/<model>.png+pdf
 *   _poze-procesate/poza-N.jpg (crop-ul pătrat 600×600, pentru verificat fața)
 *
 * Rulare: npx tsx scripts/gen-photo-matrix.mts [<model> ...]
 */
import { mkdirSync, writeFileSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { renderCVPDF } from "@/lib/pdf-templates/render";
import { smartSquareCrop } from "@/lib/photo-crop";
import { DEMO_CV } from "./demo-cv-data";
import type { CVData, TemplateId } from "@/lib/types/cv";

const require = createRequire(import.meta.url);
interface DemoCanvas {
  width: number;
  height: number;
  getContext(kind: "2d"): unknown;
  toBuffer(mime: "image/png"): Buffer;
}
const { createCanvas } = require("@napi-rs/canvas") as {
  createCanvas: (w: number, h: number) => DemoCanvas;
};

const PHOTOS_DIR = "c:/Users/Armaghedon/Desktop/cv_project/modele_cv/poze per teste";
const OUT = "c:/Users/Armaghedon/Desktop/cv_project/modele_cv/finddings/generate-poze";

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

async function rasterizePage1(pdf: Buffer, scale = 1.5): Promise<Buffer> {
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

const MODELS: TemplateId[] = [
  "meridian", "velvet", "riviera", "flamingo", "atlantic", "petrol", "manhattan",
  "blush", "sage", "graphite", "cobalt", "amber", "sterling", "sapphire",
];
const ids = (process.argv.slice(2).length ? process.argv.slice(2) : MODELS) as TemplateId[];

// pozele reale, în ordine stabilă
const photoFiles = readdirSync(PHOTOS_DIR)
  .filter((f) => /\.(jpe?g|png|webp|heic)$/i.test(f))
  .sort();

mkdirSync(path.join(OUT, "_poze-procesate"), { recursive: true });

// 1) procesăm fiecare poză prin pipeline-ul aplicației
const processed: { name: string; dataUrl: string }[] = [];
for (let i = 0; i < photoFiles.length; i++) {
  const name = `poza-${i + 1}`;
  const raw = readFileSync(path.join(PHOTOS_DIR, photoFiles[i]));
  const square = await smartSquareCrop(raw, 600);
  writeFileSync(path.join(OUT, "_poze-procesate", `${name}.jpg`), square);
  processed.push({ name, dataUrl: `data:image/jpeg;base64,${square.toString("base64")}` });
  console.log(`📷 ${name} ← ${photoFiles[i]} (${(raw.length / 1024).toFixed(0)}KB → 600×600)`);
}

// 2) matricea poze × modele
for (const { name, dataUrl } of processed) {
  const dir = path.join(OUT, name);
  mkdirSync(dir, { recursive: true });
  const cv: CVData = { ...DEMO_CV, personal: { ...DEMO_CV.personal!, photoUrl: dataUrl } };
  for (const id of ids) {
    const pdf = await renderCVPDF(cv, id);
    writeFileSync(path.join(dir, `${id}.pdf`), pdf);
    writeFileSync(path.join(dir, `${id}.png`), await rasterizePage1(pdf));
  }
  console.log(`✅ ${name}: ${ids.length} modele`);
}

// 3) fiecare model FĂRĂ poză
const noPhotoDir = path.join(OUT, "fara-poza");
mkdirSync(noPhotoDir, { recursive: true });
const cvNoPhoto: CVData = {
  ...DEMO_CV,
  personal: { ...DEMO_CV.personal!, photoUrl: undefined },
};
for (const id of ids) {
  const pdf = await renderCVPDF(cvNoPhoto, id);
  writeFileSync(path.join(noPhotoDir, `${id}.pdf`), pdf);
  writeFileSync(path.join(noPhotoDir, `${id}.png`), await rasterizePage1(pdf));
}
console.log(`✅ fara-poza: ${ids.length} modele`);
console.log(`\nTotal: ${processed.length * ids.length + ids.length} CV-uri în ${OUT}`);
