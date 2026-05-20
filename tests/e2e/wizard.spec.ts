import { test, expect } from "@playwright/test";

// ─── Helper: skip step 1 + 2, arrive at contact form ────────────────────────
async function goToContact(page: import("@playwright/test").Page) {
  await page.goto("/creare-cv");
  await page.getByText("Sari peste · CV universal").click();
  await page.waitForTimeout(300);
  await page.getByText("Nu am fotografie potrivită · Sari peste").click();
  await page.waitForTimeout(300);
}

// ─── Helper: fill contact form + arrive at Experience (step 8) ───────────────
async function goToExperience(page: import("@playwright/test").Page) {
  await goToContact(page);
  await expect(page.getByRole("heading", { name: "Date de contact" })).toBeVisible({ timeout: 8000 });
  await page.getByLabel(/Prenume/i).fill("Andrei");
  await page.getByLabel(/Nume de familie/i).fill("Popescu");
  await page.getByLabel(/Email/i).fill("andrei@gmail.com");
  await page.getByLabel(/Telefon/i).fill("0721234567");
  await page.getByLabel(/Oraș/i).fill("Cluj-Napoca");
  await page.getByRole("button", { name: "Continuă" }).click();
  await page.waitForTimeout(300);
}

// ─── Helper: arrive at Education (step 9) ────────────────────────────────────
async function goToEducation(page: import("@playwright/test").Page) {
  await goToExperience(page);
  await expect(page.getByRole("heading", { name: "Experiență profesională" })).toBeVisible({ timeout: 8000 });
  await page.getByRole("button", { name: /Continuă/ }).last().click();
  await page.waitForTimeout(300);
}

// ─── Helper: arrive at Skills ────────────────────────────────────────────────
async function goToSkills(page: import("@playwright/test").Page) {
  await goToEducation(page);
  await expect(page.getByRole("heading", { name: "Educație" })).toBeVisible({ timeout: 8000 });
  await page.getByRole("button", { name: "Continuă" }).click();
  await page.waitForTimeout(300);
}

// ─── Helper: arrive at Languages ─────────────────────────────────────────────
async function goToLanguages(page: import("@playwright/test").Page) {
  await goToSkills(page);
  await expect(page.getByRole("heading", { name: "Abilități" })).toBeVisible({ timeout: 8000 });
  await page.getByRole("button", { name: "Continuă" }).click();
  await page.waitForTimeout(300);
}

// ─── Helper: arrive at License ───────────────────────────────────────────────
async function goToLicense(page: import("@playwright/test").Page) {
  await goToLanguages(page);
  await expect(page.getByRole("heading", { name: "Limbi străine" })).toBeVisible({ timeout: 8000 });
  await page.getByRole("button", { name: "Continuă" }).click();
  await page.waitForTimeout(300);
}

// ─── Helper: arrive at Hobbies ───────────────────────────────────────────────
async function goToHobbies(page: import("@playwright/test").Page) {
  await goToLicense(page);
  await expect(page.getByRole("heading", { name: "Permis & Calificări" })).toBeVisible({ timeout: 8000 });
  await page.getByRole("button", { name: "Continuă" }).click();
  await page.waitForTimeout(300);
}

// ─── Helper: arrive at Draft ─────────────────────────────────────────────────
async function goToDraft(page: import("@playwright/test").Page) {
  await goToHobbies(page);
  await expect(page.getByRole("heading", { name: "Hobby-uri & Pasiuni" })).toBeVisible({ timeout: 8000 });
  await page.getByRole("button", { name: "Generează CV-ul!" }).click();
  await page.waitForTimeout(300);
}

