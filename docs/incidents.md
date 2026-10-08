# Incidents and lessons

Things that broke, how they were found, what changed.

## 1. Google Fonts 404 in production (PDF)

**Symptom.** PDF generation failed in production while working locally. **Cause.** Fonts were registered from Google Fonts gstatic URLs; the versioned subset files expired and returned 404. Some subsets also lacked ș/ț. **Fix.** Local TTFs (Lato, PT Serif, Montserrat, `latin-ext`) in the repo, plus `outputFileTracingIncludes` in `next.config.ts` so Vercel bundles them with the PDF route. **Lesson.** Never render from a third-party URL at request time.

## 2. Photos silently missing from PDFs

**Symptom.** Some users' CVs rendered without the photo; no error anywhere. **Cause.** `@react-pdf/renderer` does not reliably render data-URIs; it fails silently. Found during a session with real users. **Fix.** Decode the data-URI to a `Buffer` (`photoSrcOf`), re-crop non-square images, skip unsupported formats explicitly. **Lesson.** Silent failures need a test with real inputs, not synthetic ones.

## 3. A blank page at the end of the PDF

**Symptom.** Some CVs had an empty last page. **Cause.** Vertical padding on columns that span pages spills into an empty fragment. **Fix.** Padding moved to `<Page>`, `wrap={false}` on entries, `fixed` backgrounds; verified by `scripts/test-blank-pages.mjs`, which grows the content on every template and flags pages containing only the footer.

## 4. Out-of-memory on the dev machine (17 July 2026)

**Symptom.** Turbopack consumed all memory and froze the laptop. **Cause.** A stray `pnpm add` in the parent folder created a second lockfile; Turbopack picked the wrong root and scanned the whole tree including `node_modules`. **Fix.** `turbopack.root: __dirname`, a heap cap in the dev script, and a rule: every package command runs with an explicit absolute path.

## 5. `reasoning_effort` silently rejected

**Symptom.** Configuration C1 of the model benchmark cost almost the same as C0. **Cause.** The API rejected `reasoning_effort` for that model; the client retried without it, so C1 ran as C0. **Fix.** None needed in production; the retry is the right behaviour. The lesson is in the telemetry: `effortRejected` is logged per call, which is the only reason the benchmark result was understood. See [evaluation.md](evaluation.md).

## 6. Playwright run froze the laptop (October 2026)

**Symptom.** Running the full e2e suite right after a production build, with the default parallelism, exhausted RAM: the dev server slowed down, tests timed out, retries opened more browsers. **Fix.** One worker, one browser project, never after a build, and a memory watchdog that kills the test processes below 600 MB free. **Lesson.** On a 15 GB machine, parallelism is a budget, not a default.

## 7. Paddle → Creem migration

**Symptom.** Paddle's onboarding and RON support did not fit the product. **Change.** Creem as Merchant of Record with a hosted checkout, a `PAYMENT_PROVIDER` switch, and a provider-agnostic delivery path keyed on the `payment_completed` ledger so that no payment could be delivered twice during the switch.
