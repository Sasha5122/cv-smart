import type { Locale } from "@/lib/i18n/locale";

const ro = {
  restored: "Ți-am restaurat progresul — continui de unde ai rămas.",
  startOver: "Începe de la zero",
};

const en: typeof ro = {
  restored: "We restored your progress — pick up where you left off.",
  startOver: "Start from scratch",
};

export const WIZARD_CLIENT_MESSAGES: Record<Locale, typeof ro> = { ro, en };
