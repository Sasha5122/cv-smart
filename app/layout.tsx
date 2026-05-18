import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CV Smart — Crează CV profesional cu AI în 5 minute",
  description:
    "Generează un CV profesional optimizat pentru piața din România cu ajutorul inteligenței artificiale. ATS-friendly, personalizat pentru jobul tău.",
  keywords: ["creare cv", "cv online", "cv profesional", "cv AI", "generator cv", "cv Romania"],
  authors: [{ name: "CV Smart" }],
  openGraph: {
    title: "CV Smart — CV profesional cu AI",
    description: "Crează CV-ul perfect în 5 minute cu AI românesc",
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
    <html lang="ro" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased" style={{ fontFamily: "var(--font-inter, 'Inter', sans-serif)" }}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
