"use client";
import { useState } from "react";
import { StepCard } from "../step-card";
import { Button } from "@/components/ui/button";
import { Heart, X, ArrowRight, Plus, Loader2 } from "lucide-react";
import { correctText } from "@/lib/correct-text";

/* ────────────────────────────────────────────────────────────────
   Hobby-uri: userul scrie un hobby → un AI ieftin DOAR corectează
   forma (gramatică, diacritice, formulare de CV) fără să schimbe
   sensul → hobby-ul intră în listă. Se repetă pentru fiecare hobby.
   ──────────────────────────────────────────────────────────────── */

interface Props {
  sessionId: string;
  hobbies: string[];
  onUpdate: (hobbies: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step13Hobbies({ hobbies, onUpdate, onNext, onBack }: Props) {
  const [input, setInput] = useState("");
  const [isCorrecting, setIsCorrecting] = useState(false);

  const addHobby = async () => {
    const raw = input.trim();
    if (!raw || isCorrecting) return;
    setIsCorrecting(true);
    // corectare de formă — la orice problemă păstrează textul original
    const corrected = await correctText(raw, "hobby");
    setIsCorrecting(false);
    if (!hobbies.includes(corrected)) {
      onUpdate([...hobbies, corrected]);
    }
    setInput("");
  };

  const removeHobby = (i: number) => onUpdate(hobbies.filter((_, idx) => idx !== i));

  return (
    <StepCard
      title="Hobby-uri & Pasiuni"
      subtitle="Scrie un hobby cu cuvintele tale — îl formulăm noi pentru CV. Apoi adaugă următorul."
      icon={<Heart className="w-5 h-5" />}
    >
      {/* Formular de adăugare */}
      <div
        style={{
          border: "1px dashed var(--input-border)",
          borderRadius: 10,
          padding: "18px 18px 20px",
          marginBottom: hobbies.length > 0 ? 24 : 0,
        }}
      >
        <label
          htmlFor="hobby-input"
          style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: "var(--ink)", marginBottom: 10 }}
        >
          Ce faci în timpul liber?
        </label>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            id="hobby-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ex: joc fotbal cu prietenii, citesc carti de istorie…"
            onKeyDown={(e) => e.key === "Enter" && addHobby()}
            disabled={isCorrecting}
            style={{ flex: 1, padding: "13px 16px" }}
            className="rounded-[8px] border border-[var(--input-border)] bg-[var(--card)] text-[15.5px] text-[var(--ink)] placeholder:text-[var(--faint)] shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[rgba(244,90,39,0.18)] disabled:bg-[var(--muted)] disabled:text-[var(--faint)] transition-all duration-150"
          />
          <Button
            onClick={addHobby}
            disabled={!input.trim() || isCorrecting}
            icon={
              isCorrecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )
            }
          >
            {isCorrecting ? "Formulăm…" : "Adaugă"}
          </Button>
        </div>
        <p style={{ fontSize: 12.5, color: "var(--faint)", marginTop: 10 }}>
          AI-ul corectează doar formularea — sensul rămâne exact al tău.
        </p>
      </div>

      {/* Lista de hobby-uri */}
      {hobbies.length > 0 && (
        <div>
          <p className="folio" style={{ fontSize: 10.5, marginBottom: 12 }}>
            {hobbies.length} {hobbies.length === 1 ? "hobby adăugat" : "hobby-uri adăugate"}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {hobbies.map((h, i) => (
              <div
                key={i}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  backgroundColor: "var(--wash)",
                  border: "1px solid #f3c4ac",
                  color: "var(--primary-strong)",
                  borderRadius: 999,
                  padding: "8px 14px",
                  fontSize: 14.5,
                  fontWeight: 600,
                }}
              >
                {h}
                <button
                  onClick={() => removeHobby(i)}
                  aria-label={`Șterge ${h}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "none",
                    border: "none",
                    color: "var(--primary)",
                    cursor: "pointer",
                    padding: 2,
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3" style={{ marginTop: 32 }}>
        <Button variant="outline" onClick={onBack} className="flex-1">← Înapoi</Button>
        <Button onClick={onNext} className="flex-[2]" iconRight={<ArrowRight className="w-4 h-4" />}>
          Generează CV-ul!
        </Button>
      </div>
      <p
        style={{
          textAlign: "center",
          fontSize: 13,
          color: "var(--faint)",
          marginTop: 12,
        }}
      >
        Hobby-urile sunt opționale — poți continua și fără.
      </p>
    </StepCard>
  );
}
