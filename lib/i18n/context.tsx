"use client";
import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_LOCALE, type Locale } from "./locale";
import { messagesFor, type Messages } from "./messages";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

/** Pus în root layout cu limba citită din cookie pe server — fără flash. */
export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

/** Textele interfeței pentru limba curentă (acces tipat: t.hero.title). */
export function useT(): Messages {
  return messagesFor(useContext(LocaleContext));
}

/** Mesaje locale unei componente: `{ ro: {...}, en: {...} }` → varianta pentru limba curentă.
 *  Folosit de pașii wizard-ului, fiecare cu propriul fișier de texte. */
export function useMessages<T>(m: Readonly<Record<Locale, T>>): T {
  const locale = useContext(LocaleContext);
  return m[locale] ?? m[DEFAULT_LOCALE];
}

/** Varianta non-hook (pentru funcții utilitare care primesc limba explicit). */
export function pickMessages<T>(m: Readonly<Record<Locale, T>>, locale: Locale): T {
  return m[locale] ?? m[DEFAULT_LOCALE];
}
