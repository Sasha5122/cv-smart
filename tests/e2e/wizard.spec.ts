import { test, expect, Page } from "@playwright/test";

/* ────────────────────────────────────────────────────────────────
   Wizard e2e — fluxul editorial + pipeline-ul AI de experiență.
   Rutele AI sunt mock-uite (determinist, zero cost) — integrarea
   reală e acoperită de scripts/test-pipeline.ts.
   ──────────────────────────────────────────────────────────────── */

const QUESTIONS = [1, 2, 3, 4, 5].map((i) => ({
  id: `q${i}`,
  question: `Întrebarea de test numărul ${i} despre experiența ta?`,
  expected_info: "detalii",
}));

const BULLETS = [
  "Întocmit și depus lunar declarațiile D112, D300 și D394 pentru 12 firme.",
  "Procesat circa 300 de facturi lunar pentru portofoliul de clienți.",
  "Scurtat închiderea de lună de la 10 la 6 zile prin reorganizarea verificărilor.",
  "Soluționat un control ANAF cu anularea unei amenzi de 8000 lei.",
  "Coordonat o colegă junioară, cu verificarea lucrărilor contabile.",
  "Utilizat zilnic Saga, Excel și SmartBill pentru operațiuni contabile.",
  "Menținut comunicarea directă cu clienții pe mail și telefon.",
].map((text, i) => ({
  id: `b${i + 1}`,
  text,
  category: "responsabilitate_core",
}));

/** Corectarea AI e best-effort — în teste returnează textul primit. */
async function mockCorrectText(page: Page) {
  await page.route("**/api/ai/correct-text", (route, request) =>
    route.fulfill({ json: { corrected: request.postDataJSON().text } })
  );
}

async function mockPipeline(page: Page) {
  await mockCorrectText(page);
  // rezumatul auto-generat la pasul final — determinist în teste
  await page.route("**/api/ai/summary", (route) =>
    route.fulfill({
      json: { summary: "Profesionist cu experiență practică, obișnuit cu volume mari de lucru." },
    })
  );
  await page.route("**/api/cv/analyze", (route) =>
    route.fulfill({
      json: { sessionId: "test-pipeline-id", questions: QUESTIONS },
    })
  );
  await page.route("**/api/cv/generate-bullets", (route) =>
    route.fulfill({ json: { bullets: BULLETS, regenerated: false, droppedCount: 0 } })
  );
  await page.route("**/api/cv/select-bullets", (route, request) => {
    const ids: string[] = request.postDataJSON().selectedIds;
    route.fulfill({
      json: { selected: BULLETS.filter((b) => ids.includes(b.id)) },
    });
  });
  // reduce zgomotul: research-ul din pasul 1 nu contează aici
  await page.route("**/api/ai/research", (route) => route.fulfill({ json: { ok: true } }));
}

const RAW_TEXT =
  "ma ocup de contabilitate primara si declaratii pentru firme mici. bag facturi in program, fac pontaje si salarii, depun declaratii la anaf lunar, tin legatura cu clientii, fac balante la inchidere de luna si verific conturile. lucrez in saga si excel zilnic.";

/** Navighează de la început până la pasul Experiență (ecranul de input). */
async function gotoExperience(page: Page, withJD = true) {
  await mockCorrectText(page);
  await page.goto("/creare-cv");
  // Pas 1 — Job vizat
  await expect(
    page.getByRole("heading", { name: "Ce job vrei să obții?" })
  ).toBeVisible({ timeout: 15000 });
  if (withJD) {
    await page
      .getByPlaceholder(/copy-paste la descrierea/i)
      .fill("Căutăm Contabil Senior: D112, D300, D394, Saga, portofoliu de clienți.");
    await page.getByRole("button", { name: "Continuă", exact: true }).click();
  } else {
    await page.getByText(/Nu am un anunț/).click();
  }
  // Pas 2 — Fotografie (skip)
  await page.getByText("Nu am fotografie potrivită").click();
  // Pas 3 — Contact
  await expect(page.getByRole("heading", { name: "Date de contact" })).toBeVisible({
    timeout: 8000,
  });
  await page.getByLabel(/prenume/i).fill("Elena");
  await page.getByLabel(/nume de familie/i).fill("Stanciu");
  await page.getByLabel(/email/i).fill("elena.stanciu@gmail.com");
  await page.getByLabel(/telefon/i).fill("0722314558");
  await page.getByLabel(/oraș/i).first().fill("București");
  await page.getByRole("button", { name: /Continuă/ }).click();
  // Experiență — input
  await expect(page.getByRole("heading", { name: /Povestește-ne ce faci/ })).toBeVisible({
    timeout: 10000,
  });
}

