import Link from "next/link";
import { ArrowRight, Zap, ShieldCheck, MapPin, Navigation } from "lucide-react";
import { NavCTA } from "@/components/landing/nav-cta";

const ACCENT = "#4F46E5";
const ACCENT_DARK = "#3730A3";
const ACCENT_LIGHT = "#EEEDF8";
const BG_PAGE = "#F8F7F4";
const TEXT_PRIMARY = "#0D0D0D";
const TEXT_MUTED = "#6B7280";
const BORDER = "#E5E7EB";

export default function LandingPage() {
  return (
    <div
      style={{
        backgroundColor: BG_PAGE,
        color: TEXT_PRIMARY,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        minHeight: "100vh",
      }}
    >
      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav
        style={{
          backgroundColor: BG_PAGE,
          borderBottom: `1px solid ${BORDER}`,
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "0 24px",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: ACCENT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "#fff", fontSize: 11, fontWeight: 800, letterSpacing: 0.5 }}>
                CV
              </span>
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: TEXT_PRIMARY, letterSpacing: -0.3 }}>
              CV Smart
            </span>
          </div>

          <NavCTA />
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "120px 24px 80px",
          textAlign: "center",
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            backgroundColor: ACCENT_LIGHT,
            color: ACCENT,
            fontSize: 13,
            fontWeight: 600,
            padding: "6px 14px",
            borderRadius: 50,
            marginBottom: 32,
            letterSpacing: 0.1,
          }}
        >
          <MapPin size={13} />
          Pentru piața din România
        </div>

        {/* H1 */}
        <h1
          style={{
            fontSize: "clamp(48px, 7vw, 72px)",
            fontWeight: 900,
            lineHeight: 1.08,
            letterSpacing: -2,
            color: TEXT_PRIMARY,
            margin: "0 auto 20px",
            maxWidth: 700,
          }}
        >
          CV profesional cu AI
          <br />
          <span style={{ color: ACCENT }}>în 5 minute.</span>
        </h1>

        {/* Subheadline */}
        <p
          style={{
            fontSize: 20,
            color: TEXT_MUTED,
            margin: "0 auto 48px",
            fontWeight: 400,
            lineHeight: 1.5,
          }}
        >
          Personalizat pentru jobul tău. Optimizat pentru ATS.
        </p>

        {/* CTA */}
        <Link
          href="/creare-cv"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            backgroundColor: ACCENT,
            color: "#fff",
            fontWeight: 700,
            fontSize: 16,
            padding: "16px 36px",
            borderRadius: 50,
            textDecoration: "none",
            boxShadow: "0 4px 20px rgba(79, 70, 229, 0.3)",
            transition: "background-color 0.15s, box-shadow 0.15s",
          }}
        >
          Creează CV-ul tău
          <ArrowRight size={18} />
        </Link>

        {/* Social proof */}
        <p style={{ fontSize: 14, color: TEXT_MUTED, marginTop: 16 }}>
          100% gratuit · Fără înregistrare
        </p>

        {/* Stats bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ffffff",
            border: `1px solid ${BORDER}`,
            borderRadius: 16,
            padding: "28px 48px",
            marginTop: 64,
            maxWidth: 560,
            marginLeft: "auto",
            marginRight: "auto",
            gap: 0,
          }}
        >
          {[
            { value: "5 min", label: "timp mediu" },
            { value: "ATS", label: "optimizat" },
            { value: "100%", label: "în română" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              style={{
                flex: 1,
                textAlign: "center",
                borderRight: i < 2 ? `1px solid ${BORDER}` : "none",
                padding: "0 24px",
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: ACCENT,
                  letterSpacing: -1,
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: TEXT_MUTED,
                  marginTop: 6,
                  fontWeight: 500,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CUM FUNCȚIONEAZĂ ─────────────────────────────────── */}
      <section style={{ backgroundColor: "#ffffff", padding: "96px 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          {/* Title */}
          <h2
            style={{
              fontSize: "clamp(32px, 4vw, 40px)",
              fontWeight: 800,
              letterSpacing: -1,
              color: TEXT_PRIMARY,
              textAlign: "center",
              marginBottom: 56,
            }}
          >
            Cum funcționează
          </h2>

          {/* Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
            {[
              {
                step: "01",
                title: "Descrie jobul vizat",
                desc: "Lipești anunțul. AI-ul construiește profilul ideal.",
              },
              {
                step: "02",
                title: "Interviu de 5 minute",
                desc: "Răspunzi la întrebări țintite. Niciun detaliu nu se pierde.",
              },
              {
                step: "03",
                title: "Descarcă PDF-ul",
                desc: "CV gata, ATS-friendly, cu cuvintele cheie potrivite.",
              },
            ].map((item) => (
              <div
                key={item.step}
                style={{
                  backgroundColor: "#ffffff",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 16,
                  padding: "36px 32px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: ACCENT,
                    letterSpacing: 1.5,
                    marginBottom: 16,
                    backgroundColor: ACCENT_LIGHT,
                    display: "inline-block",
                    padding: "4px 10px",
                    borderRadius: 50,
                  }}
                >
                  {item.step}
                </div>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: TEXT_PRIMARY,
                    marginBottom: 10,
                    letterSpacing: -0.3,
                  }}
                >
                  {item.title}
                </h3>
                <p style={{ fontSize: 15, color: TEXT_MUTED, lineHeight: 1.6 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DE CE CV SMART ───────────────────────────────────── */}
      <section style={{ backgroundColor: BG_PAGE, padding: "96px 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "clamp(32px, 4vw, 40px)",
              fontWeight: 800,
              letterSpacing: -1,
              color: TEXT_PRIMARY,
              textAlign: "center",
              marginBottom: 56,
            }}
          >
            De ce CV Smart
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 20,
            }}
          >
            {[
              {
                Icon: Zap,
                title: "Adaptat jobului tău",
                desc: "Cuvintele cheie din anunț, integrate automat.",
              },
              {
                Icon: ShieldCheck,
                title: "ATS-friendly garantat",
                desc: "Testat pe sistemele folosite de companiile din România.",
              },
              {
                Icon: MapPin,
                title: "Piața românească",
                desc: "Diacritice corecte, format local, secțiuni relevante.",
              },
              {
                Icon: Navigation,
                title: "Ghidare completă",
                desc: "AI-ul știe ce vrea recrutorul. Tu doar răspunzi.",
              },
            ].map(({ Icon, title, desc }) => (
              <div
                key={title}
                style={{
                  display: "flex",
                  gap: 16,
                  padding: "28px 24px",
                  backgroundColor: "#ffffff",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 14,
                }}
              >
                <div style={{ flexShrink: 0, marginTop: 2 }}>
                  <Icon size={20} color={ACCENT} strokeWidth={1.75} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: TEXT_PRIMARY,
                      marginBottom: 6,
                      letterSpacing: -0.2,
                    }}
                  >
                    {title}
                  </div>
                  <div style={{ fontSize: 14, color: TEXT_MUTED, lineHeight: 1.6 }}>
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ───────────────────────────────────────── */}
      <section
        style={{
          background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%)`,
          padding: "96px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "clamp(32px, 4vw, 44px)",
              fontWeight: 900,
              color: "#ffffff",
              letterSpacing: -1.5,
              lineHeight: 1.1,
              marginBottom: 40,
            }}
          >
            Creează-ți CV-ul acum.
          </h2>

          <Link
            href="/creare-cv"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              backgroundColor: "#ffffff",
              color: ACCENT,
              fontWeight: 700,
              fontSize: 16,
              padding: "16px 36px",
              borderRadius: 50,
              textDecoration: "none",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
          >
            Începe gratuit
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer
        style={{
          backgroundColor: BG_PAGE,
          borderTop: `1px solid ${BORDER}`,
          padding: "24px",
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                backgroundColor: ACCENT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "#fff", fontSize: 9, fontWeight: 800 }}>CV</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: TEXT_PRIMARY }}>CV Smart</span>
          </div>

          {/* Links */}
          <div style={{ display: "flex", gap: 24 }}>
            {[
              { href: "/termeni", label: "Termeni" },
              { href: "/confidentialitate", label: "Confidențialitate" },
              { href: "/contact", label: "Contact" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{ fontSize: 14, color: TEXT_MUTED, textDecoration: "none" }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Copyright */}
          <p style={{ fontSize: 13, color: TEXT_MUTED }}>© 2026 CV Smart</p>
        </div>
      </footer>
    </div>
  );
}
