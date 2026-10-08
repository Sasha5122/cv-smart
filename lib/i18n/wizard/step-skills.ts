import type { Locale } from "@/lib/i18n/locale";

/** Textele pasului „Abilități" (step-10-skills). Româna rămâne sursa de adevăr. */
const ro = {
  title: "Abilități",
  loadingSubtitle: "AI analizează profilul tău și generează abilități potrivite...",
  loadingText: "Generăm abilitățile personalizate pentru tine...",
  subtitle: "Selectează abilitățile tale relevante pentru CV.",
  loadError: "Generarea AI a abilităților a eșuat. Poți reîncerca sau adaugă-le manual mai jos.",
  retry: "Încearcă din nou",
  sections: {
    hardSkills: "Abilități tehnice / Hard skills",
    softwareTools: "Software / Tools",
    softSkills: "Soft skills",
  },
  counter: (count: number, total: number, recommended: string) =>
    `${count} / ${total} — recomandat: ${recommended}`,
  noItems: "Niciun item generat.",
  manualTitle: "Adaugă manual",
  manualPlaceholder: "Ex: Managementul timpului",
  add: "Adaugă",
  back: "← Înapoi",
  continue: "Continuă",
};

const en: typeof ro = {
  title: "Skills",
  loadingSubtitle: "AI is analysing your profile and generating matching skills...",
  loadingText: "Generating personalised skills for you...",
  subtitle: "Select the skills that are relevant for your CV.",
  loadError: "AI skill generation failed. You can retry or add them manually below.",
  retry: "Try again",
  sections: {
    hardSkills: "Technical / Hard skills",
    softwareTools: "Software / Tools",
    softSkills: "Soft skills",
  },
  counter: (count: number, total: number, recommended: string) =>
    `${count} / ${total} — recommended: ${recommended}`,
  noItems: "No items generated.",
  manualTitle: "Add manually",
  manualPlaceholder: "E.g. Time management",
  add: "Add",
  back: "← Back",
  continue: "Continue",
};

export const STEP_SKILLS_MESSAGES: Record<Locale, typeof ro> = { ro, en };
