"use client";
import { FileText, PenLine, Sparkles } from "lucide-react";

interface Props {
  onImport: () => void;
  onScratch: () => void;
}

export function StarterChoice({ onImport, onScratch }: Props) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F8F7F4",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: 56, display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: "#4F46E5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "#fff", fontSize: 12, fontWeight: 800 }}>CV</span>
        </div>
        <span style={{ fontWeight: 700, fontSize: 18, color: "#0D0D0D", letterSpacing: -0.3 }}>CV Smart</span>
      </div>

      {/* Heading */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          backgroundColor: "#EEEDF8",
          color: "#4F46E5",
          fontSize: 12,
          fontWeight: 600,
          padding: "5px 14px",
          borderRadius: 50,
          marginBottom: 20,
          letterSpacing: 0.3,
        }}
      >
        <Sparkles size={12} />
        Ghidat de AI
      </div>

      <h1
        style={{
          fontSize: "clamp(26px, 4vw, 38px)",
          fontWeight: 900,
          color: "#0D0D0D",
          textAlign: "center",
          marginBottom: 10,
          letterSpacing: -1,
          lineHeight: 1.1,
        }}
      >
        Cum vrei să începi CV-ul?
      </h1>
      <p
        style={{
          fontSize: 15,
          color: "#6B7280",
          marginBottom: 48,
          textAlign: "center",
          lineHeight: 1.6,
        }}
      >
        Importă un CV existent sau creează unul nou cu ajutorul AI-ului.
      </p>

      {/* Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%", maxWidth: 500 }}>
        {/* Import — Recommended */}
        <button
          onClick={onImport}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            backgroundColor: "#ffffff",
            border: "2px solid #4F46E5",
            borderRadius: 18,
            padding: "22px 24px",
            cursor: "pointer",
            textAlign: "left",
            transition: "box-shadow 0.15s, transform 0.1s",
            boxShadow: "0 4px 20px rgba(79, 70, 229, 0.12)",
            position: "relative",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 30px rgba(79, 70, 229, 0.2)";
            (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(79, 70, 229, 0.12)";
            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          }}
        >
          {/* Recommended badge */}
          <div
            style={{
              position: "absolute",
              top: -12,
              right: 20,
              backgroundColor: "#0D0D0D",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              padding: "4px 12px",
              borderRadius: 50,
              letterSpacing: 0.3,
            }}
          >
            ✦ Recomandat
          </div>

          <div
            style={{
              width: 56,
              height: 56,
              backgroundColor: "#4F46E5",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <FileText size={24} color="#fff" />
          </div>

          <div>
            <p style={{ fontWeight: 700, fontSize: 16, color: "#0D0D0D", marginBottom: 4, letterSpacing: -0.2 }}>
              Importă CV-ul meu
            </p>
            <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.5 }}>
              Îmbunătățim layoutul și optimizăm conținutul automat.
            </p>
          </div>
        </button>

        {/* From scratch */}
        <button
          onClick={onScratch}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            backgroundColor: "#ffffff",
            border: "1px solid #E5E7EB",
            borderRadius: 18,
            padding: "22px 24px",
            cursor: "pointer",
            textAlign: "left",
            transition: "box-shadow 0.15s, border-color 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "#4F46E5";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "#E5E7EB";
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              backgroundColor: "#EEEDF8",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <PenLine size={24} color="#4F46E5" />
          </div>

          <div>
            <p style={{ fontWeight: 700, fontSize: 16, color: "#0D0D0D", marginBottom: 4, letterSpacing: -0.2 }}>
              De la zero
            </p>
            <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.5 }}>
              Te ghidăm secțiune cu secțiune cu ajutorul AI-ului.
            </p>
          </div>
        </button>
      </div>

      <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 32 }}>
        100% gratuit · Fără înregistrare
      </p>
    </div>
  );
}
