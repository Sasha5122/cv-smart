"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/ui/logo";
import { LanguageSwitch } from "@/components/i18n/language-switch";
import { useT } from "@/lib/i18n/context";

/** Header sticky, subțire — crem ca pagina; umbră + blur după scroll. */
export function LandingHeader() {
  const t = useT();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: scrolled ? "rgba(237, 234, 226, 0.85)" : "var(--paper)",
        backdropFilter: scrolled ? "blur(10px)" : undefined,
        WebkitBackdropFilter: scrolled ? "blur(10px)" : undefined,
        boxShadow: scrolled ? "0 1px 0 var(--hairline), 0 6px 20px -12px rgba(20,20,19,0.18)" : "none",
        transition: "box-shadow 0.2s ease, background-color 0.2s ease",
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <LogoMark size={30} on="light" />
          <span
            style={{
              fontFamily: "var(--font-display), sans-serif",
              fontWeight: 700,
              fontSize: 17,
              color: "var(--ink-strong)",
              letterSpacing: "-0.01em",
            }}
          >
            CVexpres
          </span>
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <Link href="/pret" className="landing-nav-link" style={{ fontSize: 14.5, fontWeight: 600, color: "var(--muted-foreground)", textDecoration: "none" }}>
            {t.header.price}
          </Link>
          <Link href="/contact" className="landing-nav-link" style={{ fontSize: 14.5, fontWeight: 600, color: "var(--muted-foreground)", textDecoration: "none" }}>
            {t.header.contact}
          </Link>
          <Link href="/termeni" className="landing-nav-link" style={{ fontSize: 14.5, fontWeight: 600, color: "var(--muted-foreground)", textDecoration: "none" }}>
            {t.header.terms}
          </Link>
          <LanguageSwitch compact />
          <Link
            href="/creare-cv"
            className="cta-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
              fontWeight: 700,
              fontSize: 14.5,
              padding: "10px 22px",
              borderRadius: "var(--radius-pill)",
              textDecoration: "none",
              boxShadow: "0 1px 2px rgba(244,90,39,0.25), 0 6px 16px -6px rgba(244,90,39,0.45)",
            }}
          >
            {t.header.start}
          </Link>
        </nav>
      </div>

      {/* pe mobil: doar logo + Începe */}
      <style>{`
        @media (max-width: 640px) {
          .landing-nav-link { display: none !important; }
        }
      `}</style>
    </header>
  );
}