test.describe("Wizard — navigare și shell editorial", () => {
  test("ruta / redirecționează direct la wizard", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/creare-cv/);
    await expect(
      page.getByRole("heading", { name: "Ce job vrei să obții?" })
    ).toBeVisible({ timeout: 15000 });
  });

  test("pasul 1 se încarcă fără exemple rapide, cu titlu și preview", async ({ page }) => {
    await page.goto("/creare-cv");
    await expect(
      page.getByRole("heading", { name: "Ce job vrei să obții?" })
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Pasul 1 din 10/i)).toBeVisible();
    // secțiunea „Exemple rapide" a fost eliminată
    await expect(page.getByText("Exemple rapide")).toHaveCount(0);
    if ((page.viewportSize()?.width ?? 1440) >= 900) {
      // sidebar-ul și preview-ul sunt ascunse pe mobil (by design)
      await expect(page.getByText("Pașii tăi")).toBeVisible();
      await expect(page.getByText("Preview CV")).toBeVisible();
    }
  });

  test("skip-ul pasului 1 duce la fotografie", async ({ page }) => {
    await page.goto("/creare-cv");
    await expect(
      page.getByRole("heading", { name: "Ce job vrei să obții?" })
    ).toBeVisible({ timeout: 15000 });
    await page.getByText(/Nu am un anunț/).click();
    await expect(page.getByText(/Pasul 2 din 10/i)).toBeVisible();
  });

  test("chip-ul de ancorare apare când există anunț", async ({ page }) => {
    await mockPipeline(page);
    await gotoExperience(page, true);
    await expect(page.getByText(/Ancorat pe anunțul tău/)).toBeVisible();
  });

  test("preview-ul live afișează numele după contact", async ({ page }) => {
    test.skip(
      (page.viewportSize()?.width ?? 1440) < 900,
      "preview-ul e ascuns pe mobil (by design)"
    );
    await mockPipeline(page);
    await gotoExperience(page);
    await expect(
      page.locator(".wizard-preview").getByText("Elena Stanciu")
    ).toBeVisible();
  });
});

test.describe("Persistență — refresh-ul nu pierde progresul", () => {
  test("după F5, utilizatorul revine exact unde a rămas, cu datele intacte", async ({ page }) => {
    await mockCorrectText(page);
    await page.route("**/api/ai/research", (route) => route.fulfill({ json: { ok: true } }));
    await page.goto("/creare-cv");
    await expect(
      page.getByRole("heading", { name: "Ce job vrei să obții?" })
    ).toBeVisible({ timeout: 15000 });
    // progres real: anunț + trecut de foto + date de contact parțiale
    await page
      .getByPlaceholder(/copy-paste la descrierea/i)
      .fill("Angajăm vânzător cu experiență la casa de marcat.");
    await page.getByRole("button", { name: "Continuă", exact: true }).click();
    await page.getByText("Nu am fotografie potrivită").click();
    await expect(page.getByRole("heading", { name: "Date de contact" })).toBeVisible();
    await page.getByLabel(/prenume/i).fill("Elena");
    await page.getByLabel(/nume de familie/i).fill("Stanciu");
    // așteaptă persistarea debounced (400ms)
    await page.waitForTimeout(800);

    await page.reload();

    // restaurat: toast-ul apare imediat la hidratare (îl prindem primul,
    // înainte să-i expire durata), apoi pasul și datele
    await expect(page.getByText(/Ți-am restaurat progresul/)).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByRole("heading", { name: "Date de contact" })).toBeVisible();
    await expect(page.getByLabel(/prenume/i)).toHaveValue("Elena");
    await expect(page.getByLabel(/nume de familie/i)).toHaveValue("Stanciu");
  });

  test("pasul 1 nu mai are buton Înapoi (fostul buton-capcană)", async ({ page }) => {
    await page.goto("/creare-cv");
    await expect(
      page.getByRole("heading", { name: "Ce job vrei să obții?" })
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("button", { name: /Înapoi/ })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Continuă", exact: true })).toBeVisible();
  });
});

