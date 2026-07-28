/** Datele operatorului — sursa unică pentru paginile legale și contact.
 *  La trecerea pe firmă se modifică DOAR aici.
 *  Regula de plasare discretă: numele/emailul/telefonul apar exclusiv în
 *  corpul Termenilor (secț. 1), al Politicii de confidențialitate (secț. 1),
 *  pe /contact și pe /refund (doar emailul) — nicăieri altundeva. */
export const LEGAL = {
  operatorName: "Alexandru Betivu",
  operatorType: "persoană fizică", // devine "SRL ..." la înființarea firmei
  contactEmail: "support@cvexpres.ro",
  contactPhone: "+373 602 441 59",
  siteUrl: "https://cvexpres.ro", // domeniul de producție
  priceText: "prețul afișat în pagina de comandă la momentul plasării acesteia",
};
