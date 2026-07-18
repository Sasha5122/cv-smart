import { NextRequest, NextResponse } from "next/server";
import {
  getSession,
  isSessionPaid,
  markSessionDownloaded,
  resolveTemplate,
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
 * ÎNGHEȚARE: un CV = o plată. Varianta salvată în DB LA MOMENTUL PLĂȚII
 * (clientul face flush-save chiar înainte de checkout/cod) e SINGURA care
 * se mai randează vreodată — nici cumpărătorul nu poate genera alt conținut
 * cu aceeași plată. Pentru modificări: proces nou, plată nouă.
 */
async function verifyAccess(
  sessionId: string,
  transactionId?: string
): Promise<{ ok: boolean; session: Session | null }> {
  if (!paywallEnabled()) return { ok: true, session: null };
  const session = await getSession(sessionId).catch(() => null);
  if (await isSessionPaid(session).catch(() => false)) {
    return { ok: true, session };
  }
  if (transactionId && (await verifyPaidTransaction(transactionId, sessionId))) {
    return { ok: true, session };
  }
  return { ok: false, session };
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

    // ÎNGHEȚAT: pe o sesiune plătită se randează EXCLUSIV varianta din DB
    // (salvată la momentul plății) — body-ul e ignorat, la fel și designul
    // trimis ulterior. Body-ul contează doar cu paywall oprit (faza gratuită)
    // sau în fereastra scurtă pre-webhook fără date salvate.
    const frozen = Boolean(access.session?.cv_data?.personal);
    const cvData = frozen ? (access.session!.cv_data as CVData) : bodyCvData;
    const template = frozen ? await resolveTemplate(access.session!) : templateId;

    const pdfBuffer = await renderCVPDF(await withSquarePhoto(cvData), template);

    // marcăm sesiunea descărcată (tolerant la constraint-ul vechi de template);
    // datele NU se mai suprascriu — varianta plătită rămâne cea de la plată
    markSessionDownloaded(sessionId, template).catch(() => {});

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
