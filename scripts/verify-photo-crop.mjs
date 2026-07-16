/** Verificarea fixului de distorsiune foto, cf. spec:
 *  3 imagini-test (portrait 800×1200, landscape 1200×800, pătrată 900×900),
 *  fiecare cu un CERC perfect centrat — dacă vreun renderer distorsionează,
 *  cercul devine elipsă. Verifică: thumb pas Fotografie, preview live,
 *  foaia finală + PDF pe toate cele 4 template-uri cu poză. */
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { mkdirSync, writeFileSync, readFileSync } from "fs";

mkdirSync(".screens/crop-test", { recursive: true });

// 1) generează imaginile-test: fundal colorat + cerc alb centrat + cruce
const mk = async (w, h, name) => {
  const r = Math.min(w, h) * 0.35;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect width="${w}" height="${h}" fill="#2b6cb0"/>
    <circle cx="${w / 2}" cy="${h / 2}" r="${r}" fill="#ffffff"/>
    <rect x="${w / 2 - 4}" y="${h / 2 - r}" width="8" height="${2 * r}" fill="#e53e3e"/>
    <rect x="${w / 2 - r}" y="${h / 2 - 4}" width="${2 * r}" height="8" fill="#e53e3e"/>
  </svg>`;
  const buf = await sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toBuffer();
  const path = `.screens/crop-test/${name}.jpg`;
  writeFileSync(path, buf);
  return path;
};
const PORTRAIT = await mk(800, 1200, "portrait");
const LANDSCAPE = await mk(1200, 800, "landscape");
const SQUARE = await mk(900, 900, "square");

// 2) UI: pas Fotografie + preview live + foaia finală, cu imaginea PORTRAIT
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.route("**/api/ai/correct-text", (r) => r.fulfill({ json: { corrected: r.request().postDataJSON().text } }));
await page.route("**/api/ai/research", (r) => r.fulfill({ json: { ok: true } }));
await page.route("**/api/ai/summary", (r) => r.fulfill({ json: { summary: "Rezumat de test." } }));
await page.route("**/api/ai/generate-skills", (r) =>
  r.fulfill({ json: { hardSkills: ["Test"], softwareTools: [], softSkills: [] } })
);

await page.goto("http://localhost:3000/creare-cv", { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.removeItem("cv-smart-progress"));
await page.reload({ waitUntil: "networkidle" });
await page.getByText(/Nu am un anunț/).click();
await page.locator("#photo-input").setInputFiles(PORTRAIT);
await page.getByText("Fotografie adăugată").waitFor();
await page.screenshot({ path: ".screens/crop-test/ui-1-pas-foto.png" });
await page.getByRole("button", { name: /Continuă cu fotografia/ }).click();
await page.getByLabel(/prenume/i).fill("Test");
await page.getByLabel(/nume de familie/i).fill("Portrait");
await page.getByLabel(/email/i).fill("t@p.ro");
await page.getByLabel(/telefon/i).fill("0722314558");
await page.getByLabel(/oraș/i).first().fill("Cluj");
await page.waitForTimeout(400);
await page.screenshot({ path: ".screens/crop-test/ui-2-preview-live.png" });
await page.getByRole("button", { name: /Continuă/ }).click();
await page.getByText(/prefer să scriu descrierile manual/i).click();
await page.getByLabel(/funcția/i).fill("Tester");
await page.getByLabel(/responsabilit/i).fill("Testare");
await page.getByRole("button", { name: /Salvează jobul/ }).click();
await page.getByRole("button", { name: /Continuă/ }).click();
await page.getByRole("button", { name: /Sari peste/ }).click();
await page.getByRole("heading", { name: "Abilități" }).waitFor();
await page.getByRole("button", { name: /Continuă/ }).click();
await page.getByRole("button", { name: /Continuă/ }).click();
await page.getByRole("button", { name: /Continuă/ }).click();
await page.getByRole("heading", { name: /Hobby-uri/ }).waitFor();
await page.getByRole("button", { name: /Generează CV-ul/ }).click();
await page.getByRole("heading", { name: /CV-ul tău e gata/ }).waitFor();
await page.waitForTimeout(600);
await page.screenshot({ path: ".screens/crop-test/ui-3-foaia-finala.png" });
// extrage photoUrl-ul normalizat (pătrat) din snapshot
const snap = await page.evaluate(() => JSON.parse(localStorage.getItem("cv-smart-progress")).cvData.personal.photoUrl);
console.log("photoUrl după upload:", snap.slice(0, 40), `(${Math.round(snap.length / 1024)}KB)`);
await browser.close();

// 3) PDF: toate cele 4 template-uri cu poză × cele 3 forme (prin ruta reală).
//    Formele landscape/square trec prin ensureSquarePhoto (crop server, ca și
//    cum ar veni dintr-o sesiune veche, ne-normalizată la upload).
const toDataUrl = (p) => `data:image/jpeg;base64,${readFileSync(p).toString("base64")}`;
const cvFor = (photo) => ({
  personal: { firstName: "Test", lastName: "Crop", email: "t@c.ro", phone: "0722 314 558", city: "Cluj-Napoca", country: "România", photoUrl: photo },
  experience: [{ title: "Tester", company: "QA SRL", period: "2020 – prezent", responsibilities: ["Verificarea proporțiilor fotografiilor."], achievements: [] }],
  education: [], courses: [], skills: [], languages: [], license: { hasLicense: false, categories: [] }, qualifications: "", hobbies: [], summary: "", targetTitle: "",
});
for (const [shape, path] of [["portrait", PORTRAIT], ["landscape", LANDSCAPE], ["square", SQUARE]]) {
  for (const tpl of ["classic", "modern", "elegant", "compact"]) {
    const res = await fetch("http://localhost:3000/api/pdf/crop-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cvData: cvFor(toDataUrl(path)), templateId: tpl }),
    });
    if (!res.ok) { console.log(`❌ ${shape}/${tpl}: ${res.status}`); continue; }
    writeFileSync(`.screens/crop-test/pdf-${shape}-${tpl}.pdf`, Buffer.from(await res.arrayBuffer()));
    console.log(`✅ pdf-${shape}-${tpl}.pdf`);
  }
}

// 4) screenshot la PDF-urile PORTRAIT (cazul din bug) pe toate 4 + spot-check
const b2 = await chromium.launch({ headless: false, args: ["--window-position=2000,2000"] });
const p2 = await b2.newPage({ viewport: { width: 900, height: 700 } });
const { pathToFileURL } = await import("url");
const pathMod = await import("path");
for (const f of ["pdf-portrait-classic", "pdf-portrait-modern", "pdf-portrait-elegant", "pdf-portrait-compact", "pdf-landscape-modern", "pdf-square-classic"]) {
  await p2.goto(pathToFileURL(pathMod.resolve(`.screens/crop-test/${f}.pdf`)).href);
  await p2.waitForTimeout(1800);
  await p2.screenshot({ path: `.screens/crop-test/${f}.png` });
}
await b2.close();
console.log("✅ verificare completă — .screens/crop-test/");
