import { NextRequest, NextResponse } from "next/server";
import { getSession, updateSessionStatus, updateSessionCVData } from "@/lib/db/queries";
import { renderCVPDF } from "@/lib/pdf-templates/render";
import { ensureSquarePhoto } from "@/lib/pdf-templates/photo";
import { buildCvFilename } from "@/lib/pdf-filename";
import { checkRateLimit, clientIp } from "@/lib/cv-pipeline/rate-limit";
import { readJsonLimited, BODY_LIMITS } from "@/lib/http-guards";
import type { CVData, TemplateId } from "@/lib/types/cv";

/** Fotografia se decupează defensiv la pătrat înainte de render. */
async function withSquarePhoto(cvData: CVData): Promise<CVData> {
  if (!cvData.personal?.photoUrl) return cvData;
  const photoUrl = await ensureSquarePhoto(cvData.personal.photoUrl);
  return { ...cvData, personal: { ...cvData.personal, photoUrl } };
}

export const maxDuration = 30;

function pdfResponse(pdfBuffer: Buffer, cvData: CVData) {
  const filename = buildCvFilename(cvData);
  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": pdfBuffer.length.toString(),
    },
  });
}

/**
 * POST — generarea principală: clientul trimite datele CV-ului direct,
 * fără dependență de baza de date (PDF-ul funcționează chiar dacă
 * persistența sesiunii e indisponibilă).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    // generarea PDF consumă CPU serios — limită per IP
    const limit = await checkRateLimit(clientIp(req), "pdf", 20, 60 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Prea multe cereri." }, { status: 429 });
    }
    const { sessionId } = await params;
    const body = await readJsonLimited<Record<string, unknown>>(req, BODY_LIMITS.CV_DATA);
    const cvData = body.cvData as CVData;
    if (!cvData?.personal) {
      return NextResponse.json({ error: "Date CV lipsă." }, { status: 400 });
    }
    // designul ales de utilizator la pasul final (default: classic)
    const templateId = (body.templateId as TemplateId) ?? "classic";

    const pdfBuffer = await renderCVPDF(await withSquarePhoto(cvData), templateId);

    // best-effort: marcăm sesiunea descărcată și salvăm ultima variantă a
    // datelor + designul ales (adminul poate re-descărca CV-ul prin GET),
    // dar nu blocăm PDF-ul dacă persistența pică
    updateSessionCVData(sessionId, cvData).catch(() => {});
    updateSessionStatus(sessionId, "downloaded", { template_id: templateId }).catch(() => {});

    return pdfResponse(pdfBuffer, cvData);
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "Eroare la generarea PDF" }, { status: 500 });
  }
}

/** GET — compatibilitate: generează din datele salvate în sesiune. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Sesiune negăsită" }, { status: 404 });
    }

    const cvData = session.cv_data as CVData;
    const pdfBuffer = await renderCVPDF(await withSquarePhoto(cvData), session.template_id ?? "classic");
    await updateSessionStatus(sessionId, "downloaded");

    return pdfResponse(pdfBuffer, cvData);
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "Eroare la generarea PDF" }, { status: 500 });
  }
}
