import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { ADMIN_COOKIE, isValidToken } from "@/lib/admin-auth";
import { cleanupExpired, SESSION_RETENTION_DAYS } from "@/lib/cleanup";
import type { CVData } from "@/lib/types/cv";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isValidToken(req.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  try {
    // 1) ștergerea automată conform Termenilor (rulează la fiecare accesare)
    const deletedCount = await cleanupExpired().catch(() => 0);

    // 2) sesiunile (cele mai recente 200)
    const { data: sessions } = await supabaseAdmin
      .from("sessions")
      .select("id, status, template_id, cv_data, created_at, updated_at")
      .neq("status", "contact_anchor")
      .order("updated_at", { ascending: false })
      .limit(200);

    // 3) ultimul pas atins per sesiune
    const { data: stepEvents } = await supabaseAdmin
      .from("events")
      .select("session_id, properties")
      .eq("event_name", "step_reached")
      .order("created_at", { ascending: false })
      .limit(2000);

    const lastStep = new Map<string, number>();
    for (const ev of stepEvents ?? []) {
      const sid = ev.session_id as string;
      const step = Number((ev.properties as { step?: number })?.step ?? 0);
      lastStep.set(sid, Math.max(lastStep.get(sid) ?? 0, step));
    }

    // 4) mesajele de contact
    const { data: messageEvents } = await supabaseAdmin
      .from("events")
      .select("id, properties, created_at")
      .eq("event_name", "contact_message")
      .order("created_at", { ascending: false })
      .limit(200);

    const rows = (sessions ?? []).map((s) => {
      const cv = (s.cv_data ?? {}) as Partial<CVData>;
      const p = cv.personal;
      const name = [p?.firstName, p?.lastName].filter(Boolean).join(" ").trim();
      return {
        id: s.id,
        name: name || "—",
        email: p?.email || "—",
        status: s.status,
        generated: s.status === "downloaded",
        template: s.template_id ?? null,
        lastStep: lastStep.get(s.id) ?? null,
        // plățile nu sunt încă active în perioada de validare
        paid: null as boolean | null,
        createdAt: s.created_at,
        updatedAt: s.updated_at,
      };
    });

    const messages = (messageEvents ?? []).map((m) => {
      const p = (m.properties ?? {}) as { name?: string; email?: string; message?: string };
      return {
        id: m.id,
        name: p.name ?? "—",
        email: p.email ?? "—",
        message: p.message ?? "",
        createdAt: m.created_at,
      };
    });

    return NextResponse.json({
      deletedCount,
      retentionDays: SESSION_RETENTION_DAYS,
      cvs: rows.filter((r) => r.generated),
      sessions: rows.filter((r) => !r.generated),
      messages,
    });
  } catch (err) {
    console.error("admin data:", err);
    return NextResponse.json({ error: "Eroare la încărcarea datelor." }, { status: 500 });
  }
}
