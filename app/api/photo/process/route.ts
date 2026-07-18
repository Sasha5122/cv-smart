import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { checkRateLimit, clientIp } from "@/lib/cv-pipeline/rate-limit";

/**
 * Plasa finală de siguranță pentru poze: când browserul nu poate decoda
 * fișierul (format exotic, browser vechi), serverul îl redimensionează cu
 * sharp la JPEG pătrat 600×600 (crop inteligent pe subiect, rotație EXIF).
 * Clientul primește un data-URL identic cu cel produs local.
 */
export const maxDuration = 30;

const MAX_BYTES = 50 * 1024 * 1024;
const SIZE = 600;

export async function POST(req: NextRequest) {
  try {
    const limit = await checkRateLimit(clientIp(req), "photo-process", 30, 60 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Prea multe încercări." }, { status: 429 });
    }

    const form = await req.formData();
    const file = form.get("photo");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Fișier lipsă." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Fișier prea mare (max 50MB)." }, { status: 413 });
    }

    const input = Buffer.from(await file.arrayBuffer());
    const jpeg = await sharp(input, { limitInputPixels: 80_000_000 })
      .rotate() // aplică rotația EXIF (pozele de telefon vin des culcate)
      .resize(SIZE, SIZE, { fit: "cover", position: sharp.strategy.attention })
      .jpeg({ quality: 88 })
      .toBuffer();

    return NextResponse.json({ dataUrl: `data:image/jpeg;base64,${jpeg.toString("base64")}` });
  } catch (e) {
    console.warn("[photo-process] decodare eșuată:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Nu am putut procesa imaginea." }, { status: 422 });
  }
}
