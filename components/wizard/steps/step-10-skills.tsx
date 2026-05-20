"use client";
import { useState } from "react";
import { StepCard } from "../step-card";
import { ChatBox } from "../chat-box";
import { SkillTag } from "../skill-tag";
import { Button } from "@/components/ui/button";
import { Star, ArrowRight, Plus } from "lucide-react";
import type { ChatMessage, Skill } from "@/lib/types/cv";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Acum să vorbim despre abilitățile tale! ⭐\n\nDescrie cu cuvintele tale ce crezi că faci cel mai bine la muncă. Nu îți face griji de formulare — eu le voi organiza profesional.",
};

interface Props {
  sessionId: string;
  skills: Skill[];
  onUpdate: (skills: Skill[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step10Skills({ sessionId, skills, onUpdate, onNext, onBack }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  const sendMessage = async (text: string) => {
    const userMsg: ChatMessage = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, step: "skills", message: text, history: newMessages }),
      });
      if (!res.ok) throw new Error("Eroare API");
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
      if (data.done && data.data?.skills) onUpdate(data.data.skills);
    } catch {
      toast.error("Eroare. Încearcă din nou.");
    } finally {
      setIsLoading(false);
    }
  };

  const addManual = () => {
    if (!newSkill.trim()) return;
    onUpdate([...skills, { name: newSkill.trim(), source: "adăugat manual" }]);
    setNewSkill("");
  };

  const removeSkill = (i: number) => {
    onUpdate(skills.filter((_, idx) => idx !== i));
  };

  return (
    <StepCard
      title="Abilități"
      subtitle="Adaugă abilitățile tale manual sau prin conversație."
      icon={<Star className="w-5 h-5" />}
    >
      <ChatBox
        messages={messages}
        onSend={sendMessage}
        loading={isLoading}
        placeholder="Ce faci cel mai bine?"
        onSkip={onNext}
      />

      {/* Manual add */}
      <div className="mt-4 flex gap-2">
        <Input
          placeholder="Adaugă abilitate manual"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addManual()}
        />
        <Button variant="outline" onClick={addManual} icon={<Plus className="w-4 h-4" />}>
          Adaugă
        </Button>
      </div>

      {/* Tags */}
      {skills.length > 0 && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {skills.map((skill, i) => (
            <SkillTag key={i} skill={skill} onRemove={() => removeSkill(i)} />
          ))}
        </div>
      )}

      <div className="flex gap-3 mt-4">
        <Button variant="outline" onClick={onBack} className="flex-1">← Înapoi</Button>
        <Button onClick={onNext} className="flex-[2]" iconRight={<ArrowRight className="w-4 h-4" />}>
          Continuă
        </Button>
      </div>
    </StepCard>
  );
}
