import { NextRequest, NextResponse } from "next/server";
import { recordApiError } from "@/lib/telemetry";
import { supabaseAdmin } from "@/lib/db/supabase";
import { checkRateLimit, clientIp } from "@/lib/cv-pipeline/rate-limit";
import { readJsonLimited, BODY_LIMITS } from "@/lib/http-guards";

export const dynamic = "force-dynamic";

/** Primește mesajele din pagina de contact și le stochează în tabela
 *  `events` (append-only, fără migrări noi) cu event_name dedicat. */
export async function POST(req: NextRequest) {
  try {
    const limit = await checkRateLimit(clientIp(req), "contact", 10, 60 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Prea multe mesaje. Încearcă din nou mai târziu." },
        { status: 429 }
      );
    }
    const { name, email, message } = await readJsonLimited<{
      name?: string;
      email?: string;
      message?: string;
    }>(req, BODY_LIMITS.TEXT);

    const nameTrim = typeof name === "string" ? name.trim() : "";
    const emailTrim = typeof email === "string" ? email.trim() : "";
    const messageTrim = typeof message === "string" ? message.trim() : "";

    if (!nameTrim || !emailTrim || !messageTrim) {
      return NextResponse.json({ error: "Completează toate câmpurile." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailTrim)) {
      return NextResponse.json({ error: "Adresa de e-mail nu pare validă." }, { status: 400 });
    }
    if (messageTrim.length > 5000 || nameTrim.length > 200 || emailTrim.length > 320) {
      return NextResponse.json({ error: "Mesajul este prea lung." }, { status: 400 });
    }

    const properties = {
      name: nameTrim,
      email: emailTrim,
      message: messageTrim,
      sent_at: new Date().toISOString(),
    };

    // încercare directă fără sesiune; dacă FK-ul cere una, creăm o sesiune-ancoră
    const { error } = await supabaseAdmin.from("events").insert({
      session_id: null,
      event_name: "contact_message",
      properties,
    });

    if (error) {
      const { data: session, error: sErr } = await supabaseAdmin
        .from("sessions")
        .insert({ cv_data: {}, status: "contact_anchor" })
        .select("id")
        .single();
      if (sErr || !session) throw new Error(error.message);
      const { error: e2 } = await supabaseAdmin.from("events").insert({
        session_id: session.id,
        event_name: "contact_message",
        properties,
      });
      if (e2) throw new Error(e2.message);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    await recordApiError("/api/contact", 500, err);
    console.error("contact:", err);
    return NextResponse.json(
      { error: "Mesajul nu a putut fi trimis. Încearcă din nou." },
      { status: 500 }
    );
  }
}
