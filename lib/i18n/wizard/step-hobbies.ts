import type { Locale } from "@/lib/i18n/locale";

const ro = {
  title: "Hobby-uri & Pasiuni",
  subtitle: "Scrie un hobby cu cuvintele tale — îl formulăm noi pentru CV. Apoi adaugă următorul.",
  form: {
    label: "Ce faci în timpul liber?",
    placeholder: "ex: joc fotbal cu prietenii, citesc carti de istorie…",
    add: "Adaugă",
    correcting: "Formulăm…",
    hint: "AI-ul corectează doar formularea — sensul rămâne exact al tău.",
  },
  list: {
    count: (n: number) => `${n} ${n === 1 ? "hobby adăugat" : "hobby-uri adăugate"}`,
    remove: (h: string) => `Șterge ${h}`,
  },
  back: "← Înapoi",
  next: "Generează CV-ul!",
  optional: "Hobby-urile sunt opționale — poți continua și fără.",
};

const en: typeof ro = {
  title: "Hobbies & Interests",
  subtitle: "Describe a hobby in your own words — we phrase it for the CV. Then add the next one.",
  form: {
    label: "What do you do in your free time?",
    placeholder: "e.g. playing football with friends, reading history books…",
    add: "Add",
    correcting: "Phrasing…",
    hint: "The AI only polishes the wording — the meaning stays exactly yours.",
  },
  list: {
    count: (n: number) => `${n} ${n === 1 ? "hobby added" : "hobbies added"}`,
    remove: (h: string) => `Remove ${h}`,
  },
  back: "← Back",
  next: "Generate my CV!",
  optional: "Hobbies are optional — you can continue without them.",
};

export const STEP_HOBBIES_MESSAGES: Record<Locale, typeof ro> = { ro, en };
