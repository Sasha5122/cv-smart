import { NextRequest, NextResponse } from "next/server";
import { getSession, isSessionPaid, updateSessionCVData, updateSessionStatus, trackEvent } from "@/lib/db/queries";
import { paywallEnabled } from "@/lib/paddle/server";
import { checkRateLimit, clientIp } from "@/lib/cv-pipeline/rate-limit";
import { readJsonLimited, BODY_LIMITS } from "@/lib/http-guards";
import { ALL_TEMPLATE_IDS } from "@/lib/types/cv";
import type { TemplateId } from "@/lib/types/cv";

const VALID_TEMPLATES: TemplateId[] = ALL_TEMPLATE_IDS;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // autosave-ul e debounced la 1s — 600/h acoperă lejer un user real
    const limit = await checkRateLimit(clientIp(req), "session-save", 600, 60 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Prea multe cereri." }, { status: 429 });
    }
    const { id } = await params;
    const { cv_data, template_id } = await readJsonLimited<{
      cv_data?: Record<string, unknown>;
      template_id?: string;
    }>(req, BODY_LIMITS.CV_DATA);

    // ÎNGHEȚARE DUPĂ PLATĂ: un CV = o plată. Varianta plătită e finală —
    // orice modificare cere un proces nou (altă sesiune, altă plată).
    if (paywallEnabled()) {
      const session = await getSession(id).catch(() => null);
      if (await isSessionPaid(session).catch(() => false)) {
        return NextResponse.json(
          { error: "CV-ul plătit e final. Pentru modificări, începe un CV nou.", frozen: true },
          { status: 409 }
        );
      }
    }

    await updateSessionCVData(id, (cv_data ?? {}) as Parameters<typeof updateSessionCVData>[1]);

    // designul ales — salvat înainte de plată ca parte a variantei finale
    // (tolerant la constraint-ul vechi: fallback pe event template_selected)
    if (template_id && VALID_TEMPLATES.includes(template_id as TemplateId)) {
      const session = await getSession(id).catch(() => null);
      if (session) {
        await updateSessionStatus(id, session.status, {
          template_id: template_id as TemplateId,
        }).catch(() =>
          trackEvent(id, "template_selected", { template_id }).catch(() => {})
        );
      }
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Eroare" }, { status: 500 });
  }
}
