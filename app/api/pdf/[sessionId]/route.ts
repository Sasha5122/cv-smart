import { NextRequest, NextResponse } from "next/server";
import { getSession, updateSessionStatus } from "@/lib/db/queries";
import { renderCVPDF } from "@/lib/pdf-templates/render";

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

    const cvData = session.cv_data;
    const templateId = session.template_id ?? "classic";

    const pdfBuffer = await renderCVPDF(cvData, templateId);

    await updateSessionStatus(sessionId, "downloaded");

    const lastName = cvData.personal?.lastName ?? "smart";
    const firstName = cvData.personal?.firstName ?? "cv";

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="CV_${firstName}_${lastName}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "Eroare la generarea PDF" }, { status: 500 });
  }
}
