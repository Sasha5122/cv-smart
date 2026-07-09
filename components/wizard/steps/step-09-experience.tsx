"use client";
import { useEffect, useRef, useState } from "react";
import { StepCard } from "../step-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ArrowLeft, Plus, Trash2, RefreshCcw } from "lucide-react";
import type { Experience } from "@/lib/types/cv";
import type { GeneratedBullet, PipelineQuestion } from "@/lib/types/cv-pipeline";
import { toast } from "sonner";

/* ────────────────────────────────────────────────────────────────
   Pasul Experiență — pipeline AI în 4 ecrane:
   input → întrebări (5) → selecție bullet-uri (7) → rezultat.
   Ancorat pe job description-ul din Pasul 1 (când există).
   ──────────────────────────────────────────────────────────────── */

interface Props {
  sessionId: string;
  jobDescription?: string;
  experience: Experience[];
  onUpdate: (exp: Experience[]) => void;
  onNext: () => void;
  onBack: () => void;
}

type Phase =
  | "summary"
  | "input"
  | "analyzing"
  | "questions"
  | "generating"
  | "select"
  | "manual";

const INDUSTRIES = [
  "Retail / Comerț",
  "HoReCa",
  "Construcții",
  "Transport & Logistică",
  "Producție",
  "IT & Software",
  "Financiar & Contabilitate",
  "Sănătate",
  "Educație",
  "Vânzări & Marketing",
  "Administrativ / Birou",
  "Servicii",
  "Alta",
];

const EMPTY_FORM = {
  title: "",
  company: "",
  period: "",
  location: "",
  industry: "",
  years: "",
  rawText: "",
};

const MIN_RAW = 200;
const MAX_RAW = 5000;

/** mesaje progresive pentru fazele de loading */
const ANALYZE_MESSAGES = [
  "Citim ce ne-ai povestit…",
  "Extragem faptele care contează…",
  "Căutăm golurile dintr-un CV puternic…",
  "Pregătim 5 întrebări țintite…",
];
const GENERATE_MESSAGES = [
  "Punem totul cap la cap…",
  "Scriem descrierile ca un recrutor…",
  "Verificăm fiecare cifră — nimic inventat…",
  "Ordonăm de la cel mai puternic…",
];

function LoadingPanel({ messages }: { messages: string[] }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setIdx((i) => (i + 1 < messages.length ? i + 1 : i)),
      3600
    );
    return () => clearInterval(t);
  }, [messages]);

  return (
    <div
      className="paper-card animate-fade-in"
      style={{ padding: "44px 36px", textAlign: "center" }}
    >
      <div
        style={{
          display: "inline-flex",
          gap: 6,
          marginBottom: 22,
          alignItems: "flex-end",
          height: 18,
        }}
      >
        <span className="typing-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--ink)", display: "inline-block" }} />
        <span className="typing-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--ink)", display: "inline-block" }} />
        <span className="typing-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--ink)", display: "inline-block" }} />
      </div>
      <p
        key={idx}
        className="animate-fade-in"
        style={{
          fontFamily: "var(--font-display), sans-serif",
          fontSize: 19,
          color: "var(--ink)",
        }}
      >
        {messages[idx]}
      </p>
      <p style={{ fontSize: 13, color: "var(--faint)", marginTop: 10 }}>
        durează câteva secunde
      </p>
    </div>
  );
}

