import { NextRequest, NextResponse } from "next/server";
import {
  getSession,
  isSessionPaid,
  markSessionDownloaded,
  resolveTemplate,
  updateSessionCVData,
} from "@/lib/db/queries";
import { paywallEnabled, verifyPaidTransaction } from "@/lib/paddle/server";
import { renderCVPDF } from "@/lib/pdf-templates/render";
import { ensureSquarePhoto } from "@/lib/pdf-templates/photo";
import { buildCvFilename } from "@/lib/pdf-filename";
import { checkRateLimit, clientIp } from "@/lib/cv-pipeline/rate-limit";
import { readJsonLimited, BODY_LIMITS } from "@/lib/http-guards";
import type { CVData, Session, TemplateId } from "@/lib/types/cv";

/** Fotografia se decupează defensiv la pătrat înainte de render. */
async function withSquarePhoto(cvData: CVData): Promise<CVData> {
  if (!cvData.personal?.photoUrl) return cvData;
  const photoUrl = await ensureSquarePhoto(cvData.personal.photoUrl);
  return { ...cvData, personal: { ...cvData.personal, photoUrl } };
}

export const maxDuration = 30;

/**
 * Cine are voie la PDF și din CE date se randează:
 *  - paywall oprit → liber, datele din body (faza de testare)
 *  - sesiune plătită în DB (webhook/events — verificarea IEFTINĂ, prima)
 *  - tranzacție prezentată de client, verificată la Paddle (fereastra de
 *    secunde până ajunge webhook-ul) — doar cumpărătorul o are în browser
 *
 * Anti-abuz: un link de sesiune distribuit altcuiva (fără transactionId)
 * primește DOAR CV-ul salvat al sesiunii, nu poate randa alt conținut —
 * o plată nu devine generator nelimitat de CV-uri pentru prieteni.
 */
async function verifyAccess(
  sessionId: string,
  transactionId?: string
): Promise<{ ok: boolean; session: Session | null; buyerProof: boolean }> {
  if (!paywallEnabled()) return { ok: true, session: null, buyerProof: true };
  const session = await getSession(sessionId).catch(() => null);
  if (transactionId && (await verifyPaidTransaction(transactionId, sessionId))) {
    return { ok: true, session, buyerProof: true };
  }
  if (await isSessionPaid(session).catch(() => false)) {
    return { ok: true, session, buyerProof: false };
  }
  return { ok: false, session, buyerProof: false };
}

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
    const bodyCvData = body.cvData as CVData;
    if (!bodyCvData?.personal) {
      return NextResponse.json({ error: "Date CV lipsă." }, { status: 400 });
    }
    // designul ales de utilizator la pasul final (default: classic)
    const templateId = (body.templateId as TemplateId) ?? "classic";

    const transactionId = typeof body.transactionId === "string" ? body.transactionId : undefined;
    const access = await verifyAccess(sessionId, transactionId);
    if (!access.ok) {
      return NextResponse.json({ error: "Plata nu a fost confirmată." }, { status: 402 });
    }

    // fără dovada cumpărătorului (transactionId), randăm DOAR datele salvate
    // ale sesiunii — nu conținut arbitrar de la oricine are linkul
    const cvData =
      access.buyerProof || !access.session?.cv_data?.personal
        ? bodyCvData
        : (access.session.cv_data as CVData);

    const pdfBuffer = await renderCVPDF(await withSquarePhoto(cvData), templateId);

    // best-effort: salvăm ultima variantă a datelor + designul și marcăm
    // sesiunea descărcată (tolerant la constraint-ul vechi de template),
    // dar nu blocăm PDF-ul dacă persistența pică
    if (access.buyerProof) {
      updateSessionCVData(sessionId, cvData).catch(() => {});
    }
    markSessionDownloaded(sessionId, templateId).catch(() => {});

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

    if (paywallEnabled() && !(await isSessionPaid(session).catch(() => false))) {
      return NextResponse.json({ error: "Plata nu a fost confirmată." }, { status: 402 });
    }

    const cvData = session.cv_data as CVData;
    const template = await resolveTemplate(session);
    const pdfBuffer = await renderCVPDF(await withSquarePhoto(cvData), template);
    await markSessionDownloaded(sessionId, template);

    return pdfResponse(pdfBuffer, cvData);
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "Eroare la generarea PDF" }, { status: 500 });
  }
}
