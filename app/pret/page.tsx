import Link from "next/link";
import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";
import { LandingPricing } from "@/components/landing/pricing";

export const metadata = {
  title: "Preț",
  description:
    "49 RON per CV în format PDF, cu TVA inclus. Plată unică — fără abonament, fără plăți recurente.",
};

export default function PretPage() {
  return (
    <>
      <LandingHeader />
      <main style={{ padding: "40px 0 0" }}>
        <h1
          style={{
            textAlign: "center",
            fontSize: 34,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            marginBottom: 6,
          }}
        >
          Preț simplu, fără surprize
        </h1>
        <p style={{ textAlign: "center", fontSize: 15.5, color: "var(--muted-foreground)", marginBottom: 8, padding: "0 20px" }}>
          Plătești o singură dată, doar când CV-ul tău e gata de descărcat.
        </p>
        <LandingPricing />
        <div style={{ textAlign: "center", marginTop: -60, paddingBottom: 80 }}>
          <Link href="/" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
            ← Înapoi la pagina principală
          </Link>
        </div>
      </main>
      <LandingFooter />
    </>
  );
}
