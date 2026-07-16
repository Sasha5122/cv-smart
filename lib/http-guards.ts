/** Citește body-ul JSON cu limită de mărime — un „colet" uriaș e refuzat
 *  înainte să ajungă la parsare/sharp/react-pdf (protecție DoS + cost). */
export class BodyTooLargeError extends Error {
  constructor() {
    super("Body prea mare");
    this.name = "BodyTooLargeError";
  }
}

export async function readJsonLimited<T = unknown>(
  req: Request,
  maxBytes: number
): Promise<T> {
  // verificarea rapidă pe header (poate lipsi sau minți — doar prefiltru)
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > maxBytes) throw new BodyTooLargeError();

  const text = await req.text();
  // lungimea în bytes (UTF-8), nu în caractere
  if (new TextEncoder().encode(text).length > maxBytes) {
    throw new BodyTooLargeError();
  }
  return JSON.parse(text) as T;
}

/** Limite standard, ca să nu apară numere magice prin rute. */
export const BODY_LIMITS = {
  /** cvData complet cu poză (poza normalizată are ~16–90KB) */
  CV_DATA: 2 * 1024 * 1024, // 2MB
  /** payload-uri text (anunț, răspunsuri, mesaje) */
  TEXT: 256 * 1024, // 256KB
  /** payload-uri minuscule (login, tracking) */
  TINY: 4 * 1024, // 4KB
} as const;
