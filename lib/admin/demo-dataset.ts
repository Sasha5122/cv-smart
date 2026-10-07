/**
 * Set de date DEMO pentru /demo/admin — generat determinist (seed fix), relativ
 * la momentul curent, ca să arate mereu „ultimele 30 de zile”.
 *
 * Compoziție (143 sesiuni):
 *   8  CV-uri complete + plătite
 *   15 CV-uri complete, neplătite (au ajuns la paywall)
 *   20 oprite pe drum (pașii 2–9)
 *   100 doar prima pagină (au deschis wizard-ul)
 *
 * Nimic de aici nu provine din date reale. Costurile folosesc exact formula de
 * producție (computeCostUSD), iar modelele sunt cele din cod (gpt-5.4 pentru
 * pipeline, mini/nano pentru rutele secundare).
 */
import { computeCostUSD } from "@/lib/ai-pricing";
import { ALL_TEMPLATE_IDS } from "@/lib/types/cv";
import {
  labelOf,
  type AdminAiCall,
  type AdminDataset,
  type AdminError,
  type AdminMessage,
  type AdminSessionRow,
  type AdminValidation,
  type AiStageKey,
} from "./types";

// ---------------------------------------------------------------------------
// PRNG determinist (mulberry32) + utilitare
// ---------------------------------------------------------------------------

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

class Rng {
  private next: () => number;
  constructor(seed: number) {
    this.next = mulberry32(seed);
  }
  float(): number {
    return this.next();
  }
  int(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }
  chance(p: number): boolean {
    return this.next() < p;
  }
  pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
  weighted<T>(items: readonly { value: T; weight: number }[]): T {
    const total = items.reduce((s, i) => s + i.weight, 0);
    let r = this.next() * total;
    for (const item of items) {
      r -= item.weight;
      if (r <= 0) return item.value;
    }
    return items[items.length - 1].value;
  }
  /** distribuție log-normală în jurul unei mediane (ms, tokeni) */
  logNormal(median: number, sigma: number): number {
    const u = Math.max(this.next(), 1e-9);
    const v = this.next();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return median * Math.exp(sigma * z);
  }
  uuid(): string {
    const hex = () => this.int(0, 15).toString(16);
    const seg = (n: number) => Array.from({ length: n }, hex).join("");
    return `${seg(8)}-${seg(4)}-4${seg(3)}-${this.pick(["8", "9", "a", "b"])}${seg(3)}-${seg(12)}`;
  }
}

const DAY = 24 * 60 * 60 * 1000;
const WINDOW_DAYS = 30;

/** ore de vârf: 10–13 și 19–22; noaptea aproape nimic */
const HOUR_WEIGHTS = [
  0.3, 0.2, 0.1, 0.1, 0.1, 0.2, 0.5, 1.0, 1.6, 2.2, 2.8, 2.9, 2.6, 2.3, 2.0, 1.9, 1.8, 1.9, 2.3, 2.9,
  3.1, 2.8, 1.9, 0.9,
];
/** duminică=0 … sâmbătă=6 */
const WEEKDAY_WEIGHTS = [0.6, 1.0, 1.05, 1.0, 1.0, 0.9, 0.7];

function randomMoment(rng: Rng, windowStart: number, windowEnd: number): number {
  for (let tries = 0; tries < 50; tries++) {
    const day = windowStart + Math.floor(rng.float() * ((windowEnd - windowStart) / DAY)) * DAY;
    const d = new Date(day);
    if (rng.float() > WEEKDAY_WEIGHTS[d.getDay()]) continue;
    const hour = rng.weighted(HOUR_WEIGHTS.map((w, h) => ({ value: h, weight: w })));
    d.setHours(hour, rng.int(0, 59), rng.int(0, 59), 0);
    const t = d.getTime();
    if (t >= windowStart && t <= windowEnd) return t;
  }
  return windowStart + rng.float() * (windowEnd - windowStart);
}

// ---------------------------------------------------------------------------
// Profilurile apelurilor AI (tokeni, modele, durate) — cf. codului de producție
// ---------------------------------------------------------------------------

