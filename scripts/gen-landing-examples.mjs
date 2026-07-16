/** Generează 2 CV-uri de exemplu pentru landing, folosind APLICAȚIA REALĂ
 *  (AI real, fără mock-uri), ca un utilizator adevărat:
 *   1. Andreea Marinescu — Contabil Senior, București → template CLASIC
 *   2. Mihai Georgescu — Coordonator Logistică, Timișoara → template MODERN
 *  Colectează erori de consolă + fricțiuni + durate (test de utilizare). */
import { chromium } from "@playwright/test";
import { mkdirSync } from "fs";

mkdirSync("public/exemple", { recursive: true });
mkdirSync("public/examples", { recursive: true });

const FOTO_FEMEIE = "C:/Users/Armaghedon/Downloads/replicate-prediction-7fja6vr2asrmt0czamhvskjqvw.jpg";
const FOTO_BARBAT = "C:/Users/Armaghedon/Downloads/replicate-prediction-xx7m52m4q5rmt0czamh8q4s5ec.jpg";

const PERSOANE = [
  {
    nume: "Andreea", prenumeFam: "Marinescu",
    email: "andreea.marinescu@gmail.com", telefon: "0745338291",
    oras: "București", judet: "București", strada: "Bd. Decebal", nr: "14", ap: "22",
    foto: FOTO_FEMEIE,
    anunt: `Contabil Senior – firmă de contabilitate, București
Cerințe: experiență minimum 5 ani în contabilitate, cunoștințe solide de legislație fiscală,
declarații D112, D300, D394, experiență cu Saga și SPV, atenție la detalii.
Responsabilități: gestionarea unui portofoliu de clienți, închideri de lună, întocmirea și
depunerea declarațiilor fiscale, relația cu ANAF, verificarea lucrărilor colegilor juniori.`,
    functia: "Contabil Senior", companie: "Expert Cont Serv SRL", localitate: "București",
    anStart: "2018",
    descriere:
      "ma ocup de un portofoliu de firme mici si mijlocii, tin contabilitatea completa de la facturi pana la bilant. fac inchiderile de luna, depun toate declaratiile la anaf prin spv, ma ocup si de salarii pentru clientii care au angajati. verific lucrarile facute de colegele mai noi inainte sa plece. tin legatura direct cu clientii si cu anaf cand sunt controale sau solicitari",
    raspunsuri: [
      "am in portofoliu 14 firme, cam 400-500 de facturi pe luna in total, plus salarii pentru vreo 120 de angajati la clientii mei",
      "lucrez in Saga si Excel zilnic, depun prin SPV, folosesc e-Factura si Revisal cand e nevoie",
      "suntem 5 in departament, eu verific lucrarile la 2 colege juniore inainte sa plece declaratiile",
      "am trecut prin 3 controale ANAF fara nicio amenda, la unul am recuperat un TVA de rambursat de vreo 45 de mii de lei",
      "inchiderea de luna o fac acum in 5 zile lucratoare, am scurtat-o de la 8, mi-am facut si fisiere de verificare automata in excel",
    ],
    eduIdx: 3, eduInst: "Academia de Studii Economice", eduLoc: "București",
    eduDomeniu: "Contabilitate și Informatică de Gestiune", eduStart: "2010", eduEnd: "2013",
    curs: { nume: "Expert contabil — membru CECCAR", an: "2019" },
    limbi: [["Engleză", "B2"], ["Franceză", "A2"]],
    permis: ["B"],
    hobby: "citesc carti si merg pe munte cand am timp",
    template: "classic",
    fisier: "cv-exemplu-contabil-clasic.pdf",
  },
  {
    nume: "Mihai", prenumeFam: "Georgescu",
    email: "mihai.georgescu80@gmail.com", telefon: "0723416785",
    oras: "Timișoara", judet: "Timiș", strada: "Str. Gheorghe Lazăr", nr: "9", ap: "",
    foto: FOTO_BARBAT,
    anunt: `Coordonator Depozit / Logistică – centru de distribuție, Timișoara
Cerințe: experiență în gestiunea depozitelor, coordonare de echipă, cunoștințe WMS,
disponibilitate program în schimburi, permis categoria B.
Responsabilități: coordonarea echipei de depozit, organizarea recepțiilor și livrărilor,
gestionarea stocurilor și inventarelor, respectarea normelor SSM.`,
    functia: "Coordonator Depozit", companie: "LogiPartner Distribution SRL", localitate: "Timișoara",
    anStart: "2019",
    descriere:
      "conduc activitatea din depozit, primesc marfa, o receptionez si organizez livrarile catre magazine. coordonez echipa de pe schimburi, fac graficele de lucru, ma ocup de inventare si de stocuri in sistemul wms. cand nu e managerul raspund eu de tot depozitul, tin legatura cu transportatorii si semnez documentele de livrare",
    raspunsuri: [
      "depozitul are 4000 de mp, ies cam 60-80 de comenzi pe zi, in sezon ajungem si la 150",
      "coordonez 12 oameni pe 2 schimburi, stivuitoristi si pickeri, eu fac graficele de tura",
      "lucrez zilnic in WMS, fac receptii si inventare cu scannere, rapoartele le tin in excel",
      "la inventarul anual am adus diferentele sub 0.5 la suta, cand am venit erau peste 2 la suta",
      "raspund de depozit in lipsa managerului, ma ocup si de instructajele ssm si de relatia cu firma de paza",
    ],
    eduIdx: 1, eduInst: "Liceul Tehnologic Henri Coandă", eduLoc: "Timișoara",
    eduDomeniu: "", eduStart: "1996", eduEnd: "2000",
    curs: { nume: "Operator stivuitor autorizat ISCIR", an: "2017" },
    limbi: [["Engleză", "A2"]],
    permis: ["B", "C", "CE"],
    hobby: "joc fotbal cu colegii si merg la pescuit",
    template: "modern",
    fisier: "cv-exemplu-logistica-modern.pdf",
  },
];

