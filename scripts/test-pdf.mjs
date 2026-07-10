// Reproduce fluxul real: sesiune nouă → salvare cv_data → descărcare PDF
import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("http://localhost:3000/creare-cv", { waitUntil: "domcontentloaded" });
// sessionId e injectat în client; îl luăm din PATCH-ul de auto-save
const [req] = await Promise.all([
  page.waitForRequest((r) => r.url().includes("/api/session/"), { timeout: 15000 }).catch(() => [null]),
  page.evaluate(() => window.dispatchEvent(new Event("focus"))),
]);
let sessionId = null;
if (req && req.url) {
  sessionId = req.url().match(/api\/session\/([^/?]+)/)?.[1];
}
console.log("sessionId din auto-save:", sessionId);
await browser.close();

if (!sessionId) {
  console.log("nu am prins auto-save; încerc PATCH direct pe o sesiune nouă nu se poate fără id — abandonez această cale");
  process.exit(0);
}

const cvData = {
  personal: { firstName: "Elena", lastName: "Stanciu", email: "e@s.com", phone: "0722 314 558", city: "Cluj-Napoca", county: "Cluj", country: "România", street: "Str. Mihai Eminescu", streetNumber: "12", apartment: "4A" },
  experience: [{ title: "Vânzător", company: "Profi", period: "2021 – prezent", responsibilities: ["Servirea clienților la casă", "Aranjarea mărfii la raft"], achievements: [] }],
  education: [{ level: "Liceu", field: "", institution: "Colegiul Național", years: "2014 – 2018", thesis: "Lucrare test", grade: "9.20" }],
  courses: [], skills: [{ name: "Vânzare consultativă", category: "hard" }], languages: [{ name: "Engleză", level: "B1" }],
  license: { hasLicense: true, categories: ["B"] }, qualifications: "Operator stivuitor", hobbies: ["Fotbal"], summary: "", targetTitle: "",
};

let res = await fetch(`http://localhost:3000/api/session/${sessionId}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ cv_data: cvData }),
});
console.log("PATCH cv_data:", res.status, await res.text());

res = await fetch(`http://localhost:3000/api/pdf/${sessionId}`);
console.log("GET pdf:", res.status, res.headers.get("content-type"));
if (res.ok) {
  const buf = Buffer.from(await res.arrayBuffer());
  console.log("PDF bytes:", buf.length, "primii octeți:", buf.subarray(0, 8).toString());
} else {
  console.log("body:", await res.text());
}
