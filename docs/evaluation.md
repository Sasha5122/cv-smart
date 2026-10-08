# Model evaluation: choosing the production model for the CV pipeline

**Question.** The CV pipeline makes two LLM calls per job (recruiter questions, then CV bullets). gpt-5.5 produced good output, but at ~6.5¢ per job. Could a cheaper configuration deliver the same quality?

**Short answer.** Yes. gpt-5.4 on both calls (config C2) gave equivalent quality in a blind side-by-side read at ~33% of the cost. It has been the production configuration since July 2026 (`PIPELINE_PROD_CONFIG` in [`lib/openai.ts`](../lib/openai.ts)).

## Method

- **9 configurations** (C0–C8), each a pair of models for call 1 and call 2, some with `reasoning_effort: minimal`.
- **4 synthetic test cases**, written to stress different failure modes ([`scripts/test-cases.ts`](../scripts/test-cases.ts)):
  1. accountant, colloquial description, **no** job ad
  2. same accountant, **with** a job ad (tests anchoring on the ad's vocabulary)
  3. **poor answers** to the recruiter questions (tests invention)
  4. professional driver (different domain, many numbers: tonnes, km, deliveries)
- **One configuration per run**, all on the `liber` prompt variant, via [`scripts/test-model-matrix.ts`](../scripts/test-model-matrix.ts). Raw outputs are in [`evaluation/results/`](evaluation/results/), one JSON per configuration × case.
- **Metrics captured per run:** cost (from token usage, cached input billed at 10%), JSON retries, `reasoning_effort` rejected by the API, number-validation failures on first pass and bullets dropped after regeneration, nominal-form compliance (bullet starts with a verbal noun), average words per bullet, and a crude *invention score* (content tokens in the output whose 5-letter prefix does not appear in the source).
- **Quality judgement:** blind side-by-side reading of the 7 bullets per case, labelled only C0–C8 ([`evaluation/results/comparison.md`](evaluation/results/comparison.md) and the per-case files).

## Results

| Config | Call 1 | Call 2 | Cost / job | % of C0 | Numbers failed / dropped | Nominal form | JSON retries | Reasoning tokens | Invention (case 3) |
|---|---|---|---|---|---|---|---|---|---|
| C0_baseline_55 | gpt-5.5 | gpt-5.5 | 6.47 ¢ | 100% | 2 / 0 | 28/28 | 0 | 681 | 6 |
| C1_55_effort_min | gpt-5.5 (effort minimal) | gpt-5.5 (effort minimal) | 5.91 ¢ | 91% | 1 / 1 | 27/27 | 0 | 632 | 5 |
| **C2_54_full** (production) | gpt-5.4 | gpt-5.4 | **2.14 ¢** | **33%** | 3 / 0 | 28/28 | 0 | 0 | 5 |
| C3_mini_54 | gpt-5.4-mini | gpt-5.4 | 1.38 ¢ | 21% | 1 / 0 | 28/28 | 0 | 0 | 5 |
| C4_mini_full | gpt-5.4-mini | gpt-5.4-mini | 0.57 ¢ | 9% | 1 / 1 | 27/27 | 0 | 0 | 6 |
| C5_51_full | gpt-5.1 | gpt-5.1 | 1.31 ¢ | 20% | 2 / 0 | 28/28 | 0 | 0 | 7 |
| C6_mini_51 | gpt-5.4-mini | gpt-5.1 | 0.95 ¢ | 15% | 2 / 0 | 28/28 | 0 | 0 | 7 |
| C7_nano_54 | gpt-5.4-nano | gpt-5.4 | 1.30 ¢ | 20% | 2 / 0 | 28/28 | 0 | 0 | 5 |
| C8_51_54 | gpt-5.1 | gpt-5.4 | 1.66 ¢ | 26% | 1 / 0 | 28/28 | 0 | 0 | 5 |

Cost / job = average over the 4 cases (call 1 + call 2 + regenerations). Full cost breakdown: [`evaluation/results/costs.md`](evaluation/results/costs.md).

## What the data says

- **Structured Outputs held everywhere.** 0 JSON retries across 36 runs. The retry path exists but was never exercised.
- **Nominal form is a prompt property, not a model property.** 27–28 of 28 bullets complied in every configuration.
- **Number validation did its job in every configuration.** 1–3 bullets per run contained a figure that did not exist in the candidate's text; the targeted regeneration fixed almost all of them, and at most 1 bullet per configuration was dropped.
- **The cheap models were not worse on the metrics**, but the blind read showed flatter, more generic phrasing for mini/nano on call 2 (the writer call). gpt-5.4 on call 2 kept the specificity of gpt-5.5.
- **Call 1 (the questions) tolerates a cheaper model.** C3 and C7 (mini/nano for the questions) produced usable questions; see [`questions_caz4_C0_vs_C7.md`](evaluation/results/questions_caz4_C0_vs_C7.md). Production still uses gpt-5.4 for both calls: the saving from downgrading call 1 is ~0.8¢ and the questions drive the whole interview.

## The surprise

C1 was supposed to test `reasoning_effort: minimal` on gpt-5.5. The per-case breakdown showed **"effort rejected? YES" on all four cases**: the API rejected the parameter, the code retried without it, and C1 ran as a slightly noisier copy of C0. The only reason this was caught is that the rejection is logged and surfaced in telemetry (`effortRejected` in `CallUsage`). Lesson: log what the API refuses, not just what it returns.

## Limitations

- 4 cases and one human reader. This is a decision aid, not a benchmark.
- The invention score is a prefix heuristic; it over-counts legitimate paraphrase.
- No evaluation of the English pipeline beyond one manual run (October 2026, warehouse operator case: 5 questions, 7 bullets, 0 numbers failed, "38k" correctly matched to "€38,000"). Run it with `pnpm test:pipeline --case=5 --lang=en`.

## Reproduce

```bash
cd cv-smart
pnpm test:pipeline --case=1            # one case, real OpenAI calls
pnpm test:pipeline --ab --case=2        # strict vs liber prompt variants
npx tsx scripts/test-model-matrix.ts --config=C2   # one configuration × 4 cases
npx tsx scripts/test-model-matrix.ts --report      # regenerate the markdown tables
```
