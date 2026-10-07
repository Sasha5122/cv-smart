import type { Locale } from "@/lib/i18n/locale";

/** Textele pasului „Experiență” (wizard, pasul 4): input → întrebări → selecție → rezumat, plus ruta manuală. */
const ro = {
  loading: {
    hint: "durează câteva zeci de secunde",
    analyze: [
      "Citim ce ne-ai povestit…",
      "Extragem faptele care contează…",
      "Căutăm golurile dintr-un CV puternic…",
      "Pregătim 5 întrebări țintite…",
    ],
    generate: [
      "Punem totul cap la cap…",
      "Scriem descrierile ca un recrutor…",
      "Verificăm fiecare cifră — nimic inventat…",
      "Ordonăm de la cel mai puternic…",
    ],
    generateHint: "poate dura până la un minut — scriem cu grijă",
  },
  errors: {
    analyzeFailed: "Analiza a eșuat.",
    generateFailed: "Generarea a eșuat.",
    selectionSaveFailed: "Salvarea selecției a eșuat.",
    saveFailed: "Salvarea a eșuat.",
  },
  toasts: {
    jobAdded: "Jobul a fost adăugat în CV.",
    manualNotRewritten:
      "Nu am putut rescrie descrierile acum — textul tău a fost păstrat exact cum l-ai scris.",
  },
  summary: {
    kicker: "Experiență profesională",
    title: "Joburile tale, negru pe alb.",
    subtitle:
      "Fiecare job trece printr-un mic interviu cu AI-ul — descrierile rezultate sunt scrise ca de un recrutor.",
    deleteAria: (title: string) => `Șterge ${title}`,
    editAria: (n: number, title: string) => `Editează descrierea ${n} de la ${title}`,
    editHint: "Poți edita descrierile direct — se salvează automat în CV.",
    addFirst: "Adaugă experiența de la cel mai recent job",
    addAnother: "Adaugă experiența de la jobul precedent",
    back: "← Înapoi",
    next: "Continuă",
  },
  input: {
    kicker: "Experiență · Pas 1 din 3",
    analyzingTitle: "Analizăm experiența ta",
    title: "Povestește-ne ce faci la job.",
    subtitle:
      "Scrie liber, ca și cum i-ai povesti unui prieten. Fără formulări pretențioase — de asta ne ocupăm noi.",
    anchoredBadge: "Ancorat pe anunțul tău din Pasul 1",
    jobTitleLabel: "Funcția / titlul jobului *",
    jobTitlePlaceholder: "ex: Contabil",
    companyLabel: "Compania",
    companyPlaceholder: "ex: SC Exemplu SRL",
    locationLabel: "Localitatea",
    locationPlaceholder: "ex: Cluj-Napoca",
    rawTextLabel: "Ce faci acolo, cu cuvintele tale? *",
    rawTextPlaceholder:
      "Descrie cu cuvintele tale ce faci la job, ca și cum i-ai povesti unui prieten. Nu-ți face griji de formulare.",
    rawTextHint: "Cu cât povestești mai mult, cu atât descrierile generate vor fi mai bune.",
    back: "← Înapoi",
    analyze: "Analizează",
    manualLink: "Prefer să scriu descrierile manual",
  },
  questions: {
    kicker: "Experiență · Pas 2 din 3",
    generatingTitle: "Scriem descrierile",
    title: "5 întrebări, ca la un interviu bun.",
    subtitle:
      "Răspunde scurt și concret — cifre, exemple, denumiri. Poți sări peste unele, dar minim 3 răspunsuri fac diferența.",
    progress: (answered: number, total: number) => `${answered}/${total} răspunsuri`,
    answerPlaceholder: "Răspunsul tău… (sau lasă gol)",
    back: "← Înapoi",
    answerMin: (answered: number) => `Răspunde la minim 3 (${answered}/3)`,
    generate: "Generează descrierile",
  },
  select: {
    kicker: "Experiență · Pas 3 din 3",
    title: "Alege ce te reprezintă.",
    subtitle: (min: number) =>
      `Toate sunt ancorate strict în ce ne-ai spus — nimic inventat. Alege minim ${min}; poți bifa toate dacă ți se potrivesc.`,
    generatedCount: (n: number) => `${n} descrieri generate`,
    chosen: (n: number, min: number) => `Ai ales ${n} (minim ${min})`,
    regenerate: "Regenerează",
    finish: "Finalizează",
    chooseMin: (min: number) => `Alege minim ${min} descrieri`,
  },
  manual: {
    kicker: "Experiență · manual",
    title: "Scrie descrierile manual.",
    subtitle: "Câte o responsabilitate pe rând. Le poți rafina mai târziu, la draftul final.",
    jobTitleLabel: "Funcția *",
    jobTitlePlaceholder: "ex: Contabil",
    companyLabel: "Compania",
    companyPlaceholder: "ex: SC Exemplu SRL",
    locationLabel: "Localitatea",
    locationPlaceholder: "ex: Cluj-Napoca",
    responsibilitiesLabel: "Responsabilități (una pe rând)",
    responsibilitiesPlaceholder: "Coordonarea unei echipe de 3 colegi\nGestionarea facturilor lunare\n…",
    rewriteNote: "Le rescriem automat în stil profesionist de CV la salvare.",
    backToAi: "Înapoi la AI",
    save: "Salvează jobul",
  },
};

