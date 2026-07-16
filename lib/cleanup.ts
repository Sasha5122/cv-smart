import { supabaseAdmin } from "@/lib/db/supabase";

/** Retenția promisă în Termeni și condiții. */
export const SESSION_RETENTION_DAYS = 30;
export const MESSAGE_RETENTION_MONTHS = 12;

/** Șterge sesiunile mai vechi de 30 de zile (cu evenimentele lor) și
 *  mesajele de contact mai vechi de 12 luni. Rulează din cron-ul zilnic
 *  și, redundant, la fiecare accesare a panoului de admin. */
export async function cleanupExpired(): Promise<number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - SESSION_RETENTION_DAYS);
  const cutoffIso = cutoff.toISOString();

  const { data: expired } = await supabaseAdmin
    .from("sessions")
    .select("id")
    .lt("updated_at", cutoffIso)
    .limit(500);

  let deleted = 0;
  if (expired && expired.length > 0) {
    const ids = expired.map((s) => s.id);
    await supabaseAdmin.from("events").delete().in("session_id", ids);
    const { count } = await supabaseAdmin
      .from("sessions")
      .delete({ count: "exact" })
      .in("id", ids);
    deleted = count ?? ids.length;
  }

  const msgCutoff = new Date();
  msgCutoff.setMonth(msgCutoff.getMonth() - MESSAGE_RETENTION_MONTHS);
  await supabaseAdmin
    .from("events")
    .delete()
    .eq("event_name", "contact_message")
    .lt("created_at", msgCutoff.toISOString());

  return deleted;
}
