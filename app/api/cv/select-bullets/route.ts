import { NextResponse } from "next/server";
import {
  getPipelineSession,
  updatePipelineSession,
} from "@/lib/cv-pipeline/store";
import { checkRateLimit, clientIp } from "@/lib/cv-pipeline/rate-limit";
import { readJsonLimited, BODY_LIMITS } from "@/lib/http-guards";
import type { GeneratedBullet } from "@/lib/types/cv-pipeline";

/**
 * Salvează selecția userului (minim 3, fără limită superioară) ȘI respingerile.
 * Marchează sesiunea ca 'completed'.
 */
export async function POST(req: Request) {
  try {
    const limit = await checkRateLimit(clientIp(req), "select-bullets", 60, 60 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Prea multe cereri." }, { status: 429 });
    }
    const body = await readJsonLimited<Record<string, unknown>>(req, BODY_LIMITS.TEXT);
    const sessionId = String(body.sessionId ?? "");
    const selectedIds = (body.selectedIds ?? []) as string[];

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId lipsă." }, { status: 400 });
    }

    const session = await getPipelineSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Sesiunea nu a fost găsită." },
        { status: 404 }
      );
    }

    const bullets = (session.generated_bullets ?? []) as GeneratedBullet[];
    const validIds = new Set(bullets.map((b) => b.id));
    const unknown = selectedIds.filter((id) => !validIds.has(id));
    if (unknown.length > 0) {
      return NextResponse.json(
        { error: `Id-uri de bullet necunoscute: ${unknown.join(", ")}` },
        { status: 400 }
      );
    }

    // minim 3 selecții (sau câte există, dacă-s mai puține); userul poate bifa toate
    const min = Math.min(3, bullets.length);
    if (selectedIds.length < min) {
      return NextResponse.json(
        { error: `Alege minim ${min} descrieri.` },
        { status: 400 }
      );
    }

    const rejectedIds = bullets
      .map((b) => b.id)
      .filter((id) => !selectedIds.includes(id));

    await updatePipelineSession(sessionId, {
      selected_bullet_ids: selectedIds,
      rejected_bullet_ids: rejectedIds,
      stage: "completed",
    });

    const selected = bullets.filter((b) => selectedIds.includes(b.id));
    return NextResponse.json({ selected });
  } catch (e) {
    console.error("[cv/select-bullets]", e);
    return NextResponse.json(
      { error: "Eroare neașteptată. Încearcă din nou." },
      { status: 500 }
    );
  }
}
