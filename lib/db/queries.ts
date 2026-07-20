import { supabaseAdmin } from "./supabase";
import { ALL_TEMPLATE_IDS } from "@/lib/types/cv";
import type { CVData, Session, IdealProfile, TemplateId } from "@/lib/types/cv";

export async function createSession(): Promise<Session> {
  const { data, error } = await supabaseAdmin
    .from("sessions")
    .insert({ cv_data: {}, status: "in_progress" })
    .select()
    .single();

  if (error) throw new Error(`createSession: ${error.message}`);
  return data as Session;
}

export async function getSession(id: string): Promise<Session | null> {
  const { data, error } = await supabaseAdmin
    .from("sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as Session;
}

export async function updateSessionCVData(id: string, cvData: Partial<CVData>) {
  const { error } = await supabaseAdmin
    .from("sessions")
    .update({ cv_data: cvData, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(`updateSessionCVData: ${error.message}`);
}

export async function updateSessionStatus(
  id: string,
  status: Session["status"],
  extra?: { draft_cv?: string; final_cv?: string; template_id?: TemplateId }
) {
  const { error } = await supabaseAdmin
    .from("sessions")
    .update({ status, updated_at: new Date().toISOString(), ...extra })
    .eq("id", id);

  if (error) throw new Error(`updateSessionStatus: ${error.message}`);
}

/**
 * Marchează sesiunea descărcată + reține designul ales — tolerant la
 * constraint-ul vechi de template_id (respinge 'minimal' până la migrație):
 * dacă update-ul combinat pică, salvăm statusul separat și designul ca event.
 */
export async function markSessionDownloaded(id: string, templateId: TemplateId): Promise<void> {
  try {
    await updateSessionStatus(id, "downloaded", { template_id: templateId });
  } catch {
    await updateSessionStatus(id, "downloaded").catch(() => {});
    await trackEvent(id, "template_selected", { template_id: templateId }).catch(() => {});
  }
}

/**
 * Designul efectiv al sesiunii: coloana template_id SAU (fallback pentru
 * 'minimal' pre-migrație) ultimul event template_selected. Default: classic.
 */
export async function resolveTemplate(session: Session): Promise<TemplateId> {
  if (session.template_id) return session.template_id;
  const { data } = await supabaseAdmin
    .from("events")
    .select("properties")
    .eq("session_id", session.id)
    .eq("event_name", "template_selected")
    .order("created_at", { ascending: false })
    .limit(1);
  const t = data?.[0]?.properties?.template_id;
  return ALL_TEMPLATE_IDS.includes(t) ? (t as TemplateId) : "classic";
}

export async function updateIdealProfile(id: string, profile: IdealProfile) {
  const { error } = await supabaseAdmin
    .from("sessions")
    .update({ ideal_profile: profile, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(`updateIdealProfile: ${error.message}`);
}

export async function getCachedProfile(roleNormalized: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data } = await supabaseAdmin
    .from("cached_profiles")
    .select("*")
    .eq("role_normalized", roleNormalized)
    .gte("created_at", thirtyDaysAgo.toISOString())
    .single();

  return data;
}

export async function upsertCachedProfile(
  roleNormalized: string,
  roleDisplay: string,
  industry: string,
  profileData: IdealProfile,
  sourceUrls: string[] = []
) {
  const { error } = await supabaseAdmin.from("cached_profiles").upsert({
    role_normalized: roleNormalized,
    role_display: roleDisplay,
    industry,
    profile_data: profileData,
    source_urls: sourceUrls,
    last_used_at: new Date().toISOString(),
  });

  if (error) throw new Error(`upsertCachedProfile: ${error.message}`);
}

/**
 * Există un eveniment cu acest transaction_id? — ARUNCĂ la eroarea de citire
 * (un „nu știu" tratat ca „nu" ar duce la acțiuni duplicate: emailuri duble).
 */
export async function hasEventForTransaction(
  eventName: string,
  transactionId: string,
  /** ignoră intrările mai vechi de atâtea ms (pt. claim-uri expirate) */
  maxAgeMs?: number
): Promise<boolean> {
  let q = supabaseAdmin
    .from("events")
    .select("id")
    .eq("event_name", eventName)
    .contains("properties", { transaction_id: transactionId })
    .limit(1);
  if (maxAgeMs) {
    q = q.gte("created_at", new Date(Date.now() - maxAgeMs).toISOString());
  }
  const { data, error } = await q;
  if (error) throw new Error(`hasEventForTransaction(${eventName}): ${error.message}`);
  return Boolean(data && data.length > 0);
}

/**
 * Idempotența livrării: emailul cu CV-ul a fost deja trimis pentru această
 * tranzacție? (Paddle retrimite webhook-urile — nu vrem emailuri duplicate.)
 */
export async function hasDeliveryForTransaction(transactionId: string): Promise<boolean> {
  return hasEventForTransaction("cv_email_sent", transactionId);
}

/**
 * Sesiunea e plătită? Sursa PRIMARĂ e evenimentul durabil `payment_completed`
 * (tabela events nu are constrângeri de status); coloana status e doar
 * scurtătura ieftină. Best-effort: la eroare de citire răspunde false.
 */
export async function isSessionPaid(session: Session | null): Promise<boolean> {
  if (!session) return false;
  if (session.status === "paid" || session.status === "downloaded") return true;
  const { data } = await supabaseAdmin
    .from("events")
    .select("id")
    .eq("session_id", session.id)
    .eq("event_name", "payment_completed")
    .limit(1);
  return Boolean(data && data.length > 0);
}

/**
 * Marchează sesiunea plătită — tolerant la constraint-ul vechi de status
 * (până se rulează supabase-migration-payments.sql, `paid` poate fi respins;
 * evenimentul payment_completed rămâne sursa de adevăr, deci nu e fatal).
 */
export async function markSessionPaid(sessionId: string): Promise<void> {
  try {
    await updateSessionStatus(sessionId, "paid");
  } catch (e) {
    console.warn(
      `[markSessionPaid] statusul 'paid' respins de DB (rulează supabase-migration-payments.sql): ${
        e instanceof Error ? e.message : e
      }`
    );
  }
}

export async function trackEvent(
  sessionId: string,
  eventName: string,
  properties?: Record<string, unknown>
) {
  await supabaseAdmin.from("events").insert({
    session_id: sessionId,
    event_name: eventName,
    properties: properties ?? {},
  });
}
