import { chromium } from "@playwright/test";

/* Test end-to-end MANUAL al plății Creem (regresie), rulat contra dev-ului
   local pornit cu PAYMENT_PROVIDER=creem + chei de test.
 *   Rulare:  node scripts/creem-e2e.mjs   (cu `pnpm dev` pornit pe :3000)
 * Mock-uim pipeline-ul AI (navigare rapidă, gratuită); plata pe Creem e REALĂ
 * cu cardul de test 4111 1111 1111 1111. Verifică lanțul complet:
 * wizard → redirect Creem → card → revenire → confirmare → auto-download.
 * NU face parte din suita Playwright (aceea rulează cu paywall dezactivat). */

const BASE = "http://localhost:3000";

const BULLETS = [
  "Servit clienții la casă și pe teren, cu accent pe consultanță.",
  "Atins constant țintele lunare de vânzări în magazin.",
  "Gestionat stocul și aranjarea raftului conform standardelor.",
].map((text, i) => ({ id: `b${i + 1}`, text, category: "responsabilitate_core" }));
const QUESTIONS = [1, 2, 3].map((i) => ({ id: `q${i}`, question: `Întrebare ${i}?`, expected_info: "x" }));

async function mockPipeline(page) {
  await page.route("**/api/ai/correct-text", (route, req) => {
    const b = req.postDataJSON();
    if (b.kind === "cv-bullets") route.fulfill({ json: { corrected: b.lines, rewritten: true } });
    else route.fulfill({ json: { corrected: b.text } });
  });
  await page.route("**/api/ai/summary", (route) =>
    route.fulfill({ json: { summary: "Vânzător cu experiență practică și orientare spre client." } })
  );
  await page.route("**/api/cv/analyze", (route) =>
    route.fulfill({ json: { sessionId: "test", questions: QUESTIONS } })
  );
  await page.route("**/api/cv/generate-bullets", (route) =>
    route.fulfill({ json: { bullets: BULLETS, regenerated: false, droppedCount: 0 } })
  );
  await page.route("**/api/cv/select-bullets", (route, req) => {
    const ids = req.postDataJSON().selectedIds;
    route.fulfill({ json: { selected: BULLETS.filter((b) => ids.includes(b.id)) } });
  });
  await page.route("**/api/ai/research", (route) => route.fulfill({ json: { ok: true } }));
  await page.route("**/api/ai/generate-skills", (route) =>
    route.fulfill({ json: { hardSkills: ["Vânzare consultativă"], softwareTools: [], softSkills: [] } })
  );
}

