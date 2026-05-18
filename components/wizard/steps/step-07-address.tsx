"use client";
import { useState } from "react";
import { StepCard } from "../step-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, ArrowRight } from "lucide-react";
import type { CVData } from "@/lib/types/cv";

const COUNTIES = [
  "Alba", "Arad", "Argeș", "Bacău", "Bihor", "Bistrița-Năsăud", "Botoșani",
  "Brăila", "Brașov", "București", "Buzău", "Călărași", "Caraș-Severin", "Cluj",
  "Constanța", "Covasna", "Dâmbovița", "Dolj", "Galați", "Giurgiu", "Gorj",
  "Harghita", "Hunedoara", "Ialomița", "Iași", "Ilfov", "Maramureș", "Mehedinți",
  "Mureș", "Neamț", "Olt", "Prahova", "Sălaj", "Satu Mare", "Sibiu", "Suceava",
  "Teleorman", "Timiș", "Tulcea", "Vâlcea", "Vaslui", "Vrancea",
];

interface Props {
  value: CVData["personal"];
  onChange: (data: Partial<CVData["personal"]>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step07Address({ value, onChange, onNext, onBack }: Props) {
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!value?.city?.trim()) { setError("Introdu orașul"); return; }
    setError("");
    onNext();
  };

  return (
    <StepCard
      title="Unde locuiești?"
      subtitle="Pe CV apare doar orașul și județul — adresa completă rămâne privată."
      icon={<MapPin className="w-5 h-5" />}
    >
      <div className="space-y-4">
        <Input
          label="Oraș *"
          placeholder="ex: Cluj-Napoca"
          value={value?.city ?? ""}
          onChange={(e) => { onChange({ city: e.target.value }); setError(""); }}
          error={error}
          autoFocus
          icon={<MapPin className="w-4 h-4" />}
        />

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Județ</label>
          <select
            value={value?.county ?? ""}
            onChange={(e) => onChange({ county: e.target.value })}
            className="w-full rounded-[10px] border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">Selectează județul</option>
            {COUNTIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <Input
          label="Cod poștal (opțional)"
          placeholder="ex: 400001"
          value={value?.postalCode ?? ""}
          onChange={(e) => onChange({ postalCode: e.target.value })}
        />
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mt-4">
        <p className="text-xs text-slate-500">
          <span className="font-medium text-slate-700">Pe CV va apărea:</span>{" "}
          {[value?.city, value?.county].filter(Boolean).join(", ") || "Cluj-Napoca, Cluj"}
          , România
        </p>
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={onBack} className="flex-1">← Înapoi</Button>
        <Button onClick={handleNext} className="flex-[2]" iconRight={<ArrowRight className="w-4 h-4" />}>
          Continuă
        </Button>
      </div>
    </StepCard>
  );
}
