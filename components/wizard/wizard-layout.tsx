"use client";
import { useState } from "react";
import Link from "next/link";
import { ProgressBar } from "./progress-bar";
import { CVPreview } from "./cv-preview";
import type { WizardStep, CVData } from "@/lib/types/cv";
import { Eye, EyeOff } from "lucide-react";

interface WizardLayoutProps {
  currentStep: WizardStep;
  cvData: CVData;
  children: React.ReactNode;
}

export function WizardLayout({ currentStep, cvData, children }: WizardLayoutProps) {
  const [previewVisible, setPreviewVisible] = useState(true);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#F8F7F4" }}>
      {/* Top nav — matches landing nav */}
      <header
        style={{
          backgroundColor: "#F8F7F4",
          borderBottom: "1px solid #E5E7EB",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: "#4F46E5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: "#fff", fontSize: 11, fontWeight: 800, letterSpacing: 0.5 }}>CV</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#0D0D0D", letterSpacing: -0.3 }}>
            CV Smart
          </span>
        </Link>

        {/* Mobile preview toggle */}
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "#6B7280",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "6px 10px",
            borderRadius: 8,
          }}
          className="md:hidden"
          onClick={() => setPreviewVisible((v) => !v)}
        >
          {previewVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {previewVisible ? "Ascunde preview" : "Arată preview"}
        </button>
      </header>

      {/* Progress */}
      <ProgressBar currentStep={currentStep} />

      {/* Main split */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
          {/* Left — Wizard form */}
          <div className="w-full">
            {children}
          </div>

          {/* Right — CV Preview */}
          <div
            className={`md:block sticky top-28 ${previewVisible ? "block" : "hidden"}`}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1 }}>
                Preview CV
              </span>
              <span style={{ fontSize: 11, color: "#9CA3AF", backgroundColor: "#ffffff", border: "1px solid #E5E7EB", padding: "2px 10px", borderRadius: 50 }}>
                live
              </span>
            </div>
            <div className="relative">
              <div className="transform scale-[0.85] origin-top-left" style={{ width: "117.6%" }}>
                <CVPreview cvData={cvData} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
