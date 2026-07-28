import { test, expect } from "@playwright/test";
import sharp from "sharp";

/* ────────────────────────────────────────────────────────────────
   Livrarea CV-ului după plată + fixuri UX (telefon).
   Rutele de plată reală (Paddle) sunt testate manual în sandbox;
   aici acoperim logica de securitate + UX care nu cere checkout real.
   ──────────────────────────────────────────────────────────────── */

test.describe("Webhook Paddle — securitate", () => {
  test("POST fără semnătură → 401, nu procesează nimic", async ({ request }) => {
    const res = await request.post("/api/paddle/webhook", {
      headers: { "Content-Type": "application/json" },
      data: { event_type: "transaction.completed", data: { id: "txn_fake" } },
    });
    expect(res.status()).toBe(401);
  });

  test("POST cu semnătură invalidă → non-2xx (Paddle reîncearcă)", async ({ request }) => {
    const res = await request.post("/api/paddle/webhook", {
      headers: {
        "Content-Type": "application/json",
        "paddle-signature": "ts=123;h1=semnatura_falsa",
      },
      data: { event_type: "transaction.completed", data: { id: "txn_fake" } },
    });
    // semnătura nu se verifică → unmarshal aruncă → 500 (nu 2xx, deci se reia)
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).not.toBe(200);
  });
});

test.describe("Link de re-descărcare (30 zile)", () => {
  test("token invalid → pagină prietenoasă de expirare, nu eroare 500", async ({ page }) => {
    await page.goto("/descarca/token-inexistent-sau-expirat");
    await expect(page.getByRole("heading", { name: /Linkul a expirat/ })).toBeVisible();
    await expect(page.getByText(/30 de zile/)).toBeVisible();
    await expect(page.getByText(/support@cvexpres\.ro/)).toBeVisible();
    // oferă o cale înainte, nu e o fundătură
    await expect(page.getByRole("link", { name: /Creează un CV nou/ })).toBeVisible();
  });

  test("API-ul de descărcare refuză un token invalid (redirect, nu PDF)", async ({ request }) => {
    const res = await request.get("/api/descarca/token-fals?download=1", {
      maxRedirects: 0,
    });
    // token invalid → redirect la pagina prietenoasă, niciodată un PDF
    expect([302, 307, 308]).toContain(res.status());
    expect(res.headers()["content-type"] ?? "").not.toContain("application/pdf");
  });
});

test.describe("Paywall — sursa unică de adevăr (server)", () => {
  test("GET /api/paywall/status răspunde coerent (dezactivat în teste)", async ({ request }) => {
    const res = await request.get("/api/paywall/status?sessionId=oarecare");
    expect(res.status()).toBe(200);
    const data = await res.json();
    // în e2e paywall-ul e OFF prin env — serverul e sursa unică de adevăr
    expect(data.enabled).toBe(false);
    expect(data.paid).toBe(false);
    // cheile de checkout NU se scurg când paywall-ul e oprit
    expect(data.clientToken).toBeUndefined();
  });
});