async function reachFinal(page) {
  await page.goto(`${BASE}/creare-cv`);
  await page.getByRole("heading", { name: "Date de contact" }).waitFor({ timeout: 20000 });
  await page.getByLabel(/prenume/i).fill("Elena");
  await page.getByLabel(/nume de familie/i).fill("Stanciu");
  await page.getByLabel(/email/i).fill("elena.stanciu@gmail.com");
  await page.getByLabel(/telefon/i).fill("0722314558");
  await page.getByLabel(/oraș/i).first().fill("București");
  await page.getByRole("button", { name: /Continuă/ }).click();
  await page.getByText("Nu am poză potrivită").click();
  await page.getByRole("heading", { name: "Ce job vrei să obții?" }).waitFor({ timeout: 10000 });
  await page.getByText(/Nu am un anunț/).click();
  await page.getByRole("heading", { name: /Povestește-ne ce faci/ }).waitFor({ timeout: 10000 });
  await page.getByText(/prefer să scriu descrierile manual/i).click();
  await page.getByLabel(/funcția/i).fill("Vânzător");
  await page.getByLabel(/responsabilit/i).fill("Servit clienții");
  await page.getByRole("button", { name: /Salvează jobul/ }).click();
  await page.getByRole("button", { name: /Continuă/ }).click();
  await page.getByRole("button", { name: /Sari peste/ }).click();
  await page.getByRole("heading", { name: "Abilități" }).waitFor({ timeout: 10000 });
  for (const h of [/Limbi străine/, /Permis & Calificări/, /Hobby-uri & Pasiuni/]) {
    await page.getByRole("button", { name: /Continuă/ }).click();
    await page.getByRole("heading", { name: h }).waitFor({ timeout: 10000 });
  }
  await page.getByRole("button", { name: /Generează CV-ul/ }).click();
  await page.getByRole("heading", { name: /CV-ul tău e gata/ }).waitFor({ timeout: 15000 });
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.on("console", (m) => console.log("  [browser]", m.text().slice(0, 200)));
try {
  await mockPipeline(page);
  console.log("→ navighez prin wizard…");
  await reachFinal(page);
  console.log("✓ am ajuns la pasul final");

  await page.getByTestId("terms-checkbox").check();
  console.log("→ apăs Plătește (redirect Creem)…");
  await page.getByTestId("pay-download").click();

  // așteptăm navigarea externă spre Creem
  await page.waitForURL(/creem\.io/, { timeout: 30000 });
  console.log("✓ pe pagina Creem:", page.url());
  await page.waitForTimeout(2500);

  // pas 1 Creem: email e PRE-COMPLETAT și dezactivat (venit prin customer.email).
  // completăm doar numele (dacă e editabil) + țara
  const nameInput = page.locator("#name");
  if ((await nameInput.count()) && (await nameInput.isEditable().catch(() => false))) {
    await nameInput.fill("Elena Stanciu");
  }
  // selectorul de țară — poate fi <select> nativ sau dropdown custom
  const nativeSelect = page.locator("select");
  let countryDone = false;
  if (await nativeSelect.count()) {
    for (const label of ["Romania", "România", "United States"]) {
      try {
        await nativeSelect.first().selectOption({ label });
        countryDone = true;
        console.log("✓ țară (select nativ):", label);
        break;
      } catch { /* încearcă următoarea */ }
    }
  }
  if (!countryDone) {
    const country = page.getByRole("button", { name: /Select billing country/i });
    if (await country.count()) {
      await country.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: "c:/Users/Armaghedon/Desktop/cv_project/_creem-country.png" });
      const opts = await page.evaluate(() =>
        [...document.querySelectorAll('[role="option"], li, [data-value]')]
          .map((e) => (e.textContent || "").trim()).filter(Boolean).slice(0, 12)
      );
      console.log("OPȚIUNI ȚARĂ:", JSON.stringify(opts));
      // căutăm un câmp de search în dropdown
      const search = page.locator('input[type="search"], input[placeholder*="earch" i]').first();
      if (await search.count()) {
        await search.fill("Romania");
        await page.waitForTimeout(600);
      }
      const ro = page.getByText(/^Romania$|^România$/i).first();
      if (await ro.count()) { await ro.click(); countryDone = true; console.log("✓ țară (dropdown): Romania"); }
    }
  }
  await page.waitForTimeout(500);
  const cont = page.getByRole("button", { name: /Continue to payment/i });
  if (await cont.count()) {
    console.log("→ Continue to payment…");
    await cont.click();
    await page.waitForTimeout(3500);
  }

  // completăm cardul (câmpurile sunt în iframe-ul Airwallex) — căutăm în toate
  // frame-urile după placeholder și completăm
  // caută un input în toate frame-urile după placeholder / aria-label / name
  async function fillInFrames(re, value, { seq = false } = {}) {
    for (const frame of page.frames()) {
      const loc = frame.locator("input");
      const n = await loc.count().catch(() => 0);
      for (let i = 0; i < n; i++) {
        const inp = loc.nth(i);
        const ph = (await inp.getAttribute("placeholder").catch(() => "")) || "";
        const aria = (await inp.getAttribute("aria-label").catch(() => "")) || "";
        const name = (await inp.getAttribute("name").catch(() => "")) || "";
        const disabled = await inp.isDisabled().catch(() => false);
        if (!disabled && (re.test(ph) || re.test(aria) || re.test(name))) {
          await inp.click().catch(() => {});
          if (seq) await inp.pressSequentially(value, { delay: 40 }).catch(() => {});
          else await inp.fill(value).catch(() => inp.pressSequentially(value, { delay: 40 }).catch(() => {}));
          return true;
        }
      }
    }
    return false;
  }

  console.log("→ completez cardul de test…");
  const okNum = await fillInFrames(/card ?number|^number$/i, "4111111111111111", { seq: true });
  const okExp = await fillInFrames(/mm\s*\/\s*yy|expir/i, "1234", { seq: true });
  const okCvc = await fillInFrames(/cvc|cvv/i, "123", { seq: true });
  const okName = await fillInFrames(/cardholder|name on card|holder/i, "Elena Stanciu");
  console.log(`  card: nr=${okNum} exp=${okExp} cvc=${okCvc} name=${okName}`);
  await page.screenshot({ path: "c:/Users/Armaghedon/Desktop/cv_project/_creem-card.png" });

  // pregătim capturarea descărcării automate de la revenire
  let downloaded = null;
  page.on("download", (d) => { downloaded = d.suggestedFilename(); });

  console.log("→ apăs Pay…");
  await page.getByRole("button", { name: /Pay €?9[.,]99/i }).click();

  // așteptăm revenirea pe localhost (success_url)
  await page.waitForURL(/localhost:3000\/creare-cv/, { timeout: 60000 });
  console.log("✓ revenit pe site:", page.url().slice(0, 70));

  // așteptăm confirmarea + auto-download (confirm face până la 5 reîncercări)
  const okToast = await page.getByText(/Plată confirmată/i).waitFor({ timeout: 30000 }).then(() => true).catch(() => false);
  await page.waitForTimeout(4000);
  console.log(`  toast „Plată confirmată": ${okToast}`);
  console.log(`  DESCĂRCARE: ${downloaded || "(nedetectată)"}`);
  const successBox = await page.getByTestId("payment-success").waitFor({ timeout: 10000 }).then(() => true).catch(() => false);
  console.log(`  caseta de succes vizibilă: ${successBox}`);
  await page.screenshot({ path: "c:/Users/Armaghedon/Desktop/cv_project/_creem-final.png", fullPage: true });

  if (downloaded && successBox) console.log("\n🎉 SUCCES COMPLET: plată → revenire → confirmare → descărcare");
  else console.log("\n⚠️ ceva lipsește — verifică screenshot-urile _creem-card.png / _creem-final.png");
} catch (e) {
  console.error("✗ EROARE:", e.message.slice(0, 300));
  await page.screenshot({ path: "c:/Users/Armaghedon/Desktop/cv_project/_creem-fail.png" }).catch(() => {});
} finally {
  await browser.close();
}
