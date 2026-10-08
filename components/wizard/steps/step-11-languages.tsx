"use client";
import { useState } from "react";
import { StepCard } from "../step-card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Globe, Plus, X, ArrowRight } from "lucide-react";
import type { Language } from "@/lib/types/cv";
import { useMessages } from "@/lib/i18n/context";
import { STEP_LANGUAGES_MESSAGES } from "@/lib/i18n/wizard/step-languages";

/** Valorile stocate în CV (apar în PDF); eticheta afișată vine din mesaje. */
const LEVEL_VALUES = ["A1", "A2", "B1", "B2", "C1", "C2", "Nativ"] as const;

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
  const t = useMessages(STEP_LANGUAGES_MESSAGES);
  const [name, setName] = useState("");
  const [level, setLevel] = useState("B1");

  const languageLabel = (value: string) =>
    (t.languages as Record<string, string>)[value] ?? value;
  const levelLabel = (value: string) => (t.levels as Record<string, string>)[value] ?? value;

  const available = LANGUAGES.filter(
    (l) => !languages.some((lang) => lang.name === l)
  ).map((value) => ({ value, label: languageLabel(value) }));
  const levelOptions = LEVEL_VALUES.map((value) => ({ value, label: levelLabel(value) }));

  const addLanguage = () => {
    if (!name.trim()) return;
    onUpdate([...languages, { name: name.trim(), level }]);
    setName("");
    setLevel("B1");
  };

  const remove = (i: number) => onUpdate(languages.filter((_, idx) => idx !== i));

  return (
    <StepCard
      title={t.title}
      subtitle={t.subtitle}
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
                  {languageLabel(lang.name)}
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
                  {levelLabel(lang.level)}
                </span>
              </div>
              <button
                onClick={() => remove(i)}
                aria-label={t.remove(languageLabel(lang.name))}
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
          {t.addTitle}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <Select
            label={t.languageLabel}
            value={name}
            onChange={setName}
            options={available}
            placeholder={t.languagePlaceholder}
            searchable
            id="language-select"
          />
          <Select
            label={t.levelLabel}
            value={level}
            onChange={setLevel}
            options={levelOptions}
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
            {t.add}
          </Button>
        </div>
      </div>

      <div className="flex gap-3" style={{ marginTop: 32 }}>
        <Button variant="outline" onClick={onBack} className="flex-1">{t.back}</Button>
        <Button onClick={onNext} className="flex-[2]" iconRight={<ArrowRight className="w-4 h-4" />}>
          {t.continue}
        </Button>
      </div>
    </StepCard>
  );
}
