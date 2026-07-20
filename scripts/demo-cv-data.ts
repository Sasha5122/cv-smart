import { readFileSync } from "node:fs";
import path from "node:path";
import type { CVData } from "@/lib/types/cv";

/** Poza demo (față decupată din model-07, trecută prin pipeline-ul aplicației). */
const photo = JSON.parse(
  readFileSync(path.join(process.cwd(), "scripts", "demo-photo.json"), "utf8")
) as { photoUrl: string };

/** Date demo românești realiste — folosite la toate exemplele de template. */
export const DEMO_CV: CVData = {
  personal: {
    firstName: "Andrei",
    lastName: "Munteanu",
    email: "andrei.munteanu@gmail.com",
    phone: "0721 456 789",
    city: "Cluj-Napoca",
    county: "Cluj",
    country: "România",
    street: "Str. Avram Iancu",
    streetNumber: "24",
    apartment: "7",
    linkedin: "linkedin.com/in/andrei-munteanu",
    photoUrl: photo.photoUrl,
  },
  targetTitle: "Manager de Proiect",
  summary:
    "Manager de proiect cu peste 7 ani de experiență în coordonarea echipelor multidisciplinare și livrarea proiectelor la termen și în buget. Orientat spre rezultate, comunicare clară și optimizarea proceselor.",
  experience: [
    {
      title: "Manager de Proiect",
      company: "Tech Solutions SRL",
      location: "Cluj-Napoca",
      period: "iunie 2021 – prezent",
      responsibilities: [
        "Coordonarea unei echipe de 12 specialiști pe proiecte software cu bugete de până la 500.000 €.",
        "Implementarea metodologiei Agile, cu reducerea timpului de livrare cu 30%.",
        "Gestionarea relației cu clienții internaționali și raportarea săptămânală a progresului.",
        "Optimizarea proceselor interne prin automatizarea raportării, economisind 8 ore pe săptămână.",
      ],
      achievements: [],
    },
    {
      title: "Coordonator de Proiect",
      company: "Digital Works SRL",
      location: "Cluj-Napoca",
      period: "2018 – 2021",
      responsibilities: [
        "Planificarea și urmărirea a peste 20 de proiecte de dezvoltare web anual.",
        "Întocmirea bugetelor și a rapoartelor de risc pentru management.",
        "Facilitarea comunicării între echipele de dezvoltare și departamentul de vânzări.",
      ],
      achievements: [],
    },
  ],
  education: [
    {
      level: "Master",
      field: "Managementul Proiectelor",
      institution: "Universitatea Babeș-Bolyai",
      location: "Cluj-Napoca",
      years: "2016 – 2018",
      thesis: "Metode Agile în proiectele IT românești",
      grade: "9.70",
    },
    {
      level: "Licență",
      field: "Cibernetică și Informatică Economică",
      institution: "Universitatea Babeș-Bolyai",
      location: "Cluj-Napoca",
      years: "2013 – 2016",
    },
  ],
  courses: [
    { name: "Professional Scrum Master I (PSM I)", provider: "Scrum.org", year: "2022" },
    { name: "PRINCE2 Foundation", provider: "AXELOS", year: "2020" },
  ],
  skills: [
    { name: "Management de proiect", category: "hard" },
    { name: "Metodologii Agile & Scrum", category: "hard" },
    { name: "Planificare bugete", category: "hard" },
    { name: "Analiză de risc", category: "hard" },
    { name: "Jira", category: "software" },
    { name: "MS Project", category: "software" },
    { name: "Excel avansat", category: "software" },
    { name: "Comunicare", category: "soft" },
    { name: "Leadership", category: "soft" },
  ],
  languages: [
    { name: "Engleză", level: "C1 - Avansat" },
    { name: "Franceză", level: "B1 - Intermediar" },
  ],
  license: { hasLicense: true, categories: ["B"] },
  qualifications: "Certificat Scrum Master, Certificat Managementul Riscului",
  hobbies: ["Alergare montană", "Fotografie", "Șah"],
};
