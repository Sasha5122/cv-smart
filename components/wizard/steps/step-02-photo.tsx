"use client";
import { useState, useCallback } from "react";
import { StepCard } from "../step-card";
import { PhotoAdjust } from "../photo-adjust";
import { Button } from "@/components/ui/button";
import {
  decodePhoto,
  downscaleToJpegBlob,
  serverResizePhoto,
  MAX_PHOTO_BYTES,
  type DecodedPhoto,
} from "@/lib/photo-decode";
import { Camera, Upload, X, CheckCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface Props {
  value?: string;
  /** imaginea întreagă (necropată) — sursa pentru ajustarea manuală */
  fullValue?: string;
  onChange: (url: string | undefined, fullUrl?: string) => void;
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
}

/** imaginea întreagă, micșorată la max 1000px — destul pentru re-crop 600×600 */
function fullFrameDataUrl(img: DecodedPhoto): string | undefined {
  try {
    const scale = Math.min(1, 1000 / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.85);
  } catch {
    return undefined;
  }
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
  "Alte persoane în poză",
];

export function Step02Photo({ value, fullValue, onChange, onNext, onSkip, onBack }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  // crop-ul „de revenire" pentru Resetează: încadrarea automată de la
  // încărcare (sau cea existentă când userul revine pe pas)
  const [autoCrop, setAutoCrop] = useState<string | undefined>(() => value);

  const handleFile = useCallback(async (file: File) => {
    const looksLikeImage =
      file.type.startsWith("image/") || /\.(jpe?g|png|webp|hei[cf])$/i.test(file.name);
    if (!looksLikeImage) {
      toast.error("Acceptăm doar imagini (JPG, PNG, WEBP, HEIC)");
      return;
    }
    // fără limită practică — pozele de telefon (8–25MB) sunt redimensionate
    // de noi; 50MB e doar protecție anti-abuz
    if (file.size > MAX_PHOTO_BYTES) {
      toast.error("Imaginea e neobișnuit de mare (peste 50MB). Încearcă altă poză.");
      return;
    }
    setIsUploading(true);
    try {
      // MECANISMUL DE ÎNCADRARE (fața mereu vizibilă, centrată, proporții
      // corecte): clientul DOAR decodează (inclusiv HEIC; EXIF explicit) și
      // micșorează poza FĂRĂ crop, apoi SERVERUL face crop-ul inteligent cu
      // sharp „attention" — găsește automat zona feței și centrează pe ea.
      // Fallback local (crop geometric) doar dacă serverul e indisponibil.
      const img = await decodePhoto(file);
      // păstrăm și cadrul întreg — sursa pentru „Ajustează încadrarea"
      const fullUrl = fullFrameDataUrl(img);
      const small = await downscaleToJpegBlob(img);
      const smart = small ? await serverResizePhoto(small) : null;
      if (smart) {
        if ("close" in img) img.close();
        setAutoCrop(smart);
        onChange(smart, fullUrl);
        setIsUploading(false);
        return;
      }

      // fallback local: crop geometric (centru; la portrete ancorat sus)
      const SIZE = 600;
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy =
        img.height > img.width
          ? (img.height - side) * 0.1
          : (img.height - side) / 2;
      const canvas = document.createElement("canvas");
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas");
      ctx.drawImage(img, sx, sy, side, side, 0, 0, SIZE, SIZE);
      if ("close" in img) img.close();
      const localCrop = canvas.toDataURL("image/jpeg", 0.88);
      setAutoCrop(localCrop);
      onChange(localCrop, fullUrl);
      setIsUploading(false);
    } catch (e) {
      if (e instanceof Error && e.message === "too-large") {
        toast.error("Imaginea are dimensiuni neobișnuit de mari. Încearcă altă poză.");
        setIsUploading(false);
        return;
      }
      // browserul nu a putut decoda deloc — trimitem originalul la server
      const dataUrl = await serverResizePhoto(file);
      if (dataUrl) {
        onChange(dataUrl);
      } else {
        toast.error("Nu am putut citi poza. Încearcă alta (JPG sau PNG).");
      }
      setIsUploading(false);
    }
  }, [onChange]);

  return (
    <StepCard
      title="Adaugă o poză"
      subtitle="Candidații cu poză profesională sunt contactați cu 38% mai des de recrutori."
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
            +38% șanse mai multe cu poză profesională
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
          backgroundColor: "var(--card)",
          border: "1px solid var(--faint)",
          borderLeft: "3px solid #22C55E",
          borderRadius: 10,
          padding: "14px 16px",
        }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#166534", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Recomandat</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {TIPS_OK.map((tip, i) => (
              <p key={i} style={{ fontSize: 16, color: "var(--foreground)", lineHeight: 1.5 }}>• {tip}</p>
            ))}
          </div>
        </div>

        {/* NO tips */}
        <div style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--faint)",
          borderLeft: "3px solid #EF4444",
          borderRadius: 10,
          padding: "14px 16px",
        }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#991B1B", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Evită</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {TIPS_NO.map((tip, i) => (
              <p key={i} style={{ fontSize: 16, color: "var(--foreground)", lineHeight: 1.5 }}>• {tip}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Upload area — cu poză pusă, editorul de încadrare e vizibil DIRECT
          (zoom + tragere, fără buton intermediar) */}
      {value ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, marginBottom: 32 }}>
          <PhotoAdjust
            src={fullValue ?? value}
            resetCrop={autoCrop}
            onCrop={(url) => onChange(url, fullValue)}
          />
          {/* starea + rezultatul final (crop-ul curent) + ștergere */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Poză de profil"
              style={{
                width: 52, height: 52,
                objectFit: "cover",
                borderRadius: "50%",
                border: "2px solid var(--hairline)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              }}
            />
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0",
              borderRadius: 50, padding: "6px 14px",
            }}>
              <CheckCircle style={{ width: 14, height: 14, color: "#22C55E" }} />
              <span style={{ fontSize: 17, color: "#166534", fontWeight: 600 }}>Poză adăugată</span>
            </div>
            <button
              onClick={() => {
                setAutoCrop(undefined);
                onChange(undefined, undefined);
              }}
              aria-label="Șterge poza"
              style={{
                width: 34, height: 34,
                backgroundColor: "#EF4444", borderRadius: "50%",
                border: "2px solid #fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", flexShrink: 0,
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              }}
            >
              <X style={{ width: 16, height: 16, color: "#fff" }} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onClick={() => document.getElementById("photo-input")?.click()}
          style={{
            border: `2px dashed ${isDragging ? "var(--primary)" : "var(--faint)"}`,
            borderRadius: 16,
            padding: "40px 20px",
            textAlign: "center",
            cursor: "pointer",
            backgroundColor: isDragging ? "var(--wash)" : "var(--muted)",
            transition: "all 0.2s",
            marginBottom: 32,
          }}
        >
          <input
            id="photo-input"
            type="file"
            style={{ display: "none" }}
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          {isUploading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32,
                border: "3px solid var(--primary)", borderTopColor: "transparent",
                borderRadius: "50%", animation: "spin 0.8s linear infinite",
              }} />
              <p style={{ fontSize: 18, color: "var(--muted-foreground)" }}>Încarc poza...</p>
            </div>
          ) : (
            <>
              <div style={{
                width: 56, height: 56,
                backgroundColor: "var(--wash)", borderRadius: 14,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
              }}>
                <Upload style={{ width: 24, height: 24, color: "var(--primary)" }} />
              </div>
              <p style={{ fontSize: 20, fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}>
                Trage poza sau{" "}
                <span style={{ color: "var(--primary)" }}>alege din telefon sau calculator</span>
              </p>
              <p style={{ fontSize: 16, color: "var(--faint)" }}>JPG, PNG, WEBP sau HEIC (iPhone) · orice mărime — o redimensionăm noi</p>
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
            {value ? "Continuă cu poza" : "Continuă"}
          </Button>
        </div>
        {!value && (
          <button
            onClick={onSkip}
            style={{
              width: "100%",
              padding: "11px 16px",
              fontSize: 17,
              fontWeight: 600,
              color: "var(--primary)",
              backgroundColor: "var(--wash)",
              border: "2px dashed var(--hairline-strong)",
              borderRadius: 10,
              cursor: "pointer",
              letterSpacing: 0.2,
            }}
          >
            Nu am poză potrivită
          </button>
        )}
      </div>
    </StepCard>
  );
}
