import Link from "next/link";
import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";
import { LandingPricing } from "@/components/landing/pricing";
import { PRICE_DISPLAY } from "@/lib/pricing";
import { getT } from "@/lib/i18n/server";

export const metadata = {
  title: "Preț",
  description: `${PRICE_DISPLAY} per CV în format PDF, cu TVA inclus. Plată unică — fără abonament, fără plăți recurente.`,
};

export default async function PretPage() {
  const t = await getT();
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
          {t.pricing.pageTitle}
        </h1>
        <p style={{ textAlign: "center", fontSize: 15.5, color: "var(--muted-foreground)", marginBottom: 8, padding: "0 20px" }}>
          {t.pricing.pageSubtitle}
        </p>
        <LandingPricing />
        <div style={{ textAlign: "center", marginTop: -60, paddingBottom: 80 }}>
          <Link href="/" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
            {t.common.back}
          </Link>
        </div>
      </main>
      <LandingFooter />
    </>
  );
}
