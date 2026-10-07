"use client";
import { StepCard } from "../step-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Target, ArrowRight, Sparkles } from "lucide-react";
import { useMessages } from "@/lib/i18n/context";
import { STEP_JOB_DESCRIPTION_MESSAGES } from "@/lib/i18n/wizard/step-job-description";

interface Props {
  value: string;
  onChange: (text: string) => void;
  onNext: () => void;
  onSkip: () => void;
  /** pasul nu mai e primul — Înapoi duce la Fotografie */
  onBack?: () => void;
}

export function Step01JobDescription({ value, onChange, onNext, onSkip, onBack }: Props) {
  const t = useMessages(STEP_JOB_DESCRIPTION_MESSAGES);
  return (
    <StepCard
      title={t.title}
      subtitle={t.subtitle}
      icon={<Target className="w-5 h-5" />}
    >
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t.placeholder}
        rows={7}
        hint={t.hint}
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
            {t.anchored}
          </p>
        </div>
      )}

      <div className="flex flex-col" style={{ gap: 14, marginTop: 32 }}>
        <div className="flex gap-3">
          {onBack && (
            <Button variant="outline" onClick={onBack} className="flex-1">
              {t.back}
            </Button>
          )}
          <Button
            onClick={onNext}
            size="lg"
            className={onBack ? "flex-[2]" : "w-full"}
            iconRight={<ArrowRight className="w-4 h-4" />}
          >
            {t.continue}
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
          {t.skip}
        </button>
      </div>
    </StepCard>
  );
}
