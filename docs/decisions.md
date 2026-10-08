# Engineering decisions

Short architecture decision records: what was decided, why, and what it costs.

## 1. Two LLM calls, not a chain

**Context.** The original design had three stages (extraction → fact sheet → bullets). **Decision.** Collapse to two: recruiter questions, then bullets from the full context. **Why.** The intermediate fact sheet added latency and cost without visible quality; the writer call does better with the raw text plus the Q&A than with a summarised sheet. **Cost.** The `fact_sheet` column and the `synthesized` stage remain as dead schema.

## 2. Number validation in code, not in the prompt

**Context.** The most damaging hallucination in a CV is an invented figure. **Decision.** A deterministic validator rejects any number in a bullet that does not exist in the candidate's text or answers; one targeted regeneration, then drop. **Why.** "Don't invent numbers" in a prompt is advisory; a regex is not. **Cost.** Legitimate rephrasing of a figure ("38 de mii" ↔ 38000, "38k" ↔ 38,000) needs explicit equivalences, maintained per language.

## 3. gpt-5.4 on both calls

See [evaluation.md](evaluation.md). ~33% of the gpt-5.5 cost at equivalent quality in a blind read. Re-evaluate when a model generation changes.

## 4. Merchant of Record instead of a payment gateway

**Decision.** Creem (earlier Paddle) as Merchant of Record. **Why.** EU VAT, invoicing and refunds are handled by the MoR; the product could launch as a sole trader without a company. **Cost.** Higher fees than a gateway, less control over the checkout UI, RON not supported (price shown as "49 lei (9,99 €)", charged in EUR).

## 5. Payments as an append-only ledger in `events`

**Decision.** `payment_completed` events keyed by transaction id are the source of truth; `sessions.status` is a cache. **Why.** No migration needed, natural idempotency for webhooks, and an audit trail. **Cost.** Queries over JSONB; mitigated by small volume and indexes if needed.

## 6. Two-layer idempotent delivery

**Decision.** `cv_email_sent` (done) and a fresh `cv_email_claim` (in progress, < 3 min) written *before* rendering the PDF. **Why.** The webhook and the browser confirm can arrive within the same second; the claim closes the duplicate window. **Cost.** A crashed delivery blocks retries for 3 minutes.

## 7. HMAC download token, no JWT

**Decision.** `<sessionId>.<expiryMs>.<hmac>` with `timingSafeEqual`. **Why.** Three fields, zero dependencies, nothing to parse. **Cost.** No revocation except by secret rotation; acceptable for a 30-day link to the user's own file.

## 8. Local fonts, bundled explicitly

**Decision.** Lato, PT Serif and Montserrat as local TTFs with `latin-ext`, listed in `outputFileTracingIncludes`. **Why.** Google Fonts' gstatic subsets expired (404 at render time) and some lacked ș/ț. See [incidents.md](incidents.md).

## 9. Photos decoded to Buffers for the PDF

**Decision.** Data-URIs are decoded server-side before rendering. **Why.** `@react-pdf/renderer` fails silently on data-URIs; the bug only showed up with real users' photos.

## 10. Face-aware crop without a model

**Decision.** `sharp` + skin-tone heuristics (RGB + YCbCr) to find the head and crop a square at ~4.2× face height; fallback to attention-based crop. **Why.** No ML dependency, cold-start friendly on serverless, good enough for portrait photos. **Cost.** Known weak spots: dark skin in low light, beige backgrounds.

## 11. Rate limiting that fails open

**Decision.** Upstash Redis, fixed window, `INCR` + `EXPIRE NX`; if Redis is unreachable, allow the request. **Why.** A Redis outage must not take the product down; the limits protect cost, not security.

## 12. The app tolerates un-run migrations

**Decision.** Status and template constraints may be missing; writes fall back to `events`. **Why.** Deploys never wait on a manual SQL step. **Cost.** Defensive code that is harder to read.

## 13. 30-day retention as a product feature

**Decision.** Sessions, events and CVs are deleted 30 days after the last activity; contact messages after 12 months. **Why.** GDPR minimisation, and a clear promise in the Terms. **Cost.** The re-download link effectively expires with the data.

## 14. Cookie-based language, no URL prefix

**Decision.** `NEXT_LOCALE` cookie, Romanian default, English as an option; no `/en` route tree. **Why.** No page moves, Romanian SEO untouched, one switch component. **Cost.** English pages are not separately indexable (intended: the product sells in Romania); the English version is demo-level.

## 15. Anonymised admin, public demo dashboard

**Decision.** The admin API never returns names or emails; a public `/demo/admin` runs the same dashboard on a deterministic generated dataset. **Why.** Recruiters can see real operational metrics without any personal data leaving the server.
