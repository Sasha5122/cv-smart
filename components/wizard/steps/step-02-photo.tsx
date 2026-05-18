"use client";
import { useState, useCallback } from "react";
import { StepCard } from "../step-card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  value?: string;
  onChange: (url: string | undefined) => void;
  onNext: () => void;
  onSkip: () => void;
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

export function Step02Photo({ value, onChange, onNext, onSkip }: Props) {
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
      reader.onload = (e) => {
        onChange(e.target?.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Eroare la încărcare. Încearcă din nou.");
      setIsUploading(false);
    }
  }, [onChange]);

  return (
    <StepCard
      title="Adaugă o fotografie"
      subtitle=""
      icon={<Camera className="w-5 h-5" />}
    >
      {/* Stats banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 flex items-start gap-3">
        <span className="text-2xl shrink-0">📈</span>
        <div>
          <p className="text-sm font-semibold text-amber-900">
            +38% șanse mai multe cu fotografie
          </p>
          <p className="text-xs text-amber-700 mt-0.5">
            Candidații cu fotografie profesională sunt contactați mai des de recrutori
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <TipList title="✅ Recomandat" items={TIPS_OK} variant="ok" />
        <TipList title="❌ Evită" items={TIPS_NO} variant="no" />
      </div>

      {/* Upload area */}
      {value ? (
        <div className="relative w-fit mx-auto">
          <img
            src={value}
            alt="Fotografie profil"
            className="w-32 h-40 object-cover rounded-2xl shadow-md border-2 border-slate-200"
          />
          <button
            onClick={() => onChange(undefined)}
            className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-md"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs px-3 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Adăugată
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onClick={() => document.getElementById("photo-input")?.click()}
          className={cn(
            "border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200",
            isDragging ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
          )}
        >
          <input
            id="photo-input"
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500">Încarc fotografia...</p>
            </div>
          ) : (
            <>
              <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-700">
                Trage fotografia sau <span className="text-indigo-600">alege din calculator</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">JPG, PNG sau WEBP · max 5MB</p>
            </>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2 mt-6">
        <Button onClick={onNext} size="lg" className="w-full" iconRight={<ArrowRight className="w-4 h-4" />}>
          {value ? "Continuă cu fotografia" : "Continuă"}
        </Button>
        {!value && (
          <Button variant="ghost" onClick={onSkip} className="w-full text-slate-400 text-xs">
            Nu am fotografie potrivită · Sari peste
          </Button>
        )}
      </div>
    </StepCard>
  );
}

function TipList({ title, items, variant }: { title: string; items: string[]; variant: "ok" | "no" }) {
  return (
    <div className={cn("rounded-xl p-3 text-xs", variant === "ok" ? "bg-emerald-50" : "bg-red-50")}>
      <p className={cn("font-semibold mb-2", variant === "ok" ? "text-emerald-800" : "text-red-800")}>{title}</p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className={cn(variant === "ok" ? "text-emerald-700" : "text-red-700")}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
