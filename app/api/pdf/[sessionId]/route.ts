import { NextRequest, NextResponse } from "next/server";
import { getSession, updateSessionStatus } from "@/lib/db/queries";
import { renderCVPDF } from "@/lib/pdf-templates/render";
import { buildCvFilename } from "@/lib/pdf-filename";
import type { CVData, TemplateId } from "@/lib/types/cv";

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
    const { sessionId } = await params;
    const body = await req.json();
    const cvData = body.cvData as CVData;
    if (!cvData?.personal) {
      return NextResponse.json({ error: "Date CV lipsă." }, { status: 400 });
    }
    // designul ales de utilizator la pasul final (default: classic)
    const templateId = (body.templateId as TemplateId) ?? "classic";

    const pdfBuffer = await renderCVPDF(cvData, templateId);

    // best-effort: marcăm sesiunea descărcată, dar nu blocăm PDF-ul dacă pică
    updateSessionStatus(sessionId, "downloaded").catch(() => {});

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
    const pdfBuffer = await renderCVPDF(cvData, session.template_id ?? "classic");
    await updateSessionStatus(sessionId, "downloaded");

    return pdfResponse(pdfBuffer, cvData);
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "Eroare la generarea PDF" }, { status: 500 });
  }
}
