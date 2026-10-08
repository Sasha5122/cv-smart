import type { Locale } from "@/lib/i18n/locale";

/** Textele pasului 2 (poza). Varianta „ro" trebuie să rămână identică cu ce vedeau userii înainte de i18n. */
const ro = {
  title: "Adaugă o poză",
  subtitle: "Candidații cu poză profesională sunt contactați cu 38% mai des de recrutori.",
  banner: {
    title: "+38% șanse mai multe cu poză profesională",
    text: "Recrutorii filtrează CV-urile în primele 6 secunde.",
  },
  tips: {
    okTitle: "Recomandat",
    noTitle: "Evită",
    ok: [
      "Cămașă/bluză curată și îngrijită",
      "Fundal alb sau neutru",
      "Față zâmbitoare, privire spre cameră",
      "Iluminare bună, fără umbre",
    ],
    no: [
      "Selfie sau foto de vacanță",
      "Ochelari de soare sau pălărie",
      "Filtre sau efecte foto",
      "Alte persoane în poză",
    ],
  },
  preview: {
    alt: "Poză de profil",
    added: "Poză adăugată",
    remove: "Șterge poza",
  },
  dropzone: {
    uploading: "Încarc poza...",
    dragPrefix: "Trage poza sau",
    dragLink: "alege din telefon sau calculator",
    formats: "JPG, PNG, WEBP sau HEIC (iPhone) · orice mărime — o redimensionăm noi",
  },
  buttons: {
    back: "← Înapoi",
    nextWithPhoto: "Continuă cu poza",
    next: "Continuă",
    skip: "Nu am poză potrivită",
  },
  errors: {
    notImage: "Acceptăm doar imagini (JPG, PNG, WEBP, HEIC)",
    tooLarge: "Imaginea e neobișnuit de mare (peste 50MB). Încearcă altă poză.",
    tooLargeDimensions: "Imaginea are dimensiuni neobișnuit de mari. Încearcă altă poză.",
    unreadable: "Nu am putut citi poza. Încearcă alta (JPG sau PNG).",
  },
};

const en: typeof ro = {
  title: "Add a photo",
  subtitle: "Candidates with a professional photo are contacted 38% more often by recruiters.",
  banner: {
    title: "+38% more chances with a professional photo",
    text: "Recruiters screen CVs in the first 6 seconds.",
  },
  tips: {
    okTitle: "Recommended",
    noTitle: "Avoid",
    ok: [
      "Clean, neat shirt or blouse",
      "White or neutral background",
      "Smiling face, looking at the camera",
      "Good lighting, no shadows",
    ],
    no: [
      "Selfies or holiday photos",
      "Sunglasses or hats",
      "Filters or photo effects",
      "Other people in the picture",
    ],
  },
  preview: {
    alt: "Profile photo",
    added: "Photo added",
    remove: "Remove photo",
  },
  dropzone: {
    uploading: "Uploading photo...",
    dragPrefix: "Drag a photo here or",
    dragLink: "choose one from your phone or computer",
    formats: "JPG, PNG, WEBP or HEIC (iPhone) · any size — we resize it for you",
  },
  buttons: {
    back: "← Back",
    nextWithPhoto: "Continue with photo",
    next: "Continue",
    skip: "I don't have a suitable photo",
  },
  errors: {
    notImage: "We only accept images (JPG, PNG, WEBP, HEIC)",
    tooLarge: "The image is unusually large (over 50MB). Try another photo.",
    tooLargeDimensions: "The image dimensions are unusually large. Try another photo.",
    unreadable: "We couldn't read the photo. Try another one (JPG or PNG).",
  },
};

export const STEP_PHOTO_MESSAGES: Record<Locale, typeof ro> = { ro, en };
