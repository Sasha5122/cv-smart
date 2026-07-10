/**
 * Helper client pentru corectarea ieftină de text (gramatică + diacritice).
 * Best-effort: la orice problemă returnează textul original — nu blochează
 * niciodată utilizatorul.
 */
export type CorrectKind = "job-title" | "city" | "hobby";

export async function correctText(text: string, kind: CorrectKind): Promise<string> {
  const t = text.trim();
  if (t.length < 2) return t;
  try {
    const res = await fetch("/api/ai/correct-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: t, kind }),
    });
    if (!res.ok) return t;
    const data = await res.json();
    const corrected = typeof data.corrected === "string" ? data.corrected.trim() : "";
    return corrected || t;
  } catch {
    return t;
  }
}
