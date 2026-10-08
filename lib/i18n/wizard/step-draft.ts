import type { Locale } from "@/lib/i18n/locale";
import type { TemplateId } from "@/lib/types/cv";

/**
 * Textele pasului final „Finalizare" (step-14-draft). Varianta română e sursa
 * de adevăr — trebuie să rămână identică cu ce vedeau utilizatorii înainte de
 * i18n (testele e2e verifică aceste texte). `en` e tipat după `ro`.
 */
const ro = {
  header: {
    kicker: "Finalizare",
    title: "CV-ul tău e gata.",
    subtitle: "Alege designul care ți se potrivește — exact așa va arăta PDF-ul descărcat.",
  },
  templates: {
    pickerLabel: "Alege designul CV-ului",
    items: {
      classic: { label: "Clasic", hint: "echilibrat, accente albastre" },
      modern: { label: "Modern", hint: "sidebar închis la culoare" },
      elegant: { label: "Elegant", hint: "serif, accente aurii" },
      compact: { label: "Compact", hint: "dens, o singură pagină" },
      minimal: { label: "Minimalist", hint: "alb-negru, aerisit" },
      meridian: { label: "Meridian", hint: "antet navy, accente verzi" },
      velvet: { label: "Velvet", hint: "sidebar prună, bandă mov" },
      riviera: { label: "Riviera", hint: "panglică teal, poză mare" },
      flamingo: { label: "Flamingo", hint: "curbe roz, panou gri" },
      atlantic: { label: "Atlantic", hint: "banner albastru, poză centrată" },
      petrol: { label: "Petrol", hint: "antet teal, dens, poză pătrată" },
      manhattan: { label: "Manhattan", hint: "nume mare albastru, grilă" },
      blush: { label: "Blush", hint: "pastel roz, forme geometrice" },
      sage: { label: "Sage", hint: "panou verde salvie, serif" },
      graphite: { label: "Graphite", hint: "coloană slate, bare de titlu" },
      cobalt: { label: "Cobalt", hint: "albastru regal, pill-uri" },
      amber: { label: "Amber", hint: "antracit cu galben, timeline" },
      sterling: { label: "Sterling", hint: "gri pal, accente albastre" },
      sapphire: { label: "Sapphire", hint: "cyan + navy, accente galbene" },
    } satisfies Record<TemplateId, { label: string; hint: string }>,
  },
  summary: {
    writing: "Scriem rezumatul tău profesional…",
  },
  paywall: {
    preparing: "Se pregătește…",
    download: "Descarcă PDF",
    payAndDownload: (price: string) => `Plătește și descarcă — ${price}`,
    priceNote: (price: string) =>
      `${price} · plată unică, TVA inclus · plata se procesează securizat în EUR prin Paddle`,
    back: "← Înapoi",
    termsRequiredToContinue: "Pentru a continua, bifează mai întâi acordul cu Termenii și condițiile.",
    termsRequiredToDownload: "Pentru a descărca CV-ul, bifează mai întâi acordul cu Termenii și condițiile.",
    cannotStart: "Plata nu poate fi inițiată acum. Reîncarcă pagina și încearcă din nou.",
    checkoutFailed: "Checkout-ul nu s-a putut deschide. Încearcă din nou.",
    confirmedPreparingPdf: "Plată confirmată. Îți pregătim PDF-ul…",
    confirmedPreparingCv: "Plată confirmată! Îți pregătim CV-ul…",
    notConfirmedAuto:
      "Nu am putut confirma plata automat. Dacă ai plătit, verifică emailul — CV-ul a fost trimis acolo.",
    notConfirmedYet:
      "Plata nu a fost confirmată încă. Dacă ai plătit, așteaptă câteva secunde și încearcă din nou.",
  },
  terms: {
    prefix: "Am luat la cunoștință și sunt de acord cu",
    termsLink: "Termenii și condițiile",
    and: "și cu",
    privacyLink: "Politica de confidențialitate",
    suffix:
      ". Solicit executarea imediată a serviciului și înțeleg că îmi pierd dreptul de retragere odată cu descărcarea CV-ului.",
  },
  promo: {
    toggle: "Ai un cod de reducere?",
    placeholder: "Codul tău",
    apply: "Aplică",
    invalid: "Cod invalid sau expirat.",
    acceptedWithEmail: "Cod acceptat! Ți-am trimis CV-ul și pe email. Îl descărcăm acum…",
    accepted: "Cod acceptat! Îți descărcăm CV-ul…",
  },
  download: {
    doneIos: "PDF descărcat — îl găsești în Descărcări (săgeata din Safari) sau în Fișiere.",
    doneAndroid: "PDF salvat în folderul Descărcări. Succes la aplicare! 🎉",
    doneDesktop: "CV-ul a fost descărcat. Succes la aplicare! 🎉",
    error: "Eroare la generarea PDF-ului. Încearcă din nou.",
  },
  paid: {
    title: "CV-ul tău e gata! ✔",
    emailSentPrefix: "Ți l-am trimis și pe email la ",
    emailSentSuffix: " — cu PDF-ul atașat.",
    redownloadNote: "Poți re-descărca CV-ul oricând în următoarele 30 de zile din emailul primit.",
    finalPrefix: "CV-ul plătit e ",
    finalWord: "final",
    finalSuffix: " — pentru modificări sau un CV nou, apasă „Începe de la zero” mai jos (proces nou, plată nouă).",
    downloadAgain: "⬇ Descarcă PDF-ul",
    whatsapp: "💬 Trimite pe WhatsApp",
    androidHintPrefix: "După descărcare, CV-ul e în folderul ",
    androidHintFolder: "Descărcări",
    androidHintSuffix: ". Îl găsești și trăgând în jos bara de notificări.",
    iosHintPrefix: "PDF-ul descărcat îl găsești în ",
    iosHintFolder: "Descărcări",
    iosHintMiddle: " (săgeata din bara Safari) sau în aplicația ",
    iosHintApp: "Fișiere",
    iosHintSuffix: " — ori trimite-l direct pe WhatsApp de mai sus.",
  },
  share: {
    button: "📤 Trimite CV-ul — WhatsApp, Email, Salvează…",
    title: "CV-ul meu",
    text: "CV-ul meu, creat cu CVexpres",
  },
  restart: {
    button: "↺ Începe de la zero",
    confirm: "Sigur vrei să începi de la zero? Toate datele introduse se vor șterge definitiv.",
  },
};

