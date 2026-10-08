import { cookies } from "next/headers";
import { LOCALE_COOKIE, toLocale, type Locale } from "./locale";
import { messagesFor, type Messages } from "./messages";

/** Limba curentă, din cookie — doar în componente/rute de server. */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return toLocale(store.get(LOCALE_COOKIE)?.value);
}

/** Textele interfeței pentru limba curentă — doar pe server. */
export async function getT(): Promise<Messages> {
  return messagesFor(await getLocale());
}
