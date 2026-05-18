"use client";
import { useState } from "react";
import { StepCard } from "../step-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, ArrowRight } from "lucide-react";

interface Props {
  value: string;
  lastName: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step04FirstName({ value, lastName, onChange, onNext, onBack }: Props) {
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!value.trim()) { setError("Introdu prenumele"); return; }
    setError("");
    onNext();
  };

  return (
    <StepCard
      title="Care este prenumele tău?"
      subtitle={lastName ? `${lastName} ...` : "Adaugă prenumele tău."}
      icon={<User className="w-5 h-5" />}
    >
      {lastName && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2.5 mb-4">
          <p className="text-xs text-indigo-500 mb-0.5">Numele complet va fi:</p>
          <p className="text-lg font-bold text-indigo-900">
            {value || "?"} {lastName}
          </p>
        </div>
      )}

      <Input
        label="Prenume"
        placeholder="ex: Alexandru"
        value={value}
        onChange={(e) => { onChange(e.target.value); setError(""); }}
        error={error}
        autoFocus
        onKeyDown={(e) => e.key === "Enter" && handleNext()}
      />

      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={onBack} className="flex-1">← Înapoi</Button>
        <Button onClick={handleNext} className="flex-[2]" iconRight={<ArrowRight className="w-4 h-4" />}>
          Continuă
        </Button>
      </div>
    </StepCard>
  );
}
