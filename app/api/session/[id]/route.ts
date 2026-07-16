import { NextRequest, NextResponse } from "next/server";
import { updateSessionCVData } from "@/lib/db/queries";
import { checkRateLimit, clientIp } from "@/lib/cv-pipeline/rate-limit";
import { readJsonLimited, BODY_LIMITS } from "@/lib/http-guards";

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
    const { cv_data } = await readJsonLimited<{ cv_data?: Record<string, unknown> }>(
      req,
      BODY_LIMITS.CV_DATA
    );
    await updateSessionCVData(id, (cv_data ?? {}) as Parameters<typeof updateSessionCVData>[1]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Eroare" }, { status: 500 });
  }
}