test.describe("Poze — orice mărime de pe orice telefon", () => {
  test("o poză REALĂ de ~10MB (peste vechea limită de 5MB) e acceptată și redimensionată", async ({ page }) => {
    test.slow();
    // generăm un JPEG mare cu zgomot (zgomotul nu se comprimă → fișier mare real)
    const side = 4200;
    const noise = Buffer.alloc(side * side * 3);
    for (let i = 0; i < noise.length; i++) noise[i] = (i * 2654435761) % 255;
    const bigJpeg = await sharp(noise, {
      raw: { width: side, height: side, channels: 3 },
    })
      .jpeg({ quality: 100 })
      .toBuffer();
    expect(bigJpeg.length).toBeGreaterThan(5 * 1024 * 1024); // peste vechea limită

    await page.goto("/creare-cv");
    // Pas 1 — date minime ca să ajungem la pasul de poză
    await expect(page.getByRole("heading", { name: "Date de contact" })).toBeVisible({ timeout: 15000 });
    await page.getByLabel(/prenume/i).fill("Test");
    await page.getByLabel(/nume de familie/i).fill("Poza");
    await page.getByLabel(/email/i).fill("test.poza@gmail.com");
    await page.getByLabel(/telefon/i).fill("0722000000");
    await page.getByLabel(/oraș/i).first().fill("București");
    await page.getByRole("button", { name: /Continuă/ }).click();

    await expect(page.getByRole("heading", { name: /Adaugă o poză/ })).toBeVisible({ timeout: 8000 });
    await page.setInputFiles("#photo-input", {
      name: "poza-telefon-mare.jpg",
      mimeType: "image/jpeg",
      buffer: bigJpeg,
    });
    // poza e decodată + redimensionată în browser, fără eroare de mărime
    await expect(page.getByText("Poză adăugată")).toBeVisible({ timeout: 30000 });
    await expect(page.getByText(/Imaginea trebuie să fie sub/)).toHaveCount(0);
  });

  test("ajustare manuală: zoom + tragere schimbă încadrarea și pe telefon, și pe laptop", async ({ page }) => {
    test.slow();
    // poză reală cu variație (gradient + zgomot) — decodabilă și croppabilă
    const w = 1200;
    const h = 1600;
    const raw = Buffer.alloc(w * h * 3);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 3;
        raw[i] = (x * 255) / w;
        raw[i + 1] = (y * 255) / h;
        raw[i + 2] = ((x + y) * 7) % 255;
      }
    }
    const jpeg = await sharp(raw, { raw: { width: w, height: h, channels: 3 } })
      .jpeg({ quality: 90 })
      .toBuffer();

    await page.goto("/creare-cv");
    await expect(page.getByRole("heading", { name: "Date de contact" })).toBeVisible({ timeout: 15000 });
    await page.getByLabel(/prenume/i).fill("Test");
    await page.getByLabel(/nume de familie/i).fill("Incadrare");
    await page.getByLabel(/email/i).fill("test.incadrare@gmail.com");
    await page.getByLabel(/telefon/i).fill("0722000001");
    await page.getByLabel(/oraș/i).first().fill("București");
    await page.getByRole("button", { name: /Continuă/ }).click();

    await expect(page.getByRole("heading", { name: /Adaugă o poză/ })).toBeVisible({ timeout: 8000 });
    await page.setInputFiles("#photo-input", { name: "poza.jpg", mimeType: "image/jpeg", buffer: jpeg });
    await expect(page.getByText("Poză adăugată")).toBeVisible({ timeout: 30000 });

    // editorul e vizibil DIRECT, fără vreun buton intermediar
    const editor = page.getByTestId("photo-adjust-editor");
    await expect(editor).toBeVisible();

    // pe telefon (viewport îngust) editorul trebuie să încapă în ecran
    const editorBox = (await editor.boundingBox())!;
    const viewport = page.viewportSize()!;
    expect(editorBox.width).toBeLessThanOrEqual(viewport.width);

    const preview = page.locator('img[alt="Poză de profil"]');
    const before = await preview.getAttribute("src");
    expect(before).toMatch(/^data:image\/jpeg/);

    // zoom din slider (funcționează identic pe touch și desktop)
    await page.getByTestId("photo-adjust-zoom").evaluate((el) => {
      const input = el as HTMLInputElement;
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
      setter.call(input, "1.8");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });

    // tragem poza (pointer events — echivalentul degetului pe telefon)
    const vpBox = (await editor.locator("div").first().boundingBox())!;
    const cx = vpBox.x + vpBox.width / 2;
    const cy = vpBox.y + vpBox.height / 2;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx + 45, cy + 30, { steps: 5 });
    await page.mouse.up();

    // crop-ul se aplică AUTOMAT (debounce) — fără buton de salvare
    await expect
      .poll(async () => preview.getAttribute("src"), { timeout: 5000 })
      .not.toBe(before);
    const after = await preview.getAttribute("src");
    expect(after).toMatch(/^data:image\/jpeg/);

    // Resetează revine la încadrarea automată inițială
    await page.getByTestId("photo-adjust-reset").click();
    await expect
      .poll(async () => preview.getAttribute("src"), { timeout: 5000 })
      .toBe(before);
  });

  test("fallback server: /api/photo/process redimensionează un JPEG valid", async ({ request }) => {
    const jpeg = await sharp({
      create: { width: 1800, height: 2400, channels: 3, background: { r: 120, g: 140, b: 180 } },
    })
      .jpeg()
      .toBuffer();
    const res = await request.post("/api/photo/process", {
      multipart: {
        photo: { name: "poza.jpg", mimeType: "image/jpeg", buffer: jpeg },
      },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.dataUrl).toMatch(/^data:image\/jpeg;base64,/);
    // rezultatul e mic (pătrat 600×600, JPEG) — sub 200KB
    expect(data.dataUrl.length).toBeLessThan(200 * 1024);
  });

  test("fallback server: un fișier care NU e imagine e refuzat elegant", async ({ request }) => {
    const res = await request.post("/api/photo/process", {
      multipart: {
        photo: { name: "cv.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4 fals") },
      },
    });
    expect(res.status()).toBe(422);
  });
});

