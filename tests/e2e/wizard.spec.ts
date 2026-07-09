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

async function mockPipeline(page: Page) {
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

  test("pasul 1 se încarcă cu titlu, cuprins și preview", async ({ page }) => {
    await page.goto("/creare-cv");
    await expect(
      page.getByRole("heading", { name: "Ce job vrei să obții?" })
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Pasul 1 din 10/i)).toBeVisible();
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

test.describe("Wizard — pipeline experiență (AI mock)", () => {
  test("gate: butonul Analizează cere minim 200 caractere", async ({ page }) => {
    await mockPipeline(page);
    await gotoExperience(page);
    await page.getByLabel(/funcția/i).fill("Contabil");
    await page.getByPlaceholder(/povesti unui prieten/i).fill("text scurt");
    await expect(page.getByRole("button", { name: /Analizează/ })).toBeDisabled();
    await expect(page.getByText(/încă \d+ caractere/)).toBeVisible();
  });

  test("fluxul complet: input → 5 întrebări → selecție → salvare în CV", async ({ page }) => {
    await mockPipeline(page);
    await gotoExperience(page);

    // ecran 1 — input
    await page.getByLabel(/funcția/i).fill("Contabil");
    await page.getByLabel(/compania/i).fill("SC ContExpert SRL");
    await page.getByLabel(/perioada/i).fill("2021 – prezent");
    await page.getByPlaceholder(/povesti unui prieten/i).fill(RAW_TEXT);
    await expect(page.getByText(/suficient de detaliat/)).toBeVisible();
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

    // ecran 3 — selecție
    await expect(page.getByText("7 descrieri generate")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Ai ales 0 din 5–6")).toBeVisible();
    await expect(page.getByRole("button", { name: /Alege minim/ })).toBeDisabled();

    // selectează 5
    for (let i = 0; i < 5; i++) {
      await page.getByText(BULLETS[i].text).click();
    }
    await expect(page.getByText("Ai ales 5 din 5–6")).toBeVisible();
    await expect(page.getByRole("button", { name: /Finalizează jobul/ })).toBeEnabled();

    // limita superioară: a 7-a selecție nu intră (max 6)
    await page.getByText(BULLETS[5].text).click();
    await page.getByText(BULLETS[6].text).click();
    await expect(page.getByText("Ai ales 6 din 5–6")).toBeVisible();

    await page.getByRole("button", { name: /Finalizează jobul/ }).click();

    // rezumat + CV actualizat
    await expect(page.getByRole("heading", { name: /Joburile tale/ })).toBeVisible({
      timeout: 10000,
    });
    if ((page.viewportSize()?.width ?? 1440) >= 900) {
      await expect(
        page.locator(".wizard-preview").getByText(/D112, D300 și D394/)
      ).toBeVisible();
    } else {
      await expect(page.getByText(/D112, D300 și D394/).first()).toBeVisible();
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
