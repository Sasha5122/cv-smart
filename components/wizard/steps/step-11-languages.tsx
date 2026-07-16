"use client";
import { useState } from "react";
import { StepCard } from "../step-card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Globe, Plus, X, ArrowRight } from "lucide-react";
import type { Language } from "@/lib/types/cv";

const LEVELS = [
  { value: "A1", label: "A1 — Începător" },
  { value: "A2", label: "A2 — Elementar" },
  { value: "B1", label: "B1 — Intermediar" },
  { value: "B2", label: "B2 — Intermediar avansat" },
  { value: "C1", label: "C1 — Avansat" },
  { value: "C2", label: "C2 — Mastery" },
  { value: "Nativ", label: "Nativ" },
];

/** Ordinea cerută: Engleză prima, apoi limbile europene, apoi restul. */
const LANGUAGES = [
  "Engleză",
  // limbi europene
  "Franceză",
  "Italiană",
  "Spaniolă",
  "Portugheză",
  "Germană",
  "Olandeză",
  "Poloneză",
  "Maghiară",
  "Cehă",
  "Slovacă",
  "Greacă",
  "Bulgară",
  "Sârbă",
  "Croată",
  "Slovenă",
  "Ucraineană",
  "Rusă",
  "Suedeză",
  "Norvegiană",
  "Daneză",
  "Finlandeză",
  "Estonă",
  "Letonă",
  "Lituaniană",
  "Turcă",
  "Română",
  // restul limbilor
  "Arabă",
  "Chineză",
  "Japoneză",
  "Coreeană",
  "Hindi",
  "Ebraică",
  "Persană",
  "Urdu",
  "Bengaleză",
  "Vietnameză",
  "Thailandeză",
  "Indoneziană",
  "Malaeză",
  "Filipineză",
  "Swahili",
];

interface Props {
  languages: Language[];
  onUpdate: (langs: Language[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step11Languages({ languages, onUpdate, onNext, onBack }: Props) {
  const [name, setName] = useState("");
  const [level, setLevel] = useState("B1");

  const available = LANGUAGES.filter(
    (l) => !languages.some((lang) => lang.name === l)
  );

  const addLanguage = () => {
    if (!name.trim()) return;
    onUpdate([...languages, { name: name.trim(), level }]);
    setName("");
    setLevel("B1");
  };

  const remove = (i: number) => onUpdate(languages.filter((_, idx) => idx !== i));

  return (
    <StepCard
      title="Limbi străine"
      subtitle="Adaugă limbile pe care le cunoști și nivelul de competență."
      icon={<Globe className="w-5 h-5" />}
    >
      {/* Limbile adăugate */}
      {languages.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {languages.map((lang, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                backgroundColor: "var(--card)",
                border: "1px solid var(--input-border)",
                borderRadius: 10,
                padding: "12px 16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                <span style={{ fontSize: 15.5, fontWeight: 700, color: "var(--ink-strong)" }}>
                  {lang.name}
                </span>
                <span
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "var(--primary-strong)",
                    backgroundColor: "var(--wash)",
                    border: "1px solid #f3c4ac",
                    borderRadius: 999,
                    padding: "3px 10px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {LEVELS.find((l) => l.value === lang.level)?.label ?? lang.level}
                </span>
              </div>
              <button
                onClick={() => remove(i)}
                aria-label={`Șterge ${lang.name}`}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  border: "1px solid transparent",
                  backgroundColor: "var(--red-soft)",
                  color: "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Formular de adăugare */}
      <div
        style={{
          border: "1px dashed var(--input-border)",
          borderRadius: 10,
          padding: "18px 18px 20px",
        }}
      >
        <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)", marginBottom: 14 }}>
          Adaugă o limbă
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <Select
            label="Limbă"
            value={name}
            onChange={setName}
            options={available}
            placeholder="alege limba..."
            searchable
            id="language-select"
          />
          <Select
            label="Nivel"
            value={level}
            onChange={setLevel}
            options={LEVELS}
            id="level-select"
          />
        </div>
        <div style={{ marginTop: 16 }}>
          <Button
            onClick={addLanguage}
            disabled={!name.trim()}
            icon={<Plus className="w-4 h-4" />}
            style={{ width: "100%" }}
          >
            Adaugă
          </Button>
        </div>
      </div>

      <div className="flex gap-3" style={{ marginTop: 32 }}>
        <Button variant="outline" onClick={onBack} className="flex-1">← Înapoi</Button>
        <Button onClick={onNext} className="flex-[2]" iconRight={<ArrowRight className="w-4 h-4" />}>
          Continuă
        </Button>
      </div>
    </StepCard>
  );
}