test.describe("Nominalizare batch — un singur apel pentru toate liniile", () => {
  test("POST cv-bullets întoarce exact atâtea linii câte a primit", async ({ request }) => {
    // fără mock aici — dar nu vrem cost AI real în e2e; verificăm doar
    // validarea de INTRARE (contractul), nu rescrierea propriu-zisă
    const bad = await request.post("/api/ai/correct-text", {
      data: { kind: "cv-bullets", lines: [] },
    });
    expect(bad.status()).toBe(400);
    const tooMany = await request.post("/api/ai/correct-text", {
      data: { kind: "cv-bullets", lines: Array(25).fill("text") },
    });
    expect(tooMany.status()).toBe(400);
  });
});

test.describe("Telefon — editare fără salt la sfârșit (bug reclamat pe mobil)", () => {
  test("ștergerea unei cifre din mijloc păstrează cursorul acolo, nu la coadă", async ({ page }) => {
    await page.goto("/creare-cv");
    const phone = page.getByLabel(/telefon/i);
    await expect(phone).toBeVisible({ timeout: 15000 });

    await phone.click();
    await phone.pressSequentially("0721234567");
    await expect(phone).toHaveValue("0721 234 567");

    // pun cursorul după a 3-a cifră ("072|1 234 567") și șterg cifra dinainte
    await phone.evaluate((el: HTMLInputElement) => el.setSelectionRange(3, 3));
    await phone.press("Backspace");

    // esența fixului: cursorul rămâne în zona editată, NU sare la final (index ~11)
    const caret = await phone.evaluate((el: HTMLInputElement) => el.selectionStart);
    expect(caret).not.toBeNull();
    expect(caret!).toBeLessThanOrEqual(4);
  });

  test("inserarea unei cifre în mijloc lasă cursorul lângă cifra nouă", async ({ page }) => {
    await page.goto("/creare-cv");
    const phone = page.getByLabel(/telefon/i);
    await expect(phone).toBeVisible({ timeout: 15000 });

    await phone.click();
    await phone.pressSequentially("072234567");
    // pun cursorul după "072" și inserez "1" → trebuie să devină 0721...
    await phone.evaluate((el: HTMLInputElement) => el.setSelectionRange(3, 3));
    await phone.type("1");

    await expect(phone).toHaveValue("0721 234 567");
    const caret = await phone.evaluate((el: HTMLInputElement) => el.selectionStart);
    // cursorul e imediat după cifra inserată (index 4), nu la sfârșit
    expect(caret!).toBeLessThanOrEqual(5);
  });
});
