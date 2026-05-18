"use client";
import { TOTAL_STEPS, STEP_LABELS, type WizardStep } from "@/lib/types/cv";

interface ProgressBarProps {
  currentStep: WizardStep;
}

export function ProgressBar({ currentStep }: ProgressBarProps) {
  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;
  const stepLabel = STEP_LABELS[currentStep];

  return (
    <div style={{ width: "100%", backgroundColor: "#ffffff", borderBottom: "1px solid #E5E7EB", padding: "12px 24px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#4F46E5",
                backgroundColor: "#EEEDF8",
                padding: "4px 12px",
                borderRadius: 50,
              }}
            >
              Pas {currentStep + 1} din {TOTAL_STEPS}
            </span>
            <span style={{ fontSize: 14, fontWeight: 500, color: "#0D0D0D" }}>{stepLabel}</span>
          </div>
          <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}>
            {Math.round(progress)}% complet
          </span>
        </div>

        {/* Track */}
        <div style={{ height: 6, backgroundColor: "#E5E7EB", borderRadius: 99, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              background: "linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)",
              borderRadius: 99,
              width: `${progress}%`,
              transition: "width 0.5s ease-out",
            }}
          />
        </div>

        {/* Step dots */}
        <div className="hidden md:flex" style={{ alignItems: "center", justifyContent: "space-between", marginTop: 6, padding: "0 2px" }}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: i <= currentStep ? "#4F46E5" : "#E5E7EB",
                transition: "background-color 0.3s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
