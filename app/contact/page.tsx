import Link from "next/link";
import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";
import { ContactForm } from "@/components/landing/contact-form";
import { LEGAL } from "@/lib/legal-config";
import { getT } from "@/lib/i18n/server";

export const metadata = {
  title: "Contact — CVexpres",
  description:
    "Scrie-ne dacă ai o întrebare despre CVexpres sau dacă ceva nu a mers cum trebuia. Răspundem în cel mult 14 zile.",
};

export default async function ContactPage() {
  const t = await getT();
  return (
    <>
      <LandingHeader />
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "56px 20px 96px" }}>
        <h1 style={{ fontSize: 34, fontWeight: 800, marginBottom: 12, letterSpacing: "-0.02em" }}>
          {t.contact.title}
        </h1>
        <p style={{ fontSize: 15.5, lineHeight: 1.7, color: "var(--muted-foreground)", marginBottom: 30 }}>
          {t.contact.intro}
        </p>

        <ContactForm />

        {/* datele de contact — doar emailul de suport */}
        <div style={{ marginTop: 36 }}>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{t.contact.detailsTitle}</p>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--muted-foreground)" }}>
            {t.contact.emailLabel} {LEGAL.contactEmail}
          </p>
        </div>

        <div style={{ marginTop: 40 }}>
          <Link href="/" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
            {t.common.back}
          </Link>
        </div>
      </main>
      <LandingFooter />
    </>
  );
}
