/**
 * Teste unitare pentru logica de livrare (fără browser/rețea):
 *  - tokenul de re-descărcare: valid, expirat, falsificat, malformat
 * Rulare: npx tsx --env-file=.env.local scripts/test-delivery-logic.ts
 */
import { createDownloadToken, verifyDownloadToken } from "@/lib/download-token";
import { buildHtml } from "@/lib/email/delivery";

let passed = 0;
let failed = 0;
function check(name: string, cond: boolean) {
  if (cond) {
    passed++;
    console.log(`  ✅ ${name}`);
  } else {
    failed++;
    console.log(`  ❌ ${name}`);
  }
}

const now = Date.now();
const DAY = 24 * 60 * 60 * 1000;

console.log("Token de re-descărcare:");

// 1. token proaspăt e valid și întoarce sessionId-ul corect
const t1 = createDownloadToken("sess-abc", now);
const v1 = verifyDownloadToken(t1, now);
check("token proaspăt → valid", v1.ok === true);
check("token proaspăt → sessionId corect", v1.ok && v1.sessionId === "sess-abc");

// 2. valid la ziua 29, expirat la ziua 31
check("valid la ziua 29", verifyDownloadToken(t1, now + 29 * DAY).ok === true);
const vExp = verifyDownloadToken(t1, now + 31 * DAY);
check("expirat la ziua 31 → ok:false", vExp.ok === false);
check("expirat → reason 'expired'", !vExp.ok && vExp.reason === "expired");

// 3. token falsificat (semnătură schimbată) → invalid
const tampered = t1.slice(0, -4) + "0000";
const vTamp = verifyDownloadToken(tampered, now);
check("semnătură falsificată → ok:false", vTamp.ok === false);
check("falsificat → reason 'invalid'", !vTamp.ok && vTamp.reason === "invalid");

// 4. sessionId schimbat în payload (dar semnătura veche) → invalid
const parts = t1.split(".");
const swapped = `alt-session.${parts[1]}.${parts[2]}`;
check("sessionId schimbat → invalid", verifyDownloadToken(swapped, now).ok === false);

// 5. formate malformate
check("token gol → invalid", verifyDownloadToken("", now).ok === false);
check("token fără puncte → invalid", verifyDownloadToken("abcdef", now).ok === false);
check("token cu 2 părți → invalid", verifyDownloadToken("a.b", now).ok === false);

// ── Emailul de livrare (fără poză, cu CTA către website) ──
console.log("\nEmail de livrare:");
const html = buildHtml({
  firstName: "Alexandru",
  downloadUrl: "http://localhost:3000/descarca/tok123",
});
check("salut personalizat", html.includes("Salut, Alexandru!"));
check("link de descărcare prezent", html.includes("http://localhost:3000/descarca/tok123"));
check("buton mare «creează un CV nou»", html.includes("Creează un CV nou pe CVexpres"));
check("CTA duce la /creare-cv (același origin)", html.includes("http://localhost:3000/creare-cv"));
check("FĂRĂ poză (niciun atașament inline cid:)", !html.includes("cid:"));
check("mențiunea 30 de zile", html.includes("30 de zile"));

console.log(`\n${failed === 0 ? "✅ TOATE" : "❌"} — ${passed} trecute, ${failed} eșuate`);
process.exit(failed === 0 ? 0 : 1);
