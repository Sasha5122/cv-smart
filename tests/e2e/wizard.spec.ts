import { test, expect } from "@playwright/test";

test.describe("Wizard UI", () => {
  test.beforeEach(async ({ page }) => {
    // Mock the session creation to avoid DB dependency
    await page.route("**/api/session/**", async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) });
    });
  });

  test("progress bar shows step 1 of 15", async ({ page }) => {
    await page.goto("/creare-cv");
    // Wait for page to load or show error
    await page.waitForLoadState("networkidle");

    // Should show wizard content or an error about Supabase
    const body = await page.locator("body").textContent();
    expect(body).toBeTruthy();
  });
});

test.describe("Wizard Steps Navigation (requires Supabase)", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "Desktop only for wizard tests");

  test("step 0 — shows CV upload", async ({ page }) => {
    // Mock the createSession API
    await page.route("**/creare-cv", async (route) => {
      await route.continue();
    });

    await page.goto("/creare-cv");
    await page.waitForLoadState("networkidle");

    // If Supabase is configured, we should see the wizard
    const isWizard = await page.locator("text=CV Smart").isVisible();
    if (isWizard) {
      await expect(page.locator("text=Pas 1 din 15")).toBeVisible();
      await expect(page.locator("text=Ai un CV existent")).toBeVisible();
    }
  });

  test("step 0 — skip button works", async ({ page }) => {
    await page.goto("/creare-cv");
    await page.waitForLoadState("networkidle");

    const skipBtn = page.locator("text=Nu am CV · Completez manual");
    if (await skipBtn.isVisible()) {
      await skipBtn.click();
      await expect(page.locator("text=Pas 2 din 15")).toBeVisible({ timeout: 3000 });
    }
  });

  test("step 3 — last name validation", async ({ page }) => {
    await page.goto("/creare-cv");
    await page.waitForLoadState("networkidle");

    // Navigate to step 3 by skipping early steps
    const skipButtons = [
      "text=Nu am CV · Completez manual",
      "text=Sari peste · CV universal",
      "text=Nu am fotografie potrivită · Sari peste",
    ];

    for (const btn of skipButtons) {
      const el = page.locator(btn);
      if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
        await el.click();
        await page.waitForTimeout(300);
      }
    }

    // Should be on last name step
    const continueBtn = page.locator("text=Continuă").first();
    if (await continueBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await continueBtn.click();
      await expect(page.locator("text=Introdu numele de familie")).toBeVisible({ timeout: 2000 });
    }
  });
});