const browser = await chromium.launch();
const notes = [];
const t0 = () => Date.now();
const sec = (t) => `${Math.round((Date.now() - t) / 1000)}s`;

for (const p of PERSOANE) {
  console.log(`\n════ ${p.nume} ${p.prenumeFam} — ${p.functia} (${p.template}) ════`);
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 160)));
  page.on("pageerror", (e) => errors.push("PAGEERROR " + String(e).slice(0, 160)));

  await page.goto("http://localhost:3000/creare-cv", { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.removeItem("cv-smart-progress"));
  await page.reload({ waitUntil: "networkidle" });

  // Pas 1 — contact (noua ordine)
  await page.getByRole("heading", { name: "Date de contact" }).waitFor();
  await page.getByLabel(/prenume/i).fill(p.nume);
  await page.getByLabel(/nume de familie/i).fill(p.prenumeFam);
  await page.getByLabel(/email/i).fill(p.email);
  await page.getByLabel(/telefon/i).fill(p.telefon);
  await page.getByLabel(/oraș/i).first().fill(p.oras);
  await page.getByRole("button", { name: /alege județul/ }).click();
  await page.getByPlaceholder("Caută...").fill(p.judet.slice(0, 4));
  await page.getByRole("option", { name: p.judet, exact: true }).click();
  await page.getByPlaceholder("ex: Str. Mihai Eminescu").fill(p.strada);
  await page.getByPlaceholder("ex: 12").fill(p.nr);
  if (p.ap) await page.getByPlaceholder("ex: 4A").fill(p.ap);
  await page.getByRole("button", { name: /Continuă/ }).click();

  // Pas 2 — foto
  await page.locator("#photo-input").setInputFiles(p.foto);
  await page.getByText("Fotografie adăugată").waitFor({ timeout: 10000 });
  await page.getByRole("button", { name: /Continuă cu fotografia/ }).click();

  // Pas 3 — anunț (job vizat)
  await page.getByRole("heading", { name: "Ce job vrei să obții?" }).waitFor();
  await page.getByPlaceholder(/copy-paste la descrierea/i).fill(p.anunt);
  await page.getByRole("button", { name: "Continuă", exact: true }).click();

  // Pas 4 — experiență (AI REAL)
  await page.getByRole("heading", { name: /Povestește-ne/ }).waitFor();
  await page.getByLabel(/funcția/i).fill(p.functia);
  await page.getByLabel(/compania/i).fill(p.companie);
  await page.getByRole("button", { name: "anul", exact: true }).click();
  await page.getByRole("listbox").getByRole("option", { name: p.anStart, exact: true }).click();
  await page.getByLabel(/localitatea/i).fill(p.localitate);
  await page.getByPlaceholder(/povesti unui prieten/i).fill(p.descriere);
  await page.waitForTimeout(2500); // corectările AI pe blur

  let t = t0();
  await page.getByRole("button", { name: /Analizează/ }).click();
  await page.getByRole("heading", { name: /5 întrebări/ }).waitFor({ timeout: 120000 });
  console.log(`  întrebări generate în ${sec(t)}`);
  const areas = page.locator("textarea");
  for (let i = 0; i < 5; i++) await areas.nth(i).fill(p.raspunsuri[i]);
  t = t0();
  await page.getByRole("button", { name: /Generează descrierile/ }).click();
  await page.getByText(/descrieri generate/).waitFor({ timeout: 180000 });
  console.log(`  descrieri generate în ${sec(t)}`);
  // selectează 6 din 7
  const cards = page.locator("button[style*='text-align']");
  for (let i = 0; i < 6; i++) await cards.nth(i).click();
  await page.getByRole("button", { name: /Finalizează/ }).click();
  await page.getByRole("heading", { name: /Joburile tale/ }).waitFor({ timeout: 15000 });
  await page.getByRole("button", { name: /Continuă/ }).click();

  // Pas 5 — educație + curs
  await page.getByRole("button", { name: /Adaugă educație/ }).click();
  await page.locator("select").selectOption({ index: p.eduIdx });
  if (p.eduDomeniu) await page.getByPlaceholder(/Informatică, Medicină/).fill(p.eduDomeniu);
  await page.getByPlaceholder(/Universitatea Babeș-Bolyai/).fill(p.eduInst);
  await page.getByPlaceholder("ex: Cluj-Napoca").last().fill(p.eduLoc);
  await page.getByRole("button", { name: "anul", exact: true }).click();
  await page.getByRole("listbox").getByRole("option", { name: p.eduStart, exact: true }).click();
  await page.getByRole("button", { name: "Prezent", exact: true }).click();
  await page.getByRole("listbox").getByRole("option", { name: p.eduEnd, exact: true }).click();
  await page.getByTestId("btn-save-education").click();
  await page.waitForTimeout(300);
  await page.getByPlaceholder(/Operator stivuitor ISCIR/).fill(p.curs.nume);
  await page.getByPlaceholder("anul").fill(p.curs.an);
  await page.getByRole("button", { name: /Adaugă cursul/ }).click();
  await page.getByRole("button", { name: "Continuă", exact: false }).click();

  // Pas 6 — abilități (AI REAL)
  t = t0();
  await page.getByRole("heading", { name: "Abilități" }).waitFor();
  await page.locator("input[type='checkbox']").first().waitFor({ timeout: 120000 });
  console.log(`  abilități generate în ${sec(t)}`);
  await page.waitForTimeout(400);
  const pick = async (sectionId, n) => {
    const boxes = page.getByTestId(sectionId).locator("input[type='checkbox']");
    const total = await boxes.count();
    for (let i = 0; i < Math.min(n, total); i++) await boxes.nth(i).check();
  };
  await pick("section-hard", 5);
  await pick("section-software", 3);
  await pick("section-soft", 2);
  await page.getByRole("button", { name: /Continuă/ }).click();

  // Pas 7 — limbi
  await page.getByRole("heading", { name: /Limbi străine/ }).waitFor();
  for (const [limba, nivel] of p.limbi) {
    await page.getByRole("button", { name: "Limbă" }).click();
    await page.getByRole("listbox").getByRole("option", { name: limba, exact: true }).click();
    await page.getByRole("button", { name: "Nivel" }).click();
    await page.getByRole("listbox").getByRole("option", { name: new RegExp(`^${nivel}`) }).click();
    await page.getByRole("button", { name: "Adaugă", exact: true }).click();
  }
  await page.getByRole("button", { name: /Continuă/ }).click();

  // Pas 8 — permis
  await page.getByRole("heading", { name: /Permis/ }).waitFor();
  await page.getByRole("button", { name: "✅ Da" }).click();
  for (const cat of p.permis) {
    await page.getByRole("button", { name: cat, exact: true }).click();
  }
  await page.getByRole("button", { name: /Continuă/ }).click();

  // Pas 9 — hobby (AI REAL)
  await page.getByRole("heading", { name: /Hobby-uri/ }).waitFor();
  await page.getByLabel(/Ce faci în timpul liber/).fill(p.hobby);
  t = t0();
  await page.getByRole("button", { name: /Adaugă/ }).click();
  await page.locator("[aria-label^='Șterge']").first().waitFor({ timeout: 60000 });
  console.log(`  hobby corectat în ${sec(t)}`);
  await page.getByRole("button", { name: /Generează CV-ul/ }).click();

  // Pas 10 — final: rezumat REAL + template + descărcare
  await page.getByRole("heading", { name: /CV-ul tău e gata/ }).waitFor({ timeout: 15000 });
  t = t0();
  await page
    .getByTestId("final-cv-sheet")
    .getByText(/Rezumat/i)
    .waitFor({ timeout: 90000 })
    .catch(() => notes.push(`${p.nume}: rezumatul NU a apărut în preview`));
  console.log(`  rezumat generat în ${sec(t)}`);
  await page.getByTestId(`template-${p.template}`).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `.screens/landing-${p.template}-preview.png` });
  // imaginea pentru hero-ul landing-ului: foaia A4, exact cum arată PDF-ul
  await page
    .getByTestId("final-cv-sheet")
    .screenshot({ path: `public/examples/cv-example-${p.template === "classic" ? 1 : 2}.png` });

  t = t0();
  const dl = page.waitForEvent("download", { timeout: 60000 });
  await page.getByRole("button", { name: /Descarcă PDF/ }).click();
  const download = await dl;
  await download.saveAs(`public/exemple/${p.fisier}`);
  console.log(`  PDF descărcat în ${sec(t)}: ${download.suggestedFilename()} → public/exemple/${p.fisier}`);

  if (errors.length) notes.push(`${p.nume}: erori consolă: ${errors.join(" | ")}`);
  await page.close();
}

await browser.close();
console.log("\n── NOTE / PROBLEME ──");
console.log(notes.length ? notes.join("\n") : "(nicio eroare, niciun impediment)");
