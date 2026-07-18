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

  // 1) tăiem marginile uniforme de fundal (studio/alb) — persoana rămâne
  //    strâns încadrată, deci capul ajunge chiar la marginea de sus a cadrului
  let content = rotated;
  try {
    content = await sharp(rotated).trim({ threshold: 12 }).toBuffer();
  } catch {
    // fundal neuniform / nimic de tăiat — continuăm cu poza întreagă
  }

  const meta = await sharp(content).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;

  // 2) poză ÎNALTĂ (om în picioare / portret lung): ancorăm ferm SUS —
  //    pătratul pornește de la marginea de sus, deci capul NU poate fi tăiat,
  //    indiferent ce contrast au hainele. La formate normale, „attention"
  //    caută regiunea de interes ca până acum.
  const position = w > 0 && h > 1.25 * w ? "top" : sharp.strategy.attention;

  return sharp(content)
    .resize(size, size, { fit: "cover", position })
    .jpeg({ quality: 88 })
    .toBuffer();
}
