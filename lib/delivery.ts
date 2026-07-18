import {
  getSession,
  hasEventForTransaction,
  resolveTemplate,
  trackEvent,
} from "@/lib/db/queries";
import { renderCVPDF } from "@/lib/pdf-templates/render";
import { ensureSquarePhoto } from "@/lib/pdf-templates/photo";
import { buildCvFilename } from "@/lib/pdf-filename";
import { createDownloadToken } from "@/lib/download-token";
import { sendCvDeliveryEmail } from "@/lib/email/delivery";
import type { CVData, Session } from "@/lib/types/cv";

/**
 * Livrarea CV-ului pe email — UNICA implementare, folosită de webhook-ul
 * Paddle și de codurile promo. Idempotentă pe transactionId în două straturi:
 *  - ledger `cv_email_sent` (verificat înainte; citirea eșuată ARUNCĂ —
 *    mai bine un retry decât un email dublu)
 *  - claim `cv_email_claim` scris ÎNAINTE de trimitere — o invocare
 *    concurentă care vede un claim proaspăt (<3 min) se retrage
 */
const CLAIM_FRESH_MS = 3 * 60 * 1000;

export type DeliveryOutcome = "sent" | "already-sent" | "in-progress" | "no-data" | "no-email";

export async function deliverCvByEmail(
  sessionOrId: Session | string,
  transactionId: string
): Promise<DeliveryOutcome> {
  if (await hasEventForTransaction("cv_email_sent", transactionId)) {
    return "already-sent";
  }
  if (await hasEventForTransaction("cv_email_claim", transactionId, CLAIM_FRESH_MS)) {
    return "in-progress";
  }

  const session =
    typeof sessionOrId === "string" ? await getSession(sessionOrId) : sessionOrId;
  if (!session?.cv_data?.personal) return "no-data";
  const cvData = session.cv_data as CVData;
  const to = cvData.personal.email?.trim();
  if (!to) return "no-email";

  // claim ÎNAINTE de munca grea — închide fereastra de duplicat
  await trackEvent(session.id, "cv_email_claim", { transaction_id: transactionId });

  // PDF-ul: aceleași date + design ca la descărcarea din aplicație
  let pdfData = cvData;
  if (cvData.personal.photoUrl) {
    const photoUrl = await ensureSquarePhoto(cvData.personal.photoUrl);
    pdfData = { ...cvData, personal: { ...cvData.personal, photoUrl } };
  }
  const template = await resolveTemplate(session);
  const pdfBuffer = await renderCVPDF(pdfData, template);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.cvexpres.ro";
  const downloadUrl = `${siteUrl}/descarca/${createDownloadToken(session.id)}`;

  const emailId = await sendCvDeliveryEmail({
    to,
    firstName: cvData.personal.firstName || "candidat",
    pdfBuffer,
    pdfFilename: buildCvFilename(cvData),
    downloadUrl,
  });

  await trackEvent(session.id, "cv_email_sent", {
    transaction_id: transactionId,
    email_id: emailId,
    to,
  });
  console.log(`[delivery] CV livrat pe email (${to}) pentru ${transactionId}`);
  return "sent";
}