interface StageProfile {
  model: string;
  prompt: [number, number];
  completion: [number, number];
  /** mediana duratei (ms) + dispersia log-normală */
  duration: [number, number];
  /** probabilitatea ca o parte din prompt să vină din cache */
  cacheChance: number;
}

const STAGE_PROFILES: Record<Exclude<AiStageKey, "other">, StageProfile> = {
  "research-intent": { model: "gpt-5.4-mini", prompt: [280, 420], completion: [40, 80], duration: [900, 0.3], cacheChance: 0 },
  "research-profile": { model: "gpt-5.4-mini", prompt: [520, 800], completion: [380, 620], duration: [4200, 0.35], cacheChance: 0 },
  questions: { model: "gpt-5.4", prompt: [1300, 2600], completion: [320, 560], duration: [6200, 0.35], cacheChance: 0.25 },
  bullets: { model: "gpt-5.4", prompt: [1900, 3600], completion: [480, 900], duration: [12500, 0.4], cacheChance: 0.25 },
  "bullets-regen": { model: "gpt-5.4", prompt: [2300, 4000], completion: [300, 600], duration: [9000, 0.4], cacheChance: 0.4 },
  skills: { model: "gpt-5.4", prompt: [800, 1300], completion: [350, 520], duration: [5100, 0.35], cacheChance: 0.1 },
  summary: { model: "gpt-5.4-mini", prompt: [600, 1000], completion: [90, 160], duration: [2600, 0.3], cacheChance: 0.1 },
  "correct-text": { model: "gpt-5.4-nano", prompt: [180, 400], completion: [30, 90], duration: [820, 0.3], cacheChance: 0 },
  "format-skill": { model: "gpt-5.4-mini", prompt: [120, 220], completion: [10, 25], duration: [700, 0.3], cacheChance: 0 },
};

const STAGE_RAW_NAMES: Record<Exclude<AiStageKey, "other">, string> = {
  "research-intent": "research-intent",
  "research-profile": "research-profile",
  questions: "apel1-intrebari-recrutor[liber]",
  bullets: "apel2-bullets[liber]",
  "bullets-regen": "apel2-bullets-regen[liber]",
  skills: "skills",
  summary: "summary",
  "correct-text": "correct-text:hobby",
  "format-skill": "format-skill",
};

