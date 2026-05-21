"use client";
import Link from "next/link";
import { CVPreview } from "./cv-preview";
import type { WizardStep, CVData } from "@/lib/types/cv";

// Maps sidebar items to our internal step numbers
const SIDEBAR_STEPS = [
  { label: "Job vizat",         steps: [1] },
  { label: "Fotografie",        steps: [2] },
  { label: "Contact",           steps: [3, 4, 5, 6, 7] },
  { label: "Experiență",        steps: [8] },
  { label: "Educație",          steps: [9] },
  { label: "Abilități",         steps: [10] },
  { label: "Limbi",             steps: [11] },
  { label: "Permis",            steps: [12] },
  { label: "Hobby-uri",         steps: [13] },
  { label: "Finalizare",        steps: [14] },
];

type StepStatus = "done" | "current" | "future";

function getStatus(steps: number[], current: number): StepStatus {
  if (current > Math.max(...steps)) return "done";
  if (steps.includes(current)) return "current";
  return "future";
}

interface WizardLayoutProps {
  currentStep: WizardStep;
  cvData: CVData;
  children: React.ReactNode;
}

export function WizardLayout({ currentStep, cvData, children }: WizardLayoutProps) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* ── LEFT SIDEBAR ─────────────────────────────────────────── */}
      <aside className="wizard-sidebar" style={{
        width: 220,
        flexShrink: 0,
        backgroundColor: "#0F172A",
        display: "flex",
        flexDirection: "column",
        padding: "24px 0",
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 20px", marginBottom: 36, textDecoration: "none" }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            backgroundColor: "#4F46E5",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "#fff", fontSize: 10, fontWeight: 800 }}>CV</span>
          </div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 20, letterSpacing: -0.3 }}>CV Smart</span>
        </Link>

        {/* Steps */}
        <nav style={{ padding: "0 16px", display: "flex", flexDirection: "column" }}>
          {SIDEBAR_STEPS.map((item, idx) => {
            const status = getStatus(item.steps, currentStep);
            return (
              <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 0 }}>
                {/* Circle + connector */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  {/* Circle */}
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 700,
                    backgroundColor:
                      status === "done" ? "#22C55E" :
                      status === "current" ? "#4F46E5" : "transparent",
                    border:
                      status === "done" ? "2px solid #22C55E" :
                      status === "current" ? "2px solid #4F46E5" : "2px solid #334155",
                    color:
                      status === "done" ? "#fff" :
                      status === "current" ? "#fff" : "#64748B",
                    flexShrink: 0,
                  }}>
                    {status === "done" ? (
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M2 6.5L5.5 10L11 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : status === "current" ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ animation: "spin 1.5s linear infinite" }}>
                        <circle cx="6" cy="6" r="5" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
                        <path d="M6 1a5 5 0 0 1 5 5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>
                  {/* Connector line */}
                  {idx < SIDEBAR_STEPS.length - 1 && (
                    <div style={{
                      width: 2, height: 28,
                      backgroundColor: status === "done" ? "#22C55E" : "#1E293B",
                      margin: "2px 0",
                    }} />
                  )}
                </div>

                {/* Label */}
                <span style={{
                  paddingTop: 5,
                  fontSize: 17,
                  fontWeight: status === "current" ? 600 : 400,
                  color:
                    status === "done" ? "#22C55E" :
                    status === "current" ? "#A5B4FC" : "#64748B",
                  lineHeight: 1.2,
                }}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </nav>
      </aside>

      {/* ── MAIN AREA ────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "#ffffff", minHeight: "100vh" }}>

        {/* Mobile top bar (hidden on desktop, shown on mobile) */}
        <div className="wizard-mobile-header" style={{
          display: "none",
          alignItems: "center",
          gap: 10,
          padding: "12px 20px",
          backgroundColor: "#0F172A",
          borderBottom: "1px solid #1E293B",
        }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{
              width: 26, height: 26, borderRadius: 7,
              backgroundColor: "#4F46E5",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ color: "#fff", fontSize: 9, fontWeight: 800 }}>CV</span>
            </div>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>CV Smart</span>
          </Link>
        </div>

        {/* Step counter top bar */}
        <div style={{
          borderBottom: "1px solid #F1F5F9",
          padding: "10px 32px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          {(() => {
            const sidebarIdx = SIDEBAR_STEPS.findIndex(s => s.steps.includes(currentStep));
            const item = SIDEBAR_STEPS[sidebarIdx];
            return (
              <>
                <span style={{
                  fontSize: 16, fontWeight: 600, color: "#4F46E5",
                  backgroundColor: "#EEF2FF", padding: "3px 12px", borderRadius: 50,
                }}>
                  Pas {sidebarIdx + 1} din {SIDEBAR_STEPS.length}
                </span>
                <span style={{ fontSize: 17, color: "#64748B" }}>{item?.label}</span>
              </>
            );
          })()}
        </div>

        {/* Content + Preview */}
        <div className="wizard-grid" style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 420px",
          gap: 40,
          padding: "32px 40px 100px",
          alignItems: "start",
        }}>
          {/* Form */}
          <div style={{ maxWidth: 600 }}>
            {children}
          </div>

          {/* CV Preview */}
          <div className="wizard-preview" style={{ position: "sticky", top: 24 }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 12,
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1 }}>
                Preview CV
              </span>
              <span style={{
                fontSize: 12, color: "#94A3B8",
                backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0",
                padding: "2px 8px", borderRadius: 50,
              }}>
                live
              </span>
            </div>
            <div style={{
              border: "1px solid #E2E8F0",
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            }}>
              <CVPreview cvData={cvData} />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .wizard-sidebar { display: none !important; }
          .wizard-preview { display: none !important; }
          .wizard-grid { grid-template-columns: 1fr !important; padding: 20px 16px 80px !important; }
          .wizard-mobile-header { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
