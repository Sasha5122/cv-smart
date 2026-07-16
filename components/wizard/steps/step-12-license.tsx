"use client";
import { StepCard } from "../step-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Car, ArrowRight } from "lucide-react";
import type { DrivingLicense } from "@/lib/types/cv";
import { cn } from "@/lib/utils";

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
  const toggleCat = (cat: string) => {
    const cats = license.categories.includes(cat)
      ? license.categories.filter((c) => c !== cat)
      : [...license.categories, cat];
    onUpdateLicense({ ...license, categories: cats });
  };

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

      {/* Qualifications */}
      <Textarea
        label="Calificări profesionale (opțional)"
        placeholder="ex: Operator stivuitor autorizat ISCIR, Electrician ANRE grad II, Sudor autorizat ISCIR..."
        value={qualifications}
        onChange={(e) => onUpdateQualifications(e.target.value)}
        rows={3}
        hint="Autorizații, atestări, certificate profesionale recunoscute oficial"
      />

      <div className="flex gap-3" style={{ marginTop: 32 }}>
        <Button variant="outline" onClick={onBack} className="flex-1">← Înapoi</Button>
        <Button onClick={onNext} className="flex-[2]" iconRight={<ArrowRight className="w-4 h-4" />}>
          Continuă
        </Button>
      </div>
    </StepCard>
  );
}
