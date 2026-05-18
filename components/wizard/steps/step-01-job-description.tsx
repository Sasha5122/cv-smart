"use client";
import { useState } from "react";
import { StepCard } from "../step-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Target, ArrowRight, Sparkles } from "lucide-react";

interface Props {
  value: string;
  onChange: (text: string) => void;
  onNext: () => void;
  onSkip: () => void;
}

const EXAMPLES = [
  "Sales Manager la Mega Image",
  "Programator Full-Stack (React + Node.js)",
  "Asistent manager în HoReCa",
  "Șofer profesionist categoria CE",
];

export function Step01JobDescription({ value, onChange, onNext, onSkip }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <StepCard
      title="Ce job vrei să obții?"
      subtitle="Lipește descrierea postului sau scrie rolul vizat. AI-ul va personaliza CV-ul exact pentru acel job."
      icon={<Target className="w-5 h-5" />}
    >
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Exemplu: Vânzător la Lidl, sau lipește descrierea completă a jobului de pe eJobs/BestJobs..."
        rows={7}
        hint="Cu cât dai mai multe detalii, cu atât CV-ul va fi mai bine personalizat"
      />

      {/* Examples */}
      {!focused && !value && (
        <div className="mt-4">
          <p className="text-xs text-slate-400 mb-2">Exemple rapide:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => onChange(ex)}
                className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
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
        <Button onClick={onNext} size="lg" className="w-full" iconRight={<ArrowRight className="w-4 h-4" />}>
          Continuă
        </Button>
        <Button variant="ghost" onClick={onSkip} className="w-full text-slate-400">
          Sari peste · CV universal
        </Button>
      </div>
    </StepCard>
  );
}
