import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { buildDemoDataset } from "@/lib/admin/demo-dataset";

/* ────────────────────────────────────────────────────────────────
   /demo/admin — panoul de administrare cu DATE GENERATE, public și
   read-only, pentru portofoliu. Setul e determinist (seed fix) și
   relativ la ora curentă, deci arată mereu „ultimele 30 de zile”.
   Arată identic cu admin-ul real (fără marcaj „demo” în interfață);
   admin-ul real (/admin) rămâne protejat cu parolă.
   ──────────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: "Admin — CVexpres",
  description: "Panou de administrare cu date generate: funnel, costuri AI, latență, erori, benchmark de modele.",
  robots: { index: false, follow: false },
};

// setul se schimbă doar din oră în oră → cache de o oră
export const revalidate = 3600;

export default function DemoAdminPage() {
  const data = buildDemoDataset();
  return <AdminDashboard data={data} mode="demo" />;
}
