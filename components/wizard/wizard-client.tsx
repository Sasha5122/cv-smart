"use client";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { WizardLayout } from "./wizard-layout";
import { useWizard } from "@/hooks/use-wizard";
import type { WizardStep } from "@/lib/types/cv";

import { Step01JobDescription } from "./steps/step-01-job-description";
import { Step02Photo } from "./steps/step-02-photo";
import { Step03Contact } from "./steps/step-03-contact";
import { Step08Education } from "./steps/step-08-education";
import { Step09Experience } from "./steps/step-09-experience";
import { Step10Skills } from "./steps/step-10-skills";
import { Step11Languages } from "./steps/step-11-languages";
import { Step12License } from "./steps/step-12-license";
import { Step13Hobbies } from "./steps/step-13-hobbies";
import { Step14Draft } from "./steps/step-14-draft";

interface WizardClientProps {
  sessionId: string;
}

const STORAGE_KEY = "cv-smart-progress";

export function WizardClient({ sessionId }: WizardClientProps) {
  const wizard = useWizard(sessionId);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const lastResearchedJD = useRef<string>("");
  const hydratedRef = useRef(false);
  // după plată CV-ul e ÎNGHEȚAT (un CV = o plată): navigarea înapoi se
  // blochează complet — singura opțiune rămasă e „Începe de la zero"
  const [paidLocked, setPaidLocked] = useState(false);

  // Restaurare după refresh: progresul stă în localStorage — un F5 accidental
  // nu mai pierde nimic. Rulează O DATĂ, înaintea efectului de persistare.
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const snap = JSON.parse(raw);
      const p = snap?.cvData?.personal ?? {};
      const hasProgress =
        snap &&
        snap.cvData &&
        (Number(snap.currentStep) > 1 ||
          String(snap.jobDescription ?? "").trim() ||
          // date introduse chiar pe pasul 1 (Contact) — tot progres e
          p.firstName || p.lastName || p.email || p.phone);
      if (!hasProgress) return;
      wizard.hydrate({
        sessionId: typeof snap.sessionId === "string" ? snap.sessionId : undefined,
        currentStep: Math.min(10, Math.max(1, Number(snap.currentStep))) as WizardStep,
        maxStep: Math.min(10, Math.max(1, Number(snap.maxStep ?? snap.currentStep))) as WizardStep,
        cvData: snap.cvData,
        jobDescription: String(snap.jobDescription ?? ""),
      });
      // amânat puțin: în dev, StrictMode remontează <Toaster> imediat după
      // primul mount și ar înghiți un toast declanșat sincron aici
      setTimeout(() => {
        toast.success("Ți-am restaurat progresul — continui de unde ai rămas.", {
          duration: 6000,
          action: {
            label: "Începe de la zero",
            onClick: () => {
              localStorage.removeItem(STORAGE_KEY);
              localStorage.removeItem("cv-smart-skills-cache");
              window.location.reload();
            },
          },
        });
      }, 400);
    } catch {
      // snapshot corupt — pornim curat
      localStorage.removeItem(STORAGE_KEY);
              localStorage.removeItem("cv-smart-skills-cache");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persistare locală (refresh-proof), debounced
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            sessionId: wizard.sessionId,
            currentStep: wizard.currentStep,
            maxStep: wizard.maxStep,
            cvData: wizard.cvData,
            jobDescription: wizard.jobDescription,
          })
        );
      } catch {
        // storage plin/blocat — nu blocăm aplicația
      }
    }, 400);
    return () => clearTimeout(t);
  }, [wizard.sessionId, wizard.currentStep, wizard.maxStep, wizard.cvData, wizard.jobDescription]);

  // Auto-save to DB debounced (folosește sesiunea activă, inclusiv cea restaurată)
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch(`/api/session/${wizard.sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv_data: wizard.cvData }),
      }).catch(() => {});
    }, 1000);
  }, [wizard.cvData, wizard.sessionId]);

  // Tracking best-effort: pasul atins (vizibil în admin la „unde s-a oprit userul")
  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: wizard.sessionId, step: wizard.currentStep }),
      keepalive: true,
    }).catch(() => {});
  }, [wizard.currentStep, wizard.sessionId]);

  const renderStep = () => {
    const { currentStep, cvData, next, back, updateCVData, updatePersonal, setJobDescription, jobDescription } = wizard;

    switch (currentStep as WizardStep) {
      // Ordinea pașilor: 1 Contact → 2 Fotografie → 3 Job vizat →
      // 4 Experiență → 5 Educație → 6 Abilități → 7 Limbi → 8 Permis →
      // 9 Hobby-uri → 10 Finalizare
      case 1:
        return (
          <Step03Contact
            value={cvData.personal}
            onChange={updatePersonal}
            onNext={next}
            // primul pas — nu are unde să ducă înapoi
          />
        );
      case 2:
        return (
          <Step02Photo
            value={cvData.personal?.photoUrl}
            onChange={(url) => updatePersonal({ photoUrl: url })}
            onNext={next}
            onSkip={next}
            onBack={back}
          />
        );
      case 3:
        return (
          <Step01JobDescription
            value={jobDescription}
            onChange={setJobDescription}
            onNext={() => {
              // guard anti-duplicat: research doar când anunțul s-a schimbat
              if (
                jobDescription.trim() &&
                lastResearchedJD.current !== jobDescription.trim()
              ) {
                lastResearchedJD.current = jobDescription.trim();
                fetch("/api/ai/research", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ sessionId: wizard.sessionId, jobDescription }),
                }).catch(() => {});
              }
              next();
            }}
            onSkip={next}
            onBack={back}
          />
        );
      case 4:
        return (
          <Step09Experience
            sessionId={wizard.sessionId}
            jobDescription={jobDescription}
            experience={cvData.experience}
            onUpdate={(experience) => updateCVData({ experience })}
            onNext={next}
            onBack={back}
          />
        );
      case 5:
        return (
          <Step08Education
            sessionId={wizard.sessionId}
            education={cvData.education}
            courses={cvData.courses}
            onUpdate={(education, courses) => updateCVData({ education, courses })}
            onNext={next}
            onBack={back}
          />
        );
      case 6:
        return (
          <Step10Skills
            sessionId={wizard.sessionId}
            cvData={cvData}
            jobDescription={jobDescription}
            skills={cvData.skills}
            onUpdate={(skills) => updateCVData({ skills })}
            onNext={next}
            onBack={back}
          />
        );
      case 7:
        return (
          <Step11Languages
            languages={cvData.languages}
            onUpdate={(languages) => updateCVData({ languages })}
            onNext={next}
            onBack={back}
          />
        );
      case 8:
        return (
          <Step12License
            license={cvData.license ?? { hasLicense: false, categories: [] }}
            qualifications={cvData.qualifications ?? ""}
            onUpdateLicense={(license) => updateCVData({ license })}
            onUpdateQualifications={(qualifications) => updateCVData({ qualifications })}
            onNext={next}
            onBack={back}
          />
        );
      case 9:
        return (
          <Step13Hobbies
            sessionId={wizard.sessionId}
            hobbies={cvData.hobbies}
            onUpdate={(hobbies) => updateCVData({ hobbies })}
            onNext={next}
            onBack={back}
          />
        );
      case 10:
        return (
          <Step14Draft
            sessionId={wizard.sessionId}
            cvData={cvData}
            jobDescription={jobDescription}
            onUpdateSummary={(summary) => updateCVData({ summary })}
            onBack={back}
            onPaidLock={() => setPaidLocked(true)}
            onRestart={() => {
              // reset total: progresul local dispare, serverul creează o
              // sesiune nouă la reîncărcarea paginii
              try {
                localStorage.removeItem(STORAGE_KEY);
              localStorage.removeItem("cv-smart-skills-cache");
              } catch {
                // storage blocat — reîncărcarea pornește oricum curat
              }
              window.location.href = "/creare-cv";
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <WizardLayout
      currentStep={wizard.currentStep}
      maxStep={wizard.maxStep}
      cvData={wizard.cvData}
      // sesiune plătită = CV înghețat: sidebar-ul nu mai navighează nicăieri
      onNavigate={paidLocked ? undefined : (step) => wizard.setStep(step)}
    >
      {renderStep()}
    </WizardLayout>
  );
}
