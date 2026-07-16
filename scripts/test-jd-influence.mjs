// Verifică REAL (AI, nu mock) dacă anunțul jobului (job description)
// influențează abilitățile și rezumatul generate. Rulează același profil
// cu și fără JD și numără cuvintele-cheie distinctive din anunț care apar.
const BASE = "http://localhost:3000";

const CV = {
  personal: { firstName: "Mihai", lastName: "Georgescu", email: "m@test.ro", phone: "0723000111", city: "Timișoara" },
  experience: [
    {
      title: "Coordonator Depozit",
      company: "LogiPartner Distribution SRL",
      period: "2019 – prezent",
      responsibilities: [
        "Coordonarea activităților operaționale ale depozitului de 4.000 mp, cu organizarea recepțiilor de marfă și a livrărilor către magazine.",
        "Coordonarea unei echipe de 12 oameni, organizată pe 2 schimburi.",
        "Gestionarea zilnică a operațiunilor în WMS, prin efectuarea recepțiilor și a inventarelor cu scannere.",
        "Întocmirea și urmărirea rapoartelor operaționale în Excel.",
      ],
      achievements: [],
    },
  ],
  education: [{ level: "Liceu", institution: "Liceul Tehnologic Henri Coandă", period: "1996 – 2000", field: "" }],
  courses: [{ name: "Operator stivuitor autorizat ISCIR", year: "2017" }],
  skills: [],
  languages: [{ name: "Engleză", level: "A2" }],
  license: { hasLicense: true, categories: ["B", "C"] },
  qualifications: "",
  hobbies: [],
};

// cuvinte-cheie DISTINCTIVE, care nu apar deloc în profilul de mai sus —
// pot ajunge în rezultat doar dacă AI-ul chiar citește anunțul
const JD = `Căutăm Șef Depozit Logistică pentru centru de distribuție FMCG.
Cerințe: experiență cu SAP EWM, inventariere ciclică, indicatori OTIF,
cross-docking, norme HACCP, coordonare echipe. Constituie avantaj
cunoașterea FIFO/FEFO și experiența cu retail.`;

const KEYWORDS = ["SAP", "OTIF", "cross-docking", "HACCP", "FIFO", "FEFO", "inventariere ciclică"];

function countHits(text) {
  const lower = text.toLowerCase();
  return KEYWORDS.filter((k) => lower.includes(k.toLowerCase()));
}

async function skills(jobDescription) {
  const res = await fetch(`${BASE}/api/ai/generate-skills`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cvData: CV, jobDescription }),
  });
  if (!res.ok) throw new Error(`skills HTTP ${res.status}`);
  const j = await res.json();
  return [...j.hardSkills, ...j.softwareTools, ...j.softSkills];
}

async function summary(jobDescription) {
  const res = await fetch(`${BASE}/api/ai/summary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cvData: CV, jobDescription }),
  });
  if (!res.ok) throw new Error(`summary HTTP ${res.status}`);
  return (await res.json()).summary;
}

console.log("── Abilități FĂRĂ anunț ──");
const s0 = await skills(undefined);
console.log(s0.join(" · "));
console.log("potriviri cu anunțul:", countHits(s0.join(" ")));

console.log("\n── Abilități CU anunț ──");
const s1 = await skills(JD);
console.log(s1.join(" · "));
console.log("potriviri cu anunțul:", countHits(s1.join(" ")));

console.log("\n── Rezumat FĂRĂ anunț ──");
const r0 = await summary(undefined);
console.log(r0);

console.log("\n── Rezumat CU anunț ──");
const r1 = await summary(JD);
console.log(r1);
console.log("\npotriviri rezumat fără:", countHits(r0), "| cu:", countHits(r1));
