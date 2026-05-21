"use client";
import { useState, useRef } from "react";
import { StepCard } from "../step-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Briefcase, ArrowRight, Trash2, Loader2, Sparkles, Plus, CheckCircle2, GripVertical } from "lucide-react";
import type { Experience } from "@/lib/types/cv";
import { toast } from "sonner";

interface Props {
  sessionId: string;
  experience: Experience[];
  onUpdate: (exp: Experience[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const EMPTY_EXP = { title: "", company: "", period: "", location: "", responsibilities: "" };

const RESPONSIBILITIES_FALLBACK = [
  "Gestionarea activităților zilnice specifice rolului",
  "Colaborarea cu echipa pentru atingerea obiectivelor comune",
  "Asigurarea calității și respectarea termenelor stabilite",
  "Comunicarea cu clienții și partenerii în mod profesional",
  "Contribuirea la îmbunătățirea proceselor interne",
  "Monitorizarea indicatorilor de performanță relevanți",
  "Raportarea periodică a rezultatelor către management",
];

type Phase = "form" | "loading-questions" | "questions" | "loading-responsibilities" | "responsibilities" | "summary" | "edit";

function punct(s: string): string {
  const trimmed = s.trim();
  return /[.!?]$/.test(trimmed) ? trimmed : trimmed + ".";
}

type Seniority = { label: string; recommended: string; instruction: string; color: string; bg: string; border: string };

function detectSeniority(period: string): Seniority {
  const currentYear = new Date().getFullYear();
  const lower = period.toLowerCase();

  if (lower.includes("prezent") || lower.includes("present") || lower.includes("curent")) {
    return {
      label: "Job actual",
      recommended: "5–6",
      instruction: "Pentru un CV profesional, selectați doar 5–6 responsabilități pe care le considerați cele mai esențiale și de impact pentru acest rol.",
      color: "#15803D", bg: "#F0FDF4", border: "#86EFAC",
    };
  }

  const years = period.match(/\b(20\d{2}|19\d{2})\b/g);
  if (!years) {
    return {
      label: "Job anterior",
      recommended: "3–4",
      instruction: "Pentru un CV profesional, selectați doar 3–4 responsabilități pe care le considerați cele mai relevante pentru cariera ta.",
      color: "#1D4ED8", bg: "#EFF6FF", border: "#93C5FD",
    };
  }

  const endYear = Math.max(...years.map(Number));
  const ago = currentYear - endYear;

  if (ago <= 2) return {
    label: "Cel mai recent job",
    recommended: "5–6",
    instruction: "Pentru un CV profesional, selectați doar 5–6 responsabilități pe care le considerați cele mai esențiale și de impact pentru acest rol.",
    color: "#15803D", bg: "#F0FDF4", border: "#86EFAC",
  };
  if (ago <= 5) return {
    label: "Job anterior",
    recommended: "3–4",
    instruction: "Pentru un CV profesional, selectați doar 3–4 responsabilități pe care le considerați cele mai relevante pentru cariera ta.",
    color: "#1D4ED8", bg: "#EFF6FF", border: "#93C5FD",
  };
  if (ago <= 10) return {
    label: "Job mai vechi",
    recommended: "2–3",
    instruction: "Pentru un CV profesional, selectați doar 2–3 responsabilități principale — suficiente pentru un job din urmă cu câțiva ani.",
    color: "#B45309", bg: "#FFFBEB", border: "#FCD34D",
  };
  return {
    label: "Job irelevant",
    recommended: "1–2",
    instruction: "Pentru un CV profesional, selectați 1–2 responsabilități reprezentative — mai mult ar dilua impactul CV-ului tău.",
    color: "#6B7280", bg: "#F9FAFB", border: "#D1D5DB",
  };
}

export function Step09Experience({ experience, onUpdate, onNext, onBack }: Props) {
  const [showForm, setShowForm] = useState(experience.length === 0);
  const [form, setForm] = useState({ ...EMPTY_EXP });
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>(experience.length > 0 ? "summary" : "form");
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [responsibilitiesList, setResponsibilitiesList] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [customInput, setCustomInput] = useState("");
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", company: "", period: "", location: "" });
  const [editResponsibilities, setEditResponsibilities] = useState<string[]>([]);
  const [editIdx, setEditIdx] = useState<number>(-1);
  const savedIdxRef = useRef<number>(-1);
  const savedJobRef = useRef({ title: "", company: "", period: "" });
  const rawDescRef = useRef("");

  const set = (field: string, val: string) => setForm((prev) => ({ ...prev, [field]: val }));

  const buildEntry = (): Experience => ({
    title: form.title.trim(),
    company: form.company.trim(),
    period: form.period.trim(),
    location: form.location.trim(),
    responsibilities: [],
    achievements: [],
  });

  // ── PHASE 1 → 2: Form → Questions ────────────────────────────────────────────
  const handleNext = async () => {
    if (!form.title.trim() || !form.company.trim() || !form.period.trim()) {
      if (experience.length > 0) { setPhase("summary"); } else { onNext(); }
      return;
    }

    const entry = buildEntry();
    const idx = editIndex !== null ? editIndex : experience.length;
    savedIdxRef.current = idx;
    savedJobRef.current = { title: entry.title, company: entry.company, period: entry.period };
    rawDescRef.current = form.responsibilities;

    if (editIndex !== null) {
      const updated = [...experience]; updated[editIndex] = entry; onUpdate(updated); setEditIndex(null);
    } else {
      onUpdate([...experience, entry]);
    }

    setPhase("loading-questions");

    try {
      const res = await fetch("/api/ai/experience-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle: entry.title, company: entry.company, period: entry.period }),
      });
      const data = await res.json();
      const qs: string[] = data.questions ?? [];
      setQuestions(qs);
      setAnswers(new Array(qs.length).fill(""));
    } catch {
      const fb = [
        "Care erau principalele tale responsabilități zilnice?",
        "Ce rezultate concrete ai obținut? (cifre, procente, proiecte)",
        "Ce instrumente sau programe foloseai în mod regulat?",
        "Câți clienți sau colegi gestionai?",
        "Care a fost cea mai mare provocare și cum ai rezolvat-o?",
      ];
      setQuestions(fb); setAnswers(new Array(fb.length).fill(""));
    }

    setPhase("questions");
  };

  // ── PHASE 2 → 3: Questions → Responsibilities ────────────────────────────────
  const handleSubmitAnswers = async () => {
    setPhase("loading-responsibilities");

    try {
      const res = await fetch("/api/ai/experience-responsibilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: savedJobRef.current.title,
          company: savedJobRef.current.company,
          period: savedJobRef.current.period,
          rawDescription: rawDescRef.current,
          qna: questions.map((q, i) => ({ question: q, answer: answers[i] ?? "" })),
        }),
      });
      const data = await res.json();
      const list: string[] = Array.isArray(data.responsibilities) && data.responsibilities.length > 0
        ? data.responsibilities
        : RESPONSIBILITIES_FALLBACK;
      setResponsibilitiesList(list);
      setSelected(new Set());
    } catch {
      setResponsibilitiesList(RESPONSIBILITIES_FALLBACK); setSelected(new Set());
    }

