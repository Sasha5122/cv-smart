import Link from "next/link";
import { CVShowcase } from "@/components/landing/cv-showcase";
import { getT } from "@/lib/i18n/server";

/** Hero minimal: mesajele mari + CTA în stânga, CV-ul — element central —
 *  în dreapta, aliniat cu butonul „Începe" din header.
 *  Pe mobil: CV-ul primul, mesajele și CTA-ul dedesubt, centrate. */
export async function LandingHero() {
  const t = await getT();
  return (
    <section style={{ maxWidth: 1120, margin: "0 auto", padding: "44px 20px 88px" }}>
      <div className="hero-grid">
        <div className="hero-copy">
          <h1
            style={{
              fontSize: "clamp(34px, 3.8vw, 54px)",
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: "-0.028em",
              marginBottom: 18,
            }}
          >
            {t.hero.title}
          </h1>

          <p
            style={{
              fontSize: "clamp(19px, 2vw, 24px)",
              fontWeight: 600,
              lineHeight: 1.4,
              letterSpacing: "-0.01em",
              color: "var(--muted-foreground)",
              marginBottom: 34,
            }}
          >
            {t.hero.subtitle}
          </p>

          <Link
            href="/creare-cv"
            className="cta-btn"
            data-testid="hero-cta"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
              fontFamily: "var(--font-display), sans-serif",
              fontWeight: 700,
              fontSize: 19,
              minHeight: 62,
              padding: "18px 44px",
              borderRadius: "var(--radius-pill)",
              textDecoration: "none",
              boxShadow: "0 2px 4px rgba(244,90,39,0.3), 0 12px 30px -8px rgba(244,90,39,0.55)",
            }}
          >
            {t.hero.cta}
          </Link>
        </div>

        <div className="hero-showcase">
          <CVShowcase />
        </div>
      </div>

      <style>{`
        .hero-grid { display: flex; flex-wrap: wrap; align-items: center; gap: 48px 56px; }
        .hero-copy { flex: 1 1 340px; min-width: 300px; text-align: left; }
        .hero-showcase { flex: 1 1 480px; min-width: 0; }
        @media (max-width: 900px) {
          .hero-copy { order: 2; text-align: center; }
          .hero-showcase { order: 1; }
        }
      `}</style>
    </section>
  );
}
