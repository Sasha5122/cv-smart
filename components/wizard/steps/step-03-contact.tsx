"use client";
import { useLayoutEffect, useRef, useState } from "react";
import { StepCard } from "../step-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AbroadModal, type AbroadData } from "../abroad-modal";
import { User, Mail, Phone, MapPin, ArrowRight, Link2, Globe, Pencil } from "lucide-react";
import type { CVData } from "@/lib/types/cv";
import { useMessages } from "@/lib/i18n/context";
import { STEP_CONTACT_MESSAGES } from "@/lib/i18n/wizard/step-contact";

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
  const t = useMessages(STEP_CONTACT_MESSAGES);
  const [errors, setErrors] = useState<Errors>({});
  const [abroadOpen, setAbroadOpen] = useState(false);

  // ── telefon: formatare live FĂRĂ să sară cursorul ─────────────────────────
  // Reformatarea rescrie input-ul, iar browserul ar arunca cursorul la final —
  // enervant mai ales pe telefon, la corectarea unei cifre din mijloc.
  // Soluția: după fiecare reformatare recalculăm poziția cursorului numărând
  // CIFRELE dinaintea lui (spațiile de formatare nu contează).
  const phoneRef = useRef<HTMLInputElement>(null);
  const phoneCaretRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (phoneCaretRef.current !== null && phoneRef.current) {
      phoneRef.current.setSelectionRange(phoneCaretRef.current, phoneCaretRef.current);
      phoneCaretRef.current = null;
    }
  });

  /** Aplică formatarea și programează cursorul după a `digitsBefore`-a cifră. */
  const applyPhone = (raw: string, digitsBefore: number) => {
    const formatted = formatPhone(raw);
    let pos = 0;
    let seen = 0;
    while (pos < formatted.length && seen < digitsBefore) {
      if (/\d/.test(formatted[pos])) seen++;
      pos++;
    }
    phoneCaretRef.current = pos;
    onChange({ phone: formatted });
    setErrors((prev) => ({ ...prev, phone: undefined }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const caret = input.selectionStart ?? input.value.length;
    const digitsBefore = input.value.slice(0, caret).replace(/\D/g, "").length;
    applyPhone(input.value, digitsBefore);
  };

  /** Backspace/Delete peste un spațiu de formatare șterge CIFRA de lângă el,
   *  nu doar spațiul (altfel formatarea îl pune la loc și pare că nu merge). */
  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const { selectionStart, selectionEnd, value: v } = input;
    if (selectionStart === null || selectionStart !== selectionEnd) return;
    if (e.key === "Backspace" && selectionStart > 0 && v[selectionStart - 1] === " ") {
      e.preventDefault();
      const raw = v.slice(0, selectionStart - 2) + v.slice(selectionStart);
      const digitsBefore = v.slice(0, selectionStart - 2).replace(/\D/g, "").length;
      applyPhone(raw, digitsBefore);
    } else if (e.key === "Delete" && v[selectionStart] === " ") {
      e.preventDefault();
      const raw = v.slice(0, selectionStart + 1) + v.slice(selectionStart + 2);
      const digitsBefore = v.slice(0, selectionStart).replace(/\D/g, "").length;
      applyPhone(raw, digitsBefore);
    }
  };

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
    if (!value?.firstName?.trim()) e.firstName = t.errors.firstName;
    if (!value?.lastName?.trim()) e.lastName = t.errors.lastName;
    if (!value?.email?.trim()) e.email = t.errors.email;
    else if (!isValidEmail(value.email)) e.email = t.errors.emailInvalid;
    // cu datele din străinătate completate, cele din România nu mai sunt necesare
    if (!isAbroad) {
      if (!value?.phone?.trim()) e.phone = t.errors.phone;
      else if (!isValidPhone(value.phone)) e.phone = t.errors.phoneFormat;
      if (!value?.city?.trim()) e.city = t.errors.city;
    }

    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    onNext();
  };

  return (
    <StepCard
      title={t.title}
      subtitle={t.subtitle}
      icon={<User className="w-5 h-5" />}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Nume + Prenume */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <Input
            label={t.fields.firstName}
            placeholder={t.fields.firstNamePlaceholder}
            value={value?.firstName ?? ""}
            onChange={(e) => set("firstName", e.target.value)}
            error={errors.firstName}
            autoFocus
          />
          <Input
            label={t.fields.lastName}
            placeholder={t.fields.lastNamePlaceholder}
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
          label={t.fields.email}
          placeholder={t.fields.emailPlaceholder}
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
                {t.abroad.summaryTitle(value?.country ?? "")}
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
                <Pencil size={13} /> {t.abroad.edit}
              </button>
              <button
                onClick={resetToRomania}
                style={{
                  fontSize: 13.5, fontWeight: 500, color: "var(--muted-foreground)",
                  background: "none", border: "none", cursor: "pointer", padding: "4px 0",
                  textDecoration: "underline", textUnderlineOffset: 3,
                }}
              >
                {t.abroad.liveInRomania}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Telefon */}
            <Input
              ref={phoneRef}
              label={t.fields.phone}
              placeholder={t.fields.phonePlaceholder}
              value={value?.phone ?? ""}
              onChange={handlePhoneChange}
              onKeyDown={handlePhoneKeyDown}
              error={errors.phone}
              type="tel"
              inputMode="numeric"
              icon={<Phone className="w-4 h-4" />}
              hint={t.fields.phoneHint}
            />

            {/* Locație */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              <Input
                label={t.fields.city}
                placeholder={t.fields.cityPlaceholder}
                value={value?.city ?? ""}
                onChange={(e) => set("city", e.target.value)}
                error={errors.city}
                icon={<MapPin className="w-4 h-4" />}
              />
              <Select
                label={t.fields.county}
                value={value?.county ?? ""}
                onChange={(v) => set("county", v)}
                options={COUNTIES}
                placeholder={t.fields.countyPlaceholder}
                searchable
              />
            </div>

            {/* Adresă — stradă + număr + apartament */}
            <Input
              label={t.fields.street}
              placeholder={t.fields.streetPlaceholder}
              value={value?.street ?? ""}
              onChange={(e) => set("street", e.target.value)}
              icon={<MapPin className="w-4 h-4" />}
            />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              <Input
                label={t.fields.streetNumber}
                placeholder={t.fields.streetNumberPlaceholder}
                value={value?.streetNumber ?? ""}
                onChange={(e) => set("streetNumber", e.target.value)}
              />
              <Input
                label={t.fields.apartment}
                placeholder={t.fields.apartmentPlaceholder}
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
              {t.abroad.openModal}
            </button>
          </>
        )}

        {/* LinkedIn - optional */}
        <Input
          label={t.fields.linkedin}
          placeholder={t.fields.linkedinPlaceholder}
          value={value?.linkedin ?? ""}
          onChange={(e) => set("linkedin", e.target.value)}
          icon={<Link2 className="w-4 h-4" />}
        />
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
        {onBack && (
          <Button variant="outline" onClick={onBack} style={{ flex: 1 }}>{t.back}</Button>
        )}
        <Button onClick={handleNext} style={{ flex: 2 }} iconRight={<ArrowRight className="w-4 h-4" />}>
          {t.next}
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