    setPhase("responsibilities");
  };

  // ── PHASE 3 → Summary ────────────────────────────────────────────────────────
  const handleSubmitResponsibilities = () => {
    const picked = responsibilitiesList.filter((_, i) => selected.has(i));
    const idx = savedIdxRef.current;
    if (idx >= 0) {
      const updated = [...experience];
      updated[idx] = { ...updated[idx], responsibilities: picked };
      onUpdate(updated);
    }
    setPhase("summary");
  };

  const toggleItem = (i: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const handleAddCustom = async () => {
    if (!customInput.trim() || isAddingCustom) return;
    setIsAddingCustom(true);
    try {
      const res = await fetch("/api/ai/format-responsibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: customInput.trim(), jobTitle: savedJobRef.current.title }),
      });
      const data = await res.json();
      const formatted: string = data.responsibility ?? customInput.trim();
      setResponsibilitiesList((prev) => {
        const next = [...prev, formatted];
        setSelected((s) => new Set([...s, next.length - 1]));
        return next;
      });
      setCustomInput("");
    } catch {
      const fallback = customInput.trim();
      setResponsibilitiesList((prev) => {
        const next = [...prev, fallback];
        setSelected((s) => new Set([...s, next.length - 1]));
        return next;
      });
      setCustomInput("");
    }
    setIsAddingCustom(false);
  };

  const handleEdit = (i: number) => {
    const exp = experience[i];
    setEditForm({ title: exp.title, company: exp.company, period: exp.period, location: exp.location ?? "" });
    setEditResponsibilities([...exp.responsibilities]);
    setEditIdx(i);
    setPhase("edit");
  };

  const handleSaveEdit = () => {
    if (!editForm.title.trim() || !editForm.company.trim() || !editForm.period.trim()) {
      toast.error("Funcția, compania și perioada sunt obligatorii.");
      return;
    }
    const updated = [...experience];
    updated[editIdx] = {
      ...updated[editIdx],
      title: editForm.title.trim(),
      company: editForm.company.trim(),
      period: editForm.period.trim(),
      location: editForm.location.trim(),
      responsibilities: editResponsibilities.filter(r => r.trim()),
    };
    onUpdate(updated);
    toast.success("Modificările au fost salvate.");
    setPhase("summary");
  };

  const handleDelete = (i: number) => {
    const updated = experience.filter((_, idx) => idx !== i);
    onUpdate(updated);
    toast.success("Experiență ștearsă");
    if (updated.length === 0) { setPhase("form"); setShowForm(true); setForm({ ...EMPTY_EXP }); }
  };

  // ── LOADING SCREEN ────────────────────────────────────────────────────────────
  if (phase === "loading-questions" || phase === "loading-responsibilities") {
    const msg = phase === "loading-questions"
      ? `Generez întrebări pentru rolul de ${savedJobRef.current.title}...`
      : `Generez lista de responsabilități pentru ${savedJobRef.current.title} la ${savedJobRef.current.company}...`;

    return (
      <StepCard icon={<Briefcase className="w-5 h-5" />}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "60px 0" }}>
          <Loader2 size={44} color="#4F46E5" style={{ animation: "spin 1s linear infinite" }} />
          <p style={{ fontSize: 18, color: "#64748B", textAlign: "center", maxWidth: 340 }}>{msg}</p>
        </div>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </StepCard>
    );
  }

  // ── QUESTIONS PHASE ───────────────────────────────────────────────────────────
  if (phase === "questions") {
    return (
      <StepCard
        title="Câteva întrebări rapide"
        subtitle={`Răspunsurile tale ne ajută să descriem cât mai complet experiența la ${savedJobRef.current.company}.`}
        icon={<Briefcase className="w-5 h-5" />}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {questions.map((q, i) => (
            <div key={i}>
              <label style={{ display: "block", fontSize: 18, fontWeight: 600, color: "#1E293B", marginBottom: 8, lineHeight: 1.4 }}>
                {i + 1}. {q}
              </label>
              <textarea
                value={answers[i] ?? ""}
                onChange={(e) => { const n = [...answers]; n[i] = e.target.value; setAnswers(n); }}
                placeholder="Scrie răspunsul tău aici..."
                rows={3}
                style={{
                  width: "100%", borderRadius: 10, border: "1px solid #94A3B8",
                  padding: "12px 16px", fontSize: 17, color: "#111827",
                  backgroundColor: "#ffffff", resize: "vertical", outline: "none",
                  fontFamily: "inherit", lineHeight: 1.6, transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#6366F1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#94A3B8"; e.target.style.boxShadow = "none"; }}
              />
            </div>
          ))}
        </div>
        <p style={{ fontSize: 15, color: "#94A3B8", marginTop: 14, textAlign: "center" }}>
          Nu trebuie să răspunzi la toate — completează ce știi
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <Button variant="outline" onClick={() => { setPhase("form"); setShowForm(true); setEditIndex(savedIdxRef.current); }} style={{ flex: 1 }}>← Înapoi</Button>
          <Button onClick={handleSubmitAnswers} style={{ flex: 2 }} iconRight={<ArrowRight className="w-4 h-4" />}>Continuă</Button>
        </div>
      </StepCard>
    );
  }

  // ── RESPONSIBILITIES PHASE ────────────────────────────────────────────────────
  if (phase === "responsibilities") {
    const selectedCount = selected.size;
    const seniority = detectSeniority(savedJobRef.current.period);
    const [recMin, recMax] = seniority.recommended.split("–").map(Number);
    const inRange = selectedCount >= recMin && selectedCount <= recMax;
    const counterColor = selectedCount === 0 ? "#94A3B8" : inRange ? "#15803D" : "#B45309";

    return (
      <StepCard
        title="Bifează ce ți se potrivește"
        subtitle={`Responsabilități generate pentru ${savedJobRef.current.title}. Bifează ce se potrivește cu experiența ta.`}
        icon={<Sparkles className="w-5 h-5" />}
      >
        {/* Seniority guidance banner */}
        <div style={{
          backgroundColor: seniority.bg,
          border: `1.5px solid ${seniority.border}`,
          borderRadius: 12, padding: "14px 18px", marginBottom: 14,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{
              fontSize: 13, fontWeight: 700, color: seniority.color,
              backgroundColor: seniority.border, padding: "2px 10px",
              borderRadius: 20, letterSpacing: 0.2,
            }}>
              {seniority.label}
            </span>
            <span style={{ fontSize: 15, fontWeight: 700, color: seniority.color }}>
              Alege {seniority.recommended} responsabilități
            </span>
          </div>
          <p style={{ fontSize: 14, color: seniority.color, margin: 0, opacity: 0.85, lineHeight: 1.5 }}>
            {seniority.instruction}
          </p>
        </div>

        {/* Counter + select/deselect buttons */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0",
          borderRadius: 10, padding: "9px 14px", marginBottom: 14,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={15} color={counterColor} />
            <span style={{ fontSize: 15, fontWeight: 600, color: counterColor }}>
              {selectedCount} din {responsibilitiesList.length} selectate
            </span>
            <span style={{ fontSize: 13, color: "#94A3B8" }}>
              — recomandat: {seniority.recommended}
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setSelected(new Set(responsibilitiesList.map((_, i) => i)))}
              style={{ fontSize: 13, color: "#4F46E5", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
            >
              Selectează tot
            </button>
            <span style={{ color: "#CBD5E1" }}>|</span>
            <button
              onClick={() => setSelected(new Set())}
              style={{ fontSize: 13, color: "#64748B", background: "none", border: "none", cursor: "pointer" }}
            >
              Deselectează tot
            </button>
          </div>
        </div>

        {/* Checkboxes list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 360, overflowY: "auto", paddingRight: 4 }}>
          {responsibilitiesList.map((r, i) => (
            <label
              key={i}
              style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "12px 16px",
                backgroundColor: selected.has(i) ? "#EEF2FF" : "#ffffff",
                border: `1.5px solid ${selected.has(i) ? "#A5B4FC" : "#E2E8F0"}`,
                borderRadius: 10, cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <input
                type="checkbox"
                checked={selected.has(i)}
                onChange={() => toggleItem(i)}
                style={{ width: 18, height: 18, marginTop: 2, accentColor: "#4F46E5", flexShrink: 0, cursor: "pointer" }}
              />
              <span style={{ fontSize: 17, color: "#1E293B", lineHeight: 1.5 }}>{r}</span>
            </label>
          ))}
        </div>

        {/* Custom responsibility input */}
        <div style={{ marginTop: 16, backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 12, padding: "14px 16px" }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: "#374151", marginBottom: 10 }}>Vrei să adaugi ceva?</p>
          <div style={{ display: "flex", gap: 10 }}>
            <textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddCustom(); } }}
              placeholder="Scrie orice, oricât de informal — ex: raspundeam la telefon, faceam facturi..."
              rows={2}
              style={{ flex: 1, borderRadius: 10, border: "1px solid #94A3B8", padding: "10px 14px", fontSize: 16, color: "#111827", backgroundColor: "#ffffff", resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.5 }}
              onFocus={(e) => { e.target.style.borderColor = "#6366F1"; }}
              onBlur={(e) => { e.target.style.borderColor = "#94A3B8"; }}
              disabled={isAddingCustom}
            />
            <button
              onClick={handleAddCustom}
              disabled={!customInput.trim() || isAddingCustom}
              style={{ padding: "0 18px", backgroundColor: customInput.trim() && !isAddingCustom ? "#4F46E5" : "#E2E8F0", color: customInput.trim() && !isAddingCustom ? "#ffffff" : "#9CA3AF", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: customInput.trim() && !isAddingCustom ? "pointer" : "not-allowed", display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s", flexShrink: 0, minWidth: 90, justifyContent: "center" }}
            >
              {isAddingCustom ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <>+ Adaugă</>}
            </button>
          </div>
          <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 6 }}>
            Scrie orice, cum vrei — vom analiza și transforma automat în limbaj profesional de CV
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <Button variant="outline" onClick={() => setPhase("questions")} style={{ flex: 1 }}>← Înapoi</Button>
          <Button onClick={handleSubmitResponsibilities} style={{ flex: 2 }} iconRight={<ArrowRight className="w-4 h-4" />}>
            Salvează ({selectedCount})
          </Button>
        </div>
      </StepCard>
    );
  }

  // ── EDIT PHASE ───────────────────────────────────────────────────────────────
  if (phase === "edit") {
    const setEF = (field: string, val: string) => setEditForm(prev => ({ ...prev, [field]: val }));

    return (
      <StepCard
        title="Editează experiența"
        subtitle="Modifică datele jobului și responsabilitățile direct."
        icon={<Briefcase className="w-5 h-5" />}
      >
        {/* Basic fields */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #CBD5E1", borderRadius: 14, padding: 20, marginBottom: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input label="Funcție / Titlu job *" value={editForm.title} onChange={e => setEF("title", e.target.value)} />
            <Input label="Companie *" value={editForm.company} onChange={e => setEF("company", e.target.value)} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input label="Perioadă *" value={editForm.period} onChange={e => setEF("period", e.target.value)} hint="ex: Ian 2019 – Prezent" />
              <Input label="Locație (opțional)" value={editForm.location} onChange={e => setEF("location", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Responsibilities editor */}
        <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 14, padding: 20, marginBottom: 16 }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 14 }}>
            Responsabilități ({editResponsibilities.filter(r => r.trim()).length})
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {editResponsibilities.map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <div style={{ paddingTop: 10, color: "#CBD5E1", flexShrink: 0 }}>
                  <GripVertical size={16} />
                </div>
                <textarea
                  value={r}
                  onChange={e => {
                    const next = [...editResponsibilities];
                    next[i] = e.target.value;
                    setEditResponsibilities(next);
                  }}
                  rows={2}
                  style={{
                    flex: 1, borderRadius: 10, border: "1px solid #CBD5E1",
                    padding: "9px 13px", fontSize: 15, color: "#1E293B",
                    backgroundColor: "#ffffff", resize: "vertical", outline: "none",
                    fontFamily: "inherit", lineHeight: 1.5,
                  }}
                  onFocus={e => { e.target.style.borderColor = "#6366F1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
                  onBlur={e => { e.target.style.borderColor = "#CBD5E1"; e.target.style.boxShadow = "none"; }}
                />
                <button
                  onClick={() => setEditResponsibilities(prev => prev.filter((_, idx) => idx !== i))}
                  style={{ padding: "8px", color: "#EF4444", backgroundColor: "#FEF2F2", border: "none", borderRadius: 8, cursor: "pointer", flexShrink: 0, marginTop: 2 }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Add new bullet */}
          <button
            onClick={() => setEditResponsibilities(prev => [...prev, ""])}
            style={{
              marginTop: 12, display: "flex", alignItems: "center", gap: 6,
              padding: "9px 14px", fontSize: 14, fontWeight: 600,
              color: "#4F46E5", backgroundColor: "#EEF2FF",
              border: "1.5px dashed #A5B4FC", borderRadius: 10, cursor: "pointer",
            }}
          >
            <Plus size={15} />
            Adaugă responsabilitate
          </button>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <Button variant="outline" onClick={() => setPhase("summary")} style={{ flex: 1 }}>← Înapoi</Button>
          <Button onClick={handleSaveEdit} style={{ flex: 2 }} iconRight={<ArrowRight className="w-4 h-4" />}>
            Salvează modificările
          </Button>
        </div>
      </StepCard>
    );
  }

  // ── SUMMARY PHASE ─────────────────────────────────────────────────────────────
  if (phase === "summary") {
    return (
      <StepCard
        title="Experiențele tale"
        subtitle="Iată ce ai adăugat. Poți adăuga mai multe joburi sau continui spre educație."
        icon={<Briefcase className="w-5 h-5" />}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 8 }}>
          {experience.map((exp, i) => (
            <div key={i} style={{ backgroundColor: "#ffffff", border: "1px solid #E2E8F0", borderRadius: 14, overflow: "hidden" }}>
              {/* Card header */}
              <div style={{ padding: "16px 20px 12px", borderBottom: exp.responsibilities.length > 0 ? "1px solid #F1F5F9" : "none" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 38, height: 38, backgroundColor: "#EEF2FF", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                      <Briefcase size={17} color="#4F46E5" />
                    </div>
                    <div>
                      <p style={{ fontSize: 19, fontWeight: 700, color: "#0F172A", lineHeight: 1.3 }}>{exp.title}</p>
                      <p style={{ fontSize: 16, fontWeight: 600, color: "#4F46E5", marginTop: 2 }}>{exp.company}</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", marginTop: 4 }}>
                        <span style={{ fontSize: 14, color: "#64748B" }}>📅 {exp.period}</span>
                        {exp.location && <span style={{ fontSize: 14, color: "#64748B" }}>📍 {exp.location}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => handleEdit(i)}
                      style={{ padding: "5px 12px", fontSize: 14, color: "#4F46E5", backgroundColor: "#EEF2FF", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}
                    >
                      Editează
                    </button>
                    <button
                      data-testid="btn-delete-exp"
                      onClick={() => handleDelete(i)}
                      style={{ padding: "5px 8px", color: "#EF4444", backgroundColor: "#FEF2F2", border: "none", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Responsibilities list */}
              {exp.responsibilities.length > 0 && (
                <div style={{ padding: "14px 20px 16px" }}>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                    {exp.responsibilities.map((r, j) => (
                      <li key={j} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <span style={{ color: "#4F46E5", fontWeight: 700, fontSize: 16, flexShrink: 0, lineHeight: "1.6" }}>•</span>
                        <span style={{ fontSize: 16, color: "#334155", lineHeight: 1.6 }}>{punct(r)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {exp.responsibilities.length === 0 && (
                <div style={{ padding: "10px 20px 14px" }}>
                  <p style={{ fontSize: 14, color: "#94A3B8", fontStyle: "italic" }}>Nicio responsabilitate adăugată încă.</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add new experience */}
        <button
          onClick={() => { setForm({ ...EMPTY_EXP }); setEditIndex(null); setShowForm(true); setPhase("form"); }}
          style={{
            width: "100%", padding: "14px 20px", marginBottom: 16,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            border: "2px dashed #C7D2FE", borderRadius: 12,
            backgroundColor: "#FAFBFF", color: "#4F46E5",
            fontSize: 17, fontWeight: 600, cursor: "pointer",
          }}
        >
          <Plus size={18} />
          Adaugă o altă experiență
        </button>

        <div style={{ display: "flex", gap: 12 }}>
          <Button variant="outline" onClick={onBack} style={{ flex: 1 }}>← Înapoi</Button>
          <Button onClick={onNext} style={{ flex: 2 }} iconRight={<ArrowRight className="w-4 h-4" />}>
            Continuă
          </Button>
        </div>
      </StepCard>
    );
  }

  // ── FORM PHASE ────────────────────────────────────────────────────────────────
  return (
    <StepCard
      title="Experiență profesională"
      subtitle="Adaugă joburile tale în ordine cronologică inversă (cel mai recent primul)."
      icon={<Briefcase className="w-5 h-5" />}
    >
      {/* Existing entries (compact, for context while adding) */}
      {experience.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {experience.map((exp, i) => (
            <div key={i} style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <CheckCircle2 size={16} color="#16A34A" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#166534", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{exp.title}</p>
                <p style={{ fontSize: 14, color: "#15803D" }}>{exp.company} · {exp.period}</p>
              </div>
              <button
                data-testid="btn-delete-exp"
                onClick={() => handleDelete(i)}
                style={{ padding: "4px 7px", color: "#EF4444", backgroundColor: "#FEF2F2", border: "none", borderRadius: 7, cursor: "pointer", display: "flex", alignItems: "center", flexShrink: 0 }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add/edit form */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #CBD5E1", borderRadius: 14, padding: 20, marginBottom: 16 }}>
        <p style={{ fontSize: 18, fontWeight: 700, color: "#0D0D0D", marginBottom: 16 }}>
          {editIndex !== null ? "Editează experiența" : "Adaugă experiență"}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Input label="Funcție / Titlu job *" placeholder="ex: Contabil" value={form.title} onChange={(e) => set("title", e.target.value)} autoFocus />
          <Input label="Companie *" placeholder="ex: Firma de Contabilitate XYZ" value={form.company} onChange={(e) => set("company", e.target.value)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Perioadă *" placeholder="ex: Ian 2019 – Prezent" value={form.period} onChange={(e) => set("period", e.target.value)} hint="Luna An – Luna An sau Prezent" />
            <Input label="Locație (opțional)" placeholder="ex: Cluj-Napoca" value={form.location} onChange={(e) => set("location", e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 18, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Ce făceai acolo? (opțional)</label>
            <textarea
              value={form.responsibilities}
              onChange={(e) => set("responsibilities", e.target.value)}
              placeholder={"Descrie cu cuvintele tale ce anume făceai acolo.\nCu cât mai multe detalii, cu atât CV-ul va fi mai complet.\n\nExemplu:\nGestionam contabilitatea completă pentru aproximativ 15 firme client\nIntroduceam facturile de intrare și ieșire în programul de contabilitate\nÎntocmeam declarațiile fiscale lunare și trimestriale (D300, D394, D112)\nPregăteam balanțele de verificare și situațiile financiare anuale\nMă ocupam de relația cu ANAF — depuneri, răspunsuri la notificări\nReconciliam conturile bancare și verificam extrasele de cont\nComunicam direct cu clienții pentru colectarea documentelor"}
              rows={6}
              style={{ width: "100%", borderRadius: 10, border: "1px solid #94A3B8", padding: "10px 14px", fontSize: 17, color: "#111827", backgroundColor: "#ffffff", resize: "vertical", outline: "none", fontFamily: "inherit", lineHeight: 1.6 }}
            />
            <p style={{ fontSize: 16, color: "#6B7280", marginTop: 6 }}>
              Cu cât mai multe detalii, cu atât mai bine 😊 Nu îți face griji pentru formulări și greșeli!
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <Button variant="outline" onClick={() => { experience.length > 0 ? setPhase("summary") : onBack(); }} style={{ flex: 1 }}>← Înapoi</Button>
        <Button onClick={handleNext} style={{ flex: 2 }} iconRight={<ArrowRight className="w-4 h-4" />}>
          Continuă
        </Button>
      </div>
    </StepCard>
  );
}
