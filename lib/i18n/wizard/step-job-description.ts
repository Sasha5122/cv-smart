import type { Locale } from "@/lib/i18n/locale";

/** Textele pasului „Unde aplici" (descrierea jobului). Româna rămâne identică cu versiunea de dinainte de i18n. */
const ro = {
  title: "Ce job vrei să obții?",
  subtitle:
    "Fă copy-paste la descrierea jobului pentru care vrei să aplici. CV-ul tău va fi personalizat exact pentru acel job ca să ai șanse maxime pentru interviu și angajare.",
  placeholder:
    "Fă copy-paste la descrierea jobului de pe eJobs, BestJobs, LinkedIn... sau scrie jobul dorit (ex: Vânzător la Lidl)",
  hint: "Cu cât descrierea e mai completă, cu atât CV-ul va fi mai bine adaptat pentru acel job",
  anchored: "CV-ul va fi ancorat pe acest anunț — vocabular, cerințe, ordine.",
  back: "← Înapoi",
  continue: "Continuă",
  skip: "Nu am un anunț — continuă cu un CV general",
};

const en: typeof ro = {
  title: "What job do you want?",
  subtitle:
    "Paste the description of the job you want to apply for. Your CV will be tailored to that exact job to give you the best chance of landing the interview and the role.",
  placeholder:
    "Paste the job description from eJobs, BestJobs, LinkedIn... or type the job you want (e.g. Sales assistant at Lidl)",
  hint: "The more complete the description, the better your CV will be adapted to that job",
  anchored: "Your CV will be anchored to this listing — vocabulary, requirements, order.",
  back: "← Back",
  continue: "Continue",
  skip: "I don't have a listing — continue with a general CV",
};

export const STEP_JOB_DESCRIPTION_MESSAGES: Record<Locale, typeof ro> = { ro, en };
