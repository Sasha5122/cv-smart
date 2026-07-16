import Link from "next/link";
import { LandingHeader } from "@/components/landing/header";
import { LandingHero } from "@/components/landing/hero";
import { LandingFooter } from "@/components/landing/footer";
import { LEGAL } from "@/lib/legal-config";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || LEGAL.siteUrl;

/** Date structurate pentru Google (rich results): serviciu + preț. */
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "CVexpres",
  url: SITE_URL,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  inLanguage: "ro",
  description:
    "Generator de CV profesionist cu inteligență artificială, optimizat pentru piața din România. CV în format PDF, gata în 10 minute.",
  offers: {
    "@type": "Offer",
    price: "49",
    priceCurrency: "RON",
    description: "Plată unică per CV în format PDF, TVA inclus — fără abonament.",
  },
};

/** Landing-ul CVexpres — mesajul, CTA-ul și CV-ul ca element central,
 *  plus cartela de preț. „Începe" → /creare-cv (pasul 1). */
export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <LandingHeader />
      <main>
        <LandingHero />

        {/* descrierea produsului + prețul — vizibile pe homepage */}
        <section
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "0 20px 56px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--muted-foreground)" }}>
            CVexpres este un serviciu online de creare a CV-urilor profesioniste în
            format PDF.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--muted-foreground)", marginTop: 4 }}>
            Preț: 49 RON per CV, cu TVA inclus — plată unică, fără abonament.{" "}
            <Link href="/pret" style={{ color: "var(--primary)", fontWeight: 600 }}>
              Vezi detalii
            </Link>
          </p>
        </section>
      </main>
      <LandingFooter />
    </>
  );
}
