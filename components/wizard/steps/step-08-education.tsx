"use client";
import { useState } from "react";
import { StepCard } from "../step-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PeriodPicker, EMPTY_PERIOD, buildPeriod, YEARS, MONTHS } from "../period-picker";
import { GraduationCap, Plus, Pencil, Trash2, X, ArrowRight, GripVertical } from "lucide-react";
import type { Education, Course } from "@/lib/types/cv";
import { toast } from "sonner";
import { useLocale, useMessages } from "@/lib/i18n/context";
import { STEP_EDUCATION_MESSAGES } from "@/lib/i18n/wizard/step-education";

// ordinea reflectă publicul aplicației: nivelurile frecvente primele
// (lista cu value/label stă în STEP_EDUCATION_MESSAGES — valoarea salvată rămâne în română)

const EMPTY = {
  level: "", institution: "", field: "", location: "", thesis: "", grade: "",
  ...EMPTY_PERIOD,
};

/** Reconstruiește dropdown-urile din textul salvat („septembrie 2016 – 2019"). */
function parsePeriod(years: string): typeof EMPTY_PERIOD {
  const v = { ...EMPTY_PERIOD };
  const [startRaw = "", endRaw = ""] = years.split("–").map((s) => s.trim());
  const pick = (raw: string) => {
    const year = YEARS.find((y) => raw.includes(y)) ?? "";
    const month = MONTHS.find((m) => raw.toLowerCase().includes(m)) ?? "";
    return { year, month };
  };
  const s = pick(startRaw);
  v.startYear = s.year;
  v.startMonth = s.month;
  if (/prezent/i.test(endRaw) || !endRaw) {
    v.endYear = "Prezent";
  } else {
    const e = pick(endRaw);
    v.endYear = e.year || "Prezent";
    v.endMonth = e.month;
  }
  return v;
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 13, fontWeight: 600, color: "var(--foreground)", marginBottom: 6,
};

