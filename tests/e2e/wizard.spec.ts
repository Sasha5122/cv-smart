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

/** Corectarea AI e best-effort — în teste returnează textul primit
 *  (inclusiv varianta batch pentru bullet-urile manuale). */
async function mockCorrectText(page: Page) {
  await page.route("**/api/ai/correct-text", (route, request) => {
    const body = request.postDataJSON();
    if (body.kind === "cv-bullets") {
      route.fulfill({ json: { corrected: body.lines, rewritten: true } });
    } else {
      route.fulfill({ json: { corrected: body.text } });
    }
  });
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

/** Navighează de la început până la pasul Experiență (ecranul de input).
 *  Ordinea nouă: 1 Contact → 2 Fotografie → 3 Job vizat → 4 Experiență. */
async function gotoExperience(page: Page, withJD = true) {
  await mockCorrectText(page);
  await page.goto("/creare-cv");
  // Pas 1 — Contact
  await expect(page.getByRole("heading", { name: "Date de contact" })).toBeVisible({
    timeout: 15000,
  });
  await page.getByLabel(/prenume/i).fill("Elena");
  await page.getByLabel(/nume de familie/i).fill("Stanciu");
  await page.getByLabel(/email/i).fill("elena.stanciu@gmail.com");
  await page.getByLabel(/telefon/i).fill("0722314558");
  await page.getByLabel(/oraș/i).first().fill("București");
  await page.getByRole("button", { name: /Continuă/ }).click();
  // Pas 2 — Fotografie (skip)
  await page.getByText("Nu am poză potrivită").click();
  // Pas 3 — Job vizat
  await expect(
    page.getByRole("heading", { name: "Ce job vrei să obții?" })
  ).toBeVisible({ timeout: 8000 });
  if (withJD) {
    await page
      .getByPlaceholder(/copy-paste la descrierea/i)
      .fill("Căutăm Contabil Senior: D112, D300, D394, Saga, portofoliu de clienți.");
    await page.getByRole("button", { name: "Continuă", exact: true }).click();
  } else {
    await page.getByText(/Nu am un anunț/).click();
  }
  // Pas 4 — Experiență (input)
  await expect(page.getByRole("heading", { name: /Povestește-ne ce faci/ })).toBeVisible({
    timeout: 10000,
  });
}

test.describe("Landing — pagina de start", () => {
  test("landing-ul se încarcă cu hero, showcase-ul mare și linkurile legale", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Garantăm un CV profesionist/ })
    ).toBeVisible({ timeout: 15000 });
    await expect(
      page.getByText(/Dezvoltat și optimizat special pentru piața din România/)
    ).toBeVisible();
    await expect(page.getByTestId("hero-cta")).toBeVisible();
    await expect(page.getByTestId("hero-cta")).toContainText("Începe acum");
    // descrierea produsului + prețul, vizibile pe homepage (cerință Paddle)
    await expect(
      page.getByText(/serviciu online de creare a CV-urilor profesioniste/)
    ).toBeVisible();
    await expect(page.getByText(/Preț: 49 lei \(9,99 €\) per CV/)).toBeVisible();
    // showcase: pornește AUTOMAT — prima glisare începe la ~2s de la
    // încărcare, deci al doilea CV devine activ fără nicio interacțiune
    await expect(page.getByTestId("cv-showcase")).toBeVisible();
    // rama taie animația (overflow hidden) — pe mobil nu se văd 2 CV-uri tăiate
    await expect(page.getByTestId("showcase-layer-0").locator("..")).toHaveCSS(
      "overflow",
      "hidden"
    );
    await expect(page.getByTestId("showcase-layer-1")).toHaveAttribute("aria-hidden", "false", {
      timeout: 10000,
    });
    // dots: comutarea manuală aduce primul CV înapoi deasupra
    await page.getByTestId("showcase-dot-0").click();
    await expect(page.getByTestId("showcase-layer-0")).toHaveAttribute("aria-hidden", "false", {
      timeout: 5000,
    });
    // footer: linkurile legale există
    await expect(
      page.locator("footer").getByRole("link", { name: "Termeni și condiții" })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Politica de confidențialitate" })).toBeVisible();
  });

  test("linkurile «Termeni și condiții» și «Preț» din header funcționează", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "pe mobil linkurile sunt doar în footer");
    await page.goto("/");
    await expect(page.locator("header").getByRole("link", { name: "Preț" })).toBeVisible();
    await page.locator("header").getByRole("link", { name: "Termeni și condiții" }).click();
    await expect(page).toHaveURL(/\/termeni/);
    await expect(page.getByRole("heading", { name: "Termeni și condiții" })).toBeVisible();
    // conținutul legal e real, nu placeholder — inclusiv Paddle ca Merchant of Record
    await expect(page.getByText(/Merchant of Record/).first()).toBeVisible();
    await expect(page.getByText(/dreptul de retragere/i).first()).toBeVisible();
    // logo-ul duce înapoi la pagina principală
    await page.locator("header").getByRole("link", { name: /CVexpres/ }).click();
    await expect(page.getByTestId("hero-cta")).toBeVisible();
  });

  test("pagina /pret afișează 49 lei (9,99 €) cu plată unică", async ({ page }) => {
    await page.goto("/pret");
    await expect(page.getByText("49 lei", { exact: true })).toBeVisible();
    await expect(page.getByText(/9,99 €/).first()).toBeVisible();
    await expect(page.getByText(/Plată unică — fără abonament/)).toBeVisible();
    await expect(page.getByRole("link", { name: "Începe" }).last()).toBeVisible();
  });

  test("pagina /refund există, cu garanția și emailul de rambursare", async ({ page }) => {
    await page.goto("/refund");
    await expect(page.getByRole("heading", { name: "Politica de rambursare" })).toBeVisible();
    await expect(page.getByText(/rambursăm integral prețul plătit/)).toBeVisible();
    await expect(page.getByText(/Cum ceri o rambursare/)).toBeVisible();
    await expect(page.getByRole("link", { name: "Termeni și condiții" }).first()).toBeVisible();
  });

  test("pagina de contact trimite mesajul către admin", async ({ page }) => {
    // răspuns determinist — nu depindem de baza de date în test
    await page.route("**/api/contact", (route) =>
      route.fulfill({ json: { ok: true } })
    );
    await page.goto("/contact");
    await page.getByTestId("contact-name").fill("Test Utilizator");
    await page.getByTestId("contact-email").fill("test@exemplu.ro");
    await page.getByTestId("contact-message").fill("Salut! Acesta este un mesaj de test.");
    await page.getByTestId("contact-submit").click();
    await expect(page.getByTestId("contact-success")).toBeVisible();
    // din commit-ul „Legal: doar email de suport la contact” pagina afișează doar emailul
    await expect(page.getByText(/Email: /)).toBeVisible();
  });

  test("adminul cere parolă; parola corectă deschide panoul", async ({ page }) => {
    // datele vin mock-uite — testăm autentificarea și randarea panoului
    await page.goto("/admin");
    await expect(page.getByTestId("admin-login")).toBeVisible();

    // parolă greșită → eroare
    await page.getByTestId("admin-password").fill("gresita");
    await page.getByTestId("admin-login-submit").click();
    await expect(page.getByTestId("admin-login-error")).toBeVisible();

    // parolă corectă → panoul cu cele 3 secțiuni
    await page.getByTestId("admin-password").fill("playwright-admin"); // setată în playwright.config.ts
    await page.getByTestId("admin-login-submit").click();
    await expect(page.getByTestId("admin-cvs")).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId("admin-sessions")).toBeVisible();
    await expect(page.getByTestId("admin-messages")).toBeVisible();
  });

  test("«Începe acum» sare direct la pasul 1 al wizard-ului", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("hero-cta").click();
    await expect(page).toHaveURL(/\/creare-cv/);
    await expect(
      page.getByRole("heading", { name: "Date de contact" })
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Pasul 1 din 10/i)).toBeVisible();
  });
});