// ─── STEP 1 — Job Description ────────────────────────────────────────────────
test.describe("Wizard — Step 1: Job Description", () => {
  test("wizardul pornește direct la step 1", async ({ page }) => {
    await page.goto("/creare-cv");
    await expect(page.getByRole("heading", { name: "Ce job vrei să obții?" })).toBeVisible({ timeout: 10000 });
  });

  test("logo CV Smart vizibil în wizard", async ({ page }) => {
    await page.goto("/creare-cv");
    // Logo is in sidebar (desktop) or mobile header (mobile) — check either
    const sidebarLogo = await page.locator(".wizard-sidebar").getByText("CV Smart").isVisible();
    const mobileLogo = await page.locator(".wizard-mobile-header").getByText("CV Smart").isVisible();
    expect(sidebarLogo || mobileLogo).toBe(true);
  });

  test("textarea și butoane vizibile", async ({ page }) => {
    await page.goto("/creare-cv");
    await expect(page.getByRole("heading", { name: "Ce job vrei să obții?" })).toBeVisible({ timeout: 8000 });
    await expect(page.locator("textarea").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Continuă" })).toBeVisible();
    await expect(page.getByText("Sari peste · CV universal")).toBeVisible();
  });

  test("exemplele rapide populează textarea", async ({ page }) => {
    await page.goto("/creare-cv");
    await expect(page.getByText("Sales Manager la Mega Image")).toBeVisible({ timeout: 8000 });
    await page.getByText("Sales Manager la Mega Image").click();
    await expect(page.locator("textarea").first()).toHaveValue("Sales Manager la Mega Image");
  });

  test("'Sari peste' navighează la step fotografie", async ({ page }) => {
    await page.goto("/creare-cv");
    await page.getByText("Sari peste · CV universal").click();
    await expect(page.getByRole("heading", { name: "Adaugă o fotografie" })).toBeVisible({ timeout: 8000 });
  });

  test("completare job description + Continuă merge la fotografie", async ({ page }) => {
    await page.goto("/creare-cv");
    await page.locator("textarea").first().fill("Programator Full-Stack React la o companie IT din Cluj");
    await page.getByRole("button", { name: "Continuă" }).click();
    await expect(page.getByRole("heading", { name: "Adaugă o fotografie" })).toBeVisible({ timeout: 8000 });
  });
});

// ─── STEP 2 — Photo ──────────────────────────────────────────────────────────
test.describe("Wizard — Step 2: Photo", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/creare-cv");
    await page.getByText("Sari peste · CV universal").click();
    await page.waitForTimeout(300);
  });

  test("ecranul fotografiei are toate elementele", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Adaugă o fotografie" })).toBeVisible({ timeout: 8000 });
    await expect(page.getByText("+38% șanse mai multe cu fotografie")).toBeVisible();
    await expect(page.getByText("Nu am fotografie potrivită · Sari peste")).toBeVisible();
  });

  test("zona de upload este prezentă în DOM", async ({ page }) => {
    await expect(page.locator("input[type='file']")).toBeAttached({ timeout: 8000 });
  });

  test("'Sari peste' navighează la date de contact", async ({ page }) => {
    await page.getByText("Nu am fotografie potrivită · Sari peste").click();
    await expect(page.getByRole("heading", { name: "Date de contact" })).toBeVisible({ timeout: 8000 });
  });
});

