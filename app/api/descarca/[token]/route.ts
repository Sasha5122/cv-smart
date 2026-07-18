import { NextRequest, NextResponse } from "next/server";
import { verifyDownloadToken } from "@/lib/download-token";
import { getSession, isSessionPaid, resolveTemplate } from "@/lib/db/queries";
import { renderCVPDF } from "@/lib/pdf-templates/render";
import { ensureSquarePhoto } from "@/lib/pdf-templates/photo";
import { buildCvFilename } from "@/lib/pdf-filename";
import type { CVData } from "@/lib/types/cv";

/**
 * Servirea PDF-ului prin tokenul semnat din emailul de livrare (30 zile).
 * Implicit `inline` (se deschide în browser — omul ÎL VEDE);
 * cu `?download=1` → attachment (descărcare cu numele corect).
 */
export const maxDuration = 30;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const check = verifyDownloadToken(token);
  if (!check.ok) {
    // pagina prietenoasă explică expirarea — nu servim erori seci
    return NextResponse.redirect(new URL(`/descarca/${token}`, req.url));
  }

  const session = await getSession(check.sessionId);
  if (!session?.cv_data?.personal || !(await isSessionPaid(session).catch(() => false))) {
    return NextResponse.redirect(new URL(`/descarca/${token}`, req.url));
  }

  let cvData = session.cv_data as CVData;
  if (cvData.personal?.photoUrl) {
    const photoUrl = await ensureSquarePhoto(cvData.personal.photoUrl);
    cvData = { ...cvData, personal: { ...cvData.personal, photoUrl } };
  }
  const pdfBuffer = await renderCVPDF(cvData, await resolveTemplate(session));
  const filename = buildCvFilename(cvData);
  const asAttachment = req.nextUrl.searchParams.get("download") === "1";

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${asAttachment ? "attachment" : "inline"}; filename="${filename}"`,
      "Content-Length": pdfBuffer.length.toString(),
      "Cache-Control": "private, no-store",
    },
  });
}
