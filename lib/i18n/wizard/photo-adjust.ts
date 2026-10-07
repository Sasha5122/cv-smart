import type { Locale } from "@/lib/i18n/locale";

/** Textele editorului de încadrare a pozei (zoom + tragere). */
const ro = {
  hint: "Trage poza ca să o centrezi · zoom din slider, două degete sau scroll. Se salvează automat.",
  zoomLabel: "Zoom poză",
  resetLabel: "Resetează încadrarea",
};

const en: typeof ro = {
  hint: "Drag the photo to center it · zoom with the slider, two fingers or scroll. Saved automatically.",
  zoomLabel: "Photo zoom",
  resetLabel: "Reset framing",
};

export const PHOTO_ADJUST_MESSAGES: Record<Locale, typeof ro> = { ro, en };
