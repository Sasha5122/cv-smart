"use client";
import { useSyncExternalStore } from "react";
import type { AiStageKey } from "./types";

/**
 * Textele panoului de administrare, în română (implicit) și engleză (opțiune).
 * Limba se alege din header (RO | EN), se ține minte în localStorage și poate
 * fi forțată din URL cu ?lang=en (link partajabil).
 */
export type AdminLocale = "ro" | "en";

export interface AdminStrings {
  locale: AdminLocale;
  intl: string; // tag pentru Intl.NumberFormat / toLocaleString
  title: string;
  retention: (days: number) => string;
  deletedNow: (n: number) => string;
  reload: string;
  home: string;
  tabs: { overview: string; eval: string };
  paid: { yes: string; no: string; inactive: string };
  cols: {
    user: string;
    design: string;
    paid: string;
    generatedAt: string;
    pdf: string;
    download: string;
    lastStep: string;
    lastActivity: string;
    aiCost: string;
    aiCalls: string;
    tokens: string;
    aiTime: string;
    timeInWizard: string;
    errors: string;
    validBullets: string;
    when: string;
    stage: string;
    model: string;
    prompt: string;
    cached: string;
    output: string;
    cost: string;
    duration: string;
    route: string;
    status: string;
    message: string;
    calls: string;
    costTotal: string;
    costPerCall: string;
    config: string;
    call1: string;
    call2: string;
    costPerJob: string;
    pctOfBaseline: string;
    numbersFailedDropped: string;
    nominalForm: string;
    reasoning: string;
    invention: string;
  };
  cvs: { title: (n: number) => string; sub: (days: number) => string; none: string };
  sessions: { title: (n: number) => string; sub: string; none: string; step: (n: number, label: string) => string; opened: string };
  messages: { title: (n: number) => string; none: string };
  details: { title: string; errors: string; noCalls: string; expand: string; collapse: string };
  eval: {
    period: string;
    periods: { d7: string; d30: string; all: string };
    exportSessions: string;
    exportCalls: string;
    summary: { title: string; sub: string };
    tiles: {
      sessions: string;
      engaged: (n: string) => string;
      cvs: string;
      ofEngaged: (p: string) => string;
      paid: string;
      revenue: string;
      perCv: string;
      aiCost: string;
      callsTokens: (calls: string, tokens: string) => string;
      costPerCv: string;
      ofPrice: (p: string) => string;
      costPerSession: string;
      cachedShare: (p: string) => string;
      errors: string;
      errorRate: (p: string) => string;
    };
    funnel: { title: string; sub: string };
    daily: { title: string; sub: string; sessions: string; cost: string; cvs: string };
    stages: { title: string; sub: string; none: string; slowest: string };
    quality: {
      title: string;
      sub: string;
      validated: string;
      regenRate: string;
      regenHint: (n: string) => string;
      dropped: string;
      droppedHint: string;
      perSet: string;
      perSetHint: string;
      jsonRetries: string;
      jsonHint: string;
      effort: string;
      effortHint: string;
    };
    errors: { title: string; sub: string; byRoute: string; none: string; latest: (n: number) => string };
    benchmark: { title: string; production: string; decision: string; surprise: string; method: string };
    heatmap: { title: string; sub: string; days: string[] };
    chart: { max: string; total: string };
  };
  stages: Record<AiStageKey, string>;
  steps: Record<number, string>;
}