interface Props {
  sessionId: string;
  education: Education[];
  courses: Course[];
  onUpdate: (education: Education[], courses: Course[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step08Education({ education, courses, onUpdate, onNext, onBack }: Props) {
  const t = useMessages(STEP_EDUCATION_MESSAGES);
  const locale = useLocale();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [courseForm, setCourseForm] = useState({ name: "", provider: "", year: "" });

  const set = (field: string, val: string) => setForm(prev => ({ ...prev, [field]: val }));

  const addCourse = () => {
    if (!courseForm.name.trim()) return;
    onUpdate(education, [
      ...courses,
      {
        name: courseForm.name.trim(),
        provider: courseForm.provider.trim() || undefined,
        year: courseForm.year.trim() || undefined,
      },
    ]);
    setCourseForm({ name: "", provider: "", year: "" });
  };

  const openAdd = () => {
    setForm({ ...EMPTY });
    setEditIdx(null);
    setDialogOpen(true);
  };

  const openEdit = (i: number) => {
    const e = education[i];
    setForm({
      level: e.level,
      institution: e.institution,
      field: e.field,
      location: e.location ?? "",
      thesis: e.thesis ?? "",
      grade: e.grade ?? "",
      ...parsePeriod(e.years),
    });
    setEditIdx(i);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.level) { toast.error(t.toasts.levelRequired); return; }
    if (!form.institution.trim()) { toast.error(t.toasts.institutionRequired); return; }
    if (!form.startYear) { toast.error(t.toasts.startYearRequired); return; }

    const entry: Education = {
      level: form.level,
      institution: form.institution.trim(),
      field: form.field.trim(),
      years: buildPeriod(form, locale),
      location: form.location.trim() || undefined,
      thesis: form.thesis.trim() || undefined,
      grade: form.grade.trim() || undefined,
    };

    if (editIdx !== null) {
      const updated = [...education];
      updated[editIdx] = entry;
      onUpdate(updated, courses);
      toast.success(t.toasts.saved);
    } else {
      onUpdate([...education, entry], courses);
      toast.success(t.toasts.added);
    }
    setDialogOpen(false);
  };

  const handleDelete = (i: number) => {
    onUpdate(education.filter((_, idx) => idx !== i), courses);
    toast.success(t.toasts.deleted);
  };

  return (
    <>
      <StepCard
        title={t.title}
        subtitle={t.subtitle}
        icon={<GraduationCap className="w-5 h-5" />}
      >
        {/* Education list */}
        {education.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {education.map((e, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 14px", borderRadius: 10,
                border: "1px solid var(--hairline)", backgroundColor: "var(--muted)",
              }}>
                <GripVertical size={16} color="var(--faint)" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink-strong)" }}>
                    {e.level}{e.field ? ` — ${e.field}` : ""}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--muted-foreground)", marginTop: 2 }}>
                    {e.institution}{e.location ? ` · ${e.location}` : ""} · {e.years}
                  </div>
                  {(e.grade || e.thesis) && (
                    <div style={{ fontSize: 12, color: "var(--faint)", marginTop: 2 }}>
                      {e.grade && t.list.grade(e.grade)}
                      {e.grade && e.thesis && " · "}
                      {e.thesis && t.list.thesis(e.thesis)}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => openEdit(i)}
                  style={{ padding: 6, borderRadius: 6, border: "1px solid var(--hairline)", backgroundColor: "var(--card)", cursor: "pointer", display: "flex", alignItems: "center", flexShrink: 0 }}
                >
                  <Pencil size={14} color="var(--muted-foreground)" />
                </button>
                <button
                  onClick={() => handleDelete(i)}
                  data-testid="btn-delete-edu"
                  style={{ padding: 6, borderRadius: 6, border: "1px solid #FEE2E2", backgroundColor: "#FFF5F5", cursor: "pointer", display: "flex", alignItems: "center", flexShrink: 0 }}
                >
                  <Trash2 size={14} color="#EF4444" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add button */}
        <button
          onClick={openAdd}
          data-testid="btn-add-education"
          style={{
            width: "100%", padding: "13px", borderRadius: 10,
            border: "2px dashed var(--faint)", backgroundColor: "transparent",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8, color: "var(--muted-foreground)", fontSize: 14, fontWeight: 500, marginBottom: 20,
          }}
        >
          <Plus size={16} />
          {t.addEducation}
        </button>

        {/* Cursuri & certificări — atestate, cursuri de calificare ANC etc. */}
        <div
          style={{
            border: "1px dashed var(--input-border)",
            borderRadius: 10,
            padding: "16px 16px 18px",
            marginBottom: 20,
          }}
        >
          <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>
            {t.courses.title} <span style={{ color: "var(--faint)", fontWeight: 400 }}>{t.courses.optional}</span>
          </p>
          <p style={{ fontSize: 12.5, color: "var(--muted-foreground)", marginBottom: 12 }}>
            {t.courses.intro}
          </p>

          {courses.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
              {courses.map((c, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                    padding: "9px 12px", borderRadius: 8,
                    border: "1px solid var(--hairline)", backgroundColor: "var(--muted)",
                  }}
                >
                  <span style={{ fontSize: 13.5, color: "var(--ink)", minWidth: 0 }}>
                    <span style={{ fontWeight: 600 }}>{c.name}</span>
                    {c.provider ? ` · ${c.provider}` : ""}
                    {c.year ? ` (${c.year})` : ""}
                  </span>
                  <button
                    onClick={() => onUpdate(education, courses.filter((_, idx) => idx !== i))}
                    aria-label={t.courses.deleteCourse(c.name)}
                    style={{ padding: 5, borderRadius: 6, border: "1px solid #FEE2E2", backgroundColor: "#FFF5F5", cursor: "pointer", display: "flex", flexShrink: 0 }}
                  >
                    <Trash2 size={13} color="#EF4444" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* pe mobil câmpurile stau unul sub altul, cu etichete vizibile —
              nimeni nu mai ghicește ce se completează în fiecare căsuță */}
          <div className="course-form-grid">
            <Input
              label={t.courses.nameLabel}
              placeholder={t.courses.namePlaceholder}
              value={courseForm.name}
              onChange={(e) => setCourseForm((p) => ({ ...p, name: e.target.value }))}
            />
            <Input
              label={t.courses.providerLabel}
              placeholder={t.courses.providerPlaceholder}
              value={courseForm.provider}
              onChange={(e) => setCourseForm((p) => ({ ...p, provider: e.target.value }))}
            />
            <Input
              label={t.courses.yearLabel}
              placeholder={t.courses.yearPlaceholder}
              inputMode="numeric"
              value={courseForm.year}
              onChange={(e) => setCourseForm((p) => ({ ...p, year: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
            />
          </div>
          <Button
            variant="outline"
            onClick={addCourse}
            disabled={!courseForm.name.trim()}
            icon={<Plus className="w-4 h-4" />}
            style={{ width: "100%" }}
          >
            {t.courses.addCourse}
          </Button>
          {!courseForm.name.trim() && (
            <p style={{ fontSize: 12, color: "var(--faint)", marginTop: 8, textAlign: "center" }}>
              {t.courses.addCourseHint}
            </p>
          )}
        </div>

        {education.length === 0 && (
          <p style={{ fontSize: 13, color: "var(--faint)", textAlign: "center", marginBottom: 4 }}>
            {t.skipHint}
          </p>
        )}

        <div style={{ display: "flex", gap: 12 }}>
          <Button variant="outline" onClick={onBack} style={{ flex: 1 }}>{t.back}</Button>
          <Button onClick={onNext} style={{ flex: 2 }}>
            {education.length > 0 || courses.length > 0 ? t.continue : t.skip} <ArrowRight size={16} />
          </Button>
        </div>
      </StepCard>

      {/* Dialog overlay */}
      {dialogOpen && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            backgroundColor: "rgba(15,23,42,0.55)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setDialogOpen(false); }}
        >
          <div style={{
            backgroundColor: "var(--card)", borderRadius: 16,
            width: "100%", maxWidth: 540, maxHeight: "90vh",
            overflowY: "auto", padding: "28px 28px 24px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}>
            {/* Dialog header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--ink-strong)", margin: 0 }}>
                {editIdx !== null ? t.dialog.editTitle : t.dialog.addTitle}
              </h2>
              <button
                onClick={() => setDialogOpen(false)}
                style={{ padding: 6, borderRadius: 8, border: "none", backgroundColor: "var(--muted)", cursor: "pointer", display: "flex" }}
              >
                <X size={18} color="var(--muted-foreground)" />
              </button>
            </div>

            {/* Level dropdown */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>{t.dialog.levelLabel}</label>
              <div style={{ position: "relative" }}>
                <select
                  value={form.level}
                  onChange={(e) => set("level", e.target.value)}
                  style={{
                    width: "100%", padding: "12px 36px 12px 16px", fontSize: 14,
                    borderRadius: 8, border: "1px solid var(--hairline)",
                    backgroundColor: "var(--card)", color: form.level ? "var(--ink-strong)" : "var(--faint)",
                    outline: "none", appearance: "none", cursor: "pointer",
                  }}
                >
                  <option value="" disabled>{t.dialog.levelPlaceholder}</option>
                  {t.levels.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
                <svg style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>

            {/* Field of study */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>{t.dialog.fieldLabel}</label>
              <Input
                value={form.field}
                onChange={(e) => set("field", e.target.value)}
                placeholder={t.dialog.fieldPlaceholder}
              />
            </div>

            {/* Institution + Location */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>{t.dialog.institutionLabel}</label>
                <Input
                  value={form.institution}
                  onChange={(e) => set("institution", e.target.value)}
                  placeholder={t.dialog.institutionPlaceholder}
                />
              </div>
              <div>
                <label style={labelStyle}>{t.dialog.locationLabel}</label>
                <Input
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                  placeholder={t.dialog.locationPlaceholder}
                />
              </div>
            </div>

            {/* Period — dropdown-uri an + lună opțională, „Prezent" prima opțiune */}
            <PeriodPicker
              value={form}
              onChange={set}
              fromLabel={t.dialog.fromLabel}
              toLabel={t.dialog.toLabel}
            />

            {/* Thesis + Grade */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
              <div>
                <label style={labelStyle}>
                  {t.dialog.thesisLabel}{" "}
                  <span style={{ color: "var(--faint)", fontWeight: 400 }}>{t.dialog.optional}</span>
                </label>
                <Input
                  value={form.thesis}
                  onChange={(e) => set("thesis", e.target.value)}
                  placeholder={t.dialog.thesisPlaceholder}
                />
              </div>
              <div>
                <label style={labelStyle}>
                  {t.dialog.gradeLabel}{" "}
                  <span style={{ color: "var(--faint)", fontWeight: 400 }}>{t.dialog.optional}</span>
                </label>
                <Input
                  value={form.grade}
                  onChange={(e) => set("grade", e.target.value)}
                  placeholder={t.dialog.gradePlaceholder}
                />
              </div>
            </div>

            {/* Dialog actions */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setDialogOpen(false)}
                style={{
                  flex: 1, padding: "11px", borderRadius: 8,
                  border: "1px solid var(--hairline)", backgroundColor: "var(--card)",
                  fontSize: 14, fontWeight: 500, color: "var(--muted-foreground)", cursor: "pointer",
                }}
              >
                {t.dialog.cancel}
              </button>
              <button
                onClick={handleSave}
                data-testid="btn-save-education"
                style={{
                  flex: 2, padding: "11px", borderRadius: 8,
                  border: "none", backgroundColor: "var(--primary)",
                  fontSize: 14, fontWeight: 600, color: "#fff", cursor: "pointer",
                }}
              >
                {editIdx !== null ? t.dialog.saveChanges : t.dialog.add}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