const en: typeof ro = {
  header: {
    kicker: "Finish",
    title: "Your CV is ready.",
    subtitle: "Pick the design that suits you — the downloaded PDF will look exactly like this.",
  },
  templates: {
    pickerLabel: "Choose the CV design",
    items: {
      classic: { label: "Classic", hint: "balanced, blue accents" },
      modern: { label: "Modern", hint: "dark sidebar" },
      elegant: { label: "Elegant", hint: "serif, gold accents" },
      compact: { label: "Compact", hint: "dense, single page" },
      minimal: { label: "Minimal", hint: "black and white, airy" },
      meridian: { label: "Meridian", hint: "navy header, green accents" },
      velvet: { label: "Velvet", hint: "plum sidebar, purple band" },
      riviera: { label: "Riviera", hint: "teal ribbon, large photo" },
      flamingo: { label: "Flamingo", hint: "pink curves, grey panel" },
      atlantic: { label: "Atlantic", hint: "blue banner, centred photo" },
      petrol: { label: "Petrol", hint: "teal header, dense, square photo" },
      manhattan: { label: "Manhattan", hint: "large blue name, grid" },
      blush: { label: "Blush", hint: "pastel pink, geometric shapes" },
      sage: { label: "Sage", hint: "sage green panel, serif" },
      graphite: { label: "Graphite", hint: "slate column, title bars" },
      cobalt: { label: "Cobalt", hint: "royal blue, pills" },
      amber: { label: "Amber", hint: "charcoal with yellow, timeline" },
      sterling: { label: "Sterling", hint: "pale grey, blue accents" },
      sapphire: { label: "Sapphire", hint: "cyan + navy, yellow accents" },
    },
  },
  summary: {
    writing: "Writing your professional summary…",
  },
  paywall: {
    preparing: "Getting ready…",
    download: "Download PDF",
    payAndDownload: (price: string) => `Pay and download — ${price}`,
    priceNote: (price: string) =>
      `${price} · one-time payment, VAT included · payment is processed securely in EUR by Paddle`,
    back: "← Back",
    termsRequiredToContinue: "To continue, first tick the box to accept the Terms and conditions.",
    termsRequiredToDownload: "To download your CV, first tick the box to accept the Terms and conditions.",
    cannotStart: "Payment cannot be started right now. Reload the page and try again.",
    checkoutFailed: "The checkout could not be opened. Please try again.",
    confirmedPreparingPdf: "Payment confirmed. Preparing your PDF…",
    confirmedPreparingCv: "Payment confirmed! Preparing your CV…",
    notConfirmedAuto:
      "We could not confirm the payment automatically. If you paid, check your e-mail — the CV was sent there.",
    notConfirmedYet:
      "The payment has not been confirmed yet. If you paid, wait a few seconds and try again.",
  },
  terms: {
    prefix: "I have read and agree to the",
    termsLink: "Terms and conditions",
    and: "and the",
    privacyLink: "Privacy policy",
    suffix:
      ". I request immediate performance of the service and understand that I lose my right of withdrawal once the CV is downloaded.",
  },
  promo: {
    toggle: "Have a discount code?",
    placeholder: "Your code",
    apply: "Apply",
    invalid: "Invalid or expired code.",
    acceptedWithEmail: "Code accepted! We also e-mailed you the CV. Downloading it now…",
    accepted: "Code accepted! Downloading your CV…",
  },
  download: {
    doneIos: "PDF downloaded — find it in Downloads (the arrow in Safari) or in Files.",
    doneAndroid: "PDF saved to the Downloads folder. Good luck with your application! 🎉",
    doneDesktop: "Your CV has been downloaded. Good luck with your application! 🎉",
    error: "Error generating the PDF. Please try again.",
  },
  paid: {
    title: "Your CV is ready! ✔",
    emailSentPrefix: "We also sent it by e-mail to ",
    emailSentSuffix: " — with the PDF attached.",
    redownloadNote: "You can re-download your CV at any time in the next 30 days from the e-mail you received.",
    finalPrefix: "A paid CV is ",
    finalWord: "final",
    finalSuffix: " — for changes or a new CV, press “Start from scratch” below (new process, new payment).",
    downloadAgain: "⬇ Download the PDF",
    whatsapp: "💬 Send on WhatsApp",
    androidHintPrefix: "After downloading, your CV is in the ",
    androidHintFolder: "Downloads",
    androidHintSuffix: " folder. You can also find it by pulling down the notification bar.",
    iosHintPrefix: "You can find the downloaded PDF in ",
    iosHintFolder: "Downloads",
    iosHintMiddle: " (the arrow in the Safari bar) or in the ",
    iosHintApp: "Files",
    iosHintSuffix: " app — or send it straight to WhatsApp from above.",
  },
  share: {
    button: "📤 Send your CV — WhatsApp, Email, Save…",
    title: "My CV",
    text: "My CV, created with CVexpres",
  },
  restart: {
    button: "↺ Start from scratch",
    confirm: "Are you sure you want to start from scratch? All the data you entered will be permanently deleted.",
  },
};

export const STEP_DRAFT_MESSAGES: Record<Locale, typeof ro> = { ro, en };
