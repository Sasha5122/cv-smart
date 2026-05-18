"use client";
import { useState } from "react";
import { StepCard } from "../step-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Phone, MapPin, ArrowRight, Link2 } from "lucide-react";
import type { CVData } from "@/lib/types/cv";

const COUNTIES = [
  "Alba","Arad","Argeș","Bacău","Bihor","Bistrița-Năsăud","Botoșani","Brăila","Brașov",
  "București","Buzău","Călărași","Caraș-Severin","Cluj","Constanța","Covasna","Dâmbovița",
  "Dolj","Galați","Giurgiu","Gorj","Harghita","Hunedoara","Ialomița","Iași","Ilfov",
  "Maramureș","Mehedinți","Mureș","Neamț","Olt","Prahova","Sălaj","Satu Mare","Sibiu",
  "Suceava","Teleorman","Timiș","Tulcea","Vâlcea","Vaslui","Vrancea",
];

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
}

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function isValidPhone(p: string) {
  const d = p.replace(/\D/g, "");
  return d.length === 10 && d.startsWith("07");
}

interface Props {
  value: CVData["personal"];
  onChange: (data: Partial<CVData["personal"]>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface Errors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  city?: string;
}

export function Step03Contact({ value, onChange, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<Errors>({});

  const set = (field: keyof CVData["personal"], val: string) => {
    onChange({ [field]: val });
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleNext = () => {
    const e: Errors = {};
    if (!value?.firstName?.trim()) e.firstName = "Introdu prenumele";
    if (!value?.lastName?.trim()) e.lastName = "Introdu numele de familie";
    if (!value?.email?.trim()) e.email = "Introdu adresa de email";
    else if (!isValidEmail(value.email)) e.email = "Email invalid";
    if (!value?.phone?.trim()) e.phone = "Introdu numărul de telefon";
    else if (!isValidPhone(value.phone)) e.phone = "Format: 07XX XXX XXX";
    if (!value?.city?.trim()) e.city = "Introdu orașul";

    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    onNext();
  };

  return (
    <StepCard
      title="Date de contact"
      subtitle="Informațiile de bază care vor apărea în antetul CV-ului tău."
      icon={<User className="w-5 h-5" />}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Nume + Prenume */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input
            label="Prenume *"
            placeholder="ex: Alexandru"
            value={value?.firstName ?? ""}
            onChange={(e) => set("firstName", e.target.value)}
            error={errors.firstName}
            autoFocus
          />
          <Input
            label="Nume de familie *"
            placeholder="ex: Popescu"
            value={value?.lastName ?? ""}
            onChange={(e) => set("lastName", e.target.value)}
            error={errors.lastName}
          />
        </div>

        {/* Preview nume complet */}
        {(value?.firstName || value?.lastName) && (
          <div
            style={{
              backgroundColor: "#EEEDF8",
              border: "1px solid #C7D2FE",
              borderRadius: 10,
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <User size={14} color="#4F46E5" />
            <span style={{ fontSize: 14, fontWeight: 700, color: "#3730A3" }}>
              {[value?.firstName, value?.lastName].filter(Boolean).join(" ")}
            </span>
          </div>
        )}

        {/* Email */}
        <Input
          label="Email *"
          placeholder="prenume.nume@gmail.com"
          value={value?.email ?? ""}
          onChange={(e) => set("email", e.target.value)}
          error={errors.email}
          type="email"
          icon={<Mail className="w-4 h-4" />}
        />

        {/* Telefon */}
        <Input
          label="Telefon *"
          placeholder="0721 234 567"
          value={value?.phone ?? ""}
          onChange={(e) => set("phone", formatPhone(e.target.value))}
          error={errors.phone}
          type="tel"
          inputMode="numeric"
          icon={<Phone className="w-4 h-4" />}
          hint="Format: 07XX XXX XXX"
        />

        {/* Locație */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input
            label="Oraș *"
            placeholder="ex: Cluj-Napoca"
            value={value?.city ?? ""}
            onChange={(e) => set("city", e.target.value)}
            error={errors.city}
            icon={<MapPin className="w-4 h-4" />}
          />
          <div>
            <label style={{ fontSize: 14, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>
              Județ
            </label>
            <select
              value={value?.county ?? ""}
              onChange={(e) => set("county", e.target.value)}
              style={{
                width: "100%",
                borderRadius: 10,
                border: "1px solid #E5E7EB",
                backgroundColor: "#ffffff",
                padding: "10px 14px",
                fontSize: 14,
                color: "#111827",
                outline: "none",
              }}
            >
              <option value="">Județ</option>
              {COUNTIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* LinkedIn - optional */}
        <Input
          label="LinkedIn (opțional)"
          placeholder="linkedin.com/in/username"
          value={value?.linkedin ?? ""}
          onChange={(e) => set("linkedin", e.target.value)}
          icon={<Link2 className="w-4 h-4" />}
        />
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        <Button variant="outline" onClick={onBack} style={{ flex: 1 }}>← Înapoi</Button>
        <Button onClick={handleNext} style={{ flex: 2 }} iconRight={<ArrowRight className="w-4 h-4" />}>
          Continuă
        </Button>
      </div>
    </StepCard>
  );
}
