import sharp from "sharp";

/**
 * Apărare server-side contra distorsiunii: orice fotografie data-URI care nu
 * e pătrată se decupează CENTRAT la pătrat (cover) înainte de generarea PDF.
 * Pozele noi vin deja pătrate de la upload (crop în canvas); asta acoperă
 * sesiunile vechi și orice client care ocolește normalizarea.
 */
export async function ensureSquarePhoto(photoUrl: string | undefined): Promise<string | undefined> {
  if (!photoUrl) return photoUrl;
  const m = photoUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!m) return photoUrl; // URL extern — trece neschimbat

  try {
    const input = Buffer.from(m[2], "base64");
    const img = sharp(input);
    const meta = await img.metadata();
    const w = meta.width ?? 0;
    const h = meta.height ?? 0;
    // deja pătrată și în format suportat de PDF → neatinsă
    if (w > 0 && w === h && (meta.format === "jpeg" || meta.format === "png")) {
      return photoUrl;
    }
    const side = Math.min(600, Math.min(w, h) || 600);
    // „attention" caută regiunea de interes (față/ton de piele) în loc de
    // centru — la poze full-body decupajul prinde capul, nu abdomenul
    const out = await img
      .resize(side, side, { fit: "cover", position: sharp.strategy.attention })
      .jpeg({ quality: 88 })
      .toBuffer();
    return `data:image/jpeg;base64,${out.toString("base64")}`;
  } catch {
    // dacă procesarea pică, mai bine fără poză decât PDF stricat/distorsionat
    return undefined;
  }
}
