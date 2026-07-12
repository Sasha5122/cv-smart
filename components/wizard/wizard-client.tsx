"use client";
import { useEffect, useRef } from "react";
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

  // Restaurare după refresh: progresul stă în localStorage — un F5 accidental
  // nu mai pierde nimic. Rulează O DATĂ, înaintea efectului de persistare.
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const snap = JSON.parse(raw);
      const hasProgress =
        snap &&
        snap.cvData &&
        (Number(snap.currentStep) > 1 || String(snap.jobDescription ?? "").trim());
      if (!hasProgress) return;
      wizard.hydrate({
        sessionId: typeof snap.sessionId === "string" ? snap.sessionId : undefined,
        currentStep: Math.min(14, Math.max(1, Number(snap.currentStep))) as WizardStep,
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
              window.location.reload();
            },
          },
        });
      }, 400);
    } catch {
      // snapshot corupt — pornim curat
      localStorage.removeItem(STORAGE_KEY);
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
            cvData: wizard.cvData,
            jobDescription: wizard.jobDescription,
          })
        );
      } catch {
        // storage plin/blocat — nu blocăm aplicația
      }
    }, 400);
    return () => clearTimeout(t);
  }, [wizard.sessionId, wizard.currentStep, wizard.cvData, wizard.jobDescription]);

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

  const renderStep = () => {
    const { currentStep, cvData, next, back, updateCVData, updatePersonal, setStep, setJobDescription, jobDescription } = wizard;

    switch (currentStep as WizardStep) {
      case 1:
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
      // Steps 3-7 combined into single contact form
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        return (
          <Step03Contact
            value={cvData.personal}
            onChange={updatePersonal}
            onNext={() => setStep(8 as WizardStep)}
            onBack={() => setStep(2 as WizardStep)}
          />
        );
      case 8:
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
      case 9:
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
      case 10:
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
      case 11:
        return (
          <Step11Languages
            languages={cvData.languages}
            onUpdate={(languages) => updateCVData({ languages })}
            onNext={next}
            onBack={back}
          />
        );
      case 12:
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
      case 13:
        return (
          <Step13Hobbies
            sessionId={wizard.sessionId}
            hobbies={cvData.hobbies}
            onUpdate={(hobbies) => updateCVData({ hobbies })}
            onNext={next}
            onBack={back}
          />
        );
      case 14:
        return (
          <Step14Draft
            sessionId={wizard.sessionId}
            cvData={cvData}
            jobDescription={jobDescription}
            onUpdateSummary={(summary) => updateCVData({ summary })}
            onBack={back}
          />
        );
      default:
        return null;
    }
  };

  return (
    <WizardLayout currentStep={wizard.currentStep} cvData={wizard.cvData}>
      {renderStep()}
    </WizardLayout>
  );
}
