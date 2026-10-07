import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 1,
  timeout: 30000,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000/creare-cv",
    // mereu server propriu — un `pnpm dev` manual cu paywall ON ar fi
    // refolosit altfel și ar anula env-ul de mai jos (teste picate misterios)
    reuseExistingServer: false,
    timeout: 60000,
    // testele e2e verifică fluxul de produs, nu checkout-ul Paddle —
    // paywall-ul se testează separat, manual, în sandbox
    // ADMIN_PASSWORD: valoare de test cunoscută de wizard.spec.ts (nu există fallback în cod)
    env: { NEXT_PUBLIC_PAYWALL_ENABLED: "false", ADMIN_PASSWORD: "playwright-admin" },
  },
});
