// Caută pagini goale: generează CV-uri cu volum crescător de conținut,
// pe toate template-urile, și verifică textul fiecărei pagini.
// O pagină „goală" = conține doar footerul (numele + paginarea).
import { pathToFileURL } from "node:url";

const PDFJS_PATH = pathToFileURL(
  "node_modules/.pnpm/pdfjs-dist@5.4.296/node_modules/pdfjs-dist/legacy/build/pdf.mjs"
).href;

const BASE = "http://localhost:3000";

function cvWith(bullets, hobbies) {
  return {
    personal: {
      firstName: "Ion",
      lastName: "Popescu",
      email: "ion.popescu@test.ro",
      phone: "0722000111",
      city: "București",
      county: "București",
    },
    summary:
      "Profesionist cu experiență în logistică și gestiunea stocurilor, obișnuit cu volume mari de lucru și coordonarea echipelor.",
    experience: [
      {
        title: "Coordonator Depozit",
        company: "LogiPartner SRL",
        period: "2019 – prezent",
        responsibilities: Array.from(
          { length: bullets },
          (_, i) =>
            `Responsabilitatea numărul ${i + 1}: coordonarea activităților operaționale din depozit, cu urmărirea indicatorilor de performanță și raportare săptămânală.`
        ),
        achievements: [],
      },
    ],
    education: [
      { level: "Liceu", institution: "Liceul Tehnologic Henri Coandă", period: "1996 – 2000", field: "" },
    ],
    courses: [{ name: "Operator stivuitor autorizat ISCIR", year: "2017" }],
    skills: [
      { name: "gestiunea stocurilor", category: "hard" },
      { name: "WMS", category: "software" },
      { name: "coordonare echipă", category: "soft" },
    ],
    languages: [{ language: "Engleză", level: "B1" }],
    license: { hasLicense: true, categories: ["B", "C"] },
    qualifications: "",
    hobbies: Array.from({ length: hobbies }, (_, i) => `Hobby ${i + 1}`),
  };
}

async function pageTexts(buf) {
  // pdfjs — extragem textul per pagină
  const pdfjs = await import(PDFJS_PATH);
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buf), useSystemFonts: true }).promise;
  const texts = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const tc = await page.getTextContent();
    texts.push(tc.items.map((it) => it.str).join(" ").trim());
  }
  return texts;
}

const templates = ["classic", "modern", "elegant", "compact", "minimal"];
let problems = 0;

for (const tpl of templates) {
  for (let bullets = 4; bullets <= 34; bullets += 3) {
    const res = await fetch(`${BASE}/api/pdf/test-blank`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cvData: cvWith(bullets, 2), templateId: tpl }),
    });
    if (!res.ok) {
      console.log(`${tpl} b=${bullets}: HTTP ${res.status}`);
      problems++;
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const texts = await pageTexts(buf);
    const last = texts[texts.length - 1];
    // pagină GOALĂ = zero text (footerul apare doar dacă totalPages > 1 și
    // conține numele — deci și el ar produce text)
    if (texts.length > 1 && last.length === 0) {
      problems++;
      console.log(`❌ ${tpl} bullets=${bullets}: ${texts.length} pagini, ultima complet goală`);
    } else if (texts.length > 1 && last.length < 40) {
      console.log(`ℹ️ ${tpl} bullets=${bullets}: ultima pagină e scurtă, dar are conținut ("${last.slice(0, 50)}")`);
    }
  }
  console.log(`${tpl}: verificat`);
}

console.log(problems === 0 ? "✅ Nicio pagină goală detectată" : `⚠️ ${problems} probleme`);