test.describe("Contact — județ dropdown + modal străinătate", () => {
  async function gotoContact(page: Page) {
    await mockCorrectText(page);
    await page.route("**/api/ai/research", (route) => route.fulfill({ json: { ok: true } }));
    await page.goto("/creare-cv");
    await expect(
      page.getByRole("heading", { name: "Ce job vrei să obții?" })
    ).toBeVisible({ timeout: 15000 });
    await page.getByText(/Nu am un anunț/).click();
    await page.getByText("Nu am fotografie potrivită").click();
    await expect(page.getByRole("heading", { name: "Date de contact" })).toBeVisible({
      timeout: 8000,
    });
  }

  test("dropdown-ul de județ se deschide în jos, cu scroll intern (max ~7 vizibile)", async ({ page }) => {
    await gotoContact(page);
    const trigger = page.getByRole("button", { name: /alege județul/ });
    await trigger.click();
    const listbox = page.getByRole("listbox");
    await expect(listbox).toBeVisible();
    // panoul se deschide SUB buton
    const tBox = (await trigger.boundingBox())!;
    const lBox = (await listbox.boundingBox())!;
    expect(lBox.y).toBeGreaterThan(tBox.y);
    // scroll intern: panoul e limitat la ~7 rânduri, nu 42 de județe
    expect(lBox.height).toBeLessThanOrEqual(360);
    // nu iese din pagină (toleranță 2px pentru rotunjiri subpixel)
    const viewport = page.viewportSize()!;
    expect(lBox.y + lBox.height).toBeLessThanOrEqual(viewport.height + 2);
    // căutarea filtrează
    await page.getByPlaceholder("Caută...").fill("gala");
    await expect(listbox.getByRole("option", { name: "Galați" })).toBeVisible();
    await listbox.getByRole("option", { name: "Galați" }).click();
    // butonul afișează acum valoarea aleasă (numele accesibil s-a schimbat)
    await expect(page.getByRole("button", { name: "Galați" })).toBeVisible();
  });

  test("modalul din afara României: țară → prefix automat → validare alternativă", async ({ page }) => {
    await gotoContact(page);
    // fără telefon/oraș RO — completăm doar numele + email
    await page.getByLabel(/prenume/i).fill("Andrei");
    await page.getByLabel(/nume de familie/i).fill("Pop");
    await page.getByLabel(/email/i).fill("andrei.pop@gmail.com");

    await page.getByRole("button", { name: /Locuiești în afara României/ }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // alege țara cu căutare — prefixul se completează automat
    await dialog.getByRole("button", { name: /Țara/ }).click();
    await page.getByPlaceholder("Caută...").fill("germa");
    await page.getByRole("option", { name: "Germania" }).click();
    await expect(dialog.getByText("+49")).toBeVisible();

    await dialog.getByPlaceholder("numărul de telefon").fill("1512 3456789");
    await dialog.getByLabel(/adresa/i).fill("Hauptstraße 12, Berlin");
    await dialog.getByRole("button", { name: "OK" }).click();

    // rezumatul înlocuiește câmpurile RO
    await expect(page.getByText(/Date de contact din Germania/)).toBeVisible();
    // apare în rezumat și în live preview
    await expect(page.getByText("+49 1512 3456789").first()).toBeVisible();

    // preview-ul afișează adresa completă din străinătate + ȚARA
    if ((page.viewportSize()?.width ?? 1440) >= 900) {
      const preview = page.locator(".wizard-preview");
      await expect(preview.getByText("Hauptstraße 12, Berlin")).toBeVisible();
      await expect(preview.getByText("Germania")).toBeVisible();
    }

    // poate continua FĂRĂ datele din România
    await page.getByRole("button", { name: /Continuă/ }).click();
    await expect(page.getByRole("heading", { name: /Povestește-ne ce faci/ })).toBeVisible({
      timeout: 10000,
    });
  });

  test("adresa completă din România apare în preview", async ({ page }) => {
    test.skip(
      (page.viewportSize()?.width ?? 1440) < 900,
      "preview-ul e ascuns pe mobil (by design)"
    );
    await gotoContact(page);
    await page.getByLabel(/prenume/i).fill("Elena");
    await page.getByLabel(/nume de familie/i).fill("Stanciu");
    await page.getByLabel(/email/i).fill("elena@gmail.com");
    await page.getByLabel(/telefon/i).fill("0722314558");
    await page.getByLabel(/oraș/i).first().fill("Cluj-Napoca");
    await page.getByRole("button", { name: /alege județul/ }).click();
    await page.getByPlaceholder("Caută...").fill("cluj");
    await page.getByRole("option", { name: "Cluj", exact: true }).click();
    await page.getByPlaceholder("ex: Str. Mihai Eminescu").fill("Str. Mihai Eminescu");
    await page.getByPlaceholder("ex: 12").fill("12");
    await page.getByPlaceholder("ex: 4A").fill("4A");

    const preview = page.locator(".wizard-preview");
    await expect(preview.getByText("Str. Mihai Eminescu 12, ap. 4A")).toBeVisible();
    await expect(preview.getByText("Cluj-Napoca, Cluj")).toBeVisible();
  });
});

test.describe("Wizard — pipeline experiență (AI mock)", () => {
  test("gate: Analizează cere doar funcție + măcar ceva text (fără limită de caractere)", async ({ page }) => {
    await mockPipeline(page);
    await gotoExperience(page);
    // gol → dezactivat
    await expect(page.getByRole("button", { name: /Analizează/ })).toBeDisabled();
    await page.getByLabel(/funcția/i).fill("Contabil");
    await expect(page.getByRole("button", { name: /Analizează/ })).toBeDisabled();
    // orice text, oricât de scurt, deblochează
    await page.getByPlaceholder(/povesti unui prieten/i).fill("text scurt");
    await expect(page.getByRole("button", { name: /Analizează/ })).toBeEnabled();
  });

  test("perioada se alege din dropdown-uri, cu Prezent prima opțiune", async ({ page }) => {
    await mockPipeline(page);
    await gotoExperience(page);
    // „De când" — anul
    await page.getByRole("button", { name: "anul", exact: true }).click();
    const listbox = page.getByRole("listbox");
    await listbox.getByRole("option", { name: "2021", exact: true }).click();
    // „Până când" e deja „Prezent" (prima opțiune, default)
    const endYear = page.getByRole("button", { name: "Prezent" });
    await expect(endYear).toBeVisible();
    await endYear.click();
    // „Prezent" e prima opțiune din listă
    const options = page.getByRole("listbox").getByRole("option");
    await expect(options.first()).toHaveText(/Prezent/);
    await page.keyboard.press("Escape");
    // câmpurile șterse nu mai există
    await expect(page.getByText("Industria")).toHaveCount(0);
    await expect(page.getByText("Ani în acest rol")).toHaveCount(0);
  });

  test("fluxul complet: input → 5 întrebări → selecție liberă (min 3) → salvare + editare inline", async ({ page }) => {
    await mockPipeline(page);
    await gotoExperience(page);

    // ecran 1 — input
    await page.getByLabel(/funcția/i).fill("Contabil");
    await page.getByLabel(/compania/i).fill("SC ContExpert SRL");
    await page.getByRole("button", { name: "anul", exact: true }).click();
    await page.getByRole("listbox").getByRole("option", { name: "2021", exact: true }).click();
    await page.getByPlaceholder(/povesti unui prieten/i).fill(RAW_TEXT);
    await page.getByRole("button", { name: /Analizează/ }).click();

    // ecran 2 — întrebări
    await expect(page.getByText("0/5 răspunsuri")).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole("heading", { name: /5 întrebări, ca la un interviu/ })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Răspunde la minim 3/ })
    ).toBeDisabled();

    const areas = page.locator("textarea");
    await areas.nth(0).fill("procesez 300 de facturi pe luna");
    await areas.nth(1).fill("folosesc Saga si Excel");
    await expect(
      page.getByRole("button", { name: /Răspunde la minim 3 \(2\/3\)/ })
    ).toBeVisible();
    await areas.nth(2).fill("coordonez o colega juniora");
    await expect(page.getByText("3/5 răspunsuri")).toBeVisible();

    await page.getByRole("button", { name: /Generează descrierile/ }).click();

    // ecran 3 — selecție: minim 3, fără limită superioară
    await expect(page.getByText("7 descrieri generate")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Ai ales 0 (minim 3)")).toBeVisible();
    await expect(page.getByRole("button", { name: /Alege minim/ })).toBeDisabled();

    // 3 bifate deblochează Finalizează
    for (let i = 0; i < 3; i++) {
      await page.getByText(BULLETS[i].text).click();
    }
    await expect(page.getByText("Ai ales 3 (minim 3)")).toBeVisible();
    await expect(page.getByRole("button", { name: "Finalizează", exact: false })).toBeEnabled();

    // pot fi bifate TOATE — nu mai există limita de 6
    for (let i = 3; i < 7; i++) {
      await page.getByText(BULLETS[i].text).click();
    }
    await expect(page.getByText("Ai ales 7 (minim 3)")).toBeVisible();

    await page.getByRole("button", { name: /Finalizează/ }).click();

    // rezumat + CV actualizat
    await expect(page.getByRole("heading", { name: /Joburile tale/ })).toBeVisible({
      timeout: 10000,
    });
    // perioada construită din dropdown-uri
    await expect(page.getByText(/2021 – prezent/).first()).toBeVisible();

    // editare inline: modificăm prima descriere direct în chenar, fără buton de save
    const firstResp = page.getByLabel(/Editează descrierea 1/);
    await expect(firstResp).toHaveValue(/D112, D300 și D394/);
    await firstResp.fill("Descriere editată manual de utilizator, direct în chenar.");
    if ((page.viewportSize()?.width ?? 1440) >= 900) {
      // editarea se reflectă automat în live preview
      await expect(
        page.locator(".wizard-preview").getByText(/editată manual de utilizator/)
      ).toBeVisible();
    }
  });

  test("ruta manuală salvează jobul fără AI", async ({ page }) => {
    await gotoExperience(page);
    await page.getByText(/prefer să scriu descrierile manual/i).click();
    await expect(
      page.getByRole("heading", { name: /Scrie descrierile manual/ })
    ).toBeVisible();

    await page.getByLabel(/funcția/i).fill("Vânzător");
    await page.getByLabel(/compania/i).fill("Profi");
    await page
      .getByLabel(/responsabilit/i)
      .fill("Servit clienții la casă\nAranjat marfa la raft");
    await page.getByRole("button", { name: /Salvează jobul/ }).click();

    await expect(page.getByRole("heading", { name: /Joburile tale/ })).toBeVisible();
    await expect(page.getByText("Servit clienții la casă").first()).toBeVisible();
    // butonul de adăugare are noul text
    await expect(
      page.getByRole("button", { name: /Adaugă experiența de la jobul precedent/ })
    ).toBeVisible();
  });

  test("eroarea de API e afișată elegant, cu revenire la input", async ({ page }) => {
    await page.route("**/api/cv/analyze", (route) =>
      route.fulfill({
        status: 500,
        json: { error: "Baza de date nu e pregătită: rulează migrarea." },
      })
    );
    await page.route("**/api/ai/research", (route) => route.fulfill({ json: { ok: true } }));
    await gotoExperience(page);
    await page.getByLabel(/funcția/i).fill("Contabil");
    await page.getByPlaceholder(/povesti unui prieten/i).fill(RAW_TEXT);
    await page.getByRole("button", { name: /Analizează/ }).click();

    await expect(page.getByText(/Baza de date nu e pregătită/)).toBeVisible({
      timeout: 10000,
    });
    // formularul rămâne completat
    await expect(page.getByLabel(/funcția/i)).toHaveValue("Contabil");
  });
});

