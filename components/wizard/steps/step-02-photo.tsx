"use client";
import { useState, useCallback } from "react";
import { StepCard } from "../step-card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, CheckCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface Props {
  value?: string;
  onChange: (url: string | undefined) => void;
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
}

const TIPS_OK = [
  "Cămașă/bluză curată și îngrijită",
  "Fundal alb sau neutru",
  "Față zâmbitoare, privire spre cameră",
  "Iluminare bună, fără umbre",
];

const TIPS_NO = [
  "Selfie sau foto de vacanță",
  "Ochelari de soare sau pălărie",
  "Filtre sau efecte foto",
  "Alte persoane în fotografie",
];

export function Step02Photo({ value, onChange, onNext, onSkip, onBack }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Acceptăm doar imagini (JPG, PNG, WEBP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imaginea trebuie să fie sub 5MB");
      return;
    }
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => { onChange(e.target?.result as string); setIsUploading(false); };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Eroare la încărcare. Încearcă din nou.");
      setIsUploading(false);
    }
  }, [onChange]);

  return (
    <StepCard
      title="Adaugă o fotografie"
      subtitle="Candidații cu fotografie profesională sunt contactați cu 38% mai des de recrutori."
      icon={<Camera className="w-5 h-5" />}
    >
      {/* Stats banner */}
      <div style={{
        backgroundColor: "#F0FDF4",
        border: "1px solid #86EFAC",
        borderRadius: 12,
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 24,
      }}>
        <span style={{ fontSize: 22, flexShrink: 0 }}>📈</span>
        <div>
          <p style={{ fontSize: 17, fontWeight: 700, color: "#166534", marginBottom: 2 }}>
            +38% șanse mai multe cu fotografie profesională
          </p>
          <p style={{ fontSize: 16, color: "#15803D", lineHeight: 1.5 }}>
            Recrutorii filtrează CV-urile în primele 6 secunde.
          </p>
        </div>
      </div>

      {/* Tips grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        {/* OK tips */}
        <div style={{
          backgroundColor: "#ffffff",
          border: "1px solid #CBD5E1",
          borderLeft: "3px solid #22C55E",
          borderRadius: 10,
          padding: "14px 16px",
        }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#166534", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Recomandat</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {TIPS_OK.map((tip, i) => (
              <p key={i} style={{ fontSize: 16, color: "#374151", lineHeight: 1.5 }}>• {tip}</p>
            ))}
          </div>
        </div>

        {/* NO tips */}
        <div style={{
          backgroundColor: "#ffffff",
          border: "1px solid #CBD5E1",
          borderLeft: "3px solid #EF4444",
          borderRadius: 10,
          padding: "14px 16px",
        }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#991B1B", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Evită</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {TIPS_NO.map((tip, i) => (
              <p key={i} style={{ fontSize: 16, color: "#374151", lineHeight: 1.5 }}>• {tip}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Upload area */}
      {value ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <div style={{ position: "relative" }}>
            <img
              src={value}
              alt="Fotografie profil"
              style={{
                width: 120, height: 150,
                objectFit: "cover",
                borderRadius: 16,
                border: "3px solid #E2E8F0",
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
              }}
            />
            <button
              onClick={() => onChange(undefined)}
              style={{
                position: "absolute", top: -10, right: -10,
                width: 28, height: 28,
                backgroundColor: "#EF4444", borderRadius: "50%",
                border: "2px solid #fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X style={{ width: 14, height: 14, color: "#fff" }} />
            </button>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0",
            borderRadius: 50, padding: "6px 14px",
          }}>
            <CheckCircle style={{ width: 14, height: 14, color: "#22C55E" }} />
            <span style={{ fontSize: 17, color: "#166534", fontWeight: 600 }}>Fotografie adăugată</span>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onClick={() => document.getElementById("photo-input")?.click()}
          style={{
            border: `2px dashed ${isDragging ? "#4F46E5" : "#94A3B8"}`,
            borderRadius: 16,
            padding: "40px 20px",
            textAlign: "center",
            cursor: "pointer",
            backgroundColor: isDragging ? "#EEF2FF" : "#F8FAFC",
            transition: "all 0.2s",
            marginBottom: 32,
          }}
        >
          <input
            id="photo-input"
            type="file"
            style={{ display: "none" }}
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          {isUploading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32,
                border: "3px solid #4F46E5", borderTopColor: "transparent",
                borderRadius: "50%", animation: "spin 0.8s linear infinite",
              }} />
              <p style={{ fontSize: 18, color: "#64748B" }}>Încarc fotografia...</p>
            </div>
          ) : (
            <>
              <div style={{
                width: 56, height: 56,
                backgroundColor: "#EEF2FF", borderRadius: 14,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
              }}>
                <Upload style={{ width: 24, height: 24, color: "#6366F1" }} />
              </div>
              <p style={{ fontSize: 20, fontWeight: 600, color: "#1E293B", marginBottom: 6 }}>
                Trage fotografia sau{" "}
                <span style={{ color: "#4F46E5" }}>alege din calculator</span>
              </p>
              <p style={{ fontSize: 16, color: "#94A3B8" }}>JPG, PNG sau WEBP · max 5MB</p>
            </>
          )}
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <Button variant="outline" onClick={onBack} style={{ flex: 1 }}>← Înapoi</Button>
          <Button
            onClick={onNext}
            size="lg"
            style={{ flex: 2 }}
            iconRight={<ArrowRight className="w-4 h-4" />}
          >
            {value ? "Continuă cu fotografia" : "Continuă"}
          </Button>
        </div>
        {!value && (
          <button
            onClick={onSkip}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 17, color: "#94A3B8", textAlign: "center",
              padding: "4px 0",
            }}
          >
            Nu am fotografie potrivită · Sari peste
          </button>
        )}
      </div>
    </StepCard>
  );
}
