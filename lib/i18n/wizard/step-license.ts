import type { Locale } from "@/lib/i18n/locale";

const ro = {
  title: "Permis & Calificări",
  subtitle: "Adaugă permisul de conducere și calificările profesionale.",
  license: {
    question: "Ai permis de conducere?",
    yes: "✅ Da",
    no: "❌ Nu",
    categories: "Categorii permis:",
  },
  qualifications: {
    label: "Calificări profesionale (opțional)",
    placeholder: "ex: operator stivuitor, electrician ANRE…",
    add: "Adaugă",
    correcting: "Corectăm…",
    hint: "Autorizații, atestări, certificate recunoscute oficial — corectăm noi scrierea.",
    remove: (q: string) => `Șterge ${q}`,
  },
  back: "← Înapoi",
  next: "Continuă",
};

const en: typeof ro = {
  title: "Licence & Qualifications",
  subtitle: "Add your driving licence and professional qualifications.",
  license: {
    question: "Do you have a driving licence?",
    yes: "✅ Yes",
    no: "❌ No",
    categories: "Licence categories:",
  },
  qualifications: {
    label: "Professional qualifications (optional)",
    placeholder: "e.g. forklift operator, certified electrician…",
    add: "Add",
    correcting: "Fixing…",
    hint: "Authorisations, attestations, officially recognised certificates — we fix the spelling for you.",
    remove: (q: string) => `Remove ${q}`,
  },
  back: "← Back",
  next: "Continue",
};

export const STEP_LICENSE_MESSAGES: Record<Locale, typeof ro> = { ro, en };
