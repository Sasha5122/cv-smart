"use client";
import { useState } from "react";
import { StepCard } from "../step-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, ArrowRight } from "lucide-react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}

function formatPhoneInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
}

function isValidRO(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 && digits.startsWith("07");
}

export function Step05Phone({ value, onChange, onNext, onBack }: Props) {
  const [error, setError] = useState("");

  const handleChange = (raw: string) => {
    onChange(formatPhoneInput(raw));
    setError("");
  };

  const handleNext = () => {
    if (!value.trim()) { setError("Introdu numărul de telefon"); return; }
    if (!isValidRO(value)) { setError("Introduceți un număr valid românesc (07XX XXX XXX)"); return; }
    setError("");
    onNext();
  };

  return (
    <StepCard
      title="Număr de telefon"
      subtitle="Recruiterii te vor contacta la acest număr."
      icon={<Phone className="w-5 h-5" />}
    >
      <Input
        label="Telefon"
        placeholder="0721 234 567"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        error={error}
        type="tel"
        inputMode="numeric"
        autoFocus
        onKeyDown={(e) => e.key === "Enter" && handleNext()}
        hint="Format românesc: 07XX XXX XXX"
        icon={<Phone className="w-4 h-4" />}
      />

      {value && isValidRO(value) && (
        <div className="mt-3 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          <span className="text-emerald-600 text-sm">✓</span>
          <p className="text-xs text-emerald-700">Număr valid</p>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={onBack} className="flex-1">← Înapoi</Button>
        <Button onClick={handleNext} className="flex-[2]" iconRight={<ArrowRight className="w-4 h-4" />}>
          Continuă
        </Button>
      </div>
    </StepCard>
  );
}
