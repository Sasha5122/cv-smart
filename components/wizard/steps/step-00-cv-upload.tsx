"use client";
import { useState, useCallback } from "react";
import { StepCard } from "../step-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, X, Loader2, ArrowRight } from "lucide-react";
import type { CVData } from "@/lib/types/cv";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  onComplete: (data: Partial<CVData>) => void;
  onSkip: () => void;
}

export function Step00CVUpload({ onComplete, onSkip }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [pasteText, setPasteText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFile = (f: File) => {
    const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    if (!validTypes.includes(f.type)) {
      toast.error("Acceptăm doar PDF, DOCX sau TXT");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Fișierul trebuie să fie sub 5MB");
      return;
    }
    setFile(f);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const handleExtract = async () => {
    if (!file && !pasteText.trim()) {
      toast.error("Adaugă un fișier sau lipește textul CV-ului");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      if (file) formData.append("file", file);
      if (pasteText) formData.append("text", pasteText);

      const res = await fetch("/api/ai/extract-cv", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Eroare la extragere");
      const data = await res.json();
      toast.success("Date extrase cu succes!");
      onComplete(data);
    } catch {
      toast.error("Nu am putut extrage datele. Continuă manual.");
      onSkip();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StepCard
      title="Ai un CV existent?"
      subtitle="Importă-l și completăm automat datele tale. Economisești 5 minute."
      icon={<FileText className="w-5 h-5" />}
    >
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer",
          isDragging
            ? "border-indigo-400 bg-indigo-50"
            : file
            ? "border-emerald-400 bg-emerald-50"
            : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
        )}
        onClick={() => !file && document.getElementById("cv-file-input")?.click()}
      >
        <input
          id="cv-file-input"
          type="file"
          className="hidden"
          accept=".pdf,.docx,.txt"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {file ? (
          <div className="flex items-center justify-center gap-3">
            <FileText className="w-8 h-8 text-emerald-600" />
            <div className="text-left">
              <p className="font-semibold text-slate-900 text-sm">{file.name}</p>
              <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="ml-2 w-7 h-7 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center text-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-700">
              Trage fișierul aici sau <span className="text-indigo-600">alege din calculator</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">PDF, DOCX sau TXT · max 5MB</p>
          </>
        )}
      </div>

      {/* Or paste */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs text-slate-400">sau lipește textul</span>
        </div>
      </div>

      <Textarea
        placeholder="Lipește conținutul CV-ului tău aici..."
        value={pasteText}
        onChange={(e) => setPasteText(e.target.value)}
        rows={4}
        hint="Copiază tot textul din CV-ul tău și lipește-l aici"
      />

      <div className="flex flex-col gap-2 mt-6">
        <Button
          onClick={handleExtract}
          loading={isLoading}
          size="lg"
          className="w-full"
          icon={isLoading ? undefined : <Upload className="w-4 h-4" />}
        >
          {isLoading ? "Extrag datele..." : "Extrage datele automat"}
        </Button>
        <Button variant="ghost" onClick={onSkip} className="w-full">
          Nu am CV · Completez manual
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </StepCard>
  );
}
