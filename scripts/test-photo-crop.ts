/** Verifică crop-ul defensiv pentru poze full-body:
 *  imagine 400×1200 cu „capul" (pătrat roșu) sus și „corpul" (albastru) jos.
 *  Crop-ul corect trebuie să păstreze regiunea roșie. */
import sharp from "sharp";
import { ensureSquarePhoto } from "../lib/pdf-templates/photo";

async function makeFullBody(): Promise<string> {
  const head = await sharp({
    create: { width: 200, height: 200, channels: 3, background: { r: 220, g: 40, b: 30 } },
  }).png().toBuffer();
  const img = await sharp({
    create: { width: 400, height: 1200, channels: 3, background: { r: 30, g: 60, b: 200 } },
  })
    .composite([{ input: head, top: 60, left: 100 }])
    .jpeg()
    .toBuffer();
  return `data:image/jpeg;base64,${img.toString("base64")}`;
}

async function main() {
  const src = await makeFullBody();
  const out = await ensureSquarePhoto(src);
  if (!out) throw new Error("crop a eșuat");

  const buf = Buffer.from(out.split(",")[1], "base64");
  const meta = await sharp(buf).metadata();
  console.log(`rezultat: ${meta.width}×${meta.height} (pătrat: ${meta.width === meta.height})`);

  // există roșu în rezultat? (media pe canalul R în treimea de sus)
  const { data, info } = await sharp(buf)
    .extract({ left: 0, top: 0, width: meta.width!, height: Math.floor(meta.height! / 3) })
    .raw()
    .toBuffer({ resolveWithObject: true });
  let red = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    if (data[i] > 150 && data[i + 1] < 100) red++;
  }
  const pct = (red / (data.length / info.channels)) * 100;
  console.log(`pixeli roșii („capul") în treimea de sus: ${pct.toFixed(1)}%`);
  console.log(pct > 5 ? "✅ capul e păstrat în crop" : "❌ capul a fost tăiat");
}

main();
