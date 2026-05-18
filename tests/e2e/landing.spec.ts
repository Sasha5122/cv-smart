import { test, expect } from "@playwright/test";

test.describe("Landing Page — Design & Content", () => {
  test("correct title and H1", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/CV Smart/);
    await expect(page.locator("h1")).toContainText("CV profesional cu AI");
    await expect(page.locator("h1")).toContainText("în 5 minute.");
  });

  test("nav: logo + CTA button", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("CV Smart").first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Începe gratuit/ }).first()).toBeVisible();
  });

  test("hero: subheadline prezent și scurt", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Personalizat pentru jobul tău. Optimizat pentru ATS.")).toBeVisible();
  });

  test("hero: CTA principal vizibil", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /Creează CV-ul tău/ })).toBeVisible();
  });

  test("hero: social proof sub buton", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("100% gratuit · Fără înregistrare")).toBeVisible();
  });

  test("stats bar: 3 metrici vizibile", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("5 min", { exact: true })).toBeVisible();
    await expect(page.getByText("ATS", { exact: true })).toBeVisible();
    await expect(page.getByText("100%", { exact: true })).toBeVisible();
    await expect(page.getByText("timp mediu")).toBeVisible();
    await expect(page.getByText("optimizat", { exact: true })).toBeVisible();
    await expect(page.getByText("în română")).toBeVisible();
  });

  test("secțiunea Cum funcționează: 3 pași", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Cum funcționează")).toBeVisible();
    await expect(page.getByText("Descrie jobul vizat")).toBeVisible();
    await expect(page.getByText("Interviu de 5 minute")).toBeVisible();
    await expect(page.getByText("Descarcă PDF-ul")).toBeVisible();
  });

  test("cards pași au numerele 01 02 03", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("01", { exact: true })).toBeVisible();
    await expect(page.getByText("02", { exact: true })).toBeVisible();
    await expect(page.getByText("03", { exact: true })).toBeVisible();
  });

  test("secțiunea De ce CV Smart: 4 features", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("De ce CV Smart")).toBeVisible();
    await expect(page.getByText("Adaptat jobului tău")).toBeVisible();
    await expect(page.getByText("ATS-friendly garantat")).toBeVisible();
    await expect(page.getByText("Piața românească")).toBeVisible();
    await expect(page.getByText("Ghidare completă")).toBeVisible();
  });

  test("CTA final prezent", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Creează-ți CV-ul acum.")).toBeVisible();
    await expect(page.getByRole("link", { name: /Începe gratuit/ }).last()).toBeVisible();
  });

  test("footer: logo + links + copyright", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Termeni")).toBeVisible();
    await expect(page.getByText("Confidențialitate")).toBeVisible();
    await expect(page.getByText("Contact")).toBeVisible();
    await expect(page.getByText(/© 2026/)).toBeVisible();
  });

  test("CTA navighează la wizard", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Creează CV-ul tău/ }).click();
    await expect(page).toHaveURL(/\/creare-cv/);
  });

  test("paleta de culori: background page #F8F7F4", async ({ page }) => {
    await page.goto("/");
    const bg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    // rgb(248, 247, 244) = #F8F7F4
    expect(bg).toBe("rgb(248, 247, 244)");
  });

  test("H1 font size este mare (>= 48px)", async ({ page }) => {
    await page.goto("/");
    const fontSize = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      return h1 ? parseFloat(window.getComputedStyle(h1).fontSize) : 0;
    });
    expect(fontSize).toBeGreaterThanOrEqual(48);
  });

  test("mobile: layout corect pe 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByRole("link", { name: /Creează CV-ul tău/ })).toBeVisible();
    await expect(page.getByText("Cum funcționează")).toBeVisible();
  });

  test("no overflow horizontal pe mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(380);
  });
});
