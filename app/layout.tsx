import type { Metadata } from "next";
import { Sora, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

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

export const metadata: Metadata = {
  title: "CVexpress — Creează CV profesional cu AI în 5 minute",
  description:
    "Generează un CV profesional optimizat pentru piața din România cu ajutorul inteligenței artificiale. ATS-friendly, personalizat pentru jobul tău.",
  keywords: ["creare cv", "cv online", "cv profesional", "cv AI", "generator cv", "cv Romania"],
  authors: [{ name: "CVexpress" }],
  openGraph: {
    title: "CVexpress — CV profesional cu AI",
    description: "Creează CV-ul perfect în 5 minute cu AI românesc",
    type: "website",
    locale: "ro_RO",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" data-scroll-behavior="smooth" className={`${sora.variable} ${instrumentSans.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <Toaster position="top-right" richColors duration={3000} />
      </body>
    </html>
  );
}