const ro: AdminStrings = {
  locale: "ro",
  intl: "ro-RO",
  title: "CVexpres — Admin",
  retention: (d) => `Retenție: ${d} zile`,
  deletedNow: (n) => `Șterse automat acum: ${n}`,
  reload: "Reîncarcă",
  home: "← Pagina principală",
  tabs: { overview: "Prezentare generală", eval: "Evaluare" },
  paid: { yes: "Da", no: "Nu", inactive: "— (plăți inactive)" },
  cols: {
    user: "Utilizator",
    design: "Design",
    paid: "Plătit",
    generatedAt: "Generat la",
    pdf: "PDF",
    download: "Descarcă",
    lastStep: "Ultimul pas atins",
    lastActivity: "Ultima activitate",
    aiCost: "Cost AI",
    aiCalls: "Apeluri AI",
    tokens: "Tokeni",
    aiTime: "Timp AI",
    timeInWizard: "Timp în wizard",
    errors: "Erori",
    validBullets: "Bullet-uri valide",
    when: "Când",
    stage: "Etapă",
    model: "Model",
    prompt: "Prompt",
    cached: "Cached",
    output: "Output",
    cost: "Cost",
    duration: "Durată",
    route: "Rută",
    status: "Status",
    message: "Mesaj",
    calls: "Apeluri",
    costTotal: "Cost total",
    costPerCall: "Cost / apel",
    config: "Config",
    call1: "Apel 1",
    call2: "Apel 2",
    costPerJob: "Cost / job",
    pctOfBaseline: "% din C0",
    numbersFailedDropped: "Cifre picate / eliminate",
    nominalForm: "Formă nominală",
    reasoning: "Reasoning",
    invention: "Invenție",
  },
  cvs: {
    title: (n) => `CV-uri generate (${n})`,
    sub: (d) => `Se șterg automat la ${d} de zile de la ultima activitate, conform Termenilor și condițiilor.`,
    none: "Niciun CV generat încă.",
  },
  sessions: {
    title: (n) => `Sesiuni fără CV generat (${n})`,
    sub: "Unde s-a oprit fiecare utilizator care nu a ajuns la descărcare. Click pe un rând pentru apelurile AI ale sesiunii.",
    none: "Nicio sesiune în lucru.",
    step: (n, label) => `Pasul ${n} — ${label}`,
    opened: "A deschis wizard-ul",
  },
  messages: { title: (n) => `Mesaje din pagina de contact (${n})`, none: "Niciun mesaj încă." },
  details: { title: "Apelurile AI ale sesiunii", errors: "Erori întâmpinate", noCalls: "Niciun apel AI în această sesiune.", expand: "Detalii", collapse: "Închide" },
  eval: {
    period: "Perioada:",
    periods: { d7: "7 zile", d30: "30 zile", all: "Tot" },
    exportSessions: "Export sesiuni CSV",
    exportCalls: "Export apeluri AI CSV",
    summary: {
      title: "Sumar",
      sub: "Sesiuni = wizard-uri deschise. Angajate = au trecut de prima pagină. Costul AI include și sesiunile abandonate, ca să fie onest.",
    },
    tiles: {
      sessions: "Sesiuni",
      engaged: (n) => `${n} angajate`,
      cvs: "CV-uri generate",
      ofEngaged: (p) => `${p} din angajate`,
      paid: "Plăți",
      revenue: "Venit",
      perCv: "9,99 € per CV",
      aiCost: "Cost AI total",
      callsTokens: (c, t) => `${c} apeluri · ${t} tokeni`,
      costPerCv: "Cost AI / CV livrat",
      ofPrice: (p) => `${p} din preț`,
      costPerSession: "Cost / sesiune cu AI",
      cachedShare: (p) => `${p} tokeni din cache`,
      errors: "Erori",
      errorRate: (p) => `rată ${p}`,
    },
    funnel: { title: "Funnel pe pași", sub: "Câți utilizatori au atins fiecare pas. Procentul din paranteză = față de pasul anterior." },
    daily: { title: "Activitate și cost pe zile", sub: "Pe zile, în perioada selectată.", sessions: "Sesiuni începute", cost: "Cost AI (USD)", cvs: "CV-uri generate" },
    stages: {
      title: "Etapele AI: cost și latență",
      sub: "Fiecare etapă AI: volum, tokeni, cost și latență (p50 / p95). Cached input e taxat la 10%.",
      none: "Niciun apel AI în perioada selectată.",
      slowest: "Cele mai lente 5 apeluri",
    },
    quality: {
      title: "Calitatea pipeline-ului",
      sub: "Validarea cifrelor e făcută în cod, nu de AI: fiecare număr dintr-un bullet trebuie să existe în ce a scris utilizatorul. Dacă nu, o regenerare țintită, apoi eliminare.",
      validated: "Seturi validate",
      regenRate: "Rată regenerare",
      regenHint: (n) => `${n} bullet-uri cu cifre inexistente la prima trecere`,
      dropped: "Bullet-uri eliminate",
      droppedHint: "după regenerare, tot invalide",
      perSet: "Bullet-uri / set",
      perSetHint: "din 7 generate",
      jsonRetries: "Retry JSON",
      jsonHint: "răspunsuri reluate pentru JSON invalid",
      effort: "reasoning_effort respins",
      effortHint: "apeluri reluate fără parametru",
    },
    errors: {
      title: "Erori",
      sub: "Erorile prinse în rutele API (timeouts OpenAI, validare insuficientă, poze neprocesabile, webhook-uri respinse).",
      byRoute: "Pe rută",
      none: "Nicio eroare în perioada selectată.",
      latest: (n) => `Ultimele ${n}`,
    },
    benchmark: {
      title: "Benchmark modele (iul 2026)",
      production: "PRODUCȚIE",
      decision: "Decizie: C2 (gpt-5.4 pe ambele apeluri) — ~33% din costul gpt-5.5, calitate echivalentă la evaluarea oarbă side-by-side.",
      surprise: "Surpriză: API-ul a respins silențios reasoning_effort pentru gpt-5.5 → C1 a rulat identic cu C0. Detectat doar pentru că respingerea e logată (effortRejected).",
      method: "Metodă: 4 cazuri sintetice (contabil fără/cu anunț, răspunsuri sărace, șofer profesionist), un singur config per rulare; metrici: cost, retry JSON, validare cifre, formă nominală, euristică de invenție.",
    },
    heatmap: { title: "Când vin utilizatorii", sub: "Sesiuni începute pe zi a săptămânii × oră (ora locală a browserului).", days: ["Du", "Lu", "Ma", "Mi", "Jo", "Vi", "Sâ"] },
    chart: { max: "max", total: "total" },
  },
  stages: {
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
  },
  steps: { 1: "Contact", 2: "Poză", 3: "Unde aplici", 4: "Experiență", 5: "Educație", 6: "Abilități", 7: "Limbi", 8: "Permis", 9: "Hobby-uri", 10: "Finalizare" },
};

