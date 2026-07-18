/**
 * Prețul produsului — UN SINGUR loc de modificat.
 * Paddle (Merchant of Record) nu suportă RON, deci plata se procesează în EUR;
 * pe site prețul se afișează mereu în lei, cu echivalentul EUR în paranteză.
 */
export const PRICE_RON = "49 lei";
export const PRICE_EUR = "9,99 €";
/** Formatul standard cerut: RON cu EUR în paranteză. */
export const PRICE_DISPLAY = `${PRICE_RON} (${PRICE_EUR})`;
