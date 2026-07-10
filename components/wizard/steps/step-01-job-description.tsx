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
        placeholder="Fă copy-paste la descrierea jobului de pe eJobs, BestJobs, LinkedIn... sau scrie jobul dorit (ex: Vânzător la Lidl)"
        rows={7}
        hint="Cu cât descrierea e mai completă, cu atât CV-ul va fi mai bine adaptat pentru acel job"
      />

      {value && (
        <div
          className="flex items-center gap-2.5"
          style={{
            marginTop: 16,
            backgroundColor: "var(--green-soft)",
            border: "1px solid #6ee7b7",
            borderRadius: 8,
            padding: "12px 16px",
          }}
        >
          <Sparkles className="w-4 h-4 shrink-0" style={{ color: "var(--green)" }} />
          <p style={{ fontSize: 13.5, color: "#065f46", fontWeight: 600 }}>
            CV-ul va fi ancorat pe acest anunț — vocabular, cerințe, ordine.
          </p>
        </div>
      )}

      <div className="flex flex-col" style={{ gap: 14, marginTop: 32 }}>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            ← Înapoi
          </Button>
          <Button
            onClick={onNext}
            size="lg"
            className="flex-[2]"
            iconRight={<ArrowRight className="w-4 h-4" />}
          >
            Continuă
          </Button>
        </div>
        <button
          onClick={onSkip}
          style={{
            width: "100%",
            padding: "10px 16px",
            fontSize: 14,
            fontWeight: 500,
            color: "var(--muted-foreground)",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            textDecoration: "underline",
            textDecorationColor: "var(--hairline-strong)",
            textUnderlineOffset: 4,
          }}
        >
          Nu am un anunț — continuă cu un CV general
        </button>
      </div>
    </StepCard>
  );
}
