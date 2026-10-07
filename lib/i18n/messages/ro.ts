/**
 * Textele interfeței în română — sursa de adevăr. Trebuie să rămână identice
 * cu ce vedeau utilizatorii înainte de i18n. `en.ts` e tipat după acest obiect,
 * deci orice cheie lipsă în engleză e eroare de compilare.
 */
export const ro = {
  common: {
    languageSwitch: "Limba",
    back: "← Înapoi la pagina principală",
  },
  header: {
    price: "Preț",
    contact: "Contact",
    terms: "Termeni și condiții",
    start: "Începe",
  },
  hero: {
    title: "Garantăm un CV profesionist, gata în 10 minute",
    subtitle: "Dezvoltat și optimizat special pentru piața din România",
    cta: "Începe acum →",
  },
  home: {
    description: "CVexpres este un serviciu online de creare a CV-urilor profesioniste în format PDF.",
    priceLine: (price: string) => `Preț: ${price} per CV, cu TVA inclus — plată unică, fără abonament.`,
    details: "Vezi detalii",
  },
  pricing: {
    eyebrow: "Preț simplu",
    perCv: (eur: string) => `(${eur}) / CV în format PDF`,
    included: [
      "CV profesionist în format PDF",
      "TVA inclus",
      "Plată unică — fără abonament, fără plăți recurente",
    ],
    start: "Începe",
    pageTitle: "Preț simplu, fără surprize",
    pageSubtitle: "Plătești o singură dată, doar când CV-ul tău e gata de descărcat.",
  },
  contact: {
    title: "Contact",
    intro:
      "Ai o întrebare, o sugestie sau ceva nu a mers cum trebuia? Scrie-ne mai jos — mesajul ajunge direct la echipa CVexpres și îți răspundem pe e-mail în cel mult 14 zile (de regulă mult mai repede).",
    detailsTitle: "Date de contact",
    emailLabel: "Email:",
    form: {
      name: "Numele tău",
      namePlaceholder: "ex: Andreea Popescu",
      email: "Adresa ta de e-mail",
      emailPlaceholder: "ex: andreea@email.com",
      message: "Mesajul tău",
      messagePlaceholder: "Scrie aici întrebarea sau problema ta…",
      sending: "Se trimite…",
      submit: "Trimite mesajul",
      errorGeneric: "Mesajul nu a putut fi trimis. Încearcă din nou.",
      errorNetwork: "Mesajul nu a putut fi trimis. Verifică conexiunea și încearcă din nou.",
      successTitle: "Mesajul a fost trimis. Mulțumim!",
      successLine: (email: string) => `Îți vom răspunde la adresa ${email} în cel mult 14 zile (de regulă mult mai repede).`,
    },
  },
  footer: {
    terms: "Termeni și condiții",
    privacy: "Politica de confidențialitate",
    refund: "Politica de rambursare",
    contact: "Contact",
    price: "Preț",
    rights: "Toate drepturile rezervate.",
  },
  legal: {
    /** afișat doar când interfața e în engleză */
    romanianOnly: "",
  },
};

export type Messages = typeof ro;
