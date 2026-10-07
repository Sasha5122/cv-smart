import { test, expect } from "@playwright/test";

/**
 * Admin demo (public, date generate) + anonimizarea admin-ului real.
 * Rulează fără AI și fără baza de date: /demo/admin e generat determinist,
 * iar /api/admin/data e verificat doar pentru forma răspunsului.
 */

test.describe("Admin demo — /demo/admin", () => {
  test("se încarcă fără parolă, cu banner și cele trei secțiuni", async ({ page }) => {
    await page.goto("/demo/admin");
    await expect(page.getByTestId("admin-demo-banner")).toBeVisible();
    await expect(page.getByTestId("admin-cvs")).toBeVisible();
    await expect(page.getByTestId("admin-sessions")).toBeVisible();
    await expect(page.getByTestId("admin-messages")).toBeVisible();
    // 23 CV-uri generate (8 plătite + 15 neplătite), 120 fără CV
    await expect(page.getByTestId("admin-cvs").getByRole("heading")).toContainText("(23)");
    await expect(page.getByTestId("admin-sessions").getByRole("heading")).toContainText("(120)");
  });

  test("nu afișează nicio adresă de email sau nume — doar „Utilizator #…”", async ({ page }) => {
    await page.goto("/demo/admin");
    await expect(page.getByTestId("admin-cvs")).toBeVisible();
    const text = await page.locator("main").innerText();
    expect(text).not.toMatch(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}/);
    expect(text).toMatch(/Utilizator #[0-9a-f]{6}/);
  });

  test("tab-ul Evaluare: sumar, funnel, etape, erori, benchmark, filtru de perioadă", async ({ page }) => {
    await page.goto("/demo/admin");
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

    // filtrul pe 7 zile reduce numărul de sesiuni, „Tot” îl readuce la 143
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
    // fără Supabase funcțional răspunsul poate fi 500 — atunci nu avem ce verifica
    if (res.status() !== 200) {
      console.log(`[admin.spec] /api/admin/data a răspuns ${res.status()}: ${(await res.text()).slice(0, 300)}`);
    }
    test.skip(res.status() !== 200, "baza de date nu e disponibilă în acest mediu");
    const body = (await res.json()) as Record<string, unknown>;
    const raw = JSON.stringify(body);
    expect(raw).not.toMatch(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}/);
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
