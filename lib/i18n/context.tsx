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
