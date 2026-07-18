import sharp from "sharp";

/**
 * Crop pătrat cu fața GARANTAT în cadru — unica implementare, folosită de
 * upload (/api/photo/process) și de plasa de siguranță din PDF:
 *
 *  1. rotație EXIF întâi (pozele de telefon vin des culcate)
 *  2. la pozele ÎNALTE (h > 1.25×w — portret full-body / om în picioare)
 *     capul e întotdeauna SUS → restrângem cadrul la banda de sus
 *     (înălțime = 1.15×w) ÎNAINTE de crop; „attention" singur alegea
 *     uneori pantalonii (contrast mare) și tăia fața
 *  3. în banda rămasă (sau în poza întreagă, la formate normale),
 *     „attention" caută regiunea de interes și centrează pe ea
 *
 * Garanția geometrică: în banda de sus de 1.15×w, fereastra pătrată poate
 * aluneca vertical cel mult 15% — fața din treimea de sus rămâne mereu în cadru.
 */
export async function smartSquareCrop(input: Buffer, size = 600): Promise<Buffer> {
  const rotated = await sharp(input, { limitInputPixels: 80_000_000 })
    .rotate()
    .toBuffer();
  const meta = await sharp(rotated).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;

  let src = sharp(rotated);
  if (w > 0 && h > 1.25 * w) {
    src = src.extract({
      left: 0,
      top: 0,
      width: w,
      height: Math.min(h, Math.round(w * 1.15)),
    });
  }
  return src
    .resize(size, size, { fit: "cover", position: sharp.strategy.attention })
    .jpeg({ quality: 88 })
    .toBuffer();
}