const en: typeof ro = {
  loading: {
    hint: "this takes a few dozen seconds",
    analyze: [
      "Reading what you told us…",
      "Pulling out the facts that matter…",
      "Looking for the gaps in a strong CV…",
      "Preparing 5 targeted questions…",
    ],
    generate: [
      "Putting it all together…",
      "Writing the descriptions like a recruiter…",
      "Checking every number — nothing made up…",
      "Ordering from strongest to weakest…",
    ],
    generateHint: "can take up to a minute — we write carefully",
  },
  errors: {
    analyzeFailed: "The analysis failed.",
    generateFailed: "Generation failed.",
    selectionSaveFailed: "Saving your selection failed.",
    saveFailed: "Saving failed.",
  },
  toasts: {
    jobAdded: "The job has been added to your CV.",
    manualNotRewritten:
      "We could not rewrite the descriptions right now — your text was kept exactly as you wrote it.",
  },
  summary: {
    kicker: "Work experience",
    title: "Your jobs, in black and white.",
    subtitle:
      "Each job goes through a short interview with the AI — the resulting descriptions read as if a recruiter wrote them.",
    deleteAria: (title: string) => `Delete ${title}`,
    editAria: (n: number, title: string) => `Edit description ${n} at ${title}`,
    editHint: "You can edit the descriptions directly — they are saved to your CV automatically.",
    addFirst: "Add the experience from your most recent job",
    addAnother: "Add the experience from your previous job",
    back: "← Back",
    next: "Continue",
  },
  input: {
    kicker: "Experience · Step 1 of 3",
    analyzingTitle: "Analysing your experience",
    title: "Tell us what you do at work.",
    subtitle:
      "Write freely, as if you were telling a friend. No fancy wording — we take care of that.",
    anchoredBadge: "Anchored to your job ad from Step 1",
    jobTitleLabel: "Job title *",
    jobTitlePlaceholder: "e.g. Accountant",
    companyLabel: "Company",
    companyPlaceholder: "e.g. Example Ltd",
    locationLabel: "Location",
    locationPlaceholder: "e.g. Cluj-Napoca",
    rawTextLabel: "What do you do there, in your own words? *",
    rawTextPlaceholder:
      "Describe in your own words what you do at work, as if you were telling a friend. Don't worry about the wording.",
    rawTextHint: "The more you tell us, the better the generated descriptions will be.",
    back: "← Back",
    analyze: "Analyse",
    manualLink: "I'd rather write the descriptions myself",
  },
  questions: {
    kicker: "Experience · Step 2 of 3",
    generatingTitle: "Writing the descriptions",
    title: "5 questions, like in a good interview.",
    subtitle:
      "Answer briefly and concretely — numbers, examples, names. You can skip some, but at least 3 answers make the difference.",
    progress: (answered: number, total: number) => `${answered}/${total} answers`,
    answerPlaceholder: "Your answer… (or leave blank)",
    back: "← Back",
    answerMin: (answered: number) => `Answer at least 3 (${answered}/3)`,
    generate: "Generate the descriptions",
  },
  select: {
    kicker: "Experience · Step 3 of 3",
    title: "Pick what represents you.",
    subtitle: (min: number) =>
      `All of them are strictly anchored in what you told us — nothing made up. Pick at least ${min}; you can tick all of them if they fit.`,
    generatedCount: (n: number) => `${n} descriptions generated`,
    chosen: (n: number, min: number) => `You picked ${n} (minimum ${min})`,
    regenerate: "Regenerate",
    finish: "Finish",
    chooseMin: (min: number) => `Pick at least ${min} descriptions`,
  },
  manual: {
    kicker: "Experience · manual",
    title: "Write the descriptions yourself.",
    subtitle: "One responsibility per line. You can refine them later, in the final draft.",
    jobTitleLabel: "Job title *",
    jobTitlePlaceholder: "e.g. Accountant",
    companyLabel: "Company",
    companyPlaceholder: "e.g. Example Ltd",
    locationLabel: "Location",
    locationPlaceholder: "e.g. Cluj-Napoca",
    responsibilitiesLabel: "Responsibilities (one per line)",
    responsibilitiesPlaceholder: "Coordinating a team of 3 colleagues\nManaging the monthly invoices\n…",
    rewriteNote: "We automatically rewrite them in a professional CV style when you save.",
    backToAi: "Back to AI",
    save: "Save job",
  },
};

export const STEP_EXPERIENCE_MESSAGES: Record<Locale, typeof ro> = { ro, en };
