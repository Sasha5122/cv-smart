"use client";
import { useState } from "react";
import { StepCard } from "../step-card";
import { ChatBox } from "../chat-box";
import { Button } from "@/components/ui/button";
import { Heart, X, ArrowRight, Plus } from "lucide-react";
import type { ChatMessage } from "@/lib/types/cv";
import { toast } from "sonner";

const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Ultimul pas conversațional! 🎯 Hai să vorbim despre hobby-urile și pasiunile tale.\n\nCe faci în timpul liber? Ce te pasionează? Chiar și activitățile simple contează pe CV.",
};

interface Props {
  sessionId: string;
  hobbies: string[];
  onUpdate: (hobbies: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step13Hobbies({ sessionId, hobbies, onUpdate, onNext, onBack }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [newHobby, setNewHobby] = useState("");

  const sendMessage = async (text: string) => {
    const newMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(newMessages);
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, step: "hobbies", message: text, history: newMessages }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
      if (data.done && data.data?.hobbies) onUpdate(data.data.hobbies);
    } catch {
      toast.error("Eroare. Încearcă din nou.");
    } finally {
      setIsLoading(false);
    }
  };

  const addHobby = () => {
    if (!newHobby.trim()) return;
    onUpdate([...hobbies, newHobby.trim()]);
    setNewHobby("");
  };

  const removeHobby = (i: number) => onUpdate(hobbies.filter((_, idx) => idx !== i));

  return (
    <StepCard
      title="Hobby-uri & Pasiuni"
      subtitle="Hobby-urile relevante te diferențiază de ceilalți candidați."
      icon={<Heart className="w-5 h-5" />}
    >
      <ChatBox
        messages={messages}
        onSend={sendMessage}
        loading={isLoading}
        placeholder="Spune-mi pasiunile tale..."
        onSkip={onNext}
        skipLabel="Sari peste hobby-uri"
      />

      {/* Pills */}
      {hobbies.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {hobbies.map((h, i) => (
            <div key={i} className="flex items-center gap-1 bg-violet-50 border border-violet-200 text-violet-700 px-3 py-1.5 rounded-full text-lg">
              {h}
              <button onClick={() => removeHobby(i)} className="ml-1 text-violet-400 hover:text-violet-700">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Manual add */}
      <div className="mt-3 flex gap-2">
        <input
          value={newHobby}
          onChange={(e) => setNewHobby(e.target.value)}
          placeholder="Adaugă hobby manual"
          onKeyDown={(e) => e.key === "Enter" && addHobby()}
          className="flex-1 rounded-[10px] border border-slate-400 bg-[var(--card)] px-3 py-2.5 text-lg focus:outline-none focus:border-indigo-400"
        />
        <Button variant="outline" onClick={addHobby} icon={<Plus className="w-4 h-4" />}>Adaugă</Button>
      </div>

      <div className="flex gap-3 mt-4">
        <Button variant="outline" onClick={onBack} className="flex-1">← Înapoi</Button>
        <Button onClick={onNext} className="flex-[2]" iconRight={<ArrowRight className="w-4 h-4" />}>
          Generează CV-ul!
        </Button>
      </div>
    </StepCard>
  );
}
