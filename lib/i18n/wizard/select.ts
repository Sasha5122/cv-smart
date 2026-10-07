import type { Locale } from "@/lib/i18n/locale";

const ro = {
  placeholder: "alege...",
  searchPlaceholder: "Caută...",
  noResults: "Niciun rezultat",
};

const en: typeof ro = {
  placeholder: "choose...",
  searchPlaceholder: "Search...",
  noResults: "No results",
};

export const SELECT_MESSAGES: Record<Locale, typeof ro> = { ro, en };
