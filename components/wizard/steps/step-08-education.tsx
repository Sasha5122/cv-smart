"use client";
import { useState } from "react";
import { StepCard } from "../step-card";
import { ChatBox } from "../chat-box";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight } from "lucide-react";
import type { ChatMessage, Education, Course } from "@/lib/types/cv";
import { toast } from "sonner";

const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Bună! Hai să discutăm despre studiile tale. 🎓\n\nCare este cea mai înaltă formă de educație pe care ai terminat-o?\n\n• Doctorat\n• Master\n• Licență / Facultate\n• Liceu\n• Școală profesională / postliceală",
};

interface Props {
  sessionId: string;
  education: Education[];
  courses: Course[];
  onUpdate: (education: Education[], courses: Course[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step08Education({ sessionId, education, courses, onUpdate, onNext, onBack }: Props) {
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
        body: JSON.stringify({
          sessionId,
          step: "education",
          message: text,
          history: newMessages,
        }),
      });

      if (!res.ok) throw new Error("Eroare API");
      const data = await res.json();

      const assistantMsg: ChatMessage = { role: "assistant", content: data.message };
      setMessages((prev) => [...prev, assistantMsg]);

      if (data.done && data.data) {
        onUpdate(data.data.education ?? education, data.data.courses ?? courses);
      }
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
        body: JSON.stringify({
          sessionId,
          step: "education",
          message: "EXTRACT_PARTIAL",
          history: messages,
        }),
      });
      const data = await res.json();
      if (data.data) {
        onUpdate(data.data.education ?? education, data.data.courses ?? courses);
      }
    } catch { /* ignore */ }
    setIsLoading(false);
    onNext();
  };

  return (
    <StepCard
      title="Educație"
      subtitle="Discuție cu AI-ul despre studiile tale. Fii cât mai detaliat."
      icon={<GraduationCap className="w-5 h-5" />}
    >
      {education.length > 0 && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <p className="text-xs font-medium text-emerald-800 mb-2">✓ Date salvate până acum:</p>
          {education.map((e, i) => (
            <p key={i} className="text-xs text-emerald-700">
              • {e.level} — {e.institution} ({e.years})
            </p>
          ))}
        </div>
      )}

      <ChatBox
        messages={messages}
        onSend={sendMessage}
        loading={isLoading}
        placeholder="Scrie răspunsul tău..."
        onSkip={handleSkip}
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
