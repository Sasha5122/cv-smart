import Link from "next/link";
import { LogoMark } from "@/components/ui/logo";

/** Footer pe fundal închis — culoarea sidebar-ului din wizard. */
export function LandingFooter() {
  return (
    <footer style={{ backgroundColor: "var(--sidebar-bg)" }}>
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "40px 20px 32px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <LogoMark size={28} on="dark" />
          <span
            style={{
              fontFamily: "var(--font-display), sans-serif",
              fontWeight: 700,
              fontSize: 16,
              color: "var(--sidebar-fg)",
            }}
          >
            CVexpres
          </span>
        </Link>

        <nav style={{ display: "flex", flexWrap: "wrap", gap: "10px 24px" }}>
          <Link href="/termeni" style={{ fontSize: 13.5, color: "var(--sidebar-muted)", textDecoration: "none" }}>
            Termeni și condiții
          </Link>
          <Link href="/confidentialitate" style={{ fontSize: 13.5, color: "var(--sidebar-muted)", textDecoration: "none" }}>
            Politica de confidențialitate
          </Link>
          <Link href="/refund" style={{ fontSize: 13.5, color: "var(--sidebar-muted)", textDecoration: "none" }}>
            Politica de rambursare
          </Link>
          <Link href="/contact" style={{ fontSize: 13.5, color: "var(--sidebar-muted)", textDecoration: "none" }}>
            Contact
          </Link>
          <Link href="/pret" style={{ fontSize: 13.5, color: "var(--sidebar-muted)", textDecoration: "none" }}>
            Preț
          </Link>
        </nav>
      </div>
      <div style={{ borderTop: "1px solid var(--sidebar-line)" }}>
        <p
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "16px 20px",
            fontSize: 12.5,
            color: "var(--sidebar-muted)",
          }}
        >
          © {new Date().getFullYear()} CVexpres. Toate drepturile rezervate.
        </p>
      </div>
    </footer>
  );
}
