"use client";
import { useState } from "react";
import { StepCard } from "../step-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AbroadModal, type AbroadData } from "../abroad-modal";
import { User, Mail, Phone, MapPin, ArrowRight, Link2, Globe, Pencil } from "lucide-react";
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
  /** absent pe primul pas — nu există unde să te întorci */
  onBack?: () => void;
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
  const [abroadOpen, setAbroadOpen] = useState(false);

  // datele din străinătate sunt completate (alternativa la datele din România)
  const isAbroad = Boolean(value?.country && value.country !== "România");

  const set = (field: keyof CVData["personal"], val: string) => {
    onChange({ [field]: val });
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const applyAbroad = (data: AbroadData) => {
    onChange({
      country: data.country,
      phone: data.phone,
      street: data.address,
      streetNumber: "",
      apartment: "",
      city: "",
      county: "",
    });
    setErrors({});
    setAbroadOpen(false);
  };

  const resetToRomania = () => {
    onChange({ country: "România", phone: "", street: "" });
    setErrors({});
  };

  const handleNext = () => {
    const e: Errors = {};
    if (!value?.firstName?.trim()) e.firstName = "Introdu prenumele";
    if (!value?.lastName?.trim()) e.lastName = "Introdu numele de familie";
    if (!value?.email?.trim()) e.email = "Introdu adresa de email";
    else if (!isValidEmail(value.email)) e.email = "Email invalid";
    // cu datele din străinătate completate, cele din România nu mai sunt necesare
    if (!isAbroad) {
      if (!value?.phone?.trim()) e.phone = "Introdu numărul de telefon";
      else if (!isValidPhone(value.phone)) e.phone = "Format: 07XX XXX XXX";
      if (!value?.city?.trim()) e.city = "Introdu orașul";
    }

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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
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
              backgroundColor: "#fbeade",
              border: "1px solid #f3c4ac",
              borderRadius: 10,
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <User size={14} color="var(--primary)" />
            <span style={{ fontSize: 18, fontWeight: 700, color: "var(--primary-strong)" }}>
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

        {isAbroad ? (
          /* Rezumatul datelor din străinătate — înlocuiește câmpurile din România */
          <div
            style={{
              border: "1px solid var(--input-border)",
              borderRadius: 10,
              padding: "16px 18px",
              backgroundColor: "var(--wash)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Globe size={15} style={{ color: "var(--primary)" }} />
              <span style={{ fontSize: 14.5, fontWeight: 700, color: "var(--primary-strong)" }}>
                Date de contact din {value?.country}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14.5, color: "var(--ink)" }}>
              <span><Phone size={13} style={{ display: "inline", marginRight: 8, color: "var(--faint)" }} />{value?.phone}</span>
              {value?.street && (
                <span><MapPin size={13} style={{ display: "inline", marginRight: 8, color: "var(--faint)" }} />{value.street}</span>
              )}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button
                onClick={() => setAbroadOpen(true)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontSize: 13.5, fontWeight: 600, color: "var(--primary)",
                  background: "none", border: "none", cursor: "pointer", padding: "4px 0",
                }}
              >
                <Pencil size={13} /> Modifică
              </button>
              <button
                onClick={resetToRomania}
                style={{
                  fontSize: 13.5, fontWeight: 500, color: "var(--muted-foreground)",
                  background: "none", border: "none", cursor: "pointer", padding: "4px 0",
                  textDecoration: "underline", textUnderlineOffset: 3,
                }}
              >
                Locuiesc în România
              </button>
            </div>
          </div>
        ) : (
          <>
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              <Input
                label="Oraș *"
                placeholder="ex: Cluj-Napoca"
                value={value?.city ?? ""}
                onChange={(e) => set("city", e.target.value)}
                error={errors.city}
                icon={<MapPin className="w-4 h-4" />}
              />
              <Select
                label="Județ"
                value={value?.county ?? ""}
                onChange={(v) => set("county", v)}
                options={COUNTIES}
                placeholder="alege județul..."
                searchable
              />
            </div>

            {/* Adresă — stradă + număr + apartament */}
            <Input
              label="Stradă (opțional)"
              placeholder="ex: Str. Mihai Eminescu"
              value={value?.street ?? ""}
              onChange={(e) => set("street", e.target.value)}
              icon={<MapPin className="w-4 h-4" />}
            />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              <Input
                label="Număr (opțional)"
                placeholder="ex: 12"
                value={value?.streetNumber ?? ""}
                onChange={(e) => set("streetNumber", e.target.value)}
              />
              <Input
                label="Apartament (opțional)"
                placeholder="ex: 4A"
                value={value?.apartment ?? ""}
                onChange={(e) => set("apartment", e.target.value)}
              />
            </div>

            {/* Alternativa pentru diaspora */}
            <button
              onClick={() => setAbroadOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                alignSelf: "flex-start",
                fontSize: 14,
                fontWeight: 600,
                color: "var(--primary)",
                backgroundColor: "var(--wash)",
                border: "1px solid #f3c4ac",
                borderRadius: 8,
                padding: "10px 16px",
                cursor: "pointer",
              }}
            >
              <Globe size={15} />
              Locuiești în afara României?
            </button>
          </>
        )}

        {/* LinkedIn - optional */}
        <Input
          label="LinkedIn (opțional)"
          placeholder="linkedin.com/in/username"
          value={value?.linkedin ?? ""}
          onChange={(e) => set("linkedin", e.target.value)}
          icon={<Link2 className="w-4 h-4" />}
        />
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
        {onBack && (
          <Button variant="outline" onClick={onBack} style={{ flex: 1 }}>← Înapoi</Button>
        )}
        <Button onClick={handleNext} style={{ flex: 2 }} iconRight={<ArrowRight className="w-4 h-4" />}>
          Continuă
        </Button>
      </div>

      <AbroadModal
        open={abroadOpen}
        initial={
          isAbroad
            ? { country: value?.country, phone: value?.phone, address: value?.street }
            : undefined
        }
        onConfirm={applyAbroad}
        onClose={() => setAbroadOpen(false)}
      />
    </StepCard>
  );
}
