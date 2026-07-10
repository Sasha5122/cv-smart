"use client";
import { useState } from "react";
import { StepCard } from "../step-card";
import { CVPreview } from "../cv-preview";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { CVData } from "@/lib/types/cv";
import { buildCvFilename } from "@/lib/pdf-filename";
import { toast } from "sonner";

/* ────────────────────────────────────────────────────────────────
   Pasul final — DOAR preview-ul mare al CV-ului + Descarcă PDF /
   Înapoi. PDF-ul se generează direct din datele completate
   (template-ul Classic), fără pași intermediari.
   ──────────────────────────────────────────────────────────────── */

interface Props {
  sessionId: string;
  cvData: CVData;
  onBack: () => void;
}

export function Step14Draft({ sessionId, cvData, onBack }: Props) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // datele merg direct din browser — PDF-ul se generează și dacă
      // persistența sesiunii e indisponibilă
      const res = await fetch(`/api/pdf/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvData }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // numele utilizatorului + data generării (ex: CV_Elena_Stanciu_2026-07-10.pdf)
      a.download = buildCvFilename(cvData);
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CV-ul a fost descărcat. Succes la aplicare! 🎉");
    } catch {
      toast.error("Eroare la generarea PDF-ului. Încearcă din nou.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <StepCard
      kicker="Finalizare"
      title="CV-ul tău e gata."
      subtitle="Verifică-l mai jos — exact așa va arăta PDF-ul descărcat."
    >
      {/* foaia mare, proporții A4 */}
      <div
        style={{
          backgroundColor: "var(--paper-deep)",
          border: "1px solid var(--hairline)",
          borderRadius: 14,
          padding: 18,
        }}
      >
        <div
          data-testid="final-cv-sheet"
          style={{
            border: "1px solid var(--hairline)",
            borderRadius: 10,
            boxShadow: "var(--shadow-lift)",
            backgroundColor: "#fff",
            maxWidth: 760,
            margin: "0 auto",
            aspectRatio: "210 / 297",
            overflowY: "auto",
          }}
        >
          <CVPreview cvData={cvData} />
        </div>
      </div>

      <div className="flex gap-3" style={{ marginTop: 32 }}>
        <Button variant="outline" onClick={onBack} className="flex-1">
          ← Înapoi
        </Button>
        <Button
          onClick={handleDownload}
          size="lg"
          className="flex-[2]"
          loading={isDownloading}
          icon={<Download className="w-4 h-4" />}
        >
          Descarcă PDF
        </Button>
      </div>
    </StepCard>
  );
}