// ─── STEP 3 — Contact Form ───────────────────────────────────────────────────
test.describe("Wizard — Step 3: Contact Form", () => {
  test.beforeEach(async ({ page }) => {
    await goToContact(page);
  });

  test("formularul de contact are toate câmpurile", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Date de contact" })).toBeVisible({ timeout: 8000 });
    await expect(page.getByLabel(/Prenume/i)).toBeVisible();
    await expect(page.getByLabel(/Nume de familie/i)).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/Telefon/i)).toBeVisible();
    await expect(page.getByLabel(/Oraș/i)).toBeVisible();
    await expect(page.getByLabel(/Stradă/i)).toBeVisible();
    await expect(page.getByLabel(/Număr \(opțional\)/i)).toBeVisible();
    await expect(page.getByLabel(/Apartament/i)).toBeVisible();
    await expect(page.getByLabel(/LinkedIn/i)).toBeVisible();
  });

  test("câmpurile de adresă sunt opționale — Continuă funcționează fără ele", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Date de contact" })).toBeVisible({ timeout: 8000 });
    await page.getByLabel(/Prenume/i).fill("Andrei");
    await page.getByLabel(/Nume de familie/i).fill("Popescu");
    await page.locator('input[type="email"]').fill("andrei@gmail.com");
    await page.locator('input[type="tel"]').fill("0721234567");
    await page.locator('input[placeholder*="Cluj"]').fill("Cluj-Napoca");
    // Leave stradă, număr, apartament empty — should still proceed
    await page.getByRole("button", { name: "Continuă" }).click();
    await expect(page.getByText("Pas 4 din 10")).toBeVisible({ timeout: 5000 });
  });

  test("câmpurile de adresă se completează și salvează corect", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Date de contact" })).toBeVisible({ timeout: 8000 });
    await page.getByLabel(/Stradă/i).fill("Str. Mihai Eminescu");
    await expect(page.getByLabel(/Stradă/i)).toHaveValue("Str. Mihai Eminescu");
    await page.getByLabel(/Număr \(opțional\)/i).fill("12");
    await expect(page.getByLabel(/Număr \(opțional\)/i)).toHaveValue("12");
    await page.getByLabel(/Apartament/i).fill("4A");
    await expect(page.getByLabel(/Apartament/i)).toHaveValue("4A");
  });

  test("icon email nu se suprapune cu textul — padding suficient", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Date de contact" })).toBeVisible({ timeout: 8000 });
    // Use direct input locator; getByLabel returns the label element not the input
    const emailInput = page.locator('input[type="email"]');
    const paddingLeft = await emailInput.evaluate((el) =>
      parseInt(window.getComputedStyle(el).paddingLeft)
    );
    // Inline style sets 56px when icon present — must clear icon (left:16px + w:16px = 32px)
    expect(paddingLeft).toBeGreaterThanOrEqual(48);
  });

  test("icon telefon nu se suprapune cu textul — padding suficient", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Date de contact" })).toBeVisible({ timeout: 8000 });
    const phoneInput = page.locator('input[type="tel"]');
    const paddingLeft = await phoneInput.evaluate((el) =>
      parseInt(window.getComputedStyle(el).paddingLeft)
    );
    expect(paddingLeft).toBeGreaterThanOrEqual(48);
  });

  test("icon oraș nu se suprapune cu textul — padding suficient", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Date de contact" })).toBeVisible({ timeout: 8000 });
    const cityInput = page.locator('input[placeholder*="Cluj"]');
    const paddingLeft = await cityInput.evaluate((el) =>
      parseInt(window.getComputedStyle(el).paddingLeft)
    );
    expect(paddingLeft).toBeGreaterThanOrEqual(48);
  });

  test("câmpurile cu icon se completează corect fără trunchiere", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Date de contact" })).toBeVisible({ timeout: 8000 });
    await page.locator('input[type="email"]').fill("andrei.popescu@gmail.com");
    await expect(page.locator('input[type="email"]')).toHaveValue("andrei.popescu@gmail.com");
    await page.locator('input[type="tel"]').fill("0721234567");
    await expect(page.locator('input[type="tel"]')).toHaveValue("0721 234 567");
    await page.locator('input[placeholder*="Cluj"]').fill("Cluj-Napoca");
    await expect(page.locator('input[placeholder*="Cluj"]')).toHaveValue("Cluj-Napoca");
  });

  test("validare — câmpuri obligatorii goale", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Date de contact" })).toBeVisible({ timeout: 8000 });
    await page.getByRole("button", { name: "Continuă" }).click();
    await expect(page.getByText("Introdu prenumele")).toBeVisible();
    await expect(page.getByText("Introdu numele de familie")).toBeVisible();
    await expect(page.getByText("Introdu adresa de email")).toBeVisible();
    await expect(page.getByText("Introdu numărul de telefon")).toBeVisible();
    await expect(page.getByText("Introdu orașul")).toBeVisible();
  });

  test("validare — email invalid", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Date de contact" })).toBeVisible({ timeout: 8000 });
    await page.getByLabel(/Prenume/i).fill("Andrei");
    await page.getByLabel(/Nume de familie/i).fill("Popescu");
    await page.getByLabel(/Email/i).fill("nu-este-email");
    await page.getByLabel(/Telefon/i).fill("0721234567");
    await page.getByLabel(/Oraș/i).fill("București");
    await page.getByRole("button", { name: "Continuă" }).click();
    await expect(page.getByText("Email invalid")).toBeVisible();
  });

  test("validare — telefon format invalid", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Date de contact" })).toBeVisible({ timeout: 8000 });
    await page.getByLabel(/Prenume/i).fill("Andrei");
    await page.getByLabel(/Nume de familie/i).fill("Popescu");
    await page.getByLabel(/Email/i).fill("andrei@gmail.com");
    await page.getByLabel(/Telefon/i).fill("123");
    await page.getByLabel(/Oraș/i).fill("București");
    await page.getByRole("button", { name: "Continuă" }).click();
    await expect(page.getByText("Format: 07XX XXX XXX")).toBeVisible();
  });

  test("preview nume complet apare în timp real", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Date de contact" })).toBeVisible({ timeout: 8000 });
    await page.getByLabel(/Prenume/i).fill("Andrei");
    await page.getByLabel(/Nume de familie/i).fill("Popescu");
    await expect(page.getByText("Andrei Popescu").first()).toBeVisible();
  });

  test("completare corectă → merge la experiență (Pas 4)", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Date de contact" })).toBeVisible({ timeout: 8000 });
    await page.getByLabel(/Prenume/i).fill("Andrei");
    await page.getByLabel(/Nume de familie/i).fill("Popescu");
    await page.getByLabel(/Email/i).fill("andrei.popescu@gmail.com");
    await page.getByLabel(/Telefon/i).fill("0721234567");
    await page.getByLabel(/Oraș/i).fill("București");
    await page.getByRole("button", { name: "Continuă" }).click();
    await expect(page.getByText("Pas 4 din 10")).toBeVisible({ timeout: 5000 });
  });
});

