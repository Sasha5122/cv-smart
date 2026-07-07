/**
 * Etapele AI ale pipeline-ului (2 apeluri) + validarea anti-halucinare.
 *
 *  1. runRecruiterQuestions — descrierea userului → 5 întrebări de recrutor
 *  2. runBulletsFromContext — context unic (descriere + Î&R + anunț) → 7 bullets
 *
 * Funcții pure — fără persistență; rutele API se ocupă de salvare.
 */
import { callStructured } from "@/lib/openai";
import {
  buildStage1System,
  buildStage1User,
  buildStage2System,
  buildStage2User,
} from "@/lib/prompts/cv-pipeline";
import {
  AnalyzeInput,
  BULLETS_SCHEMA,
  BulletsResult,
  GeneratedBullet,
  PipelineQuestion,
  QUESTIONS_SCHEMA,
  QuestionsResult,
} from "@/lib/types/cv-pipeline";

// ---------------------------------------------------------------------------
// Apel #1 — Întrebările recrutorului
// ---------------------------------------------------------------------------

export async function runRecruiterQuestions(
  input: AnalyzeInput
): Promise<PipelineQuestion[]> {
  const result = await callStructured<QuestionsResult>({
    stage: "apel1-intrebari-recrutor",
    systemPrompt: buildStage1System(
      input.jobTitle,
      Boolean(input.jobDescription?.trim())
    ),
    userContent: buildStage1User(input),
    schemaName: "recruiter_questions",
    jsonSchema: QUESTIONS_SCHEMA,
  });

  // Garantăm exact 5 întrebări (schema strict nu poate impune count).
  let questions = result.questions;
  if (questions.length > 5) questions = questions.slice(0, 5);
  if (questions.length < 5) {
    console.warn(
      `[cv-pipeline][apel1] doar ${questions.length} întrebări generate (așteptat 5)`
    );
  }
  return questions;
}

// ---------------------------------------------------------------------------
// Validare anti-halucinare (non-AI, obligatorie)
// Ancora de adevăr: descrierea originală + răspunsurile candidatului.
// ---------------------------------------------------------------------------

const NUMBER_RE = /\d+(?:[.,]\d+)?/g;
/** token alfanumeric: denumiri de software/declarații (D112, 1C, B2B, S1000...) */
const ALNUM_TOKEN_RE =
  /[A-Za-zĂÂÎȘȚăâîșț]*\d+[A-Za-z0-9ĂÂÎȘȚăâîșț.,]*|[A-Za-z0-9ĂÂÎȘȚăâîșț]+\d+/g;

function normalizeNumber(n: string): string {
  return n.replace(",", ".");
}
function stripSeparators(n: string): string {
  return n.replace(/[.,]/g, "");
}

/** „38 de mii” → 38000, „2 milioane” → 2000000 — echivalențe RO,
 * ca formularea profesională („38.000 lei”) să treacă validarea
 * când candidatul a spus „38 de mii de lei”. */
const WORD_MULTIPLIER_RE =
  /(\d+(?:[.,]\d+)?)\s*(?:de\s+)?(mii|mie|milioane|milion)\b/gi;

function numbersIn(text: string): Set<string> {
  const out = new Set<string>();
  for (const m of text.matchAll(NUMBER_RE)) {
    out.add(normalizeNumber(m[0]));
    out.add(stripSeparators(m[0]));
  }
  for (const m of text.matchAll(WORD_MULTIPLIER_RE)) {
    const base = parseFloat(normalizeNumber(m[1]));
    const mult = /mii|mie/i.test(m[2]) ? 1_000 : 1_000_000;
    if (Number.isFinite(base)) {
      out.add(String(Math.round(base * mult)));
    }
  }
  return out;
}

/** Tokeni alfanumerici (litere + cifre) din context — excepțiile permise
 * (ex. D112, 1C): cifrele lor nu se validează numeric. */
function alnumTokensIn(text: string): Set<string> {
  const out = new Set<string>();
  for (const m of text.matchAll(ALNUM_TOKEN_RE)) {
    const tok = m[0].replace(/[.,]+$/, "");
    if (/\d/.test(tok) && /[A-Za-zĂÂÎȘȚăâîșț]/.test(tok)) {
      out.add(tok.toLowerCase());
    }
  }
  return out;
}

export interface BulletValidationIssue {
  bullet: GeneratedBullet;
  badNumbers: string[];
  problem: string;
}

export interface BulletValidationResult {
  valid: GeneratedBullet[];
  invalid: BulletValidationIssue[];
}

/**
 * Verifică în cod (nu AI) că fiecare cifră dintr-un bullet există în
 * contextul-sursă (descriere + răspunsuri), cu echivalențe de format.
 */
