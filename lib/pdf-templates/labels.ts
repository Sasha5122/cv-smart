import type { Locale } from "@/lib/i18n/locale";

/**
 * Etichetele fixe din template-urile PDF (titluri de secțiuni, etichete de
 * câmp, rânduri compuse). Datele utilizatorului NU se traduc. Fiecare
 * variantă românească distinctă (ex. „Limbi" vs „Limbi străine") are cheia
 * ei, ca fiecare model să rămână identic în română. Cheile și formulările
 * în engleză sunt aliniate cu lib/i18n/wizard/preview-labels.ts.
 */
const ro = {
  /* — secțiuni principale — */
  experience: "Experiență profesională",
  experienceShort: "Experiență",
  education: "Educație",
  skills: "Competențe",
  languages: "Limbi străine",
  languagesShort: "Limbi",
  hobbies: "Hobby-uri",
  hobbiesLabel: "Hobby-uri:",
  hobbyShort: "Hobby",
  interests: "Interese",
  interestsLanguages: "Interese & Limbi",
  profile: "Profil",
  profilePersonal: "Profil personal",
  summary: "Rezumat",
  objective: "Obiectiv",
  about: "Despre mine",
  courses: "Cursuri & certificări",
  certifications: "Certificări",
  certification: "Certificare",
  certificationsQualifications: "Certificări & Calificări",
  qualifications: "Calificări",
  licenseQualifications: "Permis & Calificări",
  license: "Permis de conducere",
  licenseShort: "Permis",
  category: "categoria",
  licenseLine: (cats: string) => `Permis de conducere: categoria ${cats}`,
  licenseShortLine: (cats: string) => `Permis categoria ${cats}`,
  extra: "Extra",
  otherInfo: "Alte informații",
  atAGlance: "Pe scurt",
  software: "Software",
  technical: "Tehnice",
  personal: "Personale",

  /* — contact — */
  contact: "Contact",
  contactInfo: "Informații de contact",
  phone: "Telefon",
  address: "Adresă",
  email: "Email",
  linkedin: "LinkedIn",
  city: "Oraș",

  /* — intrări (educație / experiență) — */
  from: "De la:",
  to: "Până la:",
  inField: (field: string) => ` în ${field}`,
  gradeLine: (grade: string) => `Medie: ${grade}`,
  thesisLine: (thesis: string) => `Lucrare: „${thesis}"`,

  /* — placeholdere nume — */
  firstName: "Prenume",
  lastName: "Nume",
  fullName: "Prenume Nume",
};

const en: typeof ro = {
  experience: "Professional experience",
  experienceShort: "Experience",
  education: "Education",
  skills: "Skills",
  languages: "Languages",
  languagesShort: "Languages",
  hobbies: "Hobbies",
  hobbiesLabel: "Hobbies:",
  hobbyShort: "Hobbies",
  interests: "Interests",
  interestsLanguages: "Interests & languages",
  profile: "Profile",
  profilePersonal: "Personal profile",
  summary: "Summary",
  objective: "Objective",
  about: "About me",
  courses: "Courses & certifications",
  certifications: "Certifications",
  certification: "Certification",
  certificationsQualifications: "Certifications & qualifications",
  qualifications: "Qualifications",
  licenseQualifications: "Licence & qualifications",
  license: "Driving licence",
  licenseShort: "Licence",
  category: "category",
  licenseLine: (cats: string) => `Driving licence: category ${cats}`,
  licenseShortLine: (cats: string) => `Licence category ${cats}`,
  extra: "Extra",
  otherInfo: "Other information",
  atAGlance: "At a glance",
  software: "Software",
  technical: "Technical",
  personal: "Personal",

  contact: "Contact",
  contactInfo: "Contact details",
  phone: "Phone",
  address: "Address",
  email: "Email",
  linkedin: "LinkedIn",
  city: "City",

  from: "From:",
  to: "To:",
  inField: (field: string) => ` in ${field}`,
  gradeLine: (grade: string) => `Grade: ${grade}`,
  thesisLine: (thesis: string) => `Thesis: “${thesis}”`,

  firstName: "First name",
  lastName: "Last name",
  fullName: "Your name",
};

export type PdfLabels = typeof ro;
export const PDF_LABELS: Record<Locale, PdfLabels> = { ro, en };
export function pdfLabels(locale: Locale): PdfLabels {
  return PDF_LABELS[locale] ?? ro;
}
