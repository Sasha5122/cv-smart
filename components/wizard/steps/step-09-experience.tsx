"use client";
import { useState, useRef } from "react";
import { StepCard } from "../step-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Briefcase, ArrowRight, Trash2, ChevronDown, ChevronUp, Loader2, Sparkles } from "lucide-react";
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

type Phase = "form" | "loading-questions" | "questions" | "loading-responsibilities" | "responsibilities";

export function Step09Experience({ experience, onUpdate, onNext, onBack }: Props) {
  const [showForm, setShowForm] = useState(experience.length === 0);
  const [form, setForm] = useState({ ...EMPTY_EXP });
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("form");
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [responsibilitiesList, setResponsibilitiesList] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [customInput, setCustomInput] = useState("");
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const savedIdxRef = useRef<number>(-1);
  const savedJobRef = useRef({ title: "", company: "", period: "" });
  const rawDescRef = useRef("");

  const set = (field: string, val: string) => setForm((prev) => ({ ...prev, [field]: val }));

  const buildEntry = (): Experience => ({
    title: form.title.trim(),
    company: form.company.trim(),
    period: form.period.trim(),
    location: form.location.trim(),
    responsibilities: form.responsibilities.split("\n").map((r) => r.trim()).filter(Boolean),
    achievements: [],
  });

  // ── PHASE 1 → 2: Form → Questions ────────────────────────────────────────────
  const handleNext = async () => {
    if (!showForm || !form.title.trim() || !form.company.trim() || !form.period.trim()) {
      onNext();
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
      const list: string[] = data.responsibilities ?? [];
      setResponsibilitiesList(list);
      setSelected(new Set(list.map((_, i) => i)));
    } catch {
      setResponsibilitiesList([]); setSelected(new Set());
    }

    setPhase("responsibilities");
  };

  // ── PHASE 3 → Next step ───────────────────────────────────────────────────────
  const handleSubmitResponsibilities = () => {
    const picked = responsibilitiesList.filter((_, i) => selected.has(i));
    const idx = savedIdxRef.current;
    if (idx >= 0) {
      const updated = [...experience];
      updated[idx] = { ...updated[idx], responsibilities: picked };
      onUpdate(updated);
    }
    onNext();
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
    setForm({ title: exp.title, company: exp.company, period: exp.period, location: exp.location ?? "", responsibilities: exp.responsibilities.join("\n") });
    setEditIndex(i); setShowForm(true); setExpandedIndex(null); setPhase("form");
  };

  const handleDelete = (i: number) => {
    onUpdate(experience.filter((_, idx) => idx !== i));
    toast.success("Experiență ștearsă");
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
          <Button variant="outline" onClick={() => { setPhase("form"); setShowForm(true); }} style={{ flex: 1 }}>← Înapoi</Button>
          <Button onClick={handleSubmitAnswers} style={{ flex: 2 }} iconRight={<ArrowRight className="w-4 h-4" />}>Continuă</Button>
        </div>
      </StepCard>
    );
  }

  // ── RESPONSIBILITIES PHASE ────────────────────────────────────────────────────
  if (phase === "responsibilities") {
    const selectedCount = selected.size;

    return (
      <StepCard
        title="Bifează ce ți se potrivește"
        subtitle={`Au fost generate responsabilități pentru rolul de ${savedJobRef.current.title}. Debifează ce nu se potrivește cu experiența ta.`}
        icon={<Sparkles className="w-5 h-5" />}
      >
        {/* Header bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          backgroundColor: "#EEF2FF", border: "1px solid #C7D2FE",
          borderRadius: 10, padding: "10px 16px", marginBottom: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={16} color="#4F46E5" />
            <span style={{ fontSize: 16, fontWeight: 600, color: "#4338CA" }}>
              {selectedCount} din {responsibilitiesList.length} selectate
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setSelected(new Set(responsibilitiesList.map((_, i) => i)))}
              style={{ fontSize: 14, color: "#4F46E5", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
            >
              Selectează tot
            </button>
            <span style={{ color: "#C7D2FE" }}>|</span>
            <button
              onClick={() => setSelected(new Set())}
              style={{ fontSize: 14, color: "#64748B", background: "none", border: "none", cursor: "pointer" }}
            >
              Deselectează tot
            </button>
          </div>
        </div>

        {/* Checkboxes list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 420, overflowY: "auto", paddingRight: 4 }}>
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
        <div style={{
          marginTop: 16,
          backgroundColor: "#F8FAFC",
          border: "1px solid #E2E8F0",
          borderRadius: 12,
          padding: "14px 16px",
        }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: "#374151", marginBottom: 10 }}>
            Vrei să adaugi ceva?
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddCustom(); } }}
              placeholder="Scrie orice, oricât de informal — ex: raspundeam la telefon, faceam facturi, ma ocupam de stocuri..."
              rows={2}
              style={{
                flex: 1, borderRadius: 10, border: "1px solid #94A3B8",
                padding: "10px 14px", fontSize: 16, color: "#111827",
                backgroundColor: "#ffffff", resize: "none", outline: "none",
                fontFamily: "inherit", lineHeight: 1.5, transition: "border-color 0.15s",
              }}
              onFocus={(e) => { e.target.style.borderColor = "#6366F1"; }}
              onBlur={(e) => { e.target.style.borderColor = "#94A3B8"; }}
              disabled={isAddingCustom}
            />
            <button
              onClick={handleAddCustom}
              disabled={!customInput.trim() || isAddingCustom}
              style={{
                padding: "0 18px",
                backgroundColor: customInput.trim() && !isAddingCustom ? "#4F46E5" : "#E2E8F0",
                color: customInput.trim() && !isAddingCustom ? "#ffffff" : "#9CA3AF",
                border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600,
                cursor: customInput.trim() && !isAddingCustom ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", gap: 8,
                transition: "all 0.15s", flexShrink: 0, minWidth: 90,
                justifyContent: "center",
              }}
            >
              {isAddingCustom ? (
                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                <>+ Adaugă</>
              )}
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

  // ── FORM PHASE ────────────────────────────────────────────────────────────────
  return (
    <StepCard
      title="Experiență profesională"
      subtitle="Adaugă joburile tale în ordine cronologică inversă (cel mai recent primul)."
      icon={<Briefcase className="w-5 h-5" />}
    >
      {/* Existing entries */}
      {experience.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {experience.map((exp, i) => (
            <div key={i} style={{ backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
              <div
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", cursor: "pointer" }}
                onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, backgroundColor: "#EEEDF8", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Briefcase size={16} color="#4F46E5" />
                  </div>
                  <div>
                    <p style={{ fontSize: 18, fontWeight: 700, color: "#0D0D0D" }}>{exp.title}</p>
                    <p style={{ fontSize: 16, color: "#6B7280" }}>{exp.company} · {exp.period}</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button onClick={(e) => { e.stopPropagation(); handleEdit(i); }} style={{ padding: "6px 12px", fontSize: 16, color: "#4F46E5", backgroundColor: "#EEEDF8", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Editează</button>
                  <button data-testid="btn-delete-exp" onClick={(e) => { e.stopPropagation(); handleDelete(i); }} style={{ padding: 6, color: "#EF4444", backgroundColor: "#FEF2F2", border: "none", borderRadius: 8, cursor: "pointer", display: "flex" }}><Trash2 size={14} /></button>
                  {expandedIndex === i ? <ChevronUp size={16} color="#9CA3AF" /> : <ChevronDown size={16} color="#9CA3AF" />}
                </div>
              </div>
              {expandedIndex === i && exp.responsibilities.length > 0 && (
                <div style={{ padding: "0 16px 14px 64px", borderTop: "1px solid #E5E7EB" }}>
                  <ul style={{ margin: "10px 0 0", paddingLeft: 4, listStyle: "none" }}>
                    {exp.responsibilities.map((r, j) => (
                      <li key={j} style={{ fontSize: 17, color: "#374151", marginBottom: 4 }}>· {r}</li>
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
      ) : (
        <button
          onClick={() => { setShowForm(true); setEditIndex(null); setForm({ ...EMPTY_EXP }); }}
          style={{ width: "100%", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "2px dashed #C7D2FE", borderRadius: 12, backgroundColor: "#FAFAFA", color: "#4F46E5", fontSize: 18, fontWeight: 600, cursor: "pointer", marginBottom: 16, transition: "background-color 0.15s" }}
        >
          + Adaugă experiență profesională
        </button>
      )}

      {experience.length === 0 && !showForm && (
        <p style={{ fontSize: 17, color: "#9CA3AF", textAlign: "center", marginBottom: 16 }}>
          Nicio experiență adăugată — poți continua fără.
        </p>
      )}

      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <Button variant="outline" onClick={onBack} style={{ flex: 1 }}>← Înapoi</Button>
        <Button onClick={handleNext} style={{ flex: 2 }} iconRight={<ArrowRight className="w-4 h-4" />}>
          {experience.length > 0 && !showForm ? `Continuă (${experience.length} job${experience.length > 1 ? "uri" : ""})` : "Continuă"}
        </Button>
      </div>
    </StepCard>
  );
}
