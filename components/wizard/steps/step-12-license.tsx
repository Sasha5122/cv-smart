"use client";
import { useState } from "react";
import { StepCard } from "../step-card";
import { Button } from "@/components/ui/button";
import { Car, ArrowRight, Plus, X, Loader2 } from "lucide-react";
import type { DrivingLicense } from "@/lib/types/cv";
import { cn } from "@/lib/utils";
import { correctText } from "@/lib/correct-text";

/** Calificările sunt stocate ca string (compatibil cu preview/PDF) —
 *  UI-ul le tratează ca listă, separate prin virgulă. */
function splitQualifications(q: string): string[] {
  return q.split(",").map((s) => s.trim()).filter(Boolean);
}

const CATEGORIES = ["A", "A1", "A2", "B", "BE", "B1", "C", "CE", "C1", "D", "DE", "T"];

interface Props {
  license: DrivingLicense;
  qualifications: string;
  onUpdateLicense: (l: DrivingLicense) => void;
  onUpdateQualifications: (q: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step12License({ license, qualifications, onUpdateLicense, onUpdateQualifications, onNext, onBack }: Props) {
  const [qualInput, setQualInput] = useState("");
  const [isCorrecting, setIsCorrecting] = useState(false);
  const qualList = splitQualifications(qualifications);

  const toggleCat = (cat: string) => {
    const cats = license.categories.includes(cat)
      ? license.categories.filter((c) => c !== cat)
      : [...license.categories, cat];
    onUpdateLicense({ ...license, categories: cats });
  };

  const addQualification = async () => {
    const raw = qualInput.trim();
    if (!raw || isCorrecting) return;
    setIsCorrecting(true);
    // AI-ul corectează doar forma („oparater stivuiter" → „Operator stivuitor")
    const corrected = await correctText(raw, "qualification");
    setIsCorrecting(false);
    if (!qualList.includes(corrected)) {
      onUpdateQualifications([...qualList, corrected].join(", "));
    }
    setQualInput("");
  };

  const removeQualification = (i: number) =>
    onUpdateQualifications(qualList.filter((_, idx) => idx !== i).join(", "));

  return (
    <StepCard
      title="Permis & Calificări"
      subtitle="Adaugă permisul de conducere și calificările profesionale."
      icon={<Car className="w-5 h-5" />}
    >
      {/* License toggle */}
      <div style={{ marginBottom: 28 }}>
        <p className="text-lg font-medium text-[var(--foreground)]" style={{ marginBottom: 12 }}>
          Ai permis de conducere?
        </p>
        <div className="flex" style={{ gap: 12 }}>
          <button
            onClick={() => onUpdateLicense({ ...license, hasLicense: true })}
            className={cn(
              "flex-1 py-3 rounded-xl border-2 text-lg font-medium transition-all",
              license.hasLicense
                ? "border-[var(--primary)] bg-[var(--wash)] text-[var(--primary)]"
                : "border-[var(--hairline)] bg-[var(--card)] text-[var(--foreground)] hover:border-[var(--input-border)]"
            )}
          >
            ✅ Da
          </button>
          <button
            onClick={() => onUpdateLicense({ hasLicense: false, categories: [] })}
            className={cn(
              "flex-1 py-3 rounded-xl border-2 text-lg font-medium transition-all",
              !license.hasLicense
                ? "border-[var(--hairline-strong)] bg-[var(--muted)] text-[var(--foreground)]"
                : "border-[var(--hairline)] bg-[var(--card)] text-[var(--foreground)] hover:border-[var(--input-border)]"
            )}
          >
            ❌ Nu
          </button>
        </div>
      </div>

      {/* Categories */}
      {license.hasLicense && (
        <div style={{ marginBottom: 28 }}>
          <p className="text-lg font-medium text-[var(--foreground)]" style={{ marginBottom: 12 }}>
            Categorii permis:
          </p>
          <div className="flex flex-wrap" style={{ gap: 10 }}>
            {CATEGORIES.map((cat) => {
              const isSelected = license.categories.includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => toggleCat(cat)}
                  aria-pressed={isSelected}
                  className="w-14 h-11 rounded-lg text-base font-semibold transition-all"
                  // stil inline — litera rămâne garantat vizibilă la selectare
                  // (albastru plin + text alb); clasele arbitrare Tailwind nu
                  // sunt fiabile aici (bug istoric cu CSS-ul necompilat)
                  style={
                    isSelected
                      ? {
                          border: "2px solid var(--primary)",
                          backgroundColor: "var(--primary)",
                          color: "#ffffff",
                        }
                      : {
                          border: "2px solid var(--hairline)",
                          backgroundColor: "var(--card)",
                          color: "var(--foreground)",
                        }
                  }
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Calificări — ca la hobby-uri: scrii, AI-ul corectează, apare ca etichetă cu X */}
      <div
        style={{
          border: "1px dashed var(--input-border)",
          borderRadius: 10,
          padding: "18px 18px 20px",
        }}
      >
        <label
          htmlFor="qualification-input"
          style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: "var(--ink)", marginBottom: 10 }}
        >
          Calificări profesionale (opțional)
        </label>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            id="qualification-input"
            data-testid="qualification-input"
            value={qualInput}
            onChange={(e) => setQualInput(e.target.value)}
            placeholder="ex: operator stivuitor, electrician ANRE…"
            onKeyDown={(e) => e.key === "Enter" && addQualification()}
            disabled={isCorrecting}
            style={{ flex: 1, padding: "13px 16px", minWidth: 0 }}
            className="rounded-[8px] border border-[var(--input-border)] bg-[var(--card)] text-[15.5px] text-[var(--ink)] placeholder:text-[var(--faint)] shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[rgba(244,90,39,0.18)] disabled:bg-[var(--muted)] disabled:text-[var(--faint)] transition-all duration-150"
          />
          <Button
            onClick={addQualification}
            data-testid="qualification-add"
            disabled={!qualInput.trim() || isCorrecting}
            icon={
              isCorrecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )
            }
          >
            {isCorrecting ? "Corectăm…" : "Adaugă"}
          </Button>
        </div>
        <p style={{ fontSize: 12.5, color: "var(--faint)", marginTop: 10 }}>
          Autorizații, atestări, certificate recunoscute oficial — corectăm noi scrierea.
        </p>

        {qualList.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
            {qualList.map((q, i) => (
              <div
                key={i}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  backgroundColor: "var(--wash)",
                  border: "1px solid #f3c4ac",
                  color: "var(--primary-strong)",
                  borderRadius: 999,
                  padding: "8px 14px",
                  fontSize: 14.5,
                  fontWeight: 600,
                }}
              >
                {q}
                <button
                  onClick={() => removeQualification(i)}
                  aria-label={`Șterge ${q}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "none",
                    border: "none",
                    color: "var(--primary)",
                    cursor: "pointer",
                    padding: 2,
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3" style={{ marginTop: 32 }}>
        <Button variant="outline" onClick={onBack} className="flex-1">← Înapoi</Button>
        <Button onClick={onNext} className="flex-[2]" iconRight={<ArrowRight className="w-4 h-4" />}>
          Continuă
        </Button>
      </div>
    </StepCard>
  );
}
