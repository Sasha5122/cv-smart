import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { ADMIN_COOKIE, isValidToken } from "@/lib/admin-auth";
import { cleanupExpired, SESSION_RETENTION_DAYS } from "@/lib/cleanup";
import {
  labelOf,
  stageKeyOf,
  type AdminAiCall,
  type AdminDataset,
  type AdminError,
  type AdminMessage,
  type AdminSessionRow,
  type AdminValidation,
} from "@/lib/admin/types";

export const dynamic = "force-dynamic";

/**
 * Datele panoului de administrare — ANONIMIZATE pe server.
 * Răspunsul nu conține niciodată nume sau email: fiecare sesiune primește
 * eticheta „Utilizator #xxxxxx” (derivată stabil din UUID). Mesajele de
 * contact ajung fără expeditor. Telemetria (ai_call, api_error,
 * validation_result) vine din tabela `events`, fără schemă nouă.
 */
export async function GET(req: NextRequest) {
  if (!isValidToken(req.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  try {
    // 1) ștergerea automată conform Termenilor (rulează la fiecare accesare)
    const deletedCount = await cleanupExpired().catch(() => 0);

    // 2) sesiunile (cele mai recente 300) — fără cv_data, ca să nu citim date personale degeaba
    const { data: sessions } = await supabaseAdmin
      .from("sessions")
      .select("id, status, template_id, created_at, updated_at")
      .neq("status", "contact_anchor")
      .order("updated_at", { ascending: false })
      .limit(300);

    // 3) evenimentele relevante, într-o singură trecere pe tipuri
    const [stepEvents, paymentEvents, messageEvents, aiEvents, errorEvents, validationEvents] = await Promise.all([
      supabaseAdmin
        .from("events")
        .select("session_id, properties")
        .eq("event_name", "step_reached")
        .order("created_at", { ascending: false })
        .limit(3000),
      supabaseAdmin
        .from("events")
        .select("session_id")
        .eq("event_name", "payment_completed")
        .order("created_at", { ascending: false })
        .limit(2000),
      supabaseAdmin
        .from("events")
        .select("id, session_id, properties, created_at")
        .eq("event_name", "contact_message")
        .order("created_at", { ascending: false })
        .limit(200),
      supabaseAdmin
        .from("events")
        .select("id, session_id, properties, created_at")
        .eq("event_name", "ai_call")
        .order("created_at", { ascending: false })
        .limit(4000),
      supabaseAdmin
        .from("events")
        .select("id, session_id, properties, created_at")
        .eq("event_name", "api_error")
        .order("created_at", { ascending: false })
        .limit(500),
      supabaseAdmin
        .from("events")
        .select("id, session_id, properties, created_at")
        .eq("event_name", "validation_result")
        .order("created_at", { ascending: false })
        .limit(2000),
    ]);

    const lastStep = new Map<string, number>();
    for (const ev of stepEvents.data ?? []) {
      const sid = ev.session_id as string;
      const step = Number((ev.properties as { step?: number })?.step ?? 0);
      lastStep.set(sid, Math.max(lastStep.get(sid) ?? 0, step));
    }
    const paidSessions = new Set((paymentEvents.data ?? []).map((e) => e.session_id as string));

    const rows: AdminSessionRow[] = (sessions ?? []).map((s) => {
      const paid = paidSessions.has(s.id) || s.status === "paid";
      return {
        id: s.id,
        label: labelOf(s.id),
        status: s.status,
        // „generat” = are un CV final de descărcat: descărcat SAU plătit
        generated: s.status === "downloaded" || paid,
        template: s.template_id ?? null,
        lastStep: lastStep.get(s.id) ?? null,
        paid,
        createdAt: s.created_at,
        updatedAt: s.updated_at,
      };
    });

    const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : Number(v) || 0);

    const messages: AdminMessage[] = (messageEvents.data ?? []).map((m) => {
      const p = (m.properties ?? {}) as { message?: string };
      return {
        id: m.id,
        label: labelOf(m.session_id as string | null),
        message: p.message ?? "",
        createdAt: m.created_at,
      };
    });

    const aiCalls: AdminAiCall[] = (aiEvents.data ?? []).map((e) => {
      const p = (e.properties ?? {}) as Record<string, unknown>;
      const stage = String(p.stage ?? "other");
      return {
        id: e.id,
        sessionId: (e.session_id as string | null) ?? null,
        label: e.session_id ? labelOf(e.session_id as string) : null,
        stage,
        stageKey: stageKeyOf(stage),
        model: String(p.model ?? "?"),
        promptTokens: num(p.promptTokens),
        cachedTokens: num(p.cachedTokens),
        completionTokens: num(p.completionTokens),
        reasoningTokens: num(p.reasoningTokens),
        costUSD: num(p.costUSD),
        durationMs: num(p.durationMs),
        jsonRetries: num(p.jsonRetries),
        effortRejected: Boolean(p.effortRejected),
        createdAt: e.created_at,
      };
    });

    const errors: AdminError[] = (errorEvents.data ?? []).map((e) => {
      const p = (e.properties ?? {}) as Record<string, unknown>;
      return {
        id: e.id,
        sessionId: (e.session_id as string | null) ?? null,
        label: e.session_id ? labelOf(e.session_id as string) : null,
        route: String(p.route ?? "?"),
        status: num(p.status),
        message: String(p.message ?? ""),
        createdAt: e.created_at,
      };
    });

    const validations: AdminValidation[] = (validationEvents.data ?? []).map((e) => {
      const p = (e.properties ?? {}) as Record<string, unknown>;
      return {
        id: e.id,
        sessionId: (e.session_id as string | null) ?? null,
        label: e.session_id ? labelOf(e.session_id as string) : null,
        firstPassInvalid: num(p.firstPassInvalid),
        regenerated: Boolean(p.regenerated),
        dropped: num(p.dropped),
        finalCount: num(p.finalCount),
        createdAt: e.created_at,
      };
    });

    const payload: AdminDataset = {
      mode: "real",
      generatedAt: new Date().toISOString(),
      retentionDays: SESSION_RETENTION_DAYS,
      deletedCount,
      sessions: rows,
      aiCalls,
      validations,
      errors,
      messages,
    };
    return NextResponse.json(payload);
  } catch (err) {
    console.error("admin data:", err);
    return NextResponse.json({ error: "Eroare la încărcarea datelor." }, { status: 500 });
  }
}
