/**
 * Prețuri de referință USD / 1M tokeni (din instrucțiunea de test, iul 2026).
 * Cached input ≈ 10% din prețul de input. Reasoning = output.
 *
 * Modul separat (fără client OpenAI) ca să poată fi folosit și de generatorul
 * de date demo / paginile de admin fără a instanția SDK-ul.
 */
export const MODEL_PRICES: Record<string, { input: number; output: number }> = {
  "gpt-5.5": { input: 5.0, output: 30.0 },
  "gpt-5.4": { input: 2.5, output: 15.0 },
  "gpt-5.4-mini": { input: 0.75, output: 4.5 },
  "gpt-5.4-nano": { input: 0.2, output: 1.25 },
  "gpt-5.1": { input: 1.25, output: 10.0 },
};

export function computeCostUSD(
  model: string,
  promptTokens: number,
  cachedTokens: number,
  completionTokens: number
): number {
  const p = MODEL_PRICES[model] ?? MODEL_PRICES["gpt-5.5"];
  const uncached = Math.max(0, promptTokens - cachedTokens);
  return (
    (uncached * p.input + cachedTokens * p.input * 0.1 + completionTokens * p.output) /
    1_000_000
  );
}
