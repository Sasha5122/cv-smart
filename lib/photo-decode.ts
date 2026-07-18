"use client";
/**
 * Decodarea pozelor de pe orice telefon, oricât de mari — ca la Facebook:
 * nu refuzăm nimic, redimensionăm noi.
 *
 * Strategia (în ordine):
 *  1. HEIC/HEIF (iPhone) → convertit întâi cu heic2any (încărcat doar la nevoie)
 *  2. createImageBitmap cu redimensionare INTEGRATĂ — pozele mari (>8MB) sunt
 *     decodate direct la mic, cu o fracțiune din memorie (nu murim pe telefoane
 *     slabe la poze de 200MP); rotația EXIF aplicată nativ
 *  3. fallback <img> clasic pentru browsere vechi
 *  4. dacă browserul nu poate deloc → apelantul trimite fișierul la server
 *     (/api/photo/process, sharp) — plasa finală de siguranță
 *
 * Limita de 50MB e doar anti-abuz; garda de 80MP oprește bombele de decompresie.
 */

export const MAX_PHOTO_BYTES = 50 * 1024 * 1024;
const MAX_PIXELS = 80_000_000; // 80MP — peste orice telefon real
const RESIZE_HINT_BYTES = 8 * 1024 * 1024; // pozele mari se decodează direct la mic
const RESIZE_TARGET = 1600; // suficient pentru crop-ul final de 600×600

export type DecodedPhoto = ImageBitmap | HTMLImageElement;

function isHeic(file: File): boolean {
  return /image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
}

async function heicToJpegBlob(file: File): Promise<Blob> {
  const { default: heic2any } = await import("heic2any");
  const out = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
  return Array.isArray(out) ? out[0] : out;
}

function loadImage(src: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(src);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("decode"));
    };
    img.src = url;
  });
}

async function decodeBlob(blob: Blob): Promise<DecodedPhoto> {
  if (typeof createImageBitmap === "function") {
    try {
      // la fișierele mari cerem browserului să decodeze DIRECT la mic —
      // memorie minimă; la cele mici decodăm natural (fără upscale inutil)
      const opts: ImageBitmapOptions =
        blob.size > RESIZE_HINT_BYTES
          ? { resizeWidth: RESIZE_TARGET, resizeQuality: "high" }
          : {};
      const bmp = await createImageBitmap(blob, opts);
      if (bmp.width * bmp.height > MAX_PIXELS) {
        bmp.close();
        throw new Error("too-large");
      }
      return bmp;
    } catch (e) {
      if (e instanceof Error && e.message === "too-large") throw e;
      // unele browsere nu decodează formatul prin createImageBitmap → <img>
    }
  }
  const img = await loadImage(blob);
  if (img.naturalWidth * img.naturalHeight > MAX_PIXELS) throw new Error("too-large");
  return img;
}

/**
 * Decodează orice poză suportată într-o sursă gata de desenat pe canvas.
 * Aruncă `Error("decode")` dacă browserul nu poate citi fișierul (apelantul
 * încearcă atunci serverul) și `Error("too-large")` la bombe de decompresie.
 */
export async function decodePhoto(file: File): Promise<DecodedPhoto> {
  if (isHeic(file)) {
    try {
      return await decodeBlob(await heicToJpegBlob(file));
    } catch (e) {
      if (e instanceof Error && e.message === "too-large") throw e;
      // unele browsere (Safari) decodează HEIC nativ — mai încercăm direct
      return await decodeBlob(file);
    }
  }
  return await decodeBlob(file);
}

/**
 * Plasa finală: serverul redimensionează poza cu sharp (formate pe care
 * browserul nu le duce). Returnează data-URL-ul JPEG pătrat sau null.
 */
export async function serverResizePhoto(file: File): Promise<string | null> {
  try {
    const form = new FormData();
    form.append("photo", file);
    const res = await fetch("/api/photo/process", { method: "POST", body: form });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.dataUrl === "string" && data.dataUrl.startsWith("data:image/")
      ? data.dataUrl
      : null;
  } catch {
    return null;
  }
}