// ─── STEP 8 — Work Experience ────────────────────────────────────────────────
test.describe("Wizard — Step 8: Work Experience", () => {
  test("pagina experiență are form de adăugare", async ({ page }) => {
    await goToExperience(page);
    await expect(page.getByRole("heading", { name: "Experiență profesională" })).toBeVisible({ timeout: 8000 });
    await expect(page.getByLabel(/Funcție|Titlu job/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByLabel(/Companie/i)).toBeVisible();
    await expect(page.getByLabel(/Perioadă/i)).toBeVisible();
  });

  test("adaugă un job și îl salvează", async ({ page }) => {
    await goToExperience(page);
    await expect(page.getByRole("heading", { name: "Experiență profesională" })).toBeVisible({ timeout: 8000 });

    if (await page.getByText("Adaugă experiență profesională").isVisible().catch(() => false)) {
      await page.getByText("Adaugă experiență profesională").click();
    }

    await page.getByLabel(/Funcție|Titlu job/i).fill("Software Developer");
    await page.getByLabel(/Companie/i).fill("TechCorp SRL");
    await page.getByLabel(/Perioadă/i).fill("Ian 2022 – Prezent");
    await page.getByText("Adaugă experiența").click();

    await expect(page.getByText("Software Developer").first()).toBeVisible({ timeout: 3000 });
    await expect(page.getByText("TechCorp SRL").first()).toBeVisible();
  });

  test("șterge un job adăugat", async ({ page }) => {
    await goToExperience(page);
    if (await page.getByText("Adaugă experiență profesională").isVisible().catch(() => false)) {
      await page.getByText("Adaugă experiență profesională").click();
    }
    await page.getByLabel(/Funcție|Titlu job/i).fill("Developer");
    await page.getByLabel(/Companie/i).fill("TestCo");
    await page.getByLabel(/Perioadă/i).fill("2023 – Prezent");
    await page.getByText("Adaugă experiența").click();
    await expect(page.getByText("Developer").first()).toBeVisible({ timeout: 3000 });
    await page.getByTestId("btn-delete-exp").first().click();
    await expect(page.getByText("Adaugă experiență profesională")).toBeVisible({ timeout: 5000 });
  });

  test("Continuă fără experiență → merge la educație (Pas 5)", async ({ page }) => {
    await goToExperience(page);
    await expect(page.getByRole("heading", { name: "Experiență profesională" })).toBeVisible({ timeout: 8000 });
    await page.getByRole("button", { name: /Continuă/ }).last().click();
    await expect(page.getByText("Pas 5 din 10")).toBeVisible({ timeout: 5000 });
  });
});

// ─── STEP 9 — Education ──────────────────────────────────────────────────────
test.describe("Wizard — Step 9: Education", () => {
  test("pagina educație are chat AI și buton Continuă", async ({ page }) => {
    await goToEducation(page);
    await expect(page.getByRole("heading", { name: "Educație" })).toBeVisible({ timeout: 8000 });
    await expect(page.getByText("Bună! Hai să discutăm despre studiile tale.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Continuă" })).toBeVisible();
  });

  test("Continuă din educație → merge la abilități (Pas 6)", async ({ page }) => {
    await goToEducation(page);
    await expect(page.getByRole("heading", { name: "Educație" })).toBeVisible({ timeout: 8000 });
    await page.getByRole("button", { name: "Continuă" }).click();
    await expect(page.getByText("Pas 6 din 10")).toBeVisible({ timeout: 5000 });
  });
});

