import sharp from "sharp";
import { smartSquareCrop } from "@/lib/photo-crop";

/**
 * Apărare server-side contra distorsiunii: orice fotografie data-URI care nu
 * e pătrată se decupează la pătrat înainte de generarea PDF, cu ACEEAȘI
 * logică inteligentă ca la upload (lib/photo-crop — fața garantat în cadru).
 * Pozele noi vin deja pătrate; asta acoperă sesiunile vechi și orice client
 * care ocolește normalizarea.
 */
export async function ensureSquarePhoto(photoUrl: string | undefined): Promise<string | undefined> {
  if (!photoUrl) return photoUrl;
  const m = photoUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!m) return photoUrl; // URL extern — trece neschimbat

  try {
    const input = Buffer.from(m[2], "base64");
    const meta = await sharp(input).metadata();
    const w = meta.width ?? 0;
    const h = meta.height ?? 0;
    // deja pătrată și în format suportat de PDF → neatinsă
    if (w > 0 && w === h && (meta.format === "jpeg" || meta.format === "png")) {
      return photoUrl;
    }
    const side = Math.min(600, Math.min(w, h) || 600);
    const out = await smartSquareCrop(input, side);
    return `data:image/jpeg;base64,${out.toString("base64")}`;
  } catch {
    // dacă procesarea pică, mai bine fără poză decât PDF stricat/distorsionat
    return undefined;
  }
}
