import { Resend } from "resend";

/**
 * Emailul de livrare a CV-ului — trimis din webhook după confirmarea plății.
 * PDF-ul ATAȘAT e livrarea garantată; linkul de re-descărcare (30 zile) e backup.
 */

let resendInstance: Resend | null = null;
function resend(): Resend {
  if (!resendInstance) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY lipsește");
    resendInstance = new Resend(key);
  }
  return resendInstance;
}

export interface DeliveryEmailInput {
  to: string;
  firstName: string;
  pdfBuffer: Buffer;
  pdfFilename: string;
  downloadUrl: string;
}

const BRAND_BLUE = "#2563eb";
const INK = "#0f172a";
const PRODUCTION_SITE = "https://www.cvexpres.ro";

/** Baza site-ului pentru CTA („creează alt CV") — din originul linkului de
 *  descărcare (localhost în dev, cvexpres.ro în producție). */
function siteOrigin(downloadUrl: string): string {
  try {
    return new URL(downloadUrl).origin;
  } catch {
    return PRODUCTION_SITE;
  }
}

export function buildHtml({ firstName, downloadUrl }: { firstName: string; downloadUrl: string }) {
  const newCvUrl = `${siteOrigin(downloadUrl)}/creare-cv`;
  return `<!DOCTYPE html>
<html lang="ro">
<body style="margin:0;padding:0;background-color:#f6f7f9;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <p style="font-size:22px;font-weight:bold;color:${INK};margin:0 0 24px;">
      CV<span style="color:${BRAND_BLUE};">expres</span>
    </p>
    <div style="background-color:#ffffff;border-radius:12px;padding:32px 28px;border:1px solid #e2e8f0;">
      <h1 style="font-size:20px;color:${INK};margin:0 0 16px;">Salut, ${firstName}!</h1>
      <p style="font-size:15px;line-height:1.65;color:#334155;margin:0 0 20px;">
        CV-ul tău profesionist e gata și îl găsești <strong>atașat acestui email</strong>
        în format PDF.
      </p>
      <a href="${downloadUrl}"
         style="display:inline-block;background-color:${BRAND_BLUE};color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none;padding:14px 28px;border-radius:999px;margin:0 0 20px;">
        Descarcă CV-ul
      </a>
      <p style="font-size:13.5px;line-height:1.6;color:#64748b;margin:0 0 14px;">
        Linkul de mai sus funcționează <strong>30 de zile</strong> — poți re-descărca
        CV-ul oricând, de pe orice dispozitiv.
      </p>
      <p style="font-size:13.5px;line-height:1.6;color:#64748b;margin:0;">
        💡 <strong>Sfat:</strong> păstrează acest email — e cel mai sigur loc pentru
        CV-ul tău. Îl poți trimite angajatorilor direct de aici, cu Forward.
      </p>
    </div>

    <!-- CTA: creează alt CV -->
    <div style="background-color:#ffffff;border-radius:12px;padding:26px 28px;border:1px solid #e2e8f0;margin-top:16px;text-align:center;">
      <p style="font-size:15px;font-weight:bold;color:${INK};margin:0 0 6px;">
        Ai nevoie de alt CV?
      </p>
      <p style="font-size:13.5px;line-height:1.55;color:#64748b;margin:0 0 18px;">
        Creează oricând un CV nou — pentru altă aplicare sau altă versiune.
      </p>
      <a href="${newCvUrl}"
         style="display:inline-block;background-color:${INK};color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none;padding:14px 32px;border-radius:999px;">
        Creează un CV nou pe CVexpres →
      </a>
    </div>

    <p style="font-size:12px;line-height:1.6;color:#94a3b8;margin:20px 4px 0;">
      Mulțumim că ai ales CVexpres! ·
      <a href="${PRODUCTION_SITE}" style="color:#94a3b8;">cvexpres.ro</a> ·
      <a href="${PRODUCTION_SITE}/termeni" style="color:#94a3b8;">Termeni și condiții</a>
    </p>
  </div>
</body>
</html>`;
}

function buildText({ firstName, downloadUrl }: { firstName: string; downloadUrl: string }) {
  const newCvUrl = `${siteOrigin(downloadUrl)}/creare-cv`;
  return [
    `Salut, ${firstName}!`,
    "",
    "CV-ul tău profesionist e gata și îl găsești atașat acestui email în format PDF.",
    "",
    `Descarcă CV-ul: ${downloadUrl}`,
    "",
    "Linkul funcționează 30 de zile — poți re-descărca CV-ul oricând, de pe orice dispozitiv.",
    "Sfat: păstrează acest email — e cel mai sigur loc pentru CV-ul tău. Îl poți trimite angajatorilor direct de aici, cu Forward.",
    "",
    `Ai nevoie de alt CV? Creează unul nou pe CVexpres: ${newCvUrl}`,
    "",
    "Mulțumim că ai ales CVexpres! · https://www.cvexpres.ro",
  ].join("\n");
}

/** Trimite emailul de livrare. Aruncă la eșec — apelantul decide retry-ul. */
export async function sendCvDeliveryEmail(input: DeliveryEmailInput): Promise<string> {
  const { data, error } = await resend().emails.send({
    from: "CVexpres <cv@cvexpres.ro>",
    to: input.to,
    replyTo: process.env.REPLY_TO_EMAIL || undefined,
    subject: `CV-ul tău e gata — ${input.firstName}, îl ai atașat aici`,
    html: buildHtml(input),
    text: buildText(input),
    attachments: [{ filename: input.pdfFilename, content: input.pdfBuffer }],
  });
  if (error) throw new Error(`Resend: ${error.message}`);
  return data?.id ?? "";
}