export function validateBullets(
  bullets: GeneratedBullet[],
  contextText: string
): BulletValidationResult {
  const allowedNumbers = numbersIn(contextText);
  const allowedTokens = alnumTokensIn(contextText);

  const valid: GeneratedBullet[] = [];
  const invalid: BulletValidationIssue[] = [];

  for (const bullet of bullets) {
    const badNumbers: string[] = [];
    for (const m of bullet.text.matchAll(NUMBER_RE)) {
      const raw = m[0];
      const idx = m.index ?? 0;
      // tokenul complet din jurul cifrei (pentru excepția D112 / 1C)
      const before =
        bullet.text.slice(0, idx).match(/[A-Za-zĂÂÎȘȚăâîșț0-9]*$/)?.[0] ?? "";
      const after =
        bullet.text.slice(idx + raw.length).match(/^[A-Za-zĂÂÎȘȚăâîșț0-9]*/)?.[0] ??
        "";
      const token = (before + raw + after).toLowerCase();
      if ((before || after) && /[a-zăâîșț]/.test(token) && allowedTokens.has(token)) {
        continue; // parte dintr-o denumire permisă (ex. D112)
      }
      if (
        allowedNumbers.has(normalizeNumber(raw)) ||
        allowedNumbers.has(stripSeparators(raw))
      ) {
        continue;
      }
      badNumbers.push(raw);
    }

    if (badNumbers.length === 0) {
      valid.push(bullet);
    } else {
      invalid.push({
        bullet,
        badNumbers,
        problem: `cifrele [${badNumbers.join(", ")}] nu există în descrierea sau răspunsurile candidatului`,
      });
    }
  }

  return { valid, invalid };
}

// ---------------------------------------------------------------------------
// Apel #2 — Bullet Generation din context unic (+ regenerare țintită)
// ---------------------------------------------------------------------------

export class InsufficientBulletsError extends Error {
  constructor(public readonly validCount: number) {
    super(
      `Doar ${validCount} bullet-uri valide după regenerare (minim 5 necesare)`
    );
    this.name = "InsufficientBulletsError";
  }
}

export interface BulletStageResult {
  bullets: GeneratedBullet[];
  /** bullet-uri eliminate după a doua validare eșuată */
  dropped: BulletValidationIssue[];
  regenerated: boolean;
}

export interface BulletContextInput {
  jobTitle: string;
  rawText: string;
  interview: { question: string; answer: string }[];
  jobDescription?: string;
}

export async function runBulletsFromContext(
  input: BulletContextInput
): Promise<BulletStageResult> {
  const hasJD = Boolean(input.jobDescription?.trim());
  // ancora de adevăr pentru validarea cifrelor
  const contextText = [
    input.rawText,
    ...input.interview.map((p) => p.answer),
  ].join(" \n ");

  const first = await callStructured<BulletsResult>({
    stage: "apel2-bullets",
    systemPrompt: buildStage2System(hasJD),
    userContent: buildStage2User({
      jobTitle: input.jobTitle,
      rawText: input.rawText,
      interview: input.interview,
      jobDescription: input.jobDescription,
    }),
    schemaName: "cv_bullets",
    jsonSchema: BULLETS_SCHEMA,
  });

  let bullets = first.bullets.slice(0, 7);
  let { valid, invalid } = validateBullets(bullets, contextText);
  let regenerated = false;
  let dropped: BulletValidationIssue[] = [];

  if (invalid.length > 0) {
    regenerated = true;
    console.warn(
      `[cv-pipeline][validare] ${invalid.length} bullet-uri cu cifre inexistente → regenerare țintită`
    );
    const regen = await callStructured<BulletsResult>({
      stage: "apel2-bullets-regen",
      systemPrompt: buildStage2System(hasJD),
      userContent: buildStage2User({
        jobTitle: input.jobTitle,
        rawText: input.rawText,
        interview: input.interview,
        jobDescription: input.jobDescription,
        regenerateFeedback: {
          invalidBullets: invalid.map((i) => ({
            id: i.bullet.id,
            text: i.bullet.text,
            problem: i.problem,
          })),
          validBullets: valid.map((b) => ({ id: b.id, text: b.text })),
        },
      }),
      schemaName: "cv_bullets",
      jsonSchema: BULLETS_SCHEMA,
    });

    // Înlocuim doar bullet-urile corectate; păstrăm ordinea originală.
    const correctedById = new Map(regen.bullets.map((b) => [b.id, b]));
    bullets = bullets.map((b) => correctedById.get(b.id) ?? b);

    const second = validateBullets(bullets, contextText);
    dropped = second.invalid;
    valid = second.valid;
  }

  if (valid.length < 5) {
    throw new InsufficientBulletsError(valid.length);
  }

  return { bullets: valid, dropped, regenerated };
}
