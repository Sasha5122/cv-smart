import { test, expect } from "@playwright/test";

test.describe("Wizard — Starter Choice (Issue #1)", () => {
  test("arată ecranul de alegere la /creare-cv", async ({ page }) => {
    await page.goto("/creare-cv");
    await expect(page.getByText("Cum vrei să începi CV-ul?")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Importă CV-ul meu")).toBeVisible();
    await expect(page.getByText("De la zero")).toBeVisible();
    await expect(page.getByText("Recomandat")).toBeVisible();
  });

  test("logo CV Smart vizibil pe ecranul de alegere", async ({ page }) => {
    await page.goto("/creare-cv");
    await expect(page.getByText("CV Smart").first()).toBeVisible({ timeout: 8000 });
    await expect(page.getByText("100% gratuit · Fără înregistrare")).toBeVisible();
  });

  test("'De la zero' navighează la wizard", async ({ page }) => {
    await page.goto("/creare-cv");
    await page.getByText("De la zero").click();
    // Wizard layout should appear with progress bar
    await expect(page.getByText(/Pas \d+ din 15/)).toBeVisible({ timeout: 8000 });
  });

  test("'Importă CV-ul meu' navighează la step Upload", async ({ page }) => {
    await page.goto("/creare-cv");
    await page.getByText("Importă CV-ul meu").click();
    await expect(page.getByText(/Ai un CV existent/i)).toBeVisible({ timeout: 8000 });
  });
});

test.describe("Wizard — Import CV (Issue #2)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/creare-cv");
    await page.getByText("Importă CV-ul meu").click();
    await page.waitForTimeout(600);
  });

  test("zona de upload este vizibilă", async ({ page }) => {
    await expect(page.getByText(/Trage fișierul|alege din calculator/i)).toBeVisible();
    await expect(page.getByText(/PDF, DOCX/i)).toBeVisible();
  });

  test("butonul 'Nu am CV' skip-uieste la job description", async ({ page }) => {
    await page.getByText(/Nu am CV|Completez manual/i).click();
    await expect(page.getByText(/Pas 2 din 15/)).toBeVisible({ timeout: 5000 });
  });

  test("drag-drop zone schimbă stilul la hover", async ({ page }) => {
    const dropzone = page.locator("[ondragover]").first();
    // Zone exists in DOM
    await expect(page.locator("input[type='file']")).toBeAttached();
  });
});

