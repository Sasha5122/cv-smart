/**
 * Tipuri + JSON Schemas pentru pipeline-ul AI de generare descrieri CV.
 *
 * Arhitectura (2 apeluri AI):
 *  1. „Ochii recrutorului”  — descrierea userului → 5 întrebări
 *  2. „Scriitorul de CV”    — context unic (descriere + Î&R + anunț) → 7 bullets
 *
 * Tipurile TS sunt derivate 1:1 din schemele trimise la OpenAI (strict mode).
 */

// ---------- Enums / primitives ----------

export const FACT_CATEGORIES = [
  "responsabilitate_core",
  "realizare",
  "volum_cifre",
  "tools",
  "colaborare_leadership",
  "problema_rezolvata",
] as const;
export type FactCategory = (typeof FACT_CATEGORIES)[number];

export type PipelineStage =
  | "analyzed"
  | "answered"
  | "generated"
  | "completed";

// ---------- Apel #1: Întrebările recrutorului ----------

export interface PipelineQuestion {
  id: string;
  question: string;
  /** ce informație urmărește recrutorul să obțină */
  expected_info: string;
}

export interface QuestionsResult {
  questions: PipelineQuestion[];
}

// ---------- Apel #2: Bullet Generation din context unic ----------

export interface GeneratedBullet {
  id: string;
  text: string;
  category: FactCategory;
}

export interface BulletsResult {
  bullets: GeneratedBullet[];
}

// ---------- Input / route payloads ----------

export interface AnalyzeInput {
  jobTitle: string;
  /** compania/locul acestui job — ancorează întrebările pe jobul vizat */
  company?: string;
  /** perioada acestui job (ex: „2021 – prezent”) */
  period?: string;
  industry?: string;
  yearsExperience?: number;
  rawText: string;
  /** Job description-ul jobului țintă (opțional). Când există,
   * întregul pipeline se ancorează pe relevanța față de el. */
  jobDescription?: string;
}

export interface QuestionAnswer {
  questionId: string;
  answer: string;
}

export interface PipelineSessionRow {
  id: string;
  user_id: string | null;
  wizard_session_id: string | null;
  job_title: string;
  industry: string | null;
  years_experience: number | null;
  raw_text: string;
  job_description: string | null;
  stage: PipelineStage;
  /** păstrează numele istoric al coloanei; conține { questions } */
  extraction_result: QuestionsResult | null;
  user_answers: QuestionAnswer[] | null;
  generated_bullets: GeneratedBullet[] | null;
  selected_bullet_ids: string[] | null;
  rejected_bullet_ids: string[] | null;
  created_at: string;
  updated_at: string;
}

// ---------- JSON Schemas (OpenAI strict mode) ----------
// Regulă strict mode: fiecare obiect are additionalProperties:false
// și TOATE proprietățile în `required`.

const factCategoryEnum = { type: "string", enum: [...FACT_CATEGORIES] };

export const QUESTIONS_SCHEMA: Record<string, unknown> = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          question: { type: "string" },
          expected_info: { type: "string" },
        },
        required: ["id", "question", "expected_info"],
        additionalProperties: false,
      },
    },
  },
  required: ["questions"],
  additionalProperties: false,
};

export const BULLETS_SCHEMA: Record<string, unknown> = {
  type: "object",
  properties: {
    bullets: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          text: { type: "string" },
          category: factCategoryEnum,
        },
        required: ["id", "text", "category"],
        additionalProperties: false,
      },
    },
  },
  required: ["bullets"],
  additionalProperties: false,
};