// ─── STEP 10 — Skills ────────────────────────────────────────────────────────
test.describe("Wizard — Step 10: Skills", () => {
  test("pagina abilități are chat AI și adăugare manuală", async ({ page }) => {
    await goToSkills(page);
    await expect(page.getByRole("heading", { name: "Abilități" })).toBeVisible({ timeout: 8000 });
    await expect(page.getByText("Acum să vorbim despre abilitățile tale!")).toBeVisible();
    await expect(page.getByPlaceholder("Adaugă abilitate manual")).toBeVisible();
  });

  test("adaugă abilitate manuală cu Enter", async ({ page }) => {
    await goToSkills(page);
    await expect(page.getByRole("heading", { name: "Abilități" })).toBeVisible({ timeout: 8000 });
    await page.getByPlaceholder("Adaugă abilitate manual").fill("React.js");
    await page.getByPlaceholder("Adaugă abilitate manual").press("Enter");
    await expect(page.getByText("React.js").first()).toBeVisible({ timeout: 3000 });
  });

  test("Continuă din abilități → merge la limbi (Pas 12)", async ({ page }) => {
    await goToSkills(page);
    await expect(page.getByRole("heading", { name: "Abilități" })).toBeVisible({ timeout: 8000 });
    await page.getByRole("button", { name: "Continuă" }).click();
    await expect(page.getByText("Pas 7 din 10")).toBeVisible({ timeout: 5000 });
  });
});

// ─── STEP 11 — Languages ─────────────────────────────────────────────────────
test.describe("Wizard — Step 11: Languages", () => {
  test("pagina limbi are quick-add și formular", async ({ page }) => {
    await goToLanguages(page);
    await expect(page.getByRole("heading", { name: "Limbi străine" })).toBeVisible({ timeout: 8000 });
    await expect(page.getByText("Engleză").first()).toBeVisible();
    await expect(page.getByText("Franceză").first()).toBeVisible();
  });

  test("adaugă engleză cu quick-add și buton Adaugă", async ({ page }) => {
    await goToLanguages(page);
    await expect(page.getByRole("heading", { name: "Limbi străine" })).toBeVisible({ timeout: 8000 });
    await page.getByRole("button", { name: "Engleză" }).click();
    await page.getByRole("button", { name: "Adaugă" }).click();
    // Entry should appear in the list
    await expect(page.getByText("Engleză").first()).toBeVisible({ timeout: 3000 });
    await expect(page.getByText("B1").first()).toBeVisible();
  });

  test("Continuă din limbi → merge la permis (Pas 13)", async ({ page }) => {
    await goToLanguages(page);
    await expect(page.getByRole("heading", { name: "Limbi străine" })).toBeVisible({ timeout: 8000 });
    await page.getByRole("button", { name: "Continuă" }).click();
    await expect(page.getByText("Pas 8 din 10")).toBeVisible({ timeout: 5000 });
  });
});

// ─── STEP 12 — License & Qualifications ─────────────────────────────────────
test.describe("Wizard — Step 12: License", () => {
  test("pagina permis are toggle Da/Nu", async ({ page }) => {
    await goToLicense(page);
    await expect(page.getByRole("heading", { name: "Permis & Calificări" })).toBeVisible({ timeout: 8000 });
    await expect(page.getByText("✅ Da")).toBeVisible();
    await expect(page.getByText("❌ Nu")).toBeVisible();
  });

  test("toggle 'Da' afișează categoriile de permis", async ({ page }) => {
    await goToLicense(page);
    await expect(page.getByRole("heading", { name: "Permis & Calificări" })).toBeVisible({ timeout: 8000 });
    await page.getByText("✅ Da").click();
    await expect(page.getByText("Categorii permis:")).toBeVisible();
    await expect(page.getByRole("button", { name: "B", exact: true })).toBeVisible();
  });

  test("selectează categoria B și C", async ({ page }) => {
    await goToLicense(page);
    await page.getByText("✅ Da").click();
    await page.getByRole("button", { name: "B", exact: true }).click();
    await page.getByRole("button", { name: "C", exact: true }).click();
    await expect(page.getByRole("button", { name: "B", exact: true })).toBeVisible();
  });

  test("Continuă din permis → merge la hobby-uri (Pas 14)", async ({ page }) => {
    await goToLicense(page);
    await expect(page.getByRole("heading", { name: "Permis & Calificări" })).toBeVisible({ timeout: 8000 });
    await page.getByRole("button", { name: "Continuă" }).click();
    await expect(page.getByText("Pas 9 din 10")).toBeVisible({ timeout: 5000 });
  });
});

