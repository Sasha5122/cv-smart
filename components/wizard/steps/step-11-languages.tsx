"use client";
import { useState } from "react";
import { StepCard } from "../step-card";
import { Button } from "@/components/ui/button";
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

const COMMON_LANGS = ["Engleză", "Franceză", "Germană", "Spaniolă", "Italiană", "Rusă"];

interface Props {
  languages: Language[];
  onUpdate: (langs: Language[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step11Languages({ languages, onUpdate, onNext, onBack }: Props) {
  const [name, setName] = useState("");
  const [level, setLevel] = useState("B1");

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
      {/* Current list */}
      {languages.length > 0 && (
        <div className="mb-5 space-y-2">
          {languages.map((lang, i) => (
            <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
              <div>
                <span className="text-sm font-semibold text-slate-900">{lang.name}</span>
                <span className="text-xs text-slate-500 ml-2">{lang.level}</span>
              </div>
              <button onClick={() => remove(i)} className="w-7 h-7 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center text-red-400">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Quick add from common */}
      <p className="text-xs text-slate-400 mb-2">Adaugă rapid:</p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {COMMON_LANGS.filter((l) => !languages.some((lang) => lang.name === l)).map((l) => (
          <button
            key={l}
            onClick={() => { setName(l); }}
            className="text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 px-3 py-1.5 rounded-lg"
          >
            {l}
          </button>
        ))}
      </div>

      {/* Add form */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="text-xs font-medium text-slate-600 mb-1 block">Limbă</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex: Engleză"
            onKeyDown={(e) => e.key === "Enter" && addLanguage()}
            className="w-full rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs font-medium text-slate-600 mb-1 block">Nivel</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
          >
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
        <Button onClick={addLanguage} icon={<Plus className="w-4 h-4" />} className="mb-0 shrink-0">
          Adaugă
        </Button>
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={onBack} className="flex-1">← Înapoi</Button>
        <Button onClick={onNext} className="flex-[2]" iconRight={<ArrowRight className="w-4 h-4" />}>
          Continuă
        </Button>
      </div>
    </StepCard>
  );
}
