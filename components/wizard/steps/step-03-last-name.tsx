"use client";
import { useState } from "react";
import { StepCard } from "../step-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, ArrowRight } from "lucide-react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const SUGGESTIONS = ["Popescu", "Ionescu", "Popa", "Stan", "Gheorghe", "Stoica", "Dumitru", "Constantin"];

export function Step03LastName({ value, onChange, onNext, onBack }: Props) {
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!value.trim()) {
      setError("Introdu numele de familie");
      return;
    }
    setError("");
    onNext();
  };

  return (
    <StepCard
      title="Cum te numești?"
      subtitle="Introdu numele de familie exact cum apare în actele de identitate."
      icon={<User className="w-5 h-5" />}
    >
      <Input
        label="Nume de familie"
        placeholder="ex: Popescu"
        value={value}
        onChange={(e) => { onChange(e.target.value); setError(""); }}
        error={error}
        autoFocus
        onKeyDown={(e) => e.key === "Enter" && handleNext()}
      />

      {!value && (
        <div className="mt-4">
          <p className="text-xs text-slate-400 mb-2">Cele mai comune în România:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => onChange(s)}
                className="text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 px-3 py-1.5 rounded-lg transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={onBack} className="flex-1">
          ← Înapoi
        </Button>
        <Button onClick={handleNext} className="flex-[2]" iconRight={<ArrowRight className="w-4 h-4" />}>
          Continuă
        </Button>
      </div>
    </StepCard>
  );
}
