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
import { useMessages, useLocale } from "@/lib/i18n/context";
import { STEP_EXPERIENCE_MESSAGES } from "@/lib/i18n/wizard/step-experience";

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
function LoadingPanel({ messages, hint }: { messages: string[]; hint: string }) {
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
  const t = useMessages(STEP_EXPERIENCE_MESSAGES);
  const locale = useLocale();
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
          period: buildPeriod(form, locale) || undefined,
          rawText: form.rawText.trim(),
          jobDescription: jobDescription?.trim() || undefined,
          wizardSessionId: sessionId,
          language: locale,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t.errors.analyzeFailed);
      pipelineIdRef.current = data.sessionId;
      setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(""));
      setPhase("questions");
    } catch (e) {
      setError(e instanceof Error ? e.message : t.errors.analyzeFailed);
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
        body: JSON.stringify({ sessionId: pid, answers: answerPayload, force, language: locale }),
      });
      const genData = await gen.json();
      if (!gen.ok) throw new Error(genData.error ?? t.errors.generateFailed);

      setBullets(genData.bullets);
      setSelectedIds(new Set());
      setPhase("select");
    } catch (e) {
      setError(e instanceof Error ? e.message : t.errors.generateFailed);
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
        body: JSON.stringify({ sessionId: pid, selectedIds: ids, language: locale }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t.errors.selectionSaveFailed);

      saveEntry(
        (data.selected as GeneratedBullet[]).map((b) => b.text)
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : t.errors.saveFailed);
    }
  }

  /* ── helpers ───────────────────────────────────────────────── */

  function saveEntry(responsibilities: string[]) {
    const entry: Experience = {
      title: form.title.trim(),
      company: form.company.trim() || "—",
      period: buildPeriod(form, locale),
      location: form.location.trim() || undefined,
      responsibilities,
      achievements: [],
    };
    onUpdate([...experience, entry]);
    toast.success(t.toasts.jobAdded);
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
        kicker={t.summary.kicker}
        title={t.summary.title}
        subtitle={t.summary.subtitle}
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
                  aria-label={t.summary.deleteAria(exp.title)}
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
                        ariaLabel={t.summary.editAria(j + 1, exp.title)}
                      />
                    </li>
                  ))}
                </ul>
              )}
              {exp.responsibilities.length > 0 && (
                <p style={{ fontSize: 11.5, color: "var(--faint)", margin: "10px 0 0" }}>
                  {t.summary.editHint}
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
            {experience.length === 0 ? t.summary.addFirst : t.summary.addAnother}
          </button>
        </div>

        <div className="flex gap-3" style={{ marginTop: 32 }}>
          <Button variant="outline" onClick={onBack} className="flex-1">
            {t.summary.back}
          </Button>
          <Button
            onClick={onNext}
            size="lg"
            className="flex-[2]"
            disabled={experience.length === 0}
            iconRight={<ArrowRight className="w-4 h-4" />}
          >
            {t.summary.next}
          </Button>
        </div>
      </StepCard>
    );
  }

  /* ── ECRAN 1: input ────────────────────────────────────────── */
  if (phase === "input" || phase === "analyzing") {
    if (phase === "analyzing")
      return (
        <StepCard kicker={t.input.kicker} title={t.input.analyzingTitle}>
          <LoadingPanel messages={t.loading.analyze} hint={t.loading.hint} />
        </StepCard>
      );

    return (
      <StepCard
        kicker={t.input.kicker}
        title={t.input.title}
        subtitle={t.input.subtitle}
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
              {t.input.anchoredBadge}
            </span>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginBottom: 18 }}>
          <Input
            label={t.input.jobTitleLabel}
            placeholder={t.input.jobTitlePlaceholder}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            onBlur={() => correctField("title")}
          />
          <Input
            label={t.input.companyLabel}
            placeholder={t.input.companyPlaceholder}
            value={form.company}
            onChange={(e) => set("company", e.target.value)}
          />
        </div>

        <PeriodPicker value={form} onChange={set} />

        <div style={{ marginBottom: 18 }}>
          <Input
            label={t.input.locationLabel}
            placeholder={t.input.locationPlaceholder}
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            onBlur={() => correctField("location")}
          />
        </div>

        <Textarea
          label={t.input.rawTextLabel}
          value={form.rawText}
          onChange={(e) => set("rawText", e.target.value)}
          placeholder={t.input.rawTextPlaceholder}
          rows={7}
          hint={t.input.rawTextHint}
        />

        <div className="flex gap-3" style={{ marginTop: 32 }}>
          <Button
            variant="outline"
            onClick={() => (experience.length > 0 ? setPhase("summary") : onBack())}
            className="flex-1"
          >
            {t.input.back}
          </Button>
          <Button
            onClick={runAnalyze}
            size="lg"
            className="flex-[2]"
            disabled={!canAnalyze}
            iconRight={<ArrowRight className="w-4 h-4" />}
          >
            {t.input.analyze}
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
          {t.input.manualLink}
        </button>
      </StepCard>
    );
  }

  /* ── ECRAN 2: întrebările ──────────────────────────────────── */
  if (phase === "questions" || phase === "generating") {
    if (phase === "generating")
      return (
        <StepCard kicker={t.questions.kicker} title={t.questions.generatingTitle}>
          <LoadingPanel messages={t.loading.generate} hint={t.loading.generateHint} />
        </StepCard>
      );

    return (
      <StepCard
        kicker={t.questions.kicker}
        title={t.questions.title}
        subtitle={t.questions.subtitle}
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
            {t.questions.progress(answeredCount, questions.length)}
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
                placeholder={t.questions.answerPlaceholder}
                rows={2}
                style={{ marginLeft: 0 }}
              />
            </div>
          ))}
        </div>

        <div className="flex gap-3" style={{ marginTop: 32 }}>
          <Button variant="outline" onClick={() => setPhase("input")} className="flex-1">
            {t.questions.back}
          </Button>
          <Button
            onClick={() => runGenerate()}
            size="lg"
            className="flex-[2]"
            disabled={answeredCount < 3}
            iconRight={<ArrowRight className="w-4 h-4" />}
          >
            {answeredCount < 3 ? t.questions.answerMin(answeredCount) : t.questions.generate}
          </Button>
        </div>
      </StepCard>
    );
  }

  /* ── ECRAN 3: selecția bullet-urilor ───────────────────────── */
  if (phase === "select") {
    return (
      <StepCard
        kicker={t.select.kicker}
        title={t.select.title}
        subtitle={t.select.subtitle(minSelect)}
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
            {t.select.generatedCount(bullets.length)}
          </span>
          <span
            style={{
              fontSize: 13.5,
              fontWeight: 600,
              color: canFinishSelect ? "var(--color-success,#3d7a4e)" : "var(--muted-foreground)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {t.select.chosen(selectedIds.size, minSelect)}
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
            {t.select.regenerate}
          </Button>
          <Button
            onClick={finishSelection}
            size="lg"
            className="flex-[2]"
            disabled={!canFinishSelect}
            iconRight={<ArrowRight className="w-4 h-4" />}
          >
            {canFinishSelect ? t.select.finish : t.select.chooseMin(minSelect)}
          </Button>
        </div>
      </StepCard>
    );
  }

  /* ── ECRAN: mod manual (fallback) ──────────────────────────── */
  return (
    <StepCard
      kicker={t.manual.kicker}
      title={t.manual.title}
      subtitle={t.manual.subtitle}
    >
      {ErrorCard}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginBottom: 18 }}>
        <Input
          label={t.manual.jobTitleLabel}
          placeholder={t.manual.jobTitlePlaceholder}
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          onBlur={() => correctField("title")}
        />
        <Input
          label={t.manual.companyLabel}
          placeholder={t.manual.companyPlaceholder}
          value={form.company}
          onChange={(e) => set("company", e.target.value)}
        />
      </div>
      <PeriodPicker value={form} onChange={set} />
      <div style={{ marginBottom: 18 }}>
        <Input
          label={t.manual.locationLabel}
          placeholder={t.manual.locationPlaceholder}
          value={form.location}
          onChange={(e) => set("location", e.target.value)}
          onBlur={() => correctField("location")}
        />
      </div>
      <Textarea
        label={t.manual.responsibilitiesLabel}
        value={manualText}
        onChange={(e) => setManualText(e.target.value)}
        placeholder={t.manual.responsibilitiesPlaceholder}
        rows={6}
      />
      <p style={{ fontSize: 12.5, color: "var(--muted-foreground)", marginTop: 6 }}>
        {t.manual.rewriteNote}
      </p>
      <div className="flex gap-3" style={{ marginTop: 26 }}>
        <Button variant="outline" onClick={() => setPhase("input")} className="flex-1" icon={<ArrowLeft className="w-4 h-4" />}>
          {t.manual.backToAi}
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
                toast.info(t.toasts.manualNotRewritten);
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
          {t.manual.save}
        </Button>
      </div>
    </StepCard>
  );
}
