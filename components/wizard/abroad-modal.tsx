"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { COUNTRIES, prefixFor } from "@/lib/countries";
import { X, Globe } from "lucide-react";

export interface AbroadData {
  country: string;
  /** telefon complet, cu prefix internațional (ex: "+49 1512 3456789") */
  phone: string;
  address: string;
}

interface Props {
  open: boolean;
  initial?: Partial<AbroadData>;
  onConfirm: (data: AbroadData) => void;
  onClose: () => void;
}

/**
 * Modal „Locuiești în afara României?" — țară (dropdown cu toate țările),
 * telefon cu prefixul țării completat automat, adresă liberă.
 */
export function AbroadModal({ open, initial, onConfirm, onClose }: Props) {
  const [country, setCountry] = useState(initial?.country ?? "");
  const [number, setNumber] = useState("");
  const [address, setAddress] = useState(initial?.address ?? "");

  // re-inițializare la fiecare deschidere
  useEffect(() => {
    if (!open) return;
    setCountry(initial?.country ?? "");
    setAddress(initial?.address ?? "");
    // scoatem prefixul din telefonul salvat, dacă există
    const prefix = initial?.country ? prefixFor(initial.country) : "";
    const saved = initial?.phone ?? "";
    setNumber(prefix && saved.startsWith(prefix) ? saved.slice(prefix.length).trim() : saved);
  }, [open, initial?.country, initial?.phone, initial?.address]);

  // Escape închide
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const prefix = prefixFor(country);
  const canConfirm = country.length > 0 && number.replace(/\D/g, "").length >= 5;

  const confirm = () =>
    onConfirm({
      country,
      phone: `${prefix} ${number.trim()}`.trim(),
      address: address.trim(),
    });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Date de contact din afara României"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        backgroundColor: "rgba(11, 18, 32, 0.55)",
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          width: "100%",
          maxWidth: 500,
          backgroundColor: "#fff",
          borderRadius: 14,
          boxShadow: "0 24px 64px rgba(11,18,32,0.35)",
          padding: "28px 28px 24px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: "var(--wash)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--primary)",
                flexShrink: 0,
              }}
            >
              <Globe size={18} />
            </span>
            <h2
              style={{
                fontFamily: "var(--font-display), sans-serif",
                fontSize: 20,
                fontWeight: 700,
                color: "var(--ink-strong)",
              }}
            >
              Locuiești în afara României?
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Închide"
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--faint)", padding: 6 }}
          >
            <X size={18} />
          </button>
        </div>
        <p style={{ fontSize: 14, color: "var(--muted-foreground)", marginBottom: 22, lineHeight: 1.55 }}>
          Completează datele de contact din țara în care locuiești — nu mai e
          nevoie de cele din România.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Select
            label="Țara *"
            value={country}
            onChange={setCountry}
            options={COUNTRIES.map((c) => c.name)}
            placeholder="alege țara..."
            searchable
            id="abroad-country"
          />

          <div>
            <label
              htmlFor="abroad-phone"
              style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", display: "block", marginBottom: 8 }}
            >
              Telefon *
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <span
                aria-label="Prefix telefonic"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 74,
                  padding: "13px 14px",
                  borderRadius: 8,
                  border: "1px solid var(--input-border)",
                  backgroundColor: "var(--muted)",
                  fontSize: 15,
                  fontWeight: 600,
                  color: country ? "var(--ink)" : "var(--faint)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {prefix || "+..."}
              </span>
              <Input
                id="abroad-phone"
                placeholder="numărul de telefon"
                value={number}
                onChange={(e) => setNumber(e.target.value.replace(/[^\d\s]/g, ""))}
                type="tel"
                inputMode="numeric"
              />
            </div>
            <p style={{ fontSize: 12.5, color: "var(--faint)", marginTop: 6 }}>
              Prefixul se completează automat după alegerea țării.
            </p>
          </div>

          <Input
            label="Adresa"
            placeholder="ex: Hauptstraße 12, 10115 Berlin"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            id="abroad-address"
          />
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
          <Button variant="outline" onClick={onClose} style={{ flex: 1 }}>
            Renunță
          </Button>
          <Button onClick={confirm} disabled={!canConfirm} style={{ flex: 2 }}>
            OK
          </Button>
        </div>
      </div>
    </div>
  );
}
