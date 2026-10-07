import type { Locale } from "../locale";
import { ro, type Messages } from "./ro";
import { en } from "./en";

export type { Messages };

export const MESSAGES: Record<Locale, Messages> = { ro, en };

export function messagesFor(locale: Locale): Messages {
  return MESSAGES[locale] ?? ro;
}
