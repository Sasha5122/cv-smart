/**
 * Helper client pentru corectarea ieftină de text (gramatică + diacritice).
 * Best-effort: la orice problemă returnează textul original — nu blochează
 * niciodată utilizatorul.
 */
import type { Locale } from "@/lib/i18n/locale";

export type CorrectKind = "job-title" | "city" | "hobby" | "qualification" | "cv-bullet";

export async function correctText(
  text: string,
  kind: CorrectKind,
  language?: Locale
): Promise<string> {
  const t = text.trim();
  if (t.length < 2) return t;
  try {
    const res = await fetch("/api/ai/correct-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(language ? { text: t, kind, language } : { text: t, kind }),
    });
    if (!res.ok) return t;
    const data = await res.json();
    const corrected = typeof data.corrected === "string" ? data.corrected.trim() : "";
    return corrected || t;
  } catch {
    return t;
  }
}

export interface NominalizeResult {
  lines: string[];
  /** false = rescrierea a picat, liniile sunt originalele (apelantul anunță onest) */
  rewritten: boolean;
}

/**
 * Reformatează responsabilitățile scrise MANUAL în bullet-uri de CV în formă
 * nominală („Coordonat echipa" → „Coordonarea unei echipe") — UN SINGUR apel
 * pentru toate liniile, atomic: ori toate rescrise, ori toate originale
 * (niciodată un amestec de forme). La orice eroare, textul userului rămâne
 * intact — corectarea nu are voie să blocheze salvarea.
 */
export async function nominalizeBullets(
  lines: string[],
  language?: Locale
): Promise<NominalizeResult> {
  const clean = lines.map((l) => l.trim()).filter(Boolean);
  if (clean.length === 0) return { lines: clean, rewritten: true };
  try {
    const res = await fetch("/api/ai/correct-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        language
          ? { kind: "cv-bullets", lines: clean, language }
          : { kind: "cv-bullets", lines: clean }
      ),
    });
    if (!res.ok) return { lines: clean, rewritten: false };
    const data = await res.json();
    if (Array.isArray(data.corrected) && data.corrected.length === clean.length) {
      return { lines: data.corrected, rewritten: data.rewritten !== false };
    }
    return { lines: clean, rewritten: false };
  } catch {
    return { lines: clean, rewritten: false };
  }
}
