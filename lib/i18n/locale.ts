/**
 * Limba interfeței: română (implicit) sau engleză (opțiune, nivel demo).
 * Se ține într-un cookie, fără prefix în URL — paginile și SEO-ul pe română
 * rămân neschimbate. Butonul RO | EN scrie cookie-ul și reîncarcă datele.
 */
export type Locale = "ro" | "en";

export const LOCALES: Locale[] = ["ro", "en"];
export const DEFAULT_LOCALE: Locale = "ro";
export const LOCALE_COOKIE = "NEXT_LOCALE";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: unknown): value is Locale {
  return value === "ro" || value === "en";
}

export function toLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