// ─── STEP 13 — Hobbies ───────────────────────────────────────────────────────
test.describe("Wizard — Step 13: Hobbies", () => {
  test("pagina hobby-uri are chat AI și adăugare manuală", async ({ page }) => {
    await goToHobbies(page);
    await expect(page.getByRole("heading", { name: "Hobby-uri & Pasiuni" })).toBeVisible({ timeout: 8000 });
    await expect(page.getByPlaceholder("Adaugă hobby manual")).toBeVisible();
    await expect(page.getByText("✋ Sari peste hobby-uri")).toBeVisible();
  });

  test("adaugă hobby manual cu buton", async ({ page }) => {
    await goToHobbies(page);
    await expect(page.getByRole("heading", { name: "Hobby-uri & Pasiuni" })).toBeVisible({ timeout: 8000 });
    await page.getByPlaceholder("Adaugă hobby manual").fill("Fotografie");
    await page.getByRole("button", { name: "Adaugă" }).last().click();
    await expect(page.locator('.text-violet-700').filter({ hasText: "Fotografie" })).toBeVisible({ timeout: 3000 });
  });

  test("'Generează CV-ul!' → merge la draft (Pas 15)", async ({ page }) => {
    await goToHobbies(page);
    await expect(page.getByRole("heading", { name: "Hobby-uri & Pasiuni" })).toBeVisible({ timeout: 8000 });
    await page.getByRole("button", { name: "Generează CV-ul!" }).click();
    await expect(page.getByText("Pas 10 din 10")).toBeVisible({ timeout: 5000 });
  });
});

// ─── STEP 14 — Draft Generation ─────────────────────────────────────────────
test.describe("Wizard — Step 14: Draft", () => {
  test("step 14 pornește generarea AI", async ({ page }) => {
    await goToDraft(page);
    await expect(page.getByText("Pas 10 din 10")).toBeVisible({ timeout: 5000 });
    const hasLoading = await page.getByText("Generez CV-ul tău...").isVisible().catch(() => false);
    const hasDraft = await page.getByRole("heading", { name: "Draft CV generat" }).isVisible().catch(() => false);
    expect(hasLoading || hasDraft).toBeTruthy();
  });

  test("draft-ul CV este generat și afișat (test cu timeout AI)", async ({ page }) => {
    await goToDraft(page);
    await expect(page.getByText("Pas 10 din 10")).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole("heading", { name: "Draft CV generat" })).toBeVisible({ timeout: 45000 });
    await expect(page.getByText("Andrei Popescu").first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Finalizează & Descarcă PDF")).toBeVisible();
  });
});

