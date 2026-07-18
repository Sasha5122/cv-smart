/**
 * Test livrare email: generează un PDF real din CVData și îl trimite prin Resend.
 * Rulare: npx tsx --env-file=.env.local scripts/test-email-delivery.ts
 */
import { renderCVPDF } from "@/lib/pdf-templates/render";
import { buildCvFilename } from "@/lib/pdf-filename";
import { createDownloadToken } from "@/lib/download-token";
import { sendCvDeliveryEmail } from "@/lib/email/delivery";
import type { CVData } from "@/lib/types/cv";

const DEMO: CVData = {
  personal: {
    firstName: "Alexandru",
    lastName: "Popescu",
    email: "sashabetivu@gmail.com",
    phone: "0721 234 567",
    city: "Cluj-Napoca",
    country: "România",
  },
  targetTitle: "Șef Depozit",
  summary:
    "Profesionist în logistică cu peste 8 ani de experiență în coordonarea echipelor de depozit și optimizarea fluxurilor de mărfuri. Orientat spre rezultate măsurabile și eficiență operațională.",
  experience: [
    {
      company: "Dedeman",
      location: "Cluj-Napoca",
      title: "Șef Depozit",
      period: "Martie 2019 – Prezent",
      responsibilities: [
        "Coordonat o echipă de 12 angajați în recepția și expedierea mărfurilor.",
        "Gestionat inventarul săptămânal pentru un depozit de 4.000 mp.",
        "Implementat proceduri noi de verificare a comenzilor.",
      ],
      achievements: [
        "Redus timpul de procesare a comenzilor cu 28% prin reorganizarea fluxurilor.",
      ],
    },
  ],
  education: [
    {
      level: "Licență",
      institution: "Universitatea Babeș-Bolyai",
      field: "Management",
      years: "2011 – 2014",
      location: "Cluj-Napoca",
    },
  ],
  courses: [],
  skills: [
    { name: "Coordonare echipă", category: "soft" },
    { name: "Microsoft Excel", category: "software" },
    { name: "Gestiune stocuri", category: "hard" },
  ],
  languages: [
    { name: "Engleză", level: "B2 - Intermediar avansat" },
  ],
  license: { hasLicense: true, categories: ["B", "C"] },
  qualifications: "Operator stivuitor autorizat ISCIR",
  hobbies: ["Alergat", "Fotografie"],
};

async function main() {
  console.log("[1/3] Generez PDF-ul…");
  const pdfBuffer = await renderCVPDF(DEMO, "modern");
  console.log(`      PDF generat: ${(pdfBuffer.length / 1024).toFixed(1)} KB`);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const token = createDownloadToken("demo-session-id");
  const downloadUrl = `${siteUrl}/descarca/${token}`;
  console.log(`[2/3] Token re-descărcare (30 zile): ${token.slice(0, 40)}…`);

  console.log("[3/3] Trimit emailul prin Resend către sashabetivu@gmail.com…");
  const id = await sendCvDeliveryEmail({
    to: "sashabetivu@gmail.com",
    firstName: DEMO.personal.firstName!,
    pdfBuffer,
    pdfFilename: buildCvFilename(DEMO),
    downloadUrl,
  });
  console.log(`\n✅ Email trimis. Resend message id: ${id}`);
  console.log(`   Atașament: ${buildCvFilename(DEMO)}`);
}

main().catch((e) => {
  console.error("\n❌ Eroare:", e);
  process.exit(1);
});
