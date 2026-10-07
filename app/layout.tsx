import type { Metadata } from "next";
import { Sora, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { LEGAL } from "@/lib/legal-config";
import { PRICE_DISPLAY } from "@/lib/pricing";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { LocaleProvider } from "@/lib/i18n/context";
import { getLocale } from "@/lib/i18n/server";

/**
 * Tipografie modernă, contrast puternic:
 *  — Sora: geometric, crisp (display, titluri, numerale)
 *  — Instrument Sans: neutru, foarte lizibil (body, UI)
 * Ambele cu latin-ext → diacritice perfecte (ă â î ș ț).
 */
const sora = Sora({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || LEGAL.siteUrl;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CVexpres — CV profesionist cu AI, gata în 10 minute",
    template: "%s | CVexpres",
  },
  description: `Garantăm un CV profesionist, gata în 10 minute. Dezvoltat și optimizat special pentru piața din România. ${PRICE_DISPLAY}, plată unică, PDF descărcabil.`,
  keywords: [
    "creare cv", "cv online", "cv profesional", "cv AI", "generator cv",
    "cv Romania", "model cv", "cv pdf", "cv angajare",
  ],
  authors: [{ name: "CVexpres" }],
  alternates: { canonical: "/" },
  openGraph: {
    title: "CVexpres — CV profesionist cu AI, gata în 10 minute",
    description: `Garantăm un CV profesionist, gata în 10 minute. Optimizat pentru piața din România. ${PRICE_DISPLAY}, plată unică.`,
    type: "website",
    locale: "ro_RO",
    siteName: "CVexpres",
    url: SITE_URL,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "CVexpres — CV profesionist cu AI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CVexpres — CV profesionist cu AI, gata în 10 minute",
    description: `Optimizat pentru piața din România. ${PRICE_DISPLAY}, plată unică.`,
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // limba interfeței vine din cookie (ro implicit); vezi lib/i18n
  const locale = await getLocale();
  return (
    <html lang={locale} data-scroll-behavior="smooth" className={`${sora.variable} ${instrumentSans.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
        <Toaster position="top-right" richColors duration={3000} />
        {/* Vercel Web Analytics (vizitatori/zi, pagini, țări) + Speed Insights —
            privacy-friendly, fără cookie-uri, deci fără banner de consimțământ */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
