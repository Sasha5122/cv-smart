import type { Locale } from "@/lib/i18n/locale";

const ro = {
  /** etichetele pașilor din sidebar — aceeași ordine ca SIDEBAR_STEPS */
  steps: ["Contact", "Poză", "Unde aplici", "Experiență", "Educație", "Abilități", "Limbi", "Permis", "Hobby-uri", "Finalizare"],
  yourSteps: "Pașii tăi",
  goToStep: (n: number, label: string) => `Mergi la pasul ${n} — ${label}`,
  footerLine1: "Fără cont · Fără plată",
  footerLine2: "PDF direct, în română",
  stepOf: (n: number, total: number) => `Pasul ${n} din ${total}`,
  preview: "Preview CV",
  live: "LIVE",
};

const en: typeof ro = {
  steps: ["Contact", "Photo", "Target job", "Experience", "Education", "Skills", "Languages", "Licence", "Hobbies", "Finish"],
  yourSteps: "Your steps",
  goToStep: (n: number, label: string) => `Go to step ${n} — ${label}`,
  footerLine1: "No account · No payment",
  footerLine2: "PDF straight away",
  stepOf: (n: number, total: number) => `Step ${n} of ${total}`,
  preview: "CV preview",
  live: "LIVE",
};

export const WIZARD_LAYOUT_MESSAGES: Record<Locale, typeof ro> = { ro, en };
