"use client";
import Link from "next/link";
import { CVPreview } from "./cv-preview";
import { LogoMark } from "@/components/ui/logo";
import type { WizardStep, CVData } from "@/lib/types/cv";

// Maparea intrărilor din sidebar la pașii interni
const SIDEBAR_STEPS = [
  { label: "Job vizat", steps: [1] },
  { label: "Fotografie", steps: [2] },
  { label: "Contact", steps: [3, 4, 5, 6, 7] },
  { label: "Experiență", steps: [8] },
  { label: "Educație", steps: [9] },
  { label: "Abilități", steps: [10] },
  { label: "Limbi", steps: [11] },
  { label: "Permis", steps: [12] },
  { label: "Hobby-uri", steps: [13] },
  { label: "Finalizare", steps: [14] },
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
  const sidebarIdx = SIDEBAR_STEPS.findIndex((s) => s.steps.includes(currentStep));
  const currentItem = SIDEBAR_STEPS[sidebarIdx];
  const progressPct = Math.round(((sidebarIdx + 1) / SIDEBAR_STEPS.length) * 100);
  // pe Finalizare, preview-ul lateral dispare — pasul afișează el însuși CV-ul mare
  const isFinalStep = currentStep === 14;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* ── SIDEBAR — navy, contrast maxim ──────────────────────── */}
      <aside
        className="wizard-sidebar"
        style={{
          width: 248,
          flexShrink: 0,
          backgroundColor: "var(--sidebar-bg)",
          display: "flex",
          flexDirection: "column",
          padding: "28px 0 24px",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        {/* Logo */}
        <Link
          href="/creare-cv"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 11,
            padding: "0 26px",
            marginBottom: 10,
            textDecoration: "none",
          }}
        >
          <LogoMark size={34} />
          <span
            style={{
              fontFamily: "var(--font-display), sans-serif",
              color: "var(--sidebar-fg)",
              fontWeight: 700,
              fontSize: 17,
              letterSpacing: "-0.01em",
            }}
          >
            CVexpress
          </span>
        </Link>

        <div
          className="folio"
          style={{ padding: "20px 26px 12px", fontSize: 10.5, color: "var(--sidebar-muted)" }}
        >
          Pașii tăi
        </div>

        {/* Pași */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 14px" }}>
          {SIDEBAR_STEPS.map((item, idx) => {
            const status = getStatus(item.steps, currentStep);
            const isCurrent = status === "current";
            const isDone = status === "done";
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "9px 12px",
                  borderRadius: 8,
                  backgroundColor: isCurrent ? "rgba(37, 99, 235, 0.22)" : "transparent",
                  border: isCurrent ? "1px solid rgba(59,130,246,0.45)" : "1px solid transparent",
                  transition: "background-color 0.2s",
                }}
              >
                {/* indicator */}
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    fontVariantNumeric: "tabular-nums",
                    backgroundColor: isDone
                      ? "var(--green)"
                      : isCurrent
                        ? "var(--primary)"
                        : "rgba(241,245,249,0.08)",
                    color: isDone || isCurrent ? "#fff" : "var(--sidebar-muted)",
                    border: isDone || isCurrent ? "none" : "1px solid var(--sidebar-line)",
                  }}
                >
                  {isDone ? (
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6.2L4.8 9L10 3.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: isCurrent ? 600 : 500,
                    color: isCurrent
                      ? "#fff"
                      : isDone
                        ? "rgba(241,245,249,0.75)"
                        : "var(--sidebar-muted)",
                    lineHeight: 1.3,
                  }}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </nav>

        <div style={{ flex: 1 }} />

        {/* footer sidebar */}
        <div
          style={{
            margin: "16px 26px 0",
            paddingTop: 16,
            borderTop: "1px solid var(--sidebar-line)",
          }}
        >
          <div
            style={{
              fontSize: 12,
              lineHeight: 1.8,
              color: "var(--sidebar-muted)",
              fontWeight: 500,
            }}
          >
            Fără cont · Fără plată
            <br />
            PDF direct, în română
          </div>
        </div>
      </aside>

      {/* ── ZONA PRINCIPALĂ ─────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "var(--paper)",
          minHeight: "100vh",
          minWidth: 0,
        }}
      >
        {/* Header mobil */}
        <div
          className="wizard-mobile-header"
          style={{
            display: "none",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 20px",
            backgroundColor: "var(--sidebar-bg)",
          }}
        >
          <Link href="/creare-cv" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <LogoMark size={28} />
            <span style={{ fontFamily: "var(--font-display), sans-serif", color: "var(--sidebar-fg)", fontWeight: 700, fontSize: 16 }}>
              CVexpress
            </span>
          </Link>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--sidebar-muted)", fontVariantNumeric: "tabular-nums" }}>
            {sidebarIdx + 1} / {SIDEBAR_STEPS.length}
          </span>
        </div>

        {/* Bara de progres — pas curent */}
        <div
          style={{
            borderBottom: "1px solid var(--hairline)",
            padding: "16px 44px 0",
            backgroundColor: "var(--card)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--primary)",
                backgroundColor: "var(--wash)",
                border: "1px solid #bfdbfe",
                borderRadius: 6,
                padding: "4px 10px",
              }}
            >
              Pasul {sidebarIdx + 1} din {SIDEBAR_STEPS.length}
            </span>
            <span style={{ fontSize: 14.5, fontWeight: 600, color: "var(--ink)" }}>
              {currentItem?.label}
            </span>
            <span style={{ flex: 1 }} />
            <span
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: "var(--green)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {progressPct}%
            </span>
          </div>
          {/* șina de progres — verde */}
          <div style={{ height: 4, backgroundColor: "var(--hairline)", borderRadius: 99, position: "relative", marginBottom: 0 }}>
            <div
              style={{
                position: "absolute",
                inset: "0 auto 0 0",
                width: `${progressPct}%`,
                background: "linear-gradient(90deg, var(--green) 0%, #10b981 100%)",
                borderRadius: 99,
                transition: "width 0.5s cubic-bezier(0.22,1,0.36,1)",
              }}
            />
          </div>
        </div>

        {/* Conținut + Preview — coloanele se setează în <style> (responsive) */}
        <div
          className={isFinalStep ? "wizard-grid wizard-grid-final" : "wizard-grid"}
          style={{
            flex: 1,
            display: "grid",
            gap: 40,
            padding: "44px 44px 120px",
            alignItems: "start",
          }}
        >
          {/* Formular */}
          <div style={{ maxWidth: isFinalStep ? 880 : 640, minWidth: 0, margin: isFinalStep ? "0 auto" : undefined, width: "100%" }}>
            {children}
          </div>

          {/* Preview CV — ascuns pe pasul final (acolo preview-ul e conținutul) */}
          {!isFinalStep && (
          <div className="wizard-preview" style={{ position: "sticky", top: 28 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <span className="folio">Preview CV</span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: "var(--green)",
                  letterSpacing: "0.08em",
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    backgroundColor: "var(--green)",
                    boxShadow: "0 0 0 3px rgba(5,150,105,0.2)",
                  }}
                />
                LIVE
              </span>
            </div>
            {/* biroul */}
            <div
              style={{
                backgroundColor: "var(--paper-deep)",
                border: "1px solid var(--hairline)",
                borderRadius: 14,
                padding: 14,
              }}
            >
              {/* foaia: proporții A4 (210:297) + scroll intern — TOT
                  conținutul (limbi, hobby-uri) rămâne accesibil */}
              <div
                style={{
                  border: "1px solid var(--hairline)",
                  borderRadius: 10,
                  boxShadow: "var(--shadow-lift)",
                  backgroundColor: "#fff",
                  aspectRatio: "210 / 297",
                  maxHeight: "calc(100vh - 170px)",
                  overflowY: "auto",
                }}
              >
                <CVPreview cvData={cvData} />
              </div>
            </div>
          </div>
          )}
        </div>
      </div>

      <style>{`
        /* preview lat, proporții realiste de CV; se îngustează pe ecrane mici */
        .wizard-grid { grid-template-columns: minmax(0,1fr) 560px; }
        .wizard-grid-final { grid-template-columns: minmax(0,1fr); }
        @media (max-width: 1360px) {
          .wizard-grid { grid-template-columns: minmax(0,1fr) 460px; }
          .wizard-grid-final { grid-template-columns: minmax(0,1fr); }
        }
        @media (max-width: 1120px) {
          .wizard-grid { grid-template-columns: minmax(0,1fr) 380px; }
          .wizard-grid-final { grid-template-columns: minmax(0,1fr); }
        }
        @media (max-width: 900px) {
          .wizard-sidebar { display: none !important; }
          .wizard-preview { display: none !important; }
          .wizard-grid, .wizard-grid-final { grid-template-columns: 1fr !important; padding: 24px 18px 90px !important; }
          .wizard-mobile-header { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
