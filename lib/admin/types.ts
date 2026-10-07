/**
 * Tipurile comune ale panoului de administrare.
 *
 * Aceeași formă de date alimentează atât /admin (date reale, anonimizate pe
 * server) cât și /demo/admin (set de date generat determinist). Nicio
 * structură de aici nu conține nume sau email — doar eticheta „Utilizator #…”.
 */

export type AdminMode = "demo" | "real";

/** Etapele AI normalizate (din numele brute ale apelurilor). */
export type AiStageKey =
  | "research-intent"
  | "research-profile"
  | "questions"
  | "bullets"
  | "bullets-regen"
  | "skills"
  | "summary"
  | "correct-text"
  | "format-skill"
  | "other";

export const AI_STAGE_ORDER: AiStageKey[] = [
  "research-intent",
  "research-profile",
  "questions",
  "bullets",
  "bullets-regen",
  "skills",
  "summary",
  "correct-text",
  "format-skill",
  "other",
];

export const AI_STAGE_LABELS: Record<AiStageKey, string> = {
  "research-intent": "Research: rol & industrie",
  "research-profile": "Research: profil ideal",
  questions: "Întrebările recrutorului",
  bullets: "Bullet-uri CV",
  "bullets-regen": "Regenerare țintită",
  skills: "Abilități",
  summary: "Rezumat profesional",
  "correct-text": "Corectare text",
  "format-skill": "Formatare abilitate",
  other: "Altele",
};

export interface AdminSessionRow {
  id: string;
  /** „Utilizator #a3f9c1” — derivat stabil din UUID, fără date personale */
  label: string;
  status: string;
  generated: boolean;
  template: string | null;
  lastStep: number | null;
  paid: boolean | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAiCall {
  id: string;
  sessionId: string | null;
  label: string | null;
  /** numele brut al etapei (ex. apel2-bullets[liber]) */
  stage: string;
  stageKey: AiStageKey;
  model: string;
  promptTokens: number;
  cachedTokens: number;
  completionTokens: number;
  reasoningTokens: number;
  costUSD: number;
  durationMs: number;
  jsonRetries: number;
  effortRejected: boolean;
  createdAt: string;
}

export interface AdminValidation {
  id: string;
  sessionId: string | null;
  label: string | null;
  firstPassInvalid: number;
  regenerated: boolean;
  dropped: number;
  finalCount: number;
  createdAt: string;
}

export interface AdminError {
  id: string;
  sessionId: string | null;
  label: string | null;
  route: string;
  status: number;
  message: string;
  createdAt: string;
}

export interface AdminMessage {
  id: string;
  label: string;
  message: string;
  createdAt: string;
}

export interface AdminDataset {
  mode: AdminMode;
  generatedAt: string;
  retentionDays: number;
  deletedCount: number;
  sessions: AdminSessionRow[];
  aiCalls: AdminAiCall[];
  validations: AdminValidation[];
  errors: AdminError[];
  messages: AdminMessage[];
}

/** Eticheta anonimă a unei sesiuni: primele 6 caractere hex din UUID. */
export function labelOf(sessionId: string | null | undefined): string {
  if (!sessionId) return "Utilizator #——";
  return `Utilizator #${sessionId.replace(/-/g, "").slice(0, 6)}`;
}

/** Normalizează numele brut al etapei într-o cheie stabilă pentru grupare. */
export function stageKeyOf(stage: string): AiStageKey {
  const s = stage.toLowerCase();
  if (s.startsWith("research-intent")) return "research-intent";
  if (s.startsWith("research-profile") || s.startsWith("research")) return "research-profile";
  if (s.includes("regen")) return "bullets-regen";
  if (s.includes("apel1") || s.includes("intrebari") || s.startsWith("questions")) return "questions";
  if (s.includes("apel2") || s.startsWith("bullets")) return "bullets";
  if (s.startsWith("skills") || s.includes("abilit")) return "skills";
  if (s.startsWith("summary") || s.includes("summary") || s.includes("rezumat")) return "summary";
  if (s.startsWith("correct")) return "correct-text";
  if (s.startsWith("format-skill")) return "format-skill";
  return "other";
}
