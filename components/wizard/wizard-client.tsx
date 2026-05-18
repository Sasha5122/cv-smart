"use client";
import { useEffect, useRef } from "react";
import { WizardLayout } from "./wizard-layout";
import { useWizard } from "@/hooks/use-wizard";
import type { WizardStep } from "@/lib/types/cv";

import { Step00CVUpload } from "./steps/step-00-cv-upload";
import { Step01JobDescription } from "./steps/step-01-job-description";
import { Step02Photo } from "./steps/step-02-photo";
import { Step03LastName } from "./steps/step-03-last-name";
import { Step04FirstName } from "./steps/step-04-first-name";
import { Step05Phone } from "./steps/step-05-phone";
import { Step06Email } from "./steps/step-06-email";
import { Step07Address } from "./steps/step-07-address";
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

export function WizardClient({ sessionId }: WizardClientProps) {
  const wizard = useWizard(sessionId);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(null);

  // Auto-save to DB debounced
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch(`/api/session/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv_data: wizard.cvData }),
      }).catch(() => {});
    }, 1000);
  }, [wizard.cvData, sessionId]);

  const renderStep = () => {
    const { currentStep, cvData, next, back, updateCVData, updatePersonal, setJobDescription, jobDescription } = wizard;

    switch (currentStep as WizardStep) {
      case 0:
        return (
          <Step00CVUpload
            onComplete={(data) => { updateCVData(data); next(); }}
            onSkip={next}
          />
        );
      case 1:
        return (
          <Step01JobDescription
            value={jobDescription}
            onChange={setJobDescription}
            onNext={() => {
              if (jobDescription.trim()) {
                fetch("/api/ai/research", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ sessionId, jobDescription }),
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
          />
        );
      case 3:
        return (
          <Step03LastName
            value={cvData.personal?.lastName ?? ""}
            onChange={(v) => updatePersonal({ lastName: v })}
            onNext={next}
            onBack={back}
          />
        );
      case 4:
        return (
          <Step04FirstName
            value={cvData.personal?.firstName ?? ""}
            lastName={cvData.personal?.lastName ?? ""}
            onChange={(v) => updatePersonal({ firstName: v })}
            onNext={next}
            onBack={back}
          />
        );
      case 5:
        return (
          <Step05Phone
            value={cvData.personal?.phone ?? ""}
            onChange={(v) => updatePersonal({ phone: v })}
            onNext={next}
            onBack={back}
          />
        );
      case 6:
        return (
          <Step06Email
            value={cvData.personal?.email ?? ""}
            firstName={cvData.personal?.firstName}
            lastName={cvData.personal?.lastName}
            onChange={(v) => updatePersonal({ email: v })}
            onNext={next}
            onBack={back}
          />
        );
      case 7:
        return (
          <Step07Address
            value={cvData.personal}
            onChange={(data) => updatePersonal(data)}
            onNext={next}
            onBack={back}
          />
        );
      case 8:
        return (
          <Step08Education
            sessionId={sessionId}
            education={cvData.education}
            courses={cvData.courses}
            onUpdate={(education, courses) => updateCVData({ education, courses })}
            onNext={next}
            onBack={back}
          />
        );
      case 9:
        return (
          <Step09Experience
            sessionId={sessionId}
            experience={cvData.experience}
            onUpdate={(experience) => updateCVData({ experience })}
            onNext={next}
            onBack={back}
          />
        );
      case 10:
        return (
          <Step10Skills
            sessionId={sessionId}
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
            sessionId={sessionId}
            hobbies={cvData.hobbies}
            onUpdate={(hobbies) => updateCVData({ hobbies })}
            onNext={next}
            onBack={back}
          />
        );
      case 14:
        return (
          <Step14Draft
            sessionId={sessionId}
            cvData={cvData}
            jobDescription={jobDescription}
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