test.describe("Wizard — navigare și shell editorial", () => {

  test("pasul 1 (Contact) se încarcă cu titlu și preview, fără buton Înapoi", async ({ page }) => {
    await page.goto("/creare-cv");
    await expect(
      page.getByRole("heading", { name: "Date de contact" })
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Pasul 1 din 10/i)).toBeVisible();
    // primul pas nu are buton Înapoi
    await expect(page.getByRole("button", { name: /Înapoi/ })).toHaveCount(0);
    if ((page.viewportSize()?.width ?? 1440) >= 900) {
      // sidebar-ul și preview-ul sunt ascunse pe mobil (by design)
      await expect(page.getByText("Pașii tăi")).toBeVisible();
      await expect(page.getByText("Preview CV")).toBeVisible();
    }
  });

  test("Job vizat e pasul 3; skip-ul anunțului duce la Experiență", async ({ page }) => {
    await mockCorrectText(page);
    await page.goto("/creare-cv");
    await expect(page.getByRole("heading", { name: "Date de contact" })).toBeVisible({
      timeout: 15000,
    });
    await page.getByLabel(/prenume/i).fill("Elena");
    await page.getByLabel(/nume de familie/i).fill("Stanciu");
    await page.getByLabel(/email/i).fill("e@s.ro");
    await page.getByLabel(/telefon/i).fill("0722314558");
    await page.getByLabel(/oraș/i).first().fill("Cluj");
    await page.getByRole("button", { name: /Continuă/ }).click();
    await page.getByText("Nu am poză potrivită").click();
    await expect(page.getByText(/Pasul 3 din 10/i)).toBeVisible();
    // fără exemple rapide (eliminate)
    await expect(page.getByText("Exemple rapide")).toHaveCount(0);
    await page.getByText(/Nu am un anunț/).click();
    await expect(page.getByText(/Pasul 4 din 10/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /Povestește-ne ce faci/ })).toBeVisible();
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
    await expect(page.getByRole("heading", { name: "Date de contact" })).toBeVisible({
      timeout: 15000,
    });
    // progres real chiar pe pasul 1 (Contact) — trebuie să supraviețuiască
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
});

