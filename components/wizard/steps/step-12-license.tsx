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
      <div className="mb-5">
        <p className="text-lg font-medium text-slate-700 mb-3">Ai permis de conducere?</p>
        <div className="flex gap-2">
          <button
            onClick={() => onUpdateLicense({ ...license, hasLicense: true })}
            className={cn(
              "flex-1 py-3 rounded-xl border-2 text-lg font-medium transition-all",
              license.hasLicense
                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            )}
          >
            ✅ Da
          </button>
          <button
            onClick={() => onUpdateLicense({ hasLicense: false, categories: [] })}
            className={cn(
              "flex-1 py-3 rounded-xl border-2 text-lg font-medium transition-all",
              !license.hasLicense
                ? "border-slate-500 bg-slate-50 text-slate-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            )}
          >
            ❌ Nu
          </button>
        </div>
      </div>

      {/* Categories */}
      {license.hasLicense && (
        <div className="mb-5">
          <p className="text-lg font-medium text-slate-700 mb-2">Categorii permis:</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => toggleCat(cat)}
                className={cn(
                  "w-14 h-11 rounded-lg border-2 text-base font-semibold transition-all",
                  license.categories.includes(cat)
                    ? "border-indigo-500 bg-indigo-500 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300"
                )}
              >
                {cat}
              </button>
            ))}
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

      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={onBack} className="flex-1">← Înapoi</Button>
        <Button onClick={onNext} className="flex-[2]" iconRight={<ArrowRight className="w-4 h-4" />}>
          Continuă
        </Button>
      </div>
    </StepCard>
  );
}