test.describe("Pașii finali — limbi, permis, hobby-uri", () => {
  /** Sare direct la un pas târziu completând minimul necesar. */
  async function gotoStep(page: Page, stepHeading: RegExp) {
    await mockPipeline(page);
    await page.route("**/api/ai/generate-skills", (route) =>
      route.fulfill({
        json: { hardSkills: ["Vânzare consultativă"], softwareTools: [], softSkills: [] },
      })
    );
    await gotoExperience(page, false);
    // job manual rapid ca să putem trece de Experiență
    await page.getByText(/prefer să scriu descrierile manual/i).click();
    await page.getByLabel(/funcția/i).fill("Vânzător");
    await page.getByLabel(/responsabilit/i).fill("Servit clienții");
    await page.getByRole("button", { name: /Salvează jobul/ }).click();
    await page.getByRole("button", { name: /Continuă/ }).click();
    // Educație — fără intrări, butonul e „Sari peste"
    await expect(page.getByRole("heading", { name: /Educație/ })).toBeVisible({ timeout: 8000 });
    await page.getByRole("button", { name: /Sari peste/ }).click();
    // Abilități (pool mock-uit) → Limbi → Permis → Hobby-uri
    await expect(page.getByRole("heading", { name: "Abilități" })).toBeVisible({ timeout: 8000 });
    for (const h of [/Limbi străine/, /Permis & Calificări/, /Hobby-uri & Pasiuni/]) {
      await page.getByRole("button", { name: /Continuă/ }).click();
      await expect(page.getByRole("heading", { name: h })).toBeVisible({ timeout: 8000 });
      if (stepHeading.source === h.source) return;
    }
  }

  test("limbi: dropdown cu Engleza prima, nivel separat vizual de nume", async ({ page }) => {
    await gotoStep(page, /Limbi străine/);
    // dropdown-ul de limbă — Engleză e prima opțiune
    await page.getByRole("button", { name: "Limbă" }).click();
    const options = page.getByRole("listbox").getByRole("option");
    await expect(options.first()).toHaveText("Engleză");
    await options.first().click();
    await page.getByRole("button", { name: "Adaugă", exact: true }).click();
    // limba adăugată: numele și nivelul sunt elemente separate, nu text lipit
    await expect(page.getByText("Engleză", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("B1 — Intermediar", { exact: true }).first()).toBeVisible();
  });

  test("permis: litera categoriei rămâne vizibilă după selectare", async ({ page }) => {
    await gotoStep(page, /Permis & Calificări/);
    await page.getByRole("button", { name: "✅ Da" }).click();
    const catB = page.getByRole("button", { name: "B", exact: true });
    await catB.click();
    await expect(catB).toHaveAttribute("aria-pressed", "true");
    // fundal albastru plin + text alb → litera vizibilă
    await expect(catB).toHaveCSS("background-color", "rgb(37, 99, 235)");
    await expect(catB).toHaveCSS("color", "rgb(255, 255, 255)");
    await expect(catB).toHaveText("B");
  });

  test("hobby-uri: text → AI corectează → intră în listă", async ({ page }) => {
    await gotoStep(page, /Hobby-uri & Pasiuni/);
    // corectorul transformă textul colocvial în formă de CV
    // (înregistrat DUPĂ mock-urile generice ca să aibă prioritate)
    await page.route("**/api/ai/correct-text", (route) =>
      route.fulfill({ json: { corrected: "Fotbal cu prietenii" } })
    );
    await page.getByLabel(/Ce faci în timpul liber/).fill("joc fotbal cu baietii");
    await page.getByRole("button", { name: /Adaugă/ }).click();
    // apare și în listă, și în live preview
    await expect(page.getByText("Fotbal cu prietenii").first()).toBeVisible();
    // al doilea hobby — fluxul se repetă
    await page.getByLabel(/Ce faci în timpul liber/).fill("citesc carti");
    await page.getByRole("button", { name: /Adaugă/ }).click();
  });
});

test.describe("Preview CV — conținut complet + pasul final", () => {
  /** Parcurge tot wizardul completând educație/limbi/permis și verifică preview-ul. */
  test("permis, calificări, medie, lucrare și limbi apar în preview", async ({ page }) => {
    test.skip(
      (page.viewportSize()?.width ?? 1440) < 900,
      "preview-ul e ascuns pe mobil (by design)"
    );
    await mockPipeline(page);
    await page.route("**/api/ai/generate-skills", (route) =>
      route.fulfill({
        json: { hardSkills: ["Vânzare consultativă"], softwareTools: [], softSkills: [] },
      })
    );
    await gotoExperience(page, false);
    // job manual rapid
    await page.getByText(/prefer să scriu descrierile manual/i).click();
    await page.getByLabel(/funcția/i).fill("Vânzător");
    await page.getByLabel(/responsabilit/i).fill("Servit clienții");
    await page.getByRole("button", { name: /Salvează jobul/ }).click();
    await page.getByRole("button", { name: /Continuă/ }).click();

    // Educație — cu medie și lucrare de licență; perioada din DROPDOWN-uri
    await expect(page.getByRole("heading", { name: /Educație/ })).toBeVisible({ timeout: 8000 });
    await page.getByRole("button", { name: /Adaugă educație/ }).click();
    await page.locator("select").selectOption({ index: 1 });
    await page.getByPlaceholder(/Universitatea Babeș-Bolyai/).fill("Universitatea Babeș-Bolyai");
    // „De când": anul din dropdown; „Până când" are „Prezent" prima opțiune (default)
    await page.getByRole("button", { name: "anul", exact: true }).click();
    await page.getByRole("listbox").getByRole("option", { name: "2018", exact: true }).click();
    const endYearBtn = page.getByRole("button", { name: "Prezent", exact: true });
    await expect(endYearBtn).toBeVisible();
    await endYearBtn.click();
    await expect(
      page.getByRole("listbox").getByRole("option").first()
    ).toHaveText(/Prezent/);
    await page.getByRole("listbox").getByRole("option", { name: "2022", exact: true }).click();
    await page.getByPlaceholder(/Titlul lucrării de licență/).fill("Optimizarea proceselor logistice");
    await page.getByPlaceholder("ex: 9.50").fill("9.50");
    await page.getByTestId("btn-save-education").click();

    const preview = page.locator(".wizard-preview");
    await expect(preview.getByText("2018 – 2022")).toBeVisible();
    await expect(preview.getByText("Medie: 9.50", { exact: false })).toBeVisible();
    await expect(preview.getByText(/Lucrare: „Optimizarea proceselor logistice"/)).toBeVisible();

    // Cursuri & certificări — apar în preview în secțiune proprie
    await page.getByPlaceholder(/Operator stivuitor ISCIR/).fill("Curs operare casă de marcat");
    await page.getByPlaceholder("anul").fill("2023");
    await page.getByRole("button", { name: /Adaugă cursul/ }).click();
    await expect(preview.getByText(/Curs operare casă de marcat/)).toBeVisible();

    await page.getByRole("button", { name: "Continuă", exact: false }).click();
    // Abilități → Limbi
    await expect(page.getByRole("heading", { name: "Abilități" })).toBeVisible({ timeout: 8000 });
    await page.getByRole("button", { name: /Continuă/ }).click();
    await expect(page.getByRole("heading", { name: /Limbi străine/ })).toBeVisible({ timeout: 8000 });
    await page.getByRole("button", { name: "Limbă" }).click();
    await page.getByRole("listbox").getByRole("option", { name: "Engleză" }).click();
    await page.getByRole("button", { name: "Adaugă", exact: true }).click();
    // limbile apar în preview (scroll intern — dar elementul e prezent și vizibil)
    await expect(preview.getByText("Engleză")).toBeVisible();
    await expect(preview.getByText("(B1)")).toBeVisible();

    // Permis + calificări
    await page.getByRole("button", { name: /Continuă/ }).click();
    await expect(page.getByRole("heading", { name: /Permis & Calificări/ })).toBeVisible({ timeout: 8000 });
    await page.getByRole("button", { name: "✅ Da" }).click();
    await page.getByRole("button", { name: "B", exact: true }).click();
    await page.getByRole("button", { name: "CE", exact: true }).click();
    await page
      .getByPlaceholder(/Operator stivuitor autorizat ISCIR/)
      .fill("Operator stivuitor autorizat ISCIR");
    await expect(preview.getByText("Permis de conducere: categoria B, CE")).toBeVisible();
    await expect(preview.getByText("Operator stivuitor autorizat ISCIR")).toBeVisible();
  });

  test("pasul final: doar preview mare + Descarcă PDF + Înapoi", async ({ page }) => {
    await mockPipeline(page);
    await page.route("**/api/ai/generate-skills", (route) =>
      route.fulfill({
        json: { hardSkills: ["Vânzare consultativă"], softwareTools: [], softSkills: [] },
      })
    );
    // PDF-ul se generează REAL (rendering local, fără AI) — verificăm tot lanțul
    await gotoExperience(page, false);
    await page.getByText(/prefer să scriu descrierile manual/i).click();
    await page.getByLabel(/funcția/i).fill("Vânzător");
    await page.getByLabel(/responsabilit/i).fill("Servit clienții");
    await page.getByRole("button", { name: /Salvează jobul/ }).click();
    await page.getByRole("button", { name: /Continuă/ }).click();
    await page.getByRole("button", { name: /Sari peste/ }).click();
    await expect(page.getByRole("heading", { name: "Abilități" })).toBeVisible({ timeout: 8000 });
    for (const h of [/Limbi străine/, /Permis & Calificări/, /Hobby-uri & Pasiuni/]) {
      await page.getByRole("button", { name: /Continuă/ }).click();
      await expect(page.getByRole("heading", { name: h })).toBeVisible({ timeout: 8000 });
    }
    await page.getByRole("button", { name: /Generează CV-ul/ }).click();

    // pasul final: foaia mare de CV + exact cele 2 acțiuni
    await expect(page.getByRole("heading", { name: /CV-ul tău e gata/ })).toBeVisible({ timeout: 8000 });
    await expect(page.getByTestId("final-cv-sheet")).toBeVisible();
    await expect(page.getByTestId("final-cv-sheet").getByText("Elena Stanciu")).toBeVisible();
    await expect(page.getByRole("button", { name: /Descarcă PDF/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Înapoi/ })).toBeVisible();
    // elementele vechi au dispărut: fără draft text, fără chat de revizuiri
    await expect(page.getByText(/Draft CV generat/)).toHaveCount(0);
    await expect(page.getByPlaceholder(/Scrie modificarea dorită/)).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Regenerează/ })).toHaveCount(0);
    // preview-ul lateral e ascuns pe pasul final (nu dublăm CV-ul)
    await expect(page.locator(".wizard-preview")).toHaveCount(0);

    // ── selectorul de design: 5 variante, comutare instant, zero AI ──
    const sheet = page.getByTestId("final-cv-sheet");
    for (const id of ["classic", "modern", "elegant", "compact", "minimal"]) {
      await expect(page.getByTestId(`template-${id}`)).toBeVisible();
    }
    // default: classic
    await expect(page.getByTestId("template-classic")).toHaveAttribute("aria-checked", "true");
    await expect(sheet.locator("[data-template='classic']")).toBeVisible();
    // comutare pe Modern → layout cu sidebar navy
    await page.getByTestId("template-modern").click();
    await expect(page.getByTestId("template-modern")).toHaveAttribute("aria-checked", "true");
    await expect(sheet.locator("[data-template='modern']")).toBeVisible();
    await expect(sheet.getByText("Contact", { exact: true })).toBeVisible();
    // comutare pe Minimalist
    await page.getByTestId("template-minimal").click();
    await expect(sheet.locator("[data-template='minimal']")).toBeVisible();
    // înapoi pe Elegant pentru descărcare
    await page.getByTestId("template-elegant").click();
    await expect(sheet.locator("[data-template='elegant']")).toBeVisible();

    // descărcarea generează PDF-ul REAL în designul ales, cu numele + data
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /Descarcă PDF/ }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(
      /^CV_Elena_Stanciu_\d{4}-\d{2}-\d{2}\.pdf$/
    );
    // conținutul e un PDF valid, nu un răspuns de eroare
    const path = await download.path();
    const { readFileSync } = await import("fs");
    const buf = readFileSync(path);
    expect(buf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(buf.length).toBeGreaterThan(10000);
  });
});
