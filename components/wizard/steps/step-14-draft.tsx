"use client";
import { useState, useEffect } from "react";
import { StepCard } from "../step-card";
import { ChatBox } from "../chat-box";
import { Button } from "@/components/ui/button";
import { FileText, Download, Loader2, Sparkles, CheckCircle } from "lucide-react";
import type { ChatMessage, CVData } from "@/lib/types/cv";
import { toast } from "sonner";

interface Props {
  sessionId: string;
  cvData: CVData;
  jobDescription: string;
  onBack: () => void;
}

const LOADING_MESSAGES = [
  "Analizez datele tale...",
  "Personalizez CV-ul pentru job...",
  "Optimizez pentru ATS...",
  "Adaug cuvinte cheie relevante...",
  "Finalizez draft-ul...",
];

export function Step14Draft({ sessionId, cvData, jobDescription, onBack }: Props) {
  const [draft, setDraft] = useState("");
  const [finalCV, setFinalCV] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [revisionMessages, setRevisionMessages] = useState<ChatMessage[]>([]);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    generateDraft();
  }, []);

  useEffect(() => {
    if (!isGenerating) return;
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[i]);
    }, 2000);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const generateDraft = async () => {
    setIsGenerating(true);
    setDraft("");
    try {
      const res = await fetch("/api/ai/generate-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, cvData, jobDescription }),
      });

      if (!res.ok) throw new Error("Eroare la generare");
      const data = await res.json();
      setDraft(data.draft);
      setGenerated(true);

      setRevisionMessages([{
        role: "assistant",
        content: "CV-ul tău este gata! 🎉 Spune-mi ce dorești să modifici, sau scrie \"gata\" pentru a descărca PDF-ul.",
      }]);
    } catch {
      toast.error("Eroare la generarea CV-ului. Încearcă din nou.");
    } finally {
      setIsGenerating(false);
    }
  };

  const sendRevision = async (text: string) => {
    if (text.toLowerCase().trim() === "gata" || text.toLowerCase().trim() === "finalizează") {
      await finalize();
      return;
    }

    const userMsg: ChatMessage = { role: "user", content: text };
    const newMessages = [...revisionMessages, userMsg];
    setRevisionMessages(newMessages);
    setIsFinalizing(true);

    try {
      const res = await fetch("/api/ai/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, draft, revisions: newMessages }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDraft(data.updatedDraft);
      setRevisionMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);
    } catch {
      toast.error("Eroare. Încearcă din nou.");
    } finally {
      setIsFinalizing(false);
    }
  };

  const finalize = async () => {
    setIsFinalizing(true);
    try {
      const res = await fetch(`/api/pdf/${sessionId}`, {
        method: "GET",
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setFinalCV(draft);
      toast.success("CV-ul tău este gata de descărcat!");
    } catch {
      toast.error("Eroare la generarea PDF-ului.");
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl) { finalize(); return; }
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `CV_${cvData.personal?.lastName ?? "smart"}.pdf`;
    a.click();
  };

  return (
    <div className="space-y-4">
      {/* Loading state */}
      {isGenerating && (
        <StepCard
          title="Generez CV-ul tău..."
          icon={<Sparkles className="w-5 h-5" />}
        >
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-[var(--wash)] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
            </div>
            <p className="text-sm font-medium text-[var(--foreground)] animate-pulse">{loadingMsg}</p>
            <p className="text-xs text-[var(--faint)] mt-2">Poate dura 20-30 secunde</p>
          </div>
        </StepCard>
      )}

      {/* Draft display */}
      {!isGenerating && draft && (
        <>
          <StepCard
            title="Draft CV generat"
            subtitle="Revizuiește CV-ul tău. Scrie modificările dorite în chat-ul de mai jos."
            icon={<FileText className="w-5 h-5" />}
          >
            <div className="bg-[var(--muted)] rounded-xl p-4 font-mono text-xs text-[var(--foreground)] leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto border border-[var(--hairline)]">
              {draft}
            </div>

            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={generateDraft} className="flex-1" size="sm">
                ↺ Regenerează
              </Button>
              <Button
                onClick={handleDownload}
                className="flex-[2]"
                loading={isFinalizing}
                icon={downloadUrl ? <Download className="w-4 h-4" /> : undefined}
              >
                {downloadUrl ? "Descarcă PDF" : "Finalizează & Descarcă PDF"}
              </Button>
            </div>
          </StepCard>

          {/* Revision chat */}
          {!downloadUrl && (
            <StepCard title="Modificări" subtitle='Scrie ce dorești să schimbi sau scrie "gata" pentru descărcare.'>
              <ChatBox
                messages={revisionMessages}
                onSend={sendRevision}
                loading={isFinalizing}
                placeholder='Scrie modificarea dorită sau "gata"...'
              />
            </StepCard>
          )}

          {/* Download confirmation */}
          {downloadUrl && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <h3 className="font-bold text-emerald-900 text-lg">CV-ul tău este gata!</h3>
              <p className="text-sm text-emerald-700 mt-1 mb-4">
                Succes la aplicare! 🎉
              </p>
              <Button
                onClick={handleDownload}
                size="lg"
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                icon={<Download className="w-5 h-5" />}
              >
                Descarcă CV (PDF)
              </Button>
            </div>
          )}
        </>
      )}

      <div className="flex">
        <Button variant="outline" onClick={onBack} size="sm">
          ← Înapoi
        </Button>
      </div>
    </div>
  );
}
