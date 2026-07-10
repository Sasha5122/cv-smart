/** Generează un PDF de probă prin ruta reală (POST, fără DB) și-l salvează. */
import { writeFileSync } from "fs";

const cvData = {
  personal: {
    firstName: "Elena",
    lastName: "Stanciu",
    email: "elena.stanciu@gmail.com",
    phone: "0722 314 558",
    city: "Cluj-Napoca",
    county: "Cluj",
    country: "România",
    street: "Str. Mihai Eminescu",
    streetNumber: "12",
    apartment: "4A",
  },
  summary:
    "Contabilă cu 5 ani de experiență în contabilitate primară și declarații fiscale pentru portofolii de firme mici și mijlocii. Obișnuită cu termene strânse, volume mari și relația directă cu ANAF și clienții.",
  experience: [
    {
      title: "Contabil",
      company: "SC ContExpert SRL",
      location: "Cluj-Napoca",
      period: "martie 2021 – prezent",
      responsibilities: [
        "Întocmirea și depunerea lunară a declarațiilor D112, D300 și D394 pentru un portofoliu de 12 firme.",
        "Procesarea a circa 300 de facturi lunar, cu înregistrarea completă în Saga.",
        "Gestionarea și soluționarea diferențelor de cont prin reconciliere lunară, inclusiv un caz de 38.000 lei.",
        "Scurtarea închiderii de lună de la 10 la 6 zile prin reorganizarea verificărilor.",
        "Operarea zilnică în Saga și Excel avansat (VLOOKUP, tabele pivot, SUMIF).",
        "Coordonarea unei colege junioare, cu verificarea lucrărilor contabile.",
      ],
      achievements: [],
    },
    {
      title: "Contabil junior",
      company: "SC FinContab SRL",
      location: "Cluj-Napoca",
      period: "2019 – 2021",
      responsibilities: [
        "Înregistrarea documentelor primare și pregătirea jurnalelor de TVA.",
        "Verificarea și arhivarea documentelor financiar-contabile.",
      ],
      achievements: [],
    },
  ],
  education: [
    {
      level: "Licență",
      field: "Contabilitate și Informatică de Gestiune",
      institution: "Universitatea Babeș-Bolyai",
      location: "Cluj-Napoca",
      years: "2016 – 2019",
      thesis: "Optimizarea proceselor contabile prin digitalizare",
      grade: "9.50",
    },
  ],
  courses: [
    { name: "Expert contabil — stagiu CECCAR", provider: "CECCAR", year: "2023" },
  ],
  skills: [
    { name: "Declarații D112, D300, D394", category: "hard" },
    { name: "Contabilitate primară", category: "hard" },
    { name: "Închideri de lună", category: "hard" },
    { name: "Relația cu ANAF", category: "hard" },
    { name: "Saga", category: "software" },
    { name: "Excel avansat", category: "software" },
    { name: "SPV / e-Factura", category: "software" },
    { name: "Atenție la detalii", category: "soft" },
    { name: "Lucru cu termene strânse", category: "soft" },
  ],
  languages: [
    { name: "Engleză", level: "B2" },
    { name: "Franceză", level: "A2" },
  ],
  license: { hasLicense: true, categories: ["B"] },
  qualifications: "Stagiar CECCAR (anul 2), Certificat operare SPV",
  hobbies: ["Alergare montană", "Fotografie"],
  summaryX: "",
  targetTitle: "",
};

const res = await fetch("http://localhost:3000/api/pdf/test-session-pdf", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ cvData }),
});
console.log("status:", res.status, res.headers.get("content-type"));
console.log("content-disposition:", res.headers.get("content-disposition"));
if (!res.ok) {
  console.log(await res.text());
  process.exit(1);
}
const buf = Buffer.from(await res.arrayBuffer());
console.log("PDF:", buf.length, "bytes, header:", buf.subarray(0, 5).toString());
writeFileSync(".screens/sample-cv.pdf", buf);
console.log("✅ salvat în .screens/sample-cv.pdf");