const en: AdminStrings = {
  locale: "en",
  intl: "en-GB",
  title: "CVexpres — Admin",
  retention: (d) => `Retention: ${d} days`,
  deletedNow: (n) => `Auto-deleted now: ${n}`,
  reload: "Reload",
  home: "← Home page",
  tabs: { overview: "Overview", eval: "Evaluation" },
  paid: { yes: "Yes", no: "No", inactive: "— (payments off)" },
  cols: {
    user: "User",
    design: "Template",
    paid: "Paid",
    generatedAt: "Generated at",
    pdf: "PDF",
    download: "Download",
    lastStep: "Last step reached",
    lastActivity: "Last activity",
    aiCost: "AI cost",
    aiCalls: "AI calls",
    tokens: "Tokens",
    aiTime: "AI time",
    timeInWizard: "Time in wizard",
    errors: "Errors",
    validBullets: "Valid bullets",
    when: "When",
    stage: "Stage",
    model: "Model",
    prompt: "Prompt",
    cached: "Cached",
    output: "Output",
    cost: "Cost",
    duration: "Duration",
    route: "Route",
    status: "Status",
    message: "Message",
    calls: "Calls",
    costTotal: "Total cost",
    costPerCall: "Cost / call",
    config: "Config",
    call1: "Call 1",
    call2: "Call 2",
    costPerJob: "Cost / job",
    pctOfBaseline: "% of C0",
    numbersFailedDropped: "Numbers failed / dropped",
    nominalForm: "Nominal form",
    reasoning: "Reasoning",
    invention: "Invention",
  },
  cvs: {
    title: (n) => `Generated CVs (${n})`,
    sub: (d) => `Deleted automatically ${d} days after the last activity, as stated in the Terms.`,
    none: "No CV generated yet.",
  },
  sessions: {
    title: (n) => `Sessions without a CV (${n})`,
    sub: "Where each user stopped before reaching the download. Click a row to see the session's AI calls.",
    none: "No session in progress.",
    step: (n, label) => `Step ${n} — ${label}`,
    opened: "Opened the wizard",
  },
  messages: { title: (n) => `Contact page messages (${n})`, none: "No messages yet." },
  details: { title: "AI calls in this session", errors: "Errors encountered", noCalls: "No AI calls in this session.", expand: "Details", collapse: "Close" },
  eval: {
    period: "Period:",
    periods: { d7: "7 days", d30: "30 days", all: "All" },
    exportSessions: "Export sessions CSV",
    exportCalls: "Export AI calls CSV",
    summary: {
      title: "Summary",
      sub: "Sessions = wizards opened. Engaged = went past the first page. AI cost includes abandoned sessions, to keep the number honest.",
    },
    tiles: {
      sessions: "Sessions",
      engaged: (n) => `${n} engaged`,
      cvs: "Generated CVs",
      ofEngaged: (p) => `${p} of engaged`,
      paid: "Payments",
      revenue: "Revenue",
      perCv: "€9.99 per CV",
      aiCost: "Total AI cost",
      callsTokens: (c, t) => `${c} calls · ${t} tokens`,
      costPerCv: "AI cost / delivered CV",
      ofPrice: (p) => `${p} of the price`,
      costPerSession: "Cost / session using AI",
      cachedShare: (p) => `${p} tokens from cache`,
      errors: "Errors",
      errorRate: (p) => `rate ${p}`,
    },
    funnel: { title: "Step funnel", sub: "How many users reached each step. Percentage in brackets = relative to the previous step." },
    daily: { title: "Daily activity and cost", sub: "Per day, within the selected period.", sessions: "Sessions started", cost: "AI cost (USD)", cvs: "Generated CVs" },
    stages: {
      title: "AI stages: cost and latency",
      sub: "Each AI stage: volume, tokens, cost and latency (p50 / p95). Cached input is billed at 10%.",
      none: "No AI calls in the selected period.",
      slowest: "5 slowest calls",
    },
    quality: {
      title: "Pipeline quality",
      sub: "Number validation is done in code, not by the AI: every figure in a bullet must exist in what the user typed. If not, one targeted regeneration, then the bullet is dropped.",
      validated: "Validated sets",
      regenRate: "Regeneration rate",
      regenHint: (n) => `${n} bullets with non-existent numbers on first pass`,
      dropped: "Dropped bullets",
      droppedHint: "still invalid after regeneration",
      perSet: "Bullets / set",
      perSetHint: "out of 7 generated",
      jsonRetries: "JSON retries",
      jsonHint: "responses retried for invalid JSON",
      effort: "reasoning_effort rejected",
      effortHint: "calls retried without the parameter",
    },
    errors: {
      title: "Errors",
      sub: "Errors caught in API routes (OpenAI timeouts, insufficient validation, unprocessable photos, rejected webhooks).",
      byRoute: "By route",
      none: "No errors in the selected period.",
      latest: (n) => `Latest ${n}`,
    },
    benchmark: {
      title: "Model benchmark (Jul 2026)",
      production: "PRODUCTION",
      decision: "Decision: C2 (gpt-5.4 on both calls) — ~33% of the gpt-5.5 cost, equivalent quality in the blind side-by-side evaluation.",
      surprise: "Surprise: the API silently rejected reasoning_effort for gpt-5.5 → C1 ran identically to C0. Caught only because the rejection is logged (effortRejected).",
      method: "Method: 4 synthetic cases (accountant with/without job ad, poor answers, professional driver), one config per run; metrics: cost, JSON retries, number validation, nominal form, invention heuristic.",
    },
    heatmap: { title: "When users show up", sub: "Sessions started by weekday × hour (browser local time).", days: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] },
    chart: { max: "max", total: "total" },
  },
  stages: {
    "research-intent": "Research: role & industry",
    "research-profile": "Research: ideal profile",
    questions: "Recruiter questions",
    bullets: "CV bullets",
    "bullets-regen": "Targeted regeneration",
    skills: "Skills",
    summary: "Professional summary",
    "correct-text": "Text correction",
    "format-skill": "Skill formatting",
    other: "Other",
  },
  steps: { 1: "Contact", 2: "Photo", 3: "Target job", 4: "Experience", 5: "Education", 6: "Skills", 7: "Languages", 8: "Licence", 9: "Hobbies", 10: "Finish" },
};

export const ADMIN_STRINGS: Record<AdminLocale, AdminStrings> = { ro, en };

/* ── store minimal pentru limbă: URL ?lang= → localStorage → „ro” ───────── */

const STORAGE_KEY = "cvx-admin-locale";
const listeners = new Set<() => void>();
let current: AdminLocale | null = null;

function isLocale(v: unknown): v is AdminLocale {
  return v === "ro" || v === "en";
}

function readLocale(): AdminLocale {
  if (current) return current;
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("lang");
    if (isLocale(fromUrl)) return (current = fromUrl);
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored)) return (current = stored);
  } catch {
    // localStorage indisponibil (privat, blocat) — rămânem pe implicit
  }
  return (current = "ro");
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useAdminLocale(): [AdminLocale, (l: AdminLocale) => void] {
  const locale = useSyncExternalStore(subscribe, readLocale, (): AdminLocale => "ro");
  const setLocale = (l: AdminLocale) => {
    current = l;
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // ignorăm
    }
    listeners.forEach((fn) => fn());
  };
  return [locale, setLocale];
}