function makeAiCall(
  rng: Rng,
  stageKey: Exclude<AiStageKey, "other">,
  sessionId: string,
  at: number
): AdminAiCall {
  const p = STAGE_PROFILES[stageKey];
  const promptTokens = rng.int(p.prompt[0], p.prompt[1]);
  const cachedTokens = rng.chance(p.cacheChance) ? Math.round(promptTokens * (0.3 + rng.float() * 0.3)) : 0;
  const completionTokens = rng.int(p.completion[0], p.completion[1]);
  const jsonRetries = (stageKey === "questions" || stageKey === "bullets") && rng.chance(0.03) ? 1 : 0;
  return {
    id: rng.uuid(),
    sessionId,
    label: labelOf(sessionId),
    stage: STAGE_RAW_NAMES[stageKey],
    stageKey,
    model: p.model,
    promptTokens,
    cachedTokens,
    completionTokens,
    reasoningTokens: 0,
    costUSD: computeCostUSD(p.model, promptTokens, cachedTokens, completionTokens),
    durationMs: Math.round(rng.logNormal(p.duration[0], p.duration[1]) * (jsonRetries ? 1.8 : 1)),
    jsonRetries,
    effortRejected: false,
    createdAt: new Date(at).toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Catalog de erori plauzibile (cf. rutelor reale)
// ---------------------------------------------------------------------------

const ERROR_CATALOG: { route: string; status: number; message: string; weight: number }[] = [
  { route: "/api/cv/generate-bullets", status: 504, message: "APIConnectionTimeoutError: Request timed out (120 000 ms) — apel2-bullets[liber]", weight: 3 },
  { route: "/api/cv/generate-bullets", status: 422, message: "InsufficientBulletsError: doar 4 bullet-uri valide din 7 după regenerare", weight: 2 },
  { route: "/api/cv/analyze", status: 502, message: "StructuredCallError: JSON invalid după reîncercare (apel1-intrebari-recrutor[liber])", weight: 2 },
  { route: "/api/photo/process", status: 422, message: "Error: Input buffer contains unsupported image format (image/webp, 14.2 MB)", weight: 2 },
  { route: "/api/cv/analyze", status: 429, message: "RateLimit: 10 analize/oră depășite pentru IP", weight: 1 },
  { route: "/api/creem/webhook", status: 400, message: "Error: semnătură webhook invalidă (creem-signature)", weight: 1 },
  { route: "/api/ai/generate-skills", status: 502, message: "Error: generarea abilităților a eșuat (fără dicționar de rezervă)", weight: 1 },
  { route: "/api/pdf", status: 500, message: "Error: ENOENT fonts/Montserrat-SemiBold.ttf (bundle fără outputFileTracingIncludes)", weight: 1 },
];

const CONTACT_MESSAGES = [
  "Bună ziua, am plătit CV-ul dar nu am primit emailul. Am verificat și în spam. Puteți verifica, vă rog?",
  "Salut! Se poate adăuga și un câmp pentru certificări profesionale (ANRE, ISCIR)? Ar ajuta mult la joburile tehnice.",
  "Felicitări pentru aplicație, am făcut CV-ul în 15 minute și am fost chemat la interviu a doua zi. Aveți și varianta în engleză?",
  "Am greșit o literă în nume după ce am plătit. Pot să îl descarc din nou corectat?",
];

// ---------------------------------------------------------------------------
// Generatorul
// ---------------------------------------------------------------------------

type Group = "paid" | "complete" | "partial" | "first-page";

const PARTIAL_STEP_WEIGHTS = [
  { value: 2, weight: 4 },
  { value: 3, weight: 3 },
  { value: 4, weight: 6 },
  { value: 5, weight: 2 },
  { value: 6, weight: 2 },
  { value: 7, weight: 1 },
  { value: 8, weight: 1 },
  { value: 9, weight: 1 },
];

const TEMPLATE_WEIGHTS = ALL_TEMPLATE_IDS.map((id) => ({
  value: id as string,
  weight: id === "classic" ? 6 : id === "modern" ? 5 : id === "compact" || id === "elegant" ? 3 : 1,
}));

export function buildDemoDataset(nowMs: number = Date.now(), seed = 20260712): AdminDataset {
  // rotunjim la oră: setul rămâne identic între încărcări apropiate
  const now = Math.floor(nowMs / (60 * 60 * 1000)) * 60 * 60 * 1000;
  const windowStart = now - WINDOW_DAYS * DAY;
  const rng = new Rng(seed);

  const sessions: AdminSessionRow[] = [];
  const aiCalls: AdminAiCall[] = [];
  const validations: AdminValidation[] = [];
  const errors: AdminError[] = [];

  const plan: Group[] = [
    ...Array<Group>(8).fill("paid"),
    ...Array<Group>(15).fill("complete"),
    ...Array<Group>(20).fill("partial"),
    ...Array<Group>(100).fill("first-page"),
  ];

  for (const group of plan) {
    const id = rng.uuid();
    const createdAt = randomMoment(rng, windowStart, now - 2 * 60 * 60 * 1000);
    const lastStep =
      group === "paid" || group === "complete" ? 10 : group === "partial" ? rng.weighted(PARTIAL_STEP_WEIGHTS) : 1;
    const durationMin =
      group === "first-page" ? rng.float() * 3 : group === "partial" ? 2 + rng.float() * 18 : 12 + rng.float() * 28;
    const updatedAt = Math.min(now - 60 * 1000, createdAt + durationMin * 60 * 1000);
    const paid = group === "paid";
    const generated = paid || group === "complete";

    sessions.push({
      id,
      label: labelOf(id),
      status: paid ? "paid" : generated ? "downloaded" : "in_progress",
      generated,
      template: lastStep >= 10 ? rng.weighted(TEMPLATE_WEIGHTS) : null,
      lastStep,
      paid,
      createdAt: new Date(createdAt).toISOString(),
      updatedAt: new Date(updatedAt).toISOString(),
    });

    // apelurile AI, în ordinea pașilor, distribuite pe durata sesiunii
    const span = Math.max(updatedAt - createdAt, 60 * 1000);
    const at = (fraction: number) => createdAt + span * fraction;
    const push = (stage: Exclude<AiStageKey, "other">, fraction: number) =>
      aiCalls.push(makeAiCall(rng, stage, id, at(fraction)));

    if (lastStep >= 4) {
      push("research-intent", 0.22);
      if (rng.chance(0.55)) push("research-profile", 0.23); // restul vin din cached_profiles
    }
    const reachedExperience = lastStep >= 5 || (lastStep === 4 && rng.chance(0.75));
    if (reachedExperience) {
      push("questions", 0.32);
      const gotBullets = lastStep >= 5 || rng.chance(0.6);
      if (gotBullets) {
        const bulletsAt = at(0.42);
        aiCalls.push(makeAiCall(rng, "bullets", id, bulletsAt));
        const firstPassInvalid = rng.weighted([
          { value: 0, weight: 70 },
          { value: 1, weight: 18 },
          { value: 2, weight: 9 },
          { value: 3, weight: 3 },
        ]);
        const regenerated = firstPassInvalid > 0;
        const dropped = regenerated && rng.chance(0.15) ? 1 : 0;
        if (regenerated) aiCalls.push(makeAiCall(rng, "bullets-regen", id, bulletsAt + 15000));
        validations.push({
          id: rng.uuid(),
          sessionId: id,
          label: labelOf(id),
          firstPassInvalid,
          regenerated,
          dropped,
          finalCount: 7 - dropped,
          createdAt: new Date(bulletsAt + (regenerated ? 24000 : 12000)).toISOString(),
        });
        if (rng.chance(0.35)) push("correct-text", 0.47); // editare inline a unui bullet
      }
    }
    if (lastStep >= 6) push("skills", 0.6);
    if (lastStep >= 9) {
      const n = rng.int(0, 2);
      for (let i = 0; i < n; i++) push("correct-text", 0.8 + i * 0.03);
    }
    if (lastStep >= 10) push("summary", 0.9);
  }

  // erorile lunii: ~12, legate de sesiuni active unde are sens
  const activeSessions = sessions.filter((s) => (s.lastStep ?? 0) >= 3);
  const errorCount = 12;
  for (let i = 0; i < errorCount; i++) {
    const e = rng.weighted(ERROR_CATALOG.map((c) => ({ value: c, weight: c.weight })));
    const withSession = e.route !== "/api/creem/webhook" && e.route !== "/api/pdf";
    const session = withSession ? rng.pick(activeSessions) : null;
    const at = session
      ? new Date(session.createdAt).getTime() + rng.float() * 10 * 60 * 1000
      : randomMoment(rng, windowStart, now - 60 * 60 * 1000);
    errors.push({
      id: rng.uuid(),
      sessionId: session?.id ?? null,
      label: session ? session.label : null,
      route: e.route,
      status: e.status,
      message: e.message,
      createdAt: new Date(at).toISOString(),
    });
  }

  const messages: AdminMessage[] = CONTACT_MESSAGES.map((text) => {
    const s = rng.pick(activeSessions);
    return {
      id: rng.uuid(),
      label: s.label,
      message: text,
      createdAt: new Date(new Date(s.updatedAt).getTime() + rng.int(5, 240) * 60 * 1000).toISOString(),
    };
  });

  const byDateDesc = <T extends { createdAt: string }>(a: T, b: T) => b.createdAt.localeCompare(a.createdAt);
  sessions.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  aiCalls.sort(byDateDesc);
  validations.sort(byDateDesc);
  errors.sort(byDateDesc);
  messages.sort(byDateDesc);

  return {
    mode: "demo",
    generatedAt: new Date(now).toISOString(),
    retentionDays: 30,
    deletedCount: 0,
    sessions,
    aiCalls,
    validations,
    errors,
    messages,
  };
}