export function Step09Experience({
  sessionId,
  jobDescription,
  experience,
  onUpdate,
  onNext,
  onBack,
}: Props) {
  const [phase, setPhase] = useState<Phase>(
    experience.length > 0 ? "summary" : "input"
  );
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [error, setError] = useState<string | null>(null);

  // pipeline state
  const pipelineIdRef = useRef<string | null>(null);
  const [questions, setQuestions] = useState<PipelineQuestion[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [bullets, setBullets] = useState<GeneratedBullet[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [manualText, setManualText] = useState("");

  const hasJD = Boolean(jobDescription?.trim());
  const set = (field: keyof typeof EMPTY_FORM, val: string) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  const rawLen = form.rawText.trim().length;
  const canAnalyze =
    form.title.trim().length > 1 && rawLen >= MIN_RAW && rawLen <= MAX_RAW;
  const answeredCount = answers.filter((a) => a.trim().length > 0).length;

  const minSelect = bullets.length >= 6 ? 5 : Math.max(4, bullets.length - 1);
  const canFinishSelect =
    selectedIds.size >= minSelect && selectedIds.size <= 6;

  /* ── API calls ─────────────────────────────────────────────── */

  async function runAnalyze() {
    setError(null);
    setPhase("analyzing");
    try {
      const res = await fetch("/api/cv/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: form.title.trim(),
          company: form.company.trim() || undefined,
          period: form.period.trim() || undefined,
          industry: form.industry || undefined,
          yearsExperience: form.years ? Number(form.years) : undefined,
          rawText: form.rawText.trim(),
          jobDescription: jobDescription?.trim() || undefined,
          wizardSessionId: sessionId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analiza a eșuat.");
      pipelineIdRef.current = data.sessionId;
      setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(""));
      setPhase("questions");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analiza a eșuat.");
      setPhase("input");
    }
  }

  async function runGenerate(force = false) {
    setError(null);
    setPhase("generating");
    try {
      const pid = pipelineIdRef.current;
      const answerPayload = questions.map((q, i) => ({
        questionId: q.id,
        answer: answers[i] ?? "",
      }));
      // Context unic: descrierea + întrebările + răspunsurile → 7 bullets
      const gen = await fetch("/api/cv/generate-bullets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: pid, answers: answerPayload, force }),
      });
      const genData = await gen.json();
      if (!gen.ok) throw new Error(genData.error ?? "Generarea a eșuat.");

      setBullets(genData.bullets);
      setSelectedIds(new Set());
      setPhase("select");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generarea a eșuat.");
      setPhase("questions");
    }
  }

  async function finishSelection() {
    setError(null);
    try {
      const pid = pipelineIdRef.current;
      const ids = Array.from(selectedIds);
      const res = await fetch("/api/cv/select-bullets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: pid, selectedIds: ids }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Salvarea selecției a eșuat.");

      saveEntry(
        (data.selected as GeneratedBullet[]).map((b) => b.text)
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Salvarea a eșuat.");
    }
  }

  /* ── helpers ───────────────────────────────────────────────── */

  function saveEntry(responsibilities: string[]) {
    const entry: Experience = {
      title: form.title.trim(),
      company: form.company.trim() || "—",
      period: form.period.trim() || "",
      location: form.location.trim() || undefined,
      responsibilities,
      achievements: [],
    };
    onUpdate([...experience, entry]);
    toast.success("Jobul a fost adăugat în CV.");
    setForm({ ...EMPTY_FORM });
    setQuestions([]);
    setAnswers([]);
    setBullets([]);
    setSelectedIds(new Set());
    pipelineIdRef.current = null;
    setPhase("summary");
  }

  function removeEntry(idx: number) {
    onUpdate(experience.filter((_, i) => i !== idx));
  }

  function toggleBullet(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 6) next.add(id);
      return next;
    });
  }

  /* ── render pe faze ────────────────────────────────────────── */

  const ErrorCard = error ? (
    <div
      className="animate-fade-in"
      style={{
        backgroundColor: "var(--red-soft)",
        border: "1px solid #fca5a5",
        borderRadius: 8,
        padding: "12px 16px",
        marginBottom: 20,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <span style={{ fontSize: 14, color: "#b91c1c", fontWeight: 500 }}>{error}</span>
    </div>
  ) : null;

  /* ── ECRAN: rezumat joburi salvate ─────────────────────────── */
  if (phase === "summary") {
    return (
      <StepCard
        kicker="Experiență profesională"
        title="Joburile tale, negru pe alb."
        subtitle="Fiecare job trece printr-un mic interviu cu AI-ul — descrierile rezultate sunt scrise ca de un recrutor."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {experience.map((exp, i) => (
            <div key={i} className="paper-card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--ink-strong)" }}>
                    {exp.title}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-display), sans-serif",
                      fontSize: 14,
                      color: "var(--primary)",
                      marginTop: 2,
                    }}
                  >
                    {exp.company}
                    {exp.period ? ` · ${exp.period}` : ""}
                  </div>
                </div>
                <button
                  onClick={() => removeEntry(i)}
                  aria-label={`Șterge ${exp.title}`}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--faint)",
                    padding: 6,
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              {exp.responsibilities.length > 0 && (
                <ul style={{ listStyle: "none", margin: "12px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                  {exp.responsibilities.map((r, j) => (
                    <li key={j} style={{ display: "flex", gap: 8, fontSize: 13.5, color: "var(--foreground)", lineHeight: 1.55 }}>
                      <span style={{ color: "var(--amber)", fontWeight: 600, flexShrink: 0 }}>—</span>
                      {r}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          <button
            onClick={() => setPhase("input")}
            className="animate-fade-in"
            style={{
              border: "1px dashed var(--hairline-strong)",
              borderRadius: 8,
              padding: "14px 18px",
              background: "transparent",
              color: "var(--muted-foreground)",
              fontSize: 14.5,
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Plus size={16} />
            Adaugă încă un job
          </button>
        </div>

        <div className="flex gap-3 mt-10">
          <Button variant="outline" onClick={onBack} className="flex-1">
            ← Înapoi
          </Button>
          <Button
            onClick={onNext}
            size="lg"
            className="flex-[2]"
            disabled={experience.length === 0}
            iconRight={<ArrowRight className="w-4 h-4" />}
          >
            Continuă
          </Button>
        </div>
      </StepCard>
    );
  }

  /* ── ECRAN 1: input ────────────────────────────────────────── */
  if (phase === "input" || phase === "analyzing") {
    if (phase === "analyzing")
      return (
        <StepCard kicker="Experiență · Pas 1 din 3" title="Analizăm experiența ta">
          <LoadingPanel messages={ANALYZE_MESSAGES} />
        </StepCard>
      );

    return (
      <StepCard
        kicker="Experiență · Pas 1 din 3"
        title="Povestește-ne ce faci la job."
        subtitle="Scrie liber, ca și cum i-ai povesti unui prieten. Fără formulări pretențioase — de asta ne ocupăm noi."
      >
        {ErrorCard}

        {hasJD && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              backgroundColor: "var(--amber-soft)",
              border: "1px solid #6ee7b7",
              borderRadius: 5,
              padding: "6px 12px",
              marginBottom: 22,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--amber)" }} />
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#065f46" }}>
              Ancorat pe anunțul tău din Pasul 1
            </span>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <Input
            label="Funcția / titlul jobului *"
            placeholder="ex: Contabil"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />
          <Input
            label="Compania"
            placeholder="ex: SC Exemplu SRL"
            value={form.company}
            onChange={(e) => set("company", e.target.value)}
          />
          <Input
            label="Perioada"
            placeholder="ex: 2021 – prezent"
            value={form.period}
            onChange={(e) => set("period", e.target.value)}
          />
          <Input
            label="Localitatea"
            placeholder="ex: Cluj-Napoca"
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 18 }}>
          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>
              Industria
            </label>
            <select
              value={form.industry}
              onChange={(e) => set("industry", e.target.value)}
              style={{
                width: "100%",
                borderRadius: 8,
                border: "1px solid var(--input-border)",
                backgroundColor: "var(--card)",
                padding: "13px 16px",
                fontSize: 15,
                color: form.industry ? "var(--ink)" : "var(--faint)",
                fontFamily: "inherit",
              }}
            >
              <option value="">alege…</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Ani în acest rol"
            placeholder="ex: 5"
            type="number"
            min={0}
            max={50}
            value={form.years}
            onChange={(e) => set("years", e.target.value)}
          />
        </div>

        <Textarea
          label="Ce faci acolo, cu cuvintele tale? *"
          value={form.rawText}
          onChange={(e) => set("rawText", e.target.value)}
          placeholder="Descrie cu cuvintele tale ce faci la job, ca și cum i-ai povesti unui prieten. Nu-ți face griji de formulare."
          rows={7}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 6,
            fontSize: 12.5,
            color: rawLen >= MIN_RAW ? "var(--color-success,#3d7a4e)" : "var(--faint)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span>
            {rawLen < MIN_RAW
              ? `încă ${MIN_RAW - rawLen} caractere ca AI-ul să aibă cu ce lucra`
              : "✓ suficient de detaliat"}
          </span>
          <span>
            {rawLen}/{MAX_RAW}
          </span>
        </div>

        <div className="flex gap-3 mt-10">
          <Button
            variant="outline"
            onClick={() => (experience.length > 0 ? setPhase("summary") : onBack())}
            className="flex-1"
          >
            ← Înapoi
          </Button>
          <Button
            onClick={runAnalyze}
            size="lg"
            className="flex-[2]"
            disabled={!canAnalyze}
            iconRight={<ArrowRight className="w-4 h-4" />}
          >
            Analizează
          </Button>
        </div>
        <button
          onClick={() => setPhase("manual")}
          style={{
            width: "100%",
            marginTop: 12,
            padding: "8px",
            fontSize: 13.5,
            color: "var(--muted-foreground)",
            background: "none",
            border: "none",
            cursor: "pointer",
            textDecoration: "underline",
            textDecorationColor: "var(--hairline-strong)",
            textUnderlineOffset: 4,
          }}
        >
          Prefer să scriu descrierile manual
        </button>
      </StepCard>
    );
  }

  /* ── ECRAN 2: întrebările ──────────────────────────────────── */
  if (phase === "questions" || phase === "generating") {
    if (phase === "generating")
      return (
        <StepCard kicker="Experiență · Pas 2 din 3" title="Scriem descrierile">
          <LoadingPanel messages={GENERATE_MESSAGES} />
        </StepCard>
      );

    return (
      <StepCard
        kicker="Experiență · Pas 2 din 3"
        title="5 întrebări, ca la un interviu bun."
        subtitle="Răspunde scurt și concret — cifre, exemple, denumiri. Poți sări peste unele, dar minim 3 răspunsuri fac diferența."
      >
        {ErrorCard}

        {/* progres răspunsuri */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 5 }}>
            {questions.map((_, i) => (
              <span
                key={i}
                style={{
                  width: 26,
                  height: 3,
                  backgroundColor:
                    (answers[i] ?? "").trim().length > 0 ? "var(--ink)" : "var(--hairline)",
                  transition: "background-color 0.25s",
                }}
              />
            ))}
          </div>
          <span className="folio" style={{ fontSize: 10.5 }}>
            {answeredCount}/{questions.length} răspunsuri
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {questions.map((q, i) => (
            <div key={q.id} className="animate-fade-in" style={{ animationDelay: `${i * 70}ms` }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
                <span
                  style={{
                    fontFamily: "var(--font-display), sans-serif",
                    fontSize: 19,
                    fontWeight: 600,
                    color: "var(--amber)",
                    lineHeight: 1.35,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}.
                </span>
                <p style={{ fontSize: 15.5, fontWeight: 550, color: "var(--ink-strong)", lineHeight: 1.55 }}>
                  {q.question}
                </p>
              </div>
              <Textarea
                value={answers[i] ?? ""}
                onChange={(e) =>
                  setAnswers((prev) => {
                    const next = [...prev];
                    next[i] = e.target.value;
                    return next;
                  })
                }
                placeholder="Răspunsul tău… (sau lasă gol)"
                rows={2}
                style={{ marginLeft: 0 }}
              />
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-10">
          <Button variant="outline" onClick={() => setPhase("input")} className="flex-1">
            ← Înapoi
          </Button>
          <Button
            onClick={() => runGenerate()}
            size="lg"
            className="flex-[2]"
            disabled={answeredCount < 3}
            iconRight={<ArrowRight className="w-4 h-4" />}
          >
            {answeredCount < 3
              ? `Răspunde la minim 3 (${answeredCount}/3)`
              : "Generează descrierile"}
          </Button>
        </div>
      </StepCard>
    );
  }

  /* ── ECRAN 3: selecția bullet-urilor ───────────────────────── */
  if (phase === "select") {
    return (
      <StepCard
        kicker="Experiență · Pas 3 din 3"
        title="Alege ce te reprezintă."
        subtitle={`Toate sunt ancorate strict în ce ne-ai spus — nimic inventat. Alege ${minSelect}–6 pentru CV.`}
      >
        {ErrorCard}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <span className="folio" style={{ fontSize: 10.5 }}>
            {bullets.length} descrieri generate
          </span>
          <span
            style={{
              fontSize: 13.5,
              fontWeight: 600,
              color: canFinishSelect ? "var(--color-success,#3d7a4e)" : "var(--muted-foreground)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            Ai ales {selectedIds.size} din {minSelect}–6
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {bullets.map((b, i) => {
            const isSelected = selectedIds.has(b.id);
            return (
              <button
                key={b.id}
                onClick={() => toggleBullet(b.id)}
                className="animate-fade-in"
                style={{
                  animationDelay: `${i * 60}ms`,
                  textAlign: "left",
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                  padding: "16px 18px",
                  borderRadius: 8,
                  border: isSelected
                    ? "1.5px solid var(--primary)"
                    : "1px solid var(--hairline)",
                  backgroundColor: isSelected ? "var(--wash)" : "var(--card)",
                  boxShadow: isSelected ? "none" : "var(--shadow-paper)",
                  cursor: "pointer",
                  transition: "all 0.16s ease",
                }}
              >
                {/* caseta de cerneală */}
                <span
                  aria-hidden
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    border: isSelected ? "1.5px solid var(--primary)" : "1px solid var(--hairline-strong)",
                    backgroundColor: isSelected ? "var(--primary)" : "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 1,
                    transition: "all 0.16s ease",
                  }}
                >
                  {isSelected && (
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6.2L4.8 9L10 3.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--ink)" }}>
                  {b.text}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex gap-3 mt-10">
          <Button
            variant="outline"
            onClick={() => runGenerate(true)}
            className="flex-1"
            icon={<RefreshCcw className="w-4 h-4" />}
          >
            Regenerează
          </Button>
          <Button
            onClick={finishSelection}
            size="lg"
            className="flex-[2]"
            disabled={!canFinishSelect}
            iconRight={<ArrowRight className="w-4 h-4" />}
          >
            {canFinishSelect
              ? "Finalizează jobul"
              : `Alege minim ${minSelect} descrieri`}
          </Button>
        </div>
      </StepCard>
    );
  }

  /* ── ECRAN: mod manual (fallback) ──────────────────────────── */
  return (
    <StepCard
      kicker="Experiență · manual"
      title="Scrie descrierile manual."
      subtitle="Câte o responsabilitate pe rând. Le poți rafina mai târziu, la draftul final."
    >
      {ErrorCard}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <Input
          label="Funcția *"
          placeholder="ex: Contabil"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
        />
        <Input
          label="Compania"
          placeholder="ex: SC Exemplu SRL"
          value={form.company}
          onChange={(e) => set("company", e.target.value)}
        />
        <Input
          label="Perioada"
          placeholder="ex: 2021 – prezent"
          value={form.period}
          onChange={(e) => set("period", e.target.value)}
        />
        <Input
          label="Localitatea"
          placeholder="ex: Cluj-Napoca"
          value={form.location}
          onChange={(e) => set("location", e.target.value)}
        />
      </div>
      <Textarea
        label="Responsabilități (una pe rând)"
        value={manualText}
        onChange={(e) => setManualText(e.target.value)}
        placeholder={"Gestionat facturile lunare\nCoordonat echipa de 3 colegi\n…"}
        rows={6}
      />
      <div className="flex gap-3 mt-10">
        <Button variant="outline" onClick={() => setPhase("input")} className="flex-1" icon={<ArrowLeft className="w-4 h-4" />}>
          Înapoi la AI
        </Button>
        <Button
          onClick={() =>
            saveEntry(
              manualText
                .split("\n")
                .map((l) => l.trim())
                .filter(Boolean)
            )
          }
          size="lg"
          className="flex-[2]"
          disabled={form.title.trim().length < 2 || manualText.trim().length < 3}
          iconRight={<ArrowRight className="w-4 h-4" />}
        >
          Salvează jobul
        </Button>
      </div>
    </StepCard>
  );
}
