import { test, expect } from "@playwright/test";

/**
 * Limba interfeței: română implicit, engleză ca opțiune (cookie NEXT_LOCALE).
 * Nivel demo: landing, preț, contact, footer; paginile legale rămân în română.
 */

test.describe("Limbă — RO implicit, EN ca opțiune", () => {
  test("landing-ul e în română fără cookie", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "ro");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Garantăm un CV profesionist");
    await expect(page.getByTestId("hero-cta")).toHaveText("Începe acum →");
  });

  test("butonul EN traduce landing-ul, persistă la refresh și RO îl readuce", async ({ page }) => {
    await page.goto("/");
    await page.locator("header").getByTestId("lang-en").click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("A professional CV, guaranteed");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByTestId("hero-cta")).toHaveText("Start now →");
    await expect(page.locator("footer")).toContainText("All rights reserved.");

    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("A professional CV, guaranteed");

    await page.locator("header").getByTestId("lang-ro").click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Garantăm un CV profesionist");
  });

  test("/en e link partajabil: setează engleza și trimite la landing", async ({ page }) => {
    await page.goto("/en");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("A professional CV, guaranteed");
    await page.goto("/pret");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Simple pricing, no surprises");
    await page.goto("/contact");
    await expect(page.getByTestId("contact-submit")).toHaveText("Send message");
    await page.goto("/ro");
    await expect(page.getByTestId("hero-cta")).toHaveText("Începe acum →");
  });

  test("paginile legale rămân în română, cu notă în engleză doar pe EN", async ({ page }) => {
    await page.goto("/termeni");
    await expect(page.getByTestId("legal-language-note")).toHaveCount(0);
    await page.goto("/en");
    await page.goto("/termeni");
    await expect(page.getByTestId("legal-language-note")).toContainText("available in Romanian only");
    await page.goto("/ro");
  });

  test("admin-ul folosește același cookie de limbă", async ({ page }) => {
    await page.goto("/en");
    await page.goto("/demo/admin");
    await expect(page.getByTestId("admin-cvs").getByRole("heading")).toContainText("Generated CVs");
    await page.getByTestId("admin-lang-ro").click();
    await expect(page.getByTestId("admin-cvs").getByRole("heading")).toContainText("CV-uri generate");
    await page.goto("/");
    await expect(page.getByTestId("hero-cta")).toHaveText("Începe acum →");
  });
});

test.describe("Wizard în engleză (nivel demo)", () => {
  test("sidebar-ul, pasul 1 și pasul 2 sunt în engleză; româna rămâne implicită", async ({ page }) => {
    await page.goto("/creare-cv");
    await expect(page.getByRole("heading", { name: "Date de contact" })).toBeVisible();

    await page.goto("/en");
    await page.goto("/creare-cv");
    await expect(page.getByRole("heading", { name: "Contact details" })).toBeVisible();
    await expect(page.getByTestId("sidebar-step-4")).toContainText("Experience");
    await expect(page.getByTestId("sidebar-step-10")).toContainText("Finish");
    await expect(page.locator("aside").getByTestId("lang-switch")).toBeVisible();

    // completăm pasul 1 ca să ajungem la pasul 2 (Poză) în engleză
    await page.getByLabel(/First name/i).fill("Ana");
    await page.getByLabel(/^Last name/i).fill("Pop");
    await page.getByLabel(/E-?mail/i).fill("ana@example.com");
    await page.getByLabel(/Phone/i).fill("0721234567");
    await page.getByRole("button", { name: /Continue/ }).click();
    await expect(page.getByRole("heading", { name: /photo/i })).toBeVisible();

    await page.goto("/ro");
    await page.goto("/creare-cv");
    await expect(page.getByTestId("sidebar-step-4")).toContainText("Experiență");
  });
});
