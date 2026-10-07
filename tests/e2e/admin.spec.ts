import { test, expect } from "@playwright/test";

/**
 * Admin demo (public, date generate) + anonimizarea admin-ului real.
 * Rulează fără AI: /demo/admin e generat determinist, iar /api/admin/data
 * e verificat doar pentru forma răspunsului.
 */

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}/;

test.describe("Admin demo — /demo/admin", () => {
  test("se încarcă fără parolă, arată ca admin-ul real, cu cele trei secțiuni", async ({ page }) => {
    await page.goto("/demo/admin");
    await expect(page.getByTestId("admin-cvs")).toBeVisible();
    await expect(page.getByTestId("admin-sessions")).toBeVisible();
    await expect(page.getByTestId("admin-messages")).toBeVisible();
    // fără marcaj „demo” în interfață
    await expect(page.locator("main")).not.toContainText(/demo/i);
    // 23 CV-uri generate (8 plătite + 15 neplătite), 120 fără CV
    await expect(page.getByTestId("admin-cvs").getByRole("heading")).toContainText("(23)");
    await expect(page.getByTestId("admin-sessions").getByRole("heading")).toContainText("(120)");
  });

  test("nu afișează nicio adresă de email sau nume — doar „Utilizator #…”", async ({ page }) => {
    await page.goto("/demo/admin");
    await expect(page.getByTestId("admin-cvs")).toBeVisible();
    const text = await page.locator("main").innerText();
    expect(text).not.toMatch(EMAIL_RE);
    expect(text).toMatch(/Utilizator #[0-9a-f]{6}/);
  });

  test("fiecare rând are cost AI, apeluri, tokeni, timp și erori; click → detaliile apelurilor", async ({ page }) => {
    await page.goto("/demo/admin");
    const cvs = page.getByTestId("admin-cvs");
    await expect(cvs.getByRole("columnheader", { name: "Cost AI" })).toBeVisible();
    await expect(cvs.getByRole("columnheader", { name: "Timp în wizard" })).toBeVisible();
    await expect(cvs.getByRole("columnheader", { name: "Bullet-uri valide" })).toBeVisible();
    const firstRow = page.getByTestId("admin-cv-row").first();
    await expect(firstRow).toContainText("¢");
    await firstRow.click();
    const details = page.getByTestId("admin-session-details").first();
    await expect(details).toBeVisible();
    await expect(details).toContainText("gpt-5.4");
    await firstRow.click();
    await expect(page.getByTestId("admin-session-details")).toHaveCount(0);
  });

  test("engleza e opțiune, nu implicit; comutatorul traduce panoul și se ține minte", async ({ page }) => {
    await page.goto("/demo/admin");
    await expect(page.getByTestId("admin-cvs").getByRole("heading")).toContainText("CV-uri generate");
    await page.getByTestId("admin-lang-en").click();
    await expect(page.getByTestId("admin-cvs").getByRole("heading")).toContainText("Generated CVs");
    await expect(page.getByTestId("admin-tab-eval")).toHaveText("Evaluation");
    await page.getByTestId("admin-tab-eval").click();
    await expect(page.getByTestId("admin-eval-benchmark")).toContainText("PRODUCTION");
    // persistă la reîncărcare
    await page.reload();
    await expect(page.getByTestId("admin-cvs").getByRole("heading")).toContainText("Generated CVs");
    await page.getByTestId("admin-lang-ro").click();
    await expect(page.getByTestId("admin-cvs").getByRole("heading")).toContainText("CV-uri generate");
  });

  test("?lang=en deschide direct în engleză", async ({ page }) => {
    await page.goto("/demo/admin?lang=en");
    await expect(page.getByTestId("admin-sessions").getByRole("heading")).toContainText("Sessions without a CV");
  });

  test("tab-ul Evaluare: sumar, funnel, etape, erori, benchmark, filtru de perioadă", async ({ page }) => {
    await page.goto("/demo/admin");
    await page.getByTestId("admin-lang-ro").click();
    await page.getByTestId("admin-tab-eval").click();
    await expect(page.getByTestId("admin-eval")).toBeVisible();
    await expect(page.getByTestId("tile-sessions")).toContainText("143");
    await expect(page.getByTestId("tile-cvs")).toContainText("23");
    await expect(page.getByTestId("tile-paid")).toContainText("8");
    await expect(page.getByTestId("admin-eval-funnel")).toBeVisible();
    await expect(page.getByTestId("admin-eval-stages")).toContainText("Bullet-uri CV");
    await expect(page.getByTestId("admin-eval-errors")).toContainText("/api/cv/generate-bullets");
    await expect(page.getByTestId("admin-eval-benchmark")).toContainText("PRODUCȚIE");
    await expect(page.getByTestId("admin-eval-heatmap")).toBeVisible();

    await page.getByTestId("admin-period-7").click();
    const sevenDays = await page.getByTestId("tile-sessions").innerText();
    expect(sevenDays).not.toContain("143");
    await page.getByTestId("admin-period-0").click();
    await expect(page.getByTestId("tile-sessions")).toContainText("143");
  });

  test("pagina nu este indexabilă", async ({ page }) => {
    await page.goto("/demo/admin");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });
});

test.describe("Admin real — anonimizare", () => {
  test("/api/admin/data refuză fără cookie", async ({ request }) => {
    const res = await request.get("/api/admin/data");
    expect(res.status()).toBe(401);
  });

  test("după login, răspunsul API nu conține email sau nume", async ({ page }) => {
    await page.goto("/admin");
    await page.getByTestId("admin-password").fill("playwright-admin"); // setată în playwright.config.ts
    const [res] = await Promise.all([
      // ignorăm GET-ul de la montare (401, fără cookie) — vrem răspunsul de după login
      page.waitForResponse((r) => r.url().includes("/api/admin/data") && r.status() !== 401),
      page.getByTestId("admin-login-submit").click(),
    ]);
    if (res.status() !== 200) {
      console.log(`[admin.spec] /api/admin/data a răspuns ${res.status()}: ${(await res.text()).slice(0, 300)}`);
    }
    test.skip(res.status() !== 200, "baza de date nu e disponibilă în acest mediu");
    const body = (await res.json()) as Record<string, unknown>;
    expect(JSON.stringify(body)).not.toMatch(EMAIL_RE);
    expect(body).toHaveProperty("sessions");
    expect(body).toHaveProperty("aiCalls");
    expect(body).toHaveProperty("errors");
    for (const s of body.sessions as Record<string, unknown>[]) {
      expect(s).not.toHaveProperty("email");
      expect(s).not.toHaveProperty("name");
      expect(String(s.label)).toMatch(/^Utilizator #[0-9a-f]{6}$/);
    }
  });
});
