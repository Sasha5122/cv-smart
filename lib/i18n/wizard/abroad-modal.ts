import type { Locale } from "@/lib/i18n/locale";

/** Textele modalului „Locuiești în afara României?" (țara, telefon cu prefix, adresă). */
const ro = {
  ariaLabel: "Date de contact din afara României",
  title: "Locuiești în afara României?",
  close: "Închide",
  intro: "Completează datele de contact din țara în care locuiești — nu mai e nevoie de cele din România.",
  country: "Țara *",
  countryPlaceholder: "alege țara...",
  phone: "Telefon *",
  phonePrefixAria: "Prefix telefonic",
  phonePlaceholder: "numărul de telefon",
  phoneHint: "Prefixul se completează automat după alegerea țării.",
  address: "Adresa",
  addressPlaceholder: "ex: Hauptstraße 12, 10115 Berlin",
  cancel: "Renunță",
  confirm: "OK",
};

const en: typeof ro = {
  ariaLabel: "Contact details from outside Romania",
  title: "Living outside Romania?",
  close: "Close",
  intro: "Fill in your contact details for the country you live in — the Romanian ones are no longer needed.",
  country: "Country *",
  countryPlaceholder: "choose a country...",
  phone: "Phone *",
  phonePrefixAria: "Phone prefix",
  phonePlaceholder: "phone number",
  phoneHint: "The prefix is filled in automatically once you choose a country.",
  address: "Address",
  addressPlaceholder: "e.g. Hauptstraße 12, 10115 Berlin",
  cancel: "Cancel",
  confirm: "OK",
};

export const ABROAD_MODAL_MESSAGES: Record<Locale, typeof ro> = { ro, en };
