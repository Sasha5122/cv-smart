"use client";
import { useState, useRef } from "react";
import { StepCard } from "../step-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowRight, AlertTriangle } from "lucide-react";

interface Props {
  value: string;
  firstName?: string;
  lastName?: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function Step06Email({ value, firstName, lastName, onChange, onNext, onBack }: Props) {
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [verifying, setVerifying] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(null);

  const handleChange = (v: string) => {
    onChange(v);
    setError("");
    setWarning("");
    setSuggestions([]);

    if (timer.current) clearTimeout(timer.current);
    if (isValidEmail(v)) {
      timer.current = setTimeout(() => verifyEmail(v), 800);
    }
  };

  const verifyEmail = async (email: string) => {
    setVerifying(true);
    try {
      const res = await fetch("/api/ai/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName, lastName }),
      });
      const data = await res.json();
      if (!data.ok) {
        setWarning(data.suggestion ?? "Emailul nu pare profesional");
        setSuggestions(data.alternatives ?? []);
      }
    } catch { /* ignore */ }
    setVerifying(false);
  };

  const handleNext = () => {
    if (!value.trim()) { setError("Introdu adresa de email"); return; }
    if (!isValidEmail(value)) { setError("Adresă de email invalidă"); return; }
    setError("");
    onNext();
  };

  return (
    <StepCard
      title="Adresă de email"
      subtitle="Asigură-te că emailul este profesional și îl verifici regulat."
      icon={<Mail className="w-5 h-5" />}
    >
      <Input
        label="Email"
        placeholder="prenume.nume@gmail.com"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        error={error}
        type="email"
        autoFocus
        onKeyDown={(e) => e.key === "Enter" && handleNext()}
        icon={<Mail className="w-4 h-4" />}
        iconRight={verifying ? <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" /> : undefined}
      />

      {warning && (
        <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-amber-800 font-medium">{warning}</p>
              {suggestions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => { onChange(s); setWarning(""); setSuggestions([]); }}
                      className="text-xs bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 px-2.5 py-1 rounded-lg"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
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