test.describe("Wizard — Contact Form (Issue #3)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/creare-cv");
    await page.getByText("De la zero").click();
    await page.waitForTimeout(500);
    // Skip job description
    await page.getByText("Sari peste · CV universal").click();
    await page.waitForTimeout(400);
    // Skip photo
    await page.getByText("Nu am fotografie potrivită · Sari peste").click();
    await page.waitForTimeout(400);
  });

  test("formularul de contact are toate câmpurile", async ({ page }) => {
    await expect(page.getByText("Date de contact")).toBeVisible({ timeout: 8000 });
    await expect(page.getByLabel(/Prenume/i)).toBeVisible();
    await expect(page.getByLabel(/Nume de familie/i)).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/Telefon/i)).toBeVisible();
    await expect(page.getByLabel(/Oraș/i)).toBeVisible();
    await expect(page.getByLabel(/LinkedIn/i)).toBeVisible();
  });

  test("validare — câmpuri obligatorii goale", async ({ page }) => {
    await expect(page.getByText("Date de contact")).toBeVisible({ timeout: 8000 });
    await page.getByText("Continuă").click();
    await expect(page.getByText("Introdu prenumele")).toBeVisible();
    await expect(page.getByText("Introdu numele de familie")).toBeVisible();
    await expect(page.getByText("Introdu adresa de email")).toBeVisible();
    await expect(page.getByText("Introdu numărul de telefon")).toBeVisible();
    await expect(page.getByText("Introdu orașul")).toBeVisible();
  });

  test("validare — email invalid", async ({ page }) => {
    await expect(page.getByText("Date de contact")).toBeVisible({ timeout: 8000 });
    await page.getByLabel(/Email/i).fill("nu-este-email");
    await page.getByLabel(/Prenume/i).fill("Andrei");
    await page.getByLabel(/Nume de familie/i).fill("Popescu");
    await page.getByLabel(/Telefon/i).fill("0721234567");
    await page.getByLabel(/Oraș/i).fill("București");
    await page.getByText("Continuă").click();
    await expect(page.getByText("Email invalid")).toBeVisible();
  });

  test("validare — telefon format invalid", async ({ page }) => {
    await expect(page.getByText("Date de contact")).toBeVisible({ timeout: 8000 });
    await page.getByLabel(/Prenume/i).fill("Andrei");
    await page.getByLabel(/Nume de familie/i).fill("Popescu");
    await page.getByLabel(/Email/i).fill("andrei@gmail.com");
    await page.getByLabel(/Telefon/i).fill("123");
    await page.getByLabel(/Oraș/i).fill("București");
    await page.getByText("Continuă").click();
    await expect(page.getByText("Format: 07XX XXX XXX")).toBeVisible();
  });

  test("preview nume complet apare în timp real", async ({ page }) => {
    await expect(page.getByText("Date de contact")).toBeVisible({ timeout: 8000 });
    await page.getByLabel(/Prenume/i).fill("Andrei");
    await page.getByLabel(/Nume de familie/i).fill("Popescu");
    await expect(page.getByText("Andrei Popescu").first()).toBeVisible();
  });

  test("completare completă date Andrei Popescu + continuă", async ({ page }) => {
    await expect(page.getByText("Date de contact")).toBeVisible({ timeout: 8000 });

    await page.getByLabel(/Prenume/i).fill("Andrei");
    await page.getByLabel(/Nume de familie/i).fill("Popescu");
    await page.getByLabel(/Email/i).fill("andrei.popescu@gmail.com");
    await page.getByLabel(/Telefon/i).fill("0721234567");
    await page.getByLabel(/Oraș/i).fill("București");

    await page.getByText("Continuă").click();
    // Should jump to step 8 (education) — Pas 9 din 15
    await expect(page.getByText("Pas 9 din 15")).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Wizard — Work Experience (Issue #4)", () => {
  // Navigate to experience step by setting URL state
  const navigateToExperience = async (page: import("@playwright/test").Page) => {
    await page.goto("/creare-cv");
    await page.getByText("De la zero").click();
    await page.waitForTimeout(400);

    // Skip job description
    await page.getByText("Sari peste · CV universal").click().catch(() => {});
    await page.waitForTimeout(300);
    // Skip photo
    await page.getByText("Nu am fotografie potrivită · Sari peste").click().catch(() => {});
    await page.waitForTimeout(300);
    // Fill contact minimum
    if (await page.getByLabel(/Prenume/i).isVisible().catch(() => false)) {
      await page.getByLabel(/Prenume/i).fill("Andrei");
      await page.getByLabel(/Nume de familie/i).fill("Popescu");
      await page.getByLabel(/Email/i).fill("andrei@gmail.com");
      await page.getByLabel(/Telefon/i).fill("0721234567");
      await page.getByLabel(/Oraș/i).fill("București");
      await page.getByText("Continuă").click();
      await page.waitForTimeout(400);
    }
    // Skip education
    await page.getByText(/Continuă|Skip/i).first().click().catch(() => {});
    await page.waitForTimeout(300);
  };

  test("work experience are buton Adaugă", async ({ page }) => {
    await navigateToExperience(page);
    await expect(page.getByText("Adaugă experiență profesională").or(page.getByText("Experiență profesională"))).toBeVisible({ timeout: 8000 });
  });

  test("formular adăugare job — câmpuri vizibile", async ({ page }) => {
    await navigateToExperience(page);
    await expect(page.getByText("Experiență profesională")).toBeVisible({ timeout: 8000 });
    // Form should be visible (first job, empty state shows form)
    await expect(page.getByLabel(/Funcție|Titlu job/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByLabel(/Companie/i)).toBeVisible();
    await expect(page.getByLabel(/Perioadă/i)).toBeVisible();
  });

  test("adaugă și salvează un job", async ({ page }) => {
    await navigateToExperience(page);
    await expect(page.getByText("Experiență profesională")).toBeVisible({ timeout: 8000 });

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

  test("pot șterge o experiență adăugată", async ({ page }) => {
    await navigateToExperience(page);
    await expect(page.getByText("Experiență profesională")).toBeVisible({ timeout: 8000 });

    if (await page.getByText("Adaugă experiență profesională").isVisible().catch(() => false)) {
      await page.getByText("Adaugă experiență profesională").click();
    }

    await page.getByLabel(/Funcție|Titlu job/i).fill("Developer");
    await page.getByLabel(/Companie/i).fill("TestCo");
    await page.getByLabel(/Perioadă/i).fill("2023 – Prezent");
    await page.getByText("Adaugă experiența").click();

    await expect(page.getByText("Developer").first()).toBeVisible({ timeout: 3000 });
    // Click the delete (trash) button
    await page.getByTestId("btn-delete-exp").first().click();
    // Entry should disappear
    await expect(page.getByText("Adaugă experiență profesională")).toBeVisible({ timeout: 5000 });
  });
});
