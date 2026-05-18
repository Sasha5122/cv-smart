"use client";
import { useState } from "react";
import { StepCard } from "../step-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Briefcase, ArrowRight, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { Experience } from "@/lib/types/cv";
import { toast } from "sonner";

interface Props {
  sessionId: string;
  experience: Experience[];
  onUpdate: (exp: Experience[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const EMPTY_EXP = {
  title: "",
  company: "",
  period: "",
  location: "",
  responsibilities: "",
};

export function Step09Experience({ experience, onUpdate, onNext, onBack }: Props) {
  const [showForm, setShowForm] = useState(experience.length === 0);
  const [form, setForm] = useState({ ...EMPTY_EXP });
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const set = (field: string, val: string) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Introdu funcția";
    if (!form.company.trim()) e.company = "Introdu compania";
    if (!form.period.trim()) e.period = "Introdu perioada";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    const entry: Experience = {
      title: form.title.trim(),
      company: form.company.trim(),
      period: form.period.trim(),
      location: form.location.trim(),
      responsibilities: form.responsibilities
        .split("\n")
        .map((r) => r.trim())
        .filter(Boolean),
      achievements: [],
    };

    if (editIndex !== null) {
      const updated = [...experience];
      updated[editIndex] = entry;
      onUpdate(updated);
      setEditIndex(null);
    } else {
      onUpdate([...experience, entry]);
    }

    setForm({ ...EMPTY_EXP });
    setShowForm(false);
    toast.success("Experiență salvată!");
  };

  const handleEdit = (i: number) => {
    const exp = experience[i];
    setForm({
      title: exp.title,
      company: exp.company,
      period: exp.period,
      location: exp.location ?? "",
      responsibilities: exp.responsibilities.join("\n"),
    });
    setEditIndex(i);
    setShowForm(true);
    setExpandedIndex(null);
  };

  const handleDelete = (i: number) => {
    onUpdate(experience.filter((_, idx) => idx !== i));
    toast.success("Experiență ștearsă");
  };

  const handleCancel = () => {
    setForm({ ...EMPTY_EXP });
    setEditIndex(null);
    setShowForm(false);
    setErrors({});
  };

  return (
    <StepCard
      title="Experiență profesională"
      subtitle="Adaugă joburile tale în ordine cronologică inversă (cel mai recent primul)."
      icon={<Briefcase className="w-5 h-5" />}
    >
      {/* Existing entries */}
      {experience.length > 0 && !showForm && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {experience.map((exp, i) => (
            <div
              key={i}
              style={{
                backgroundColor: "#F9FAFB",
                border: "1px solid #E5E7EB",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  cursor: "pointer",
                }}
                onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      backgroundColor: "#EEEDF8",
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Briefcase size={16} color="#4F46E5" />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#0D0D0D" }}>{exp.title}</p>
                    <p style={{ fontSize: 12, color: "#6B7280" }}>{exp.company} · {exp.period}</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(i); }}
                    style={{
                      padding: "6px 12px",
                      fontSize: 12,
                      color: "#4F46E5",
                      backgroundColor: "#EEEDF8",
                      border: "none",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Editează
                  </button>
                  <button
                    data-testid="btn-delete-exp"
                    onClick={(e) => { e.stopPropagation(); handleDelete(i); }}
                    style={{
                      padding: 6,
                      color: "#EF4444",
                      backgroundColor: "#FEF2F2",
                      border: "none",
                      borderRadius: 8,
                      cursor: "pointer",
                      display: "flex",
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                  {expandedIndex === i ? <ChevronUp size={16} color="#9CA3AF" /> : <ChevronDown size={16} color="#9CA3AF" />}
                </div>
              </div>

              {expandedIndex === i && exp.responsibilities.length > 0 && (
                <div style={{ padding: "0 16px 14px 64px", borderTop: "1px solid #E5E7EB" }}>
                  <ul style={{ margin: "10px 0 0", paddingLeft: 4, listStyle: "none" }}>
                    {exp.responsibilities.map((r, j) => (
                      <li key={j} style={{ fontSize: 13, color: "#374151", marginBottom: 4 }}>
                        · {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      {showForm ? (
        <div
          style={{
            backgroundColor: "#F9FAFB",
            border: "1px solid #E5E7EB",
            borderRadius: 14,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <p style={{ fontSize: 14, fontWeight: 700, color: "#0D0D0D", marginBottom: 16 }}>
            {editIndex !== null ? "Editează experiența" : "Adaugă experiență"}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input
              label="Funcție / Titlu job *"
              placeholder="ex: Software Developer"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              error={errors.title}
              autoFocus
            />
            <Input
              label="Companie *"
              placeholder="ex: Google România"
              value={form.company}
              onChange={(e) => set("company", e.target.value)}
              error={errors.company}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input
                label="Perioadă *"
                placeholder="ex: Ian 2022 – Prezent"
                value={form.period}
                onChange={(e) => set("period", e.target.value)}
                error={errors.period}
                hint="Luna An – Luna An sau Prezent"
              />
              <Input
                label="Locație (opțional)"
                placeholder="ex: Cluj-Napoca"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: 14, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>
                Responsabilități (opțional)
              </label>
              <textarea
                value={form.responsibilities}
                onChange={(e) => set("responsibilities", e.target.value)}
                placeholder={"Am dezvoltat funcționalități noi pentru aplicația web...\nAm colaborat cu echipa de design...\nAm redus timpii de încărcare cu 40%..."}
                rows={4}
                style={{
                  width: "100%",
                  borderRadius: 10,
                  border: "1px solid #E5E7EB",
                  padding: "10px 14px",
                  fontSize: 13,
                  color: "#111827",
                  resize: "vertical",
                  outline: "none",
                  fontFamily: "inherit",
                  lineHeight: 1.6,
                }}
              />
              <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>
                Câte o responsabilitate pe linie
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button
              onClick={handleCancel}
              style={{
                flex: 1,
                padding: "10px 16px",
                fontSize: 14,
                color: "#6B7280",
                backgroundColor: "#F3F4F6",
                border: "1px solid #E5E7EB",
                borderRadius: 10,
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Anulează
            </button>
            <button
              onClick={handleSave}
              style={{
                flex: 2,
                padding: "10px 16px",
                fontSize: 14,
                color: "#ffffff",
                backgroundColor: "#4F46E5",
                border: "none",
                borderRadius: 10,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {editIndex !== null ? "Salvează modificările" : "Adaugă experiența"}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => { setShowForm(true); setEditIndex(null); setForm({ ...EMPTY_EXP }); }}
          style={{
            width: "100%",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            border: "2px dashed #C7D2FE",
            borderRadius: 12,
            backgroundColor: "#FAFAFA",
            color: "#4F46E5",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 16,
            transition: "background-color 0.15s",
          }}
        >
          <Plus size={18} />
          Adaugă experiență profesională
        </button>
      )}

      {experience.length === 0 && !showForm && (
        <p style={{ fontSize: 13, color: "#9CA3AF", textAlign: "center", marginBottom: 16 }}>
          Nicio experiență adăugată — poți continua fără.
        </p>
      )}

      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <Button variant="outline" onClick={onBack} style={{ flex: 1 }}>← Înapoi</Button>
        <Button onClick={onNext} style={{ flex: 2 }} iconRight={<ArrowRight className="w-4 h-4" />}>
          {experience.length > 0 ? `Continuă (${experience.length} job${experience.length > 1 ? "uri" : ""})` : "Continuă"}
        </Button>
      </div>
    </StepCard>
  );
}
