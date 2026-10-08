import type { Messages } from "./ro";

/** English (demo level): enough for a recruiter to try the product end to end. */
export const en: Messages = {
  common: {
    languageSwitch: "Language",
    back: "← Back to the home page",
  },
  header: {
    price: "Pricing",
    contact: "Contact",
    terms: "Terms",
    start: "Start",
  },
  hero: {
    title: "A professional CV, guaranteed, ready in 10 minutes",
    subtitle: "Built and optimised for the Romanian job market",
    cta: "Start now →",
  },
  home: {
    description: "CVexpres is an online service that creates professional CVs as PDF files.",
    priceLine: (price: string) => `Price: ${price} per CV, VAT included — one-time payment, no subscription.`,
    details: "See details",
  },
  pricing: {
    eyebrow: "Simple pricing",
    perCv: (eur: string) => `(${eur}) per CV as PDF`,
    included: ["Professional CV as PDF", "VAT included", "One-time payment — no subscription, no recurring charges"],
    start: "Start",
    pageTitle: "Simple pricing, no surprises",
    pageSubtitle: "You pay once, only when your CV is ready to download.",
  },
  contact: {
    title: "Contact",
    intro:
      "Have a question, a suggestion, or did something go wrong? Write to us below — your message goes straight to the CVexpres team and we reply by e-mail within 14 days (usually much sooner).",
    detailsTitle: "Contact details",
    emailLabel: "Email:",
    form: {
      name: "Your name",
      namePlaceholder: "e.g. Andreea Popescu",
      email: "Your e-mail address",
      emailPlaceholder: "e.g. andreea@email.com",
      message: "Your message",
      messagePlaceholder: "Write your question or issue here…",
      sending: "Sending…",
      submit: "Send message",
      errorGeneric: "The message could not be sent. Please try again.",
      errorNetwork: "The message could not be sent. Check your connection and try again.",
      successTitle: "Your message has been sent. Thank you!",
      successLine: (email: string) => `We will reply to ${email} within 14 days (usually much sooner).`,
    },
  },
  footer: {
    terms: "Terms and conditions",
    privacy: "Privacy policy",
    refund: "Refund policy",
    contact: "Contact",
    price: "Pricing",
    rights: "All rights reserved.",
  },
  legal: {
    romanianOnly: "This page is available in Romanian only. The Romanian text is the legally binding version.",
  },
};
