/**
 * Persistența sesiunilor de pipeline — cu fallback automat.
 *
 * Preferat: tabela dedicată `cv_pipeline_sessions` (vezi
 * supabase-migration-cv-pipeline.sql). Dacă tabela NU există încă,
 * folosim tabela `events` (există din schema inițială) ca depozit de
 * snapshot-uri JSONB, append-only:
 *   { event_name: 'cv_pipeline_session', session_id: <wizard>, properties: {pipeline_id, ...stare} }
 * Citirea ia snapshot-ul cel mai recent. Astfel userul nu are NICIUN
 * pas manual de făcut; când migrarea e rulată, trecem singuri pe tabelă.
 */
import { randomUUID } from "node:crypto";
import { supabaseAdmin } from "@/lib/db/supabase";
import type {
  GeneratedBullet,
  PipelineStage,
  QuestionAnswer,
  QuestionsResult,
} from "@/lib/types/cv-pipeline";

export interface PipelineState {
  id: string;
  wizard_session_id: string | null;
  job_title: string;
  industry: string | null;
  years_experience: number | null;
  raw_text: string;
  job_description: string | null;
  stage: PipelineStage;
  /** numele istoric al coloanei din tabelă; conține { questions } */
  extraction_result: QuestionsResult | null;
  user_answers: QuestionAnswer[] | null;
  generated_bullets: GeneratedBullet[] | null;
  selected_bullet_ids: string[] | null;
  rejected_bullet_ids: string[] | null;
}

const TABLE = "cv_pipeline_sessions";
const EVENT_NAME = "cv_pipeline_session";

/** null = necunoscut încă; se detectează la primul apel */
let tableAvailable: boolean | null = null;

function isMissingTable(message: string | undefined): boolean {
  return Boolean(message && message.includes(TABLE));
}

async function detectTable(): Promise<boolean> {
  if (tableAvailable !== null) return tableAvailable;
  const { error } = await supabaseAdmin.from(TABLE).select("id").limit(1);
  tableAvailable = !(error && isMissingTable(error.message));
  if (!tableAvailable) {
    console.warn(
      `[cv-pipeline][store] tabela ${TABLE} lipsește — folosesc fallback-ul pe tabela events`
    );
  }
  return tableAvailable;
}

/* ── fallback pe events ────────────────────────────────────────── */

async function eventsInsertSnapshot(state: PipelineState): Promise<void> {
  const { error } = await supabaseAdmin.from("events").insert({
    session_id: state.wizard_session_id,
    event_name: EVENT_NAME,
    properties: { pipeline_id: state.id, ...state },
  });
  if (error) throw new Error(`events insert: ${error.message}`);
}

async function eventsGetLatest(id: string): Promise<PipelineState | null> {
  const { data, error } = await supabaseAdmin
    .from("events")
    .select("properties")
    .eq("event_name", EVENT_NAME)
    .eq("properties->>pipeline_id", id)
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) throw new Error(`events select: ${error.message}`);
  if (!data || data.length === 0) return null;
  return data[0].properties as PipelineState;
}

/* ── API public ────────────────────────────────────────────────── */

export async function createPipelineSession(
  fields: Omit<
    PipelineState,
    | "id"
    | "stage"
    | "extraction_result"
    | "user_answers"
    | "generated_bullets"
    | "selected_bullet_ids"
    | "rejected_bullet_ids"
  >
): Promise<string> {
  const state: PipelineState = {
    ...fields,
    id: randomUUID(),
    stage: "analyzed",
    extraction_result: null,
    user_answers: null,
    generated_bullets: null,
    selected_bullet_ids: null,
    rejected_bullet_ids: null,
  };

  if (await detectTable()) {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .insert({
        wizard_session_id: state.wizard_session_id,
        job_title: state.job_title,
        industry: state.industry,
        years_experience: state.years_experience,
        raw_text: state.raw_text,
        job_description: state.job_description,
        stage: state.stage,
      })
      .select("id")
      .single();
    if (error) {
      if (isMissingTable(error.message)) {
        tableAvailable = false; // race la prima detecție — retrimite pe fallback
        await eventsInsertSnapshot(state);
        return state.id;
      }
      throw new Error(`insert ${TABLE}: ${error.message}`);
    }
    return data.id as string;
  }

  await eventsInsertSnapshot(state);
  return state.id;
}

export async function getPipelineSession(id: string): Promise<PipelineState | null> {
  if (await detectTable()) {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .single();
    if (error) return null;
    return data as PipelineState;
  }
  return eventsGetLatest(id);
}

export async function updatePipelineSession(
  id: string,
  patch: Partial<PipelineState>
): Promise<void> {
  if (await detectTable()) {
    const { error } = await supabaseAdmin
      .from(TABLE)
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(`update ${TABLE}: ${error.message}`);
    return;
  }
  const current = await eventsGetLatest(id);
  if (!current) throw new Error(`pipeline session ${id} inexistentă`);
  await eventsInsertSnapshot({ ...current, ...patch, id });
}
