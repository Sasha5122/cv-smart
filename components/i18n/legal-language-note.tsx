import { getLocale, getT } from "@/lib/i18n/server";

/** Pe paginile legale (doar în română): o linie de avertizare când interfața e în engleză. */
export async function LegalLanguageNote() {
  const locale = await getLocale();
  if (locale === "ro") return null;
  const t = await getT();
  return (
    <p
      data-testid="legal-language-note"
      style={{
        maxWidth: 820,
        margin: "20px auto 0",
        padding: "10px 16px",
        borderRadius: 10,
        border: "1px solid var(--hairline-strong)",
        backgroundColor: "#fff",
        fontSize: 13.5,
        color: "var(--muted-foreground)",
      }}
    >
      {t.legal.romanianOnly}
    </p>
  );
}