// ─── Back Navigation Tests ───────────────────────────────────────────────────
test.describe("Wizard — Navigare Înapoi", () => {
  test("Step 1: buton Înapoi este vizibil", async ({ page }) => {
    await page.goto("/creare-cv");
    await expect(page.getByRole("heading", { name: "Ce job vrei să obții?" })).toBeVisible({ timeout: 8000 });
    await expect(page.getByRole("button", { name: "← Înapoi" })).toBeVisible();
  });

  test("Step 1: Înapoi navighează la pagina principală", async ({ page }) => {
    await page.goto("/creare-cv");
    await expect(page.getByRole("heading", { name: "Ce job vrei să obții?" })).toBeVisible({ timeout: 8000 });
    await page.getByRole("button", { name: "← Înapoi" }).click();
    await expect(page).toHaveURL("/", { timeout: 5000 });
  });

  test("Step 2: buton Înapoi este vizibil", async ({ page }) => {
    await page.goto("/creare-cv");
    await page.getByText("Sari peste · CV universal").click();
    await expect(page.getByRole("heading", { name: "Adaugă o fotografie" })).toBeVisible({ timeout: 8000 });
    await expect(page.getByRole("button", { name: "← Înapoi" })).toBeVisible();
  });

  test("Step 2: Înapoi navighează la Step 1", async ({ page }) => {
    await page.goto("/creare-cv");
    await page.getByText("Sari peste · CV universal").click();
    await expect(page.getByRole("heading", { name: "Adaugă o fotografie" })).toBeVisible({ timeout: 8000 });
    await page.getByRole("button", { name: "← Înapoi" }).click();
    await expect(page.getByRole("heading", { name: "Ce job vrei să obții?" })).toBeVisible({ timeout: 5000 });
  });

  test("Step 3 (contact): Înapoi navighează la fotografie", async ({ page }) => {
    await goToContact(page);
    await expect(page.getByRole("heading", { name: "Date de contact" })).toBeVisible({ timeout: 8000 });
    await page.getByRole("button", { name: "← Înapoi" }).click();
    await expect(page.getByRole("heading", { name: "Adaugă o fotografie" })).toBeVisible({ timeout: 5000 });
  });

  test("Step 8 (experiență): Înapoi navighează la contact", async ({ page }) => {
    await goToExperience(page);
    await expect(page.getByRole("heading", { name: "Experiență profesională" })).toBeVisible({ timeout: 8000 });
    await page.getByRole("button", { name: "← Înapoi" }).last().click();
    await expect(page.getByRole("heading", { name: "Date de contact" })).toBeVisible({ timeout: 5000 });
  });

  test("Step 9 (educație): Înapoi navighează la experiență", async ({ page }) => {
    await goToEducation(page);
    await expect(page.getByRole("heading", { name: "Educație" })).toBeVisible({ timeout: 8000 });
    await page.getByRole("button", { name: "← Înapoi" }).click();
    await expect(page.getByRole("heading", { name: "Experiență profesională" })).toBeVisible({ timeout: 5000 });
  });

  test("Step 10 (abilități): Înapoi navighează la educație", async ({ page }) => {
    await goToSkills(page);
    await expect(page.getByRole("heading", { name: "Abilități" })).toBeVisible({ timeout: 8000 });
    await page.getByRole("button", { name: "← Înapoi" }).click();
    await expect(page.getByRole("heading", { name: "Educație" })).toBeVisible({ timeout: 5000 });
  });

  test("Step 11 (limbi): Înapoi navighează la abilități", async ({ page }) => {
    await goToLanguages(page);
    await expect(page.getByRole("heading", { name: "Limbi străine" })).toBeVisible({ timeout: 8000 });
    await page.getByRole("button", { name: "← Înapoi" }).click();
    await expect(page.getByRole("heading", { name: "Abilități" })).toBeVisible({ timeout: 5000 });
  });

  test("Step 12 (permis): Înapoi navighează la limbi", async ({ page }) => {
    await goToLicense(page);
    await expect(page.getByRole("heading", { name: "Permis & Calificări" })).toBeVisible({ timeout: 8000 });
    await page.getByRole("button", { name: "← Înapoi" }).click();
    await expect(page.getByRole("heading", { name: "Limbi străine" })).toBeVisible({ timeout: 5000 });
  });

  test("Step 13 (hobby-uri): Înapoi navighează la permis", async ({ page }) => {
    await goToHobbies(page);
    await expect(page.getByRole("heading", { name: "Hobby-uri & Pasiuni" })).toBeVisible({ timeout: 8000 });
    await page.getByRole("button", { name: "← Înapoi" }).click();
    await expect(page.getByRole("heading", { name: "Permis & Calificări" })).toBeVisible({ timeout: 5000 });
  });

  test("Step 14 (draft): Înapoi navighează la hobby-uri", async ({ page }) => {
    await goToDraft(page);
    await expect(page.getByText("Pas 10 din 10")).toBeVisible({ timeout: 5000 });
    await page.getByRole("button", { name: "← Înapoi" }).click();
    await expect(page.getByRole("heading", { name: "Hobby-uri & Pasiuni" })).toBeVisible({ timeout: 5000 });
  });
});
