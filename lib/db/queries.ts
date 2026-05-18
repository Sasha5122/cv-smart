import { supabaseAdmin } from "./supabase";
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
