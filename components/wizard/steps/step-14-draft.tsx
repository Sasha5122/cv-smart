"use client";
import { useEffect, useRef, useState } from "react";
import { StepCard } from "../step-card";
import { CVPreview } from "../cv-preview";
import { Button } from "@/components/ui/button";
import { Download, Check, Loader2 } from "lucide-react";
import type { CVData, TemplateId } from "@/lib/types/cv";
import { buildCvFilename } from "@/lib/pdf-filename";
import { toast } from "sonner";

/* ────────────────────────────────────────────────────────────────
   Pasul final — alegi designul CV-ului (5 variante), preview-ul se
   schimbă instant, apoi Descarcă PDF în designul ales. Schimbarea
   designului e 100% locală: zero apeluri AI, zero cost.
   ──────────────────────────────────────────────────────────────── */

interface Props {
  sessionId: string;
  cvData: CVData;
  /** anunțul de la Pasul 1 — rezumatul se aliniază la el */
  jobDescription?: string;
  /** rezumatul generat se salvează în CV (preview + PDF) */
  onUpdateSummary: (summary: string) => void;
  onBack: () => void;
}

const TEMPLATES: { id: TemplateId; label: string; hint: string }[] = [
  { id: "classic", label: "Clasic", hint: "echilibrat, accente albastre" },
  { id: "modern", label: "Modern", hint: "sidebar închis la culoare" },
  { id: "elegant", label: "Elegant", hint: "serif, accente aurii" },
  { id: "compact", label: "Compact", hint: "dens, o singură pagină" },
  { id: "minimal", label: "Minimalist", hint: "alb-negru, aerisit" },
];

/** Mini-mockup CSS al fiecărui design pentru cardul de selecție. */
function TemplateThumb({ id }: { id: TemplateId }) {
  const line = (w: string, c = "#cbd5e1", h = 3) => (
    <div style={{ width: w, height: h, backgroundColor: c, borderRadius: 1 }} />
  );
  const base: React.CSSProperties = {
    width: 52,
    height: 68,
    backgroundColor: "#fff",
    border: "1px solid var(--hairline)",
    borderRadius: 4,
    padding: 5,
    display: "flex",
    flexDirection: "column",
    gap: 3,
    overflow: "hidden",
    flexShrink: 0,
  };
  switch (id) {
    case "modern":
      return (
        <div style={{ ...base, flexDirection: "row", padding: 0, gap: 0 }}>
          <div style={{ width: "34%", backgroundColor: "#0b1220" }} />
          <div style={{ flex: 1, padding: 5, display: "flex", flexDirection: "column", gap: 3 }}>
            {line("80%", "#0f172a", 4)}
            {line("40%", "#2563eb")}
            {line("90%")}
            {line("85%")}
            {line("70%")}
          </div>
        </div>
      );
    case "elegant":
      return (
        <div style={{ ...base, alignItems: "center" }}>
          {line("60%", "#1c1917", 4)}
          {line("45%", "#a16207", 2)}
          <div style={{ width: "90%", height: 1, backgroundColor: "#1c1917" }} />
          {line("80%")}
          {line("85%")}
          {line("75%")}
        </div>
      );
    case "compact":
      return (
        <div style={{ ...base, gap: 2 }}>
          {line("70%", "#0f172a", 4)}
          {line("100%", "#0f766e", 2)}
          {line("95%", "#cbd5e1", 2)}
          {line("90%", "#cbd5e1", 2)}
          {line("95%", "#cbd5e1", 2)}
          {line("85%", "#cbd5e1", 2)}
          {line("90%", "#cbd5e1", 2)}
          {line("80%", "#cbd5e1", 2)}
        </div>
      );
    case "minimal":
      return (
        <div style={{ ...base, gap: 4, padding: 7 }}>
          {line("75%", "#111111", 4)}
          <div style={{ width: "100%", height: 1, backgroundColor: "#111111" }} />
          {line("60%")}
          {line("70%")}
        </div>
      );
    default: // classic
      return (
        <div style={base}>
          {line("70%", "#0f172a", 4)}
          <div style={{ width: "100%", height: 2, backgroundColor: "#0f172a" }} />
          {line("35%", "#2563eb")}
          {line("90%")}
          {line("85%")}
          {line("60%")}
        </div>
      );
  }
}

export function Step14Draft({ sessionId, cvData, jobDescription, onUpdateSummary, onBack }: Props) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [template, setTemplate] = useState<TemplateId>("classic");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const summaryRequested = useRef(false);

  // Rezumatul profesional se generează automat, o singură dată, din datele
  // completate (apel ieftin) — CV-ul nu mai pleacă fără profil.
  useEffect(() => {
    if (summaryRequested.current) return;
    if (cvData.summary?.trim() || cvData.experience.length === 0) return;
    summaryRequested.current = true;
    setIsSummarizing(true);
    fetch("/api/ai/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cvData, jobDescription: jobDescription?.trim() || undefined }),
    })
      .then((res) => (res.ok ? res.json() : { summary: "" }))
      .then((data) => {
        if (typeof data.summary === "string" && data.summary.trim()) {
          onUpdateSummary(data.summary.trim());
        }
      })
      .catch(() => {})
      .finally(() => setIsSummarizing(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // datele merg direct din browser — PDF-ul se generează și dacă
      // persistența sesiunii e indisponibilă
      const res = await fetch(`/api/pdf/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvData, templateId: template }),
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
      subtitle="Alege designul care ți se potrivește — exact așa va arăta PDF-ul descărcat."
    >
      {/* Selectorul de design */}
      <div
        role="radiogroup"
        aria-label="Alege designul CV-ului"
        style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 22 }}
      >
        {TEMPLATES.map((tpl) => {
          const isSelected = tpl.id === template;
          return (
            <button
              key={tpl.id}
              role="radio"
              aria-checked={isSelected}
              data-testid={`template-${tpl.id}`}
              onClick={() => setTemplate(tpl.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px 10px 10px",
                borderRadius: 10,
                border: isSelected ? "2px solid var(--primary)" : "1px solid var(--hairline)",
                backgroundColor: isSelected ? "var(--wash)" : "var(--card)",
                cursor: "pointer",
                transition: "all 0.15s",
                textAlign: "left",
              }}
            >
              <TemplateThumb id={tpl.id} />
              <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: isSelected ? "var(--primary-strong)" : "var(--ink)" }}>
                  {tpl.label}
                  {isSelected && <Check size={14} style={{ color: "var(--primary)" }} />}
                </span>
                <span style={{ fontSize: 11.5, color: "var(--muted-foreground)" }}>{tpl.hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      {isSummarizing && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "var(--muted-foreground)",
            marginBottom: 12,
          }}
        >
          <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: "var(--primary)" }} />
          Scriem rezumatul tău profesional…
        </div>
      )}

      {/* foaia mare, proporții A4, în designul ales */}
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
          <CVPreview cvData={cvData} template={template} />
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
