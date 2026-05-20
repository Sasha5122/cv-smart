"use client";
import { StepCard } from "../step-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Target, ArrowRight, Sparkles } from "lucide-react";

interface Props {
  value: string;
  onChange: (text: string) => void;
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
}

const EXAMPLES = [
  "Sales Manager la Mega Image",
  "Programator Full-Stack (React + Node.js)",
  "Asistent manager în HoReCa",
  "Șofer profesionist categoria CE",
];

export function Step01JobDescription({ value, onChange, onNext, onSkip, onBack }: Props) {
  return (
    <StepCard
      title="Ce job vrei să obții?"
      subtitle="Fă copy-paste la descrierea jobului pentru care vrei să aplici. CV-ul tău va fi personalizat exact pentru acel job ca să ai șanse maxime pentru interviu și angajare."
      icon={<Target className="w-5 h-5" />}
    >
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Fă copy-paste la descrierea jobului de pe eJobs, BestJobs, LinkedIn... sau scrie rolul vizat (ex: Vânzător la Lidl)"
        rows={7}
        hint="Cu cât descrierea e mai completă, cu atât CV-ul va fi mai bine adaptat pentru acel job"
      />

      {/* Examples — always visible when no value */}
      {!value && (
        <div className="mt-4">
          <p className="text-sm text-slate-400 mb-2">Exemple rapide:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => onChange(ex)}
                className="text-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}

      {value && (
        <div className="mt-3 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <p className="text-xs text-emerald-700">
            AI-ul va analiza jobul și va personaliza CV-ul pentru tine
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2 mt-6">
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">← Înapoi</Button>
          <Button onClick={onNext} size="lg" className="flex-[2]" iconRight={<ArrowRight className="w-4 h-4" />}>
            Continuă
          </Button>
        </div>
        <button
          onClick={onSkip}
          style={{
            width: "100%",
            padding: "11px 16px",
            fontSize: 17,
            fontWeight: 600,
            color: "#6366F1",
            backgroundColor: "#EEF2FF",
            border: "2px dashed #A5B4FC",
            borderRadius: 10,
            cursor: "pointer",
            letterSpacing: 0.2,
          }}
        >
          Sari peste
        </button>
      </div>
    </StepCard>
  );
}
