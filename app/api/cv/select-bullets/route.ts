import { NextResponse } from "next/server";
import {
  getPipelineSession,
  updatePipelineSession,
} from "@/lib/cv-pipeline/store";
import type { GeneratedBullet } from "@/lib/types/cv-pipeline";

/**
 * Salvează selecția userului (5-6 bullet-uri) ȘI respingerile.
 * Marchează sesiunea ca 'completed'.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
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

    // 5-6 selecții; când există doar 5 bullet-uri valide, minim 4 e acceptabil
    const min = Math.min(5, Math.max(4, bullets.length - 1));
    if (selectedIds.length < min || selectedIds.length > 6) {
      return NextResponse.json(
        { error: `Alege între ${min} și 6 descrieri.` },
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
