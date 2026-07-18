"use client";
import { useEffect, useRef, useState } from "react";
import { StepCard } from "../step-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PeriodPicker, buildPeriod } from "../period-picker";
import { ArrowRight, ArrowLeft, Plus, Trash2, RefreshCcw } from "lucide-react";
import type { Experience } from "@/lib/types/cv";
import type { GeneratedBullet, PipelineQuestion } from "@/lib/types/cv-pipeline";
import { correctText, nominalizeBullets } from "@/lib/correct-text";
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

const EMPTY_FORM = {
  title: "",
  company: "",
  startYear: "",
  startMonth: "",
  endYear: "Prezent",
  endMonth: "",
  location: "",
  rawText: "",
};

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

function LoadingPanel({ messages, hint = "durează câteva zeci de secunde" }: { messages: string[]; hint?: string }) {
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
      <p style={{ fontSize: 13, color: "var(--faint)", marginTop: 10 }}>{hint}</p>
    </div>
  );
}


/** Text editabil direct în chenar — arată ca text simplu, dar userul poate
 *  șterge/scrie; crește pe verticală odată cu conținutul. */
function InlineEditableText({
  value,
  onChange,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  ariaLabel: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
      rows={1}
      spellCheck={false}
      style={{
        width: "100%",
        border: "1px solid transparent",
        borderRadius: 6,
        background: "transparent",
        resize: "none",
        overflow: "hidden",
        font: "inherit",
        fontSize: 13.5,
        lineHeight: 1.55,
        color: "var(--foreground)",
        padding: "2px 6px",
        margin: "-2px -6px",
        transition: "border-color 0.15s, background-color 0.15s",
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "var(--input-border)";
        e.currentTarget.style.backgroundColor = "var(--card)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "transparent";
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    />
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
  const [savingManual, setSavingManual] = useState(false);

  const hasJD = Boolean(jobDescription?.trim());
  const set = (field: keyof typeof EMPTY_FORM, val: string) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  // corectare AI ieftină (gramatică + diacritice) la părăsirea câmpului
  const correctField = async (field: "title" | "location") => {
    const current = form[field].trim();
    if (current.length < 2) return;
    const corrected = await correctText(
      current,
      field === "title" ? "job-title" : "city"
    );
    if (corrected !== current) {
      setForm((prev) =>
        // aplicăm doar dacă userul nu a modificat textul între timp
        prev[field].trim() === current ? { ...prev, [field]: corrected } : prev
      );
    }
  };

  const canAnalyze =
    form.title.trim().length > 1 && form.rawText.trim().length > 0;
  const answeredCount = answers.filter((a) => a.trim().length > 0).length;

  // minim 3 bifate, fără limită superioară — userul poate alege toate
  const minSelect = Math.min(3, bullets.length);
  const canFinishSelect = selectedIds.size >= minSelect;

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
          period: buildPeriod(form) || undefined,
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
      period: buildPeriod(form),
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
      else next.add(id);
      return next;
    });
  }

  /** Editare inline a unei descrieri dintr-un job salvat — fără buton de
   *  save: ultima versiune merge automat în live view și în PDF. */
  function editResponsibility(expIdx: number, respIdx: number, text: string) {
    onUpdate(
      experience.map((exp, i) =>
        i === expIdx
          ? {
              ...exp,
              responsibilities: exp.responsibilities.map((r, j) =>
                j === respIdx ? text : r
              ),
            }
          : exp
      )
    );
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
                      {/* editabil direct — ultima versiune intră automat în CV și în preview */}
                      <InlineEditableText
                        value={r}
                        onChange={(text) => editResponsibility(i, j, text)}
                        ariaLabel={`Editează descrierea ${j + 1} de la ${exp.title}`}
                      />
                    </li>
                  ))}
                </ul>
              )}
              {exp.responsibilities.length > 0 && (
                <p style={{ fontSize: 11.5, color: "var(--faint)", margin: "10px 0 0" }}>
                  Poți edita descrierile direct — se salvează automat în CV.
                </p>
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
            {experience.length === 0
              ? "Adaugă experiența de la cel mai recent job"
              : "Adaugă experiența de la jobul precedent"}
          </button>
        </div>

        <div className="flex gap-3" style={{ marginTop: 32 }}>
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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginBottom: 18 }}>
          <Input
            label="Funcția / titlul jobului *"
            placeholder="ex: Contabil"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            onBlur={() => correctField("title")}
          />
          <Input
            label="Compania"
            placeholder="ex: SC Exemplu SRL"
            value={form.company}
            onChange={(e) => set("company", e.target.value)}
          />
        </div>

        <PeriodPicker value={form} onChange={set} />

        <div style={{ marginBottom: 18 }}>
          <Input
            label="Localitatea"
            placeholder="ex: Cluj-Napoca"
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            onBlur={() => correctField("location")}
          />
        </div>

        <Textarea
          label="Ce faci acolo, cu cuvintele tale? *"
          value={form.rawText}
          onChange={(e) => set("rawText", e.target.value)}
          placeholder="Descrie cu cuvintele tale ce faci la job, ca și cum i-ai povesti unui prieten. Nu-ți face griji de formulare."
          rows={7}
          hint="Cu cât povestești mai mult, cu atât descrierile generate vor fi mai bune."
        />

        <div className="flex gap-3" style={{ marginTop: 32 }}>
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
          <LoadingPanel messages={GENERATE_MESSAGES} hint="poate dura până la un minut — scriem cu grijă" />
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

        <div className="flex gap-3" style={{ marginTop: 32 }}>
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
        subtitle={`Toate sunt ancorate strict în ce ne-ai spus — nimic inventat. Alege minim ${minSelect}; poți bifa toate dacă ți se potrivesc.`}
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
            Ai ales {selectedIds.size} (minim {minSelect})
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

        <div className="flex gap-3" style={{ marginTop: 32 }}>
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
              ? "Finalizează"
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginBottom: 18 }}>
        <Input
          label="Funcția *"
          placeholder="ex: Contabil"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          onBlur={() => correctField("title")}
        />
        <Input
          label="Compania"
          placeholder="ex: SC Exemplu SRL"
          value={form.company}
          onChange={(e) => set("company", e.target.value)}
        />
      </div>
      <PeriodPicker value={form} onChange={set} />
      <div style={{ marginBottom: 18 }}>
        <Input
          label="Localitatea"
          placeholder="ex: Cluj-Napoca"
          value={form.location}
          onChange={(e) => set("location", e.target.value)}
          onBlur={() => correctField("location")}
        />
      </div>
      <Textarea
        label="Responsabilități (una pe rând)"
        value={manualText}
        onChange={(e) => setManualText(e.target.value)}
        placeholder={"Coordonarea unei echipe de 3 colegi\nGestionarea facturilor lunare\n…"}
        rows={6}
      />
      <p style={{ fontSize: 12.5, color: "var(--muted-foreground)", marginTop: 6 }}>
        Le rescriem automat în stil profesionist de CV la salvare.
      </p>
      <div className="flex gap-3" style={{ marginTop: 26 }}>
        <Button variant="outline" onClick={() => setPhase("input")} className="flex-1" icon={<ArrowLeft className="w-4 h-4" />}>
          Înapoi la AI
        </Button>
        <Button
          onClick={async () => {
            const lines = manualText
              .split("\n")
              .map((l) => l.trim())
              .filter(Boolean);
            setSavingManual(true);
            try {
              // rescriem în formă nominală de CV („Coordonat…" → „Coordonarea…")
              // — atomic: ori toate liniile, ori păstrăm exact ce a scris userul
              const result = await nominalizeBullets(lines);
              if (!result.rewritten) {
                toast.info("Nu am putut rescrie descrierile acum — textul tău a fost păstrat exact cum l-ai scris.");
              }
              saveEntry(result.lines);
            } finally {
              setSavingManual(false);
            }
          }}
          size="lg"
          className="flex-[2]"
          loading={savingManual}
          disabled={form.title.trim().length < 2 || manualText.trim().length < 3}
          iconRight={<ArrowRight className="w-4 h-4" />}
        >
          Salvează jobul
        </Button>
      </div>
    </StepCard>
  );
}