test.describe("Contact — județ dropdown + modal străinătate", () => {
  async function gotoContact(page: Page) {
    await mockCorrectText(page);
    await page.route("**/api/ai/research", (route) => route.fulfill({ json: { ok: true } }));
    // Contactul E pasul 1 acum — direct la țintă
    await page.goto("/creare-cv");
    await expect(page.getByRole("heading", { name: "Date de contact" })).toBeVisible({
      timeout: 15000,
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

    // poate continua FĂRĂ datele din România → pasul 2 (Fotografie)
    await page.getByRole("button", { name: /Continuă/ }).click();
    await expect(page.getByRole("heading", { name: /Adaugă o poză/ })).toBeVisible({
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

  test("ruta manuală rescrie descrierile în formă nominală de CV", async ({ page }) => {
    await gotoExperience(page);
    // mock țintit: batch-ul de bullet-uri devine formă nominală
    await page.route("**/api/ai/correct-text", (route, request) => {
      const body = request.postDataJSON();
      const map: Record<string, string> = {
        "Coordonat echipa de 3 colegi": "Coordonarea unei echipe de 3 colegi",
        "Gestionat stocul din depozit": "Gestionarea stocului din depozit",
      };
      if (body.kind === "cv-bullets") {
        route.fulfill({
          json: {
            corrected: (body.lines as string[]).map((l) => map[l] ?? l),
            rewritten: true,
          },
        });
      } else {
        route.fulfill({ json: { corrected: body.text } });
      }
    });

    await page.getByText(/prefer să scriu descrierile manual/i).click();
    await page.getByLabel(/funcția/i).fill("Șef depozit");
    await page
      .getByLabel(/responsabilit/i)
      .fill("Coordonat echipa de 3 colegi\nGestionat stocul din depozit");
    await page.getByRole("button", { name: /Salvează jobul/ }).click();

    await expect(page.getByRole("heading", { name: /Joburile tale/ })).toBeVisible();
    // bulleturile apar în formă nominală, nu participiu
    await expect(page.getByText("Coordonarea unei echipe de 3 colegi").first()).toBeVisible();
    await expect(page.getByText("Gestionarea stocului din depozit").first()).toBeVisible();
    await expect(page.getByText("Coordonat echipa de 3 colegi")).toHaveCount(0);
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
    await expect(catB).toHaveCSS("background-color", "rgb(244, 90, 39)");
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

    // Cursuri & certificări — câmpuri cu etichete clare; apar în preview
    await page.getByLabel(/Numele cursului/).fill("Curs operare casă de marcat");
    await page.getByLabel(/Anul \(opțional\)/).fill("2023");
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
    // calificările — ca la hobby: scrii, AI-ul corectează, apare chip cu X
    await page.getByTestId("qualification-input").fill("Operator stivuitor autorizat ISCIR");
    await page.getByTestId("qualification-add").click();
    await expect(
      page.getByRole("button", { name: /Șterge Operator stivuitor/ })
    ).toBeVisible();
    await expect(preview.getByText("Permis de conducere: categoria B, CE")).toBeVisible();
    await expect(preview.getByText("Operator stivuitor autorizat ISCIR")).toBeVisible();
    // X-ul șterge calificarea
    await page.getByRole("button", { name: /Șterge Operator stivuitor/ }).click();
    await expect(preview.getByText("Operator stivuitor autorizat ISCIR")).toHaveCount(0);
  });

  test("abilitățile NU se regenerează la revenirea pe pas; bifele rămân", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "navigarea prin sidebar e desktop-only");
    await mockPipeline(page);
    let skillsCalls = 0;
    await page.route("**/api/ai/generate-skills", (route) => {
      skillsCalls++;
      route.fulfill({
        json: {
          hardSkills: ["Vânzare consultativă", "Gestionare stocuri"],
          softwareTools: ["Casă de marcat"],
          softSkills: ["Comunicare"],
        },
      });
    });
    await gotoExperience(page, false);
    await page.getByText(/prefer să scriu descrierile manual/i).click();
    await page.getByLabel(/funcția/i).fill("Vânzător");
    await page.getByLabel(/responsabilit/i).fill("Servit clienții");
    await page.getByRole("button", { name: /Salvează jobul/ }).click();
    await page.getByRole("button", { name: /Continuă/ }).click();
    await expect(page.getByRole("heading", { name: /Educație/ })).toBeVisible({ timeout: 8000 });
    await page.getByRole("button", { name: /Sari peste|Continuă/ }).click();

    // Abilități — prima vizită: lista se generează (1 apel AI)
    await expect(page.getByTestId("skills-selection")).toBeVisible({ timeout: 10000 });
    expect(skillsCalls).toBe(1);
    // bifăm o abilitate
    const firstSkill = page.getByTestId("section-hard").locator("input[type=checkbox]").first();
    await firstSkill.check();

    // plecăm pe alt pas prin sidebar și revenim
    await page.getByTestId("sidebar-step-4").click();
    await expect(
      page.getByRole("heading", { name: /Joburile tale|Povestește-ne/i }).first()
    ).toBeVisible({ timeout: 8000 });
    await page.getByTestId("sidebar-step-6").click();

    // lista e din cache: NICIUN apel AI nou, bifa e tot acolo
    await expect(page.getByTestId("skills-selection")).toBeVisible({ timeout: 8000 });
    expect(skillsCalls).toBe(1);
    await expect(
      page.getByTestId("section-hard").locator("input[type=checkbox]").first()
    ).toBeChecked();
  });

  test("pasul final: doar preview mare + Descarcă PDF + Înapoi", async ({ page }, testInfo) => {
    // pe mobil, share-ul nativ e stub-uit — verificăm doar apariția butonului
    await page.addInitScript(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigator as any).canShare = () => true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigator as any).share = () => Promise.resolve();
    });
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

    // ── modelele NOI: fiecare are un preview DEDICAT (oglindește PDF-ul),
    //    nu doar o schimbare de culoare. Fiecare are marca `data-model-preview`
    //    și data-template propriu; selecția schimbă vizibil designul. ──
    for (const id of ["meridian", "cobalt", "riviera", "sapphire", "sage"]) {
      await page.getByTestId(`template-${id}`).click();
      await expect(page.getByTestId(`template-${id}`)).toHaveAttribute("aria-checked", "true");
      const model = sheet.locator(`[data-template='${id}'][data-model-preview]`);
      await expect(model).toBeVisible();
      // numele candidatului apare în designul ales (preview-ul e populat);
      // unele modele împart numele pe 2 rânduri, deci verificăm numele de familie
      await expect(model.getByText("Stanciu", { exact: false }).first()).toBeVisible();
    }

    // înapoi pe Elegant pentru descărcare
    await page.getByTestId("template-elegant").click();
    await expect(sheet.locator("[data-template='elegant']")).toBeVisible();

    // preview-ul e paginat ca PDF-ul — foi separate, fără scrollbar intern
    await expect(sheet).toHaveAttribute("data-preview-page", "1");
    const hasNoInnerScroll = await sheet.evaluate(
      (el) => el.scrollHeight <= el.clientHeight + 1
    );
    expect(hasNoInnerScroll).toBe(true);
    // conținutul e randat la lățimea de referință și SCALAT — pe telefon
    // proporțiile text/foaie sunt identice cu PDF-ul (impresie realistă)
    const innerTransform = await sheet
      .locator("> div")
      .first()
      .evaluate((el) => getComputedStyle(el).transform);
    expect(innerTransform).not.toBe("none");

    // fără acceptarea Termenilor, butonul de descărcare e blocat
    const downloadBtn = page.getByRole("button", { name: /Descarcă PDF/ });
    await expect(downloadBtn).toBeDisabled();
    await expect(page.getByTestId("terms-consent")).toBeVisible();
    await page.getByTestId("terms-checkbox").check();
    await expect(downloadBtn).toBeEnabled();

    // descărcarea generează PDF-ul REAL în designul ales, cu numele + data
    const downloadPromise = page.waitForEvent("download");
    await downloadBtn.click();
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

    // ── pe telefon: după descărcare apare „Trimite" (share sheet nativ) ──
    if (testInfo.project.name === "mobile") {
      await expect(page.getByTestId("share-cv")).toBeVisible();
      await page.getByTestId("share-cv").click(); // stub — nu crapă
    } else {
      // pe desktop butonul NU apare (pointer fin, nu touch)
      await expect(page.getByTestId("share-cv")).toHaveCount(0);
    }

    // ── sidebar-ul clicabil: salt direct la un pas parcurs + înapoi ──
    if ((page.viewportSize()?.width ?? 1440) >= 900) {
      await page.getByTestId("sidebar-step-1").click();
      await expect(page.getByRole("heading", { name: "Date de contact" })).toBeVisible();
      // datele sunt păstrate — editare liberă
      await expect(page.getByLabel(/prenume/i)).toHaveValue("Elena");
      // bifele verzi NU se pierd la saltul înapoi: pașii 2–9 rămân „completați"
      // (verdele reflectă cât a completat userul, nu unde se află acum)
      for (const s of [2, 5, 9]) {
        await expect(page.getByTestId(`sidebar-step-${s}`).locator("svg")).toBeVisible();
      }
      // salt înainte, direct la Finalizare (pas deja vizitat)
      await page.getByTestId("sidebar-step-10").click();
      await expect(page.getByRole("heading", { name: /CV-ul tău e gata/ })).toBeVisible();
      // pașii nevizitați nu sunt clicabili — nimic peste maxStep aici (toți vizitați)
    }

    // ── „Începe de la zero": confirmare → totul se resetează la pasul 1 ──
    page.once("dialog", (d) => d.accept());
    await page.getByTestId("restart-wizard").click();
    await expect(page.getByRole("heading", { name: "Date de contact" })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText(/Pasul 1 din 10/i)).toBeVisible();
    // câmpurile sunt goale — progresul vechi a fost șters definitiv
    await expect(page.getByLabel(/prenume/i)).toHaveValue("");
  });

  test("pașii nevizitați din sidebar NU sunt clicabili", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "sidebar-ul e ascuns pe mobil");
    await page.goto("/creare-cv");
    await expect(page.getByRole("heading", { name: "Date de contact" })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByTestId("sidebar-step-5")).toBeDisabled();
    await expect(page.getByTestId("sidebar-step-10")).toBeDisabled();
    // pasul curent (1) nu e nici el buton de navigare
    await expect(page.getByTestId("sidebar-step-1")).toBeDisabled();
  });
});
