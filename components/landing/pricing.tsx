import Link from "next/link";
import { PRICE_EUR, PRICE_RON } from "@/lib/pricing";
import { getT } from "@/lib/i18n/server";

/** Secțiunea de preț — o singură cartelă, un singur preț. */
export async function LandingPricing() {
  const t = await getT();
  return (
    <section id="pret" style={{ maxWidth: 1120, margin: "0 auto", padding: "24px 20px 96px" }}>
      <div
        style={{
          maxWidth: 460,
          margin: "0 auto",
          backgroundColor: "#fff",
          border: "1px solid var(--hairline)",
          borderRadius: 18,
          padding: "36px 32px",
          textAlign: "center",
          boxShadow: "0 20px 50px -20px rgba(20, 20, 19, 0.18)",
        }}
      >
        <p
          style={{
            fontSize: 11.5,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--muted-foreground)",
            marginBottom: 10,
          }}
        >
          {t.pricing.eyebrow}
        </p>
        <p
          style={{
            fontFamily: "var(--font-display), sans-serif",
            fontSize: 52,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            marginBottom: 6,
          }}
        >
          {PRICE_RON}
        </p>
        <p style={{ fontSize: 15, color: "var(--muted-foreground)", marginBottom: 24 }}>
          {t.pricing.perCv(PRICE_EUR)}
        </p>

        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", textAlign: "left" }}>
          {t.pricing.included.map((item) => (
            <li
              key={item}
              style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 14.5, fontWeight: 500, padding: "6px 0" }}
            >
              <svg width="15" height="15" viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: 3 }}>
                <path d="M2 6.2L4.8 9L10 3.5" stroke="var(--green)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {item}
            </li>
          ))}
        </ul>

        <Link
          href="/creare-cv"
          className="cta-btn"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            backgroundColor: "var(--primary)",
            color: "var(--primary-foreground)",
            fontFamily: "var(--font-display), sans-serif",
            fontWeight: 700,
            fontSize: 16.5,
            minHeight: 54,
            borderRadius: "var(--radius-pill)",
            textDecoration: "none",
            boxShadow: "0 2px 4px rgba(244,90,39,0.3), 0 10px 24px -8px rgba(244,90,39,0.5)",
          }}
        >
          {t.pricing.start}
        </Link>
      </div>
    </section>
  );
}
