import type { CVData } from "@/lib/types/cv";

/**
 * Numele fișierului PDF: numele utilizatorului + data generării.
 * Ex: „CV_Elena_Stanciu_2026-07-10.pdf" — diacriticele sunt transliterate,
 * caracterele nesigure pentru sisteme de fișiere sunt eliminate.
 */
export function buildCvFilename(cvData: CVData, when: Date = new Date()): string {
  const clean = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "") // diacritice → litera de bază
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

  const name = [cvData.personal?.firstName, cvData.personal?.lastName]
    .filter(Boolean)
    .map((p) => clean(String(p)))
    .filter(Boolean)
    .join("_");

  const yyyy = when.getFullYear();
  const mm = String(when.getMonth() + 1).padStart(2, "0");
  const dd = String(when.getDate()).padStart(2, "0");

  return `CV_${name || "smart"}_${yyyy}-${mm}-${dd}.pdf`;
}
