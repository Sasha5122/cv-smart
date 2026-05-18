"use client";
import { useState } from "react";
import { StepCard } from "../step-card";
import { ChatBox } from "../chat-box";
import { Button } from "@/components/ui/button";
import { Briefcase, ArrowRight } from "lucide-react";
import type { ChatMessage, Experience } from "@/lib/types/cv";
import { toast } from "sonner";

const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Excelent! Acum hai să vorbim despre experiența ta profesională. 💼\n\nÎncepe cu cel mai recent loc de muncă:\n• Unde ai lucrat? (companie, locație)\n• Ce funcție ai avut?\n• De când și până când?",
};

interface Props {
  sessionId: string;
  experience: Experience[];
  onUpdate: (exp: Experience[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step09Experience({ sessionId, experience, onUpdate, onNext, onBack }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (text: string) => {
    const userMsg: ChatMessage = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, step: "experience", message: text, history: newMessages }),
      });
      if (!res.ok) throw new Error("Eroare API");
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
      if (data.done && data.data?.experience) onUpdate(data.data.experience);
    } catch {
      toast.error("Eroare de comunicare. Încearcă din nou.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    if (messages.length <= 1) { onNext(); return; }
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, step: "experience", message: "EXTRACT_PARTIAL", history: messages }),
      });
      const data = await res.json();
      if (data.data?.experience) onUpdate(data.data.experience);
    } catch { /* ignore */ }
    setIsLoading(false);
    onNext();
  };

  return (
    <StepCard
      title="Experiență profesională"
      subtitle="Cel mai important pas! AI-ul te va ghida să extragă toate detaliile relevante."
      icon={<Briefcase className="w-5 h-5" />}
    >
      {experience.length > 0 && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <p className="text-xs font-medium text-emerald-800 mb-2">✓ Joburi adăugate:</p>
          {experience.map((e, i) => (
            <p key={i} className="text-xs text-emerald-700">
              • {e.title} @ {e.company} ({e.period})
            </p>
          ))}
        </div>
      )}

      <ChatBox
        messages={messages}
        onSend={sendMessage}
        loading={isLoading}
        placeholder="Descrie experiența ta..."
        onSkip={handleSkip}
        skipLabel="Ajunge cu experiența, continuă"
      />

      <div className="flex gap-3 mt-4">
        <Button variant="outline" onClick={onBack} className="flex-1">← Înapoi</Button>
        <Button onClick={onNext} className="flex-[2]" iconRight={<ArrowRight className="w-4 h-4" />}>
          Continuă
        </Button>
      </div>
    </StepCard>
  );
}
