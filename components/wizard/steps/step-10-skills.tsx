"use client";
import { useState, useEffect } from "react";
import { StepCard } from "../step-card";
import { Button } from "@/components/ui/button";
import { Star, ArrowRight, Plus, X, Loader2 } from "lucide-react";
import type { Skill, CVData } from "@/lib/types/cv";
import { useMessages, useLocale } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/locale";
import { STEP_SKILLS_MESSAGES } from "@/lib/i18n/wizard/step-skills";

interface SkillPool {
  hardSkills: string[];
  softwareTools: string[];
  softSkills: string[];
}

const SECTIONS = [
  {
    key: "hardSkills" as const,
    testId: "section-hard",
    recommended: "4–6",
    min: 4,
    max: 6,
  },
  {
    key: "softwareTools" as const,
    testId: "section-software",
    recommended: "3–4",
    min: 3,
    max: 4,
  },
  {
    key: "softSkills" as const,
    testId: "section-soft",
    recommended: "2–3",
    min: 2,
    max: 3,
  },
] as const;

interface Props {
  sessionId: string;
  cvData: CVData;
  /** anunțul de la Pasul 1 — abilitățile se aliniază la cerințele lui */
  jobDescription?: string;
  skills: Skill[];
  onUpdate: (skills: Skill[]) => void;
  onNext: () => void;
  onBack: () => void;
}

/** Cache-ul listei generate — lista NU se regenerează la fiecare vizită pe
 *  pas, ci doar când se schimbă experiența/anunțul sau la „Începe de la zero".
 *  Bifele userului se păstrează și ele. */
export const SKILLS_CACHE_KEY = "cv-smart-skills-cache";

/** Amprenta datelor din care se generează lista: experiența + anunțul.
 *  Dacă amprenta nu se schimbă, lista veche rămâne valabilă. */
function skillsFingerprint(cvData: CVData, jobDescription?: string): string {
  const src =
    (cvData.experience ?? [])
      .map((e) => [e.title, e.company, ...(e.responsibilities ?? [])].join("|"))
      .join("||") +
    "##" +
    (jobDescription ?? "").trim();
  let h = 0;
  for (let i = 0; i < src.length; i++) h = (h * 31 + src.charCodeAt(i)) | 0;
  return String(h);
}

interface SkillsCache {
  fingerprint: string;
  pool: SkillPool;
  selectedHard: string[];
  selectedSoftware: string[];
  selectedSoft: string[];
  custom: string[];
}

/** Deduplicare la nivel de modul: două montări simultane (StrictMode în dev,
 *  dublu-click etc.) împart UN SINGUR apel AI pentru aceeași amprentă. */
const inflightSkills = new Map<string, Promise<SkillPool>>();

function fetchSkillsOnce(
  fingerprint: string,
  body: { cvData: CVData; jobDescription?: string; sessionId: string; language: Locale }
): Promise<SkillPool> {
  const existing = inflightSkills.get(fingerprint);
  if (existing) return existing;
  const req = fetch("/api/ai/generate-skills", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
    .then(async (res) => {
      if (!res.ok) throw new Error();
      return (await res.json()) as SkillPool;
    })
    .finally(() => {
      inflightSkills.delete(fingerprint);
    });
  inflightSkills.set(fingerprint, req);
  return req;
}

export function Step10Skills({ sessionId, cvData, jobDescription, onUpdate, onNext, onBack }: Props) {
  const t = useMessages(STEP_SKILLS_MESSAGES);
  const locale = useLocale();
  const [phase, setPhase] = useState<"loading" | "selection">("loading");
  const [loadError, setLoadError] = useState(false);
  const [pool, setPool] = useState<SkillPool>({ hardSkills: [], softwareTools: [], softSkills: [] });
  const [selectedHard, setSelectedHard] = useState<Set<string>>(new Set());
  const [selectedSoftware, setSelectedSoftware] = useState<Set<string>>(new Set());
  const [selectedSoft, setSelectedSoft] = useState<Set<string>>(new Set());
  const [customSkills, setCustomSkills] = useState<string[]>([]);
  const [manualInput, setManualInput] = useState("");
  const [isFormatting, setIsFormatting] = useState(false);

  const selectionSets = { hardSkills: selectedHard, softwareTools: selectedSoftware, softSkills: selectedSoft };
  const setters = { hardSkills: setSelectedHard, softwareTools: setSelectedSoftware, softSkills: setSelectedSoft };
  const fingerprint = skillsFingerprint(cvData, jobDescription);

  const loadSkills = () => {
    setPhase("loading");
    setLoadError(false);
    // anunțul + sessionId (pentru cuvintele-cheie ATS din research)
    fetchSkillsOnce(fingerprint, {
      cvData,
      jobDescription: jobDescription?.trim() || undefined,
      sessionId,
      language: locale,
    })
      .then((data: SkillPool) => {
        setPool(data);
        // dacă userul avea deja abilități salvate în CV, le rebifăm pe cele
        // care există și în noua listă (restul devin „adăugate manual")
        const saved = new Set((cvData.skills ?? []).map((s) => s.name));
        if (saved.size > 0) {
          setSelectedHard(new Set(data.hardSkills.filter((s) => saved.has(s))));
          setSelectedSoftware(new Set(data.softwareTools.filter((s) => saved.has(s))));
          setSelectedSoft(new Set(data.softSkills.filter((s) => saved.has(s))));
          // ce era salvat dar nu apare în noua listă rămâne ca „adăugat manual"
          const inPool = new Set([...data.hardSkills, ...data.softwareTools, ...data.softSkills]);
          setCustomSkills([...saved].filter((n) => !inPool.has(n)));
        }
        setPhase("selection");
      })
      .catch(() => {
        // fără dicționare generice: arătăm eroarea și butonul de reîncercare
        setLoadError(true);
        setPhase("selection");
      });
  };

  useEffect(() => {
    // 1) există o listă generată pentru EXACT aceleași date? → o refolosim
    //    (zero apeluri AI, bifele rămân cum le-a lăsat userul)
    try {
      const raw = localStorage.getItem(SKILLS_CACHE_KEY);
      if (raw) {
        const c = JSON.parse(raw) as SkillsCache;
        if (c.fingerprint === fingerprint && c.pool?.hardSkills?.length) {
          setPool(c.pool);
          setSelectedHard(new Set(c.selectedHard ?? []));
          setSelectedSoftware(new Set(c.selectedSoftware ?? []));
          setSelectedSoft(new Set(c.selectedSoft ?? []));
          setCustomSkills(c.custom ?? []);
          setPhase("selection");
          return;
        }
      }
    } catch {
      // cache corupt — regenerăm
    }
    // 2) date noi (experiență/anunț schimbate sau prima vizită) → generăm
    loadSkills();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // orice schimbare (listă generată, bife, manuale) se salvează în cache
  useEffect(() => {
    if (phase !== "selection" || pool.hardSkills.length === 0) return;
    try {
      const cache: SkillsCache = {
        fingerprint,
        pool,
        selectedHard: [...selectedHard],
        selectedSoftware: [...selectedSoftware],
        selectedSoft: [...selectedSoft],
        custom: customSkills,
      };
      localStorage.setItem(SKILLS_CACHE_KEY, JSON.stringify(cache));
    } catch {
      // storage plin — nu blocăm
    }
  }, [phase, pool, selectedHard, selectedSoftware, selectedSoft, customSkills, fingerprint]);

  const toggleSkill = (key: "hardSkills" | "softwareTools" | "softSkills", skill: string) => {
    const next = new Set(selectionSets[key]);
    if (next.has(skill)) next.delete(skill); else next.add(skill);
    setters[key](next);
  };

  const handleAddManual = async () => {
    const trimmed = manualInput.trim();
    if (!trimmed) return;
    setIsFormatting(true);
    setManualInput("");
    try {
      const res = await fetch("/api/ai/format-skill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill: trimmed, language: locale }),
      });
      const { corrected } = await res.json();
      setCustomSkills((prev) => [...prev, corrected || trimmed]);
    } catch {
      setCustomSkills((prev) => [...prev, trimmed]);
    } finally {
      setIsFormatting(false);
    }
  };

  const handleContinue = () => {
    const built: Skill[] = [
      ...[...selectedHard].map((name) => ({ name, category: "hard" as const })),
      ...[...selectedSoftware].map((name) => ({ name, category: "software" as const })),
      ...[...selectedSoft].map((name) => ({ name, category: "soft" as const })),
      ...customSkills.map((name) => ({ name, category: "hard" as const })),
    ];
    onUpdate(built);
    onNext();
  };

  const counterColor = (count: number, min: number, max: number) => {
    if (count >= min && count <= max) return "#15803D";
    if (count === 0) return "var(--muted-foreground)";
    return "#B45309";
  };

  if (phase === "loading") {
    return (
      <StepCard
        title={t.title}
        subtitle={t.loadingSubtitle}
        icon={<Star className="w-5 h-5" />}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 0", gap: 16 }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--primary)" }} />
          <p style={{ color: "var(--muted-foreground)", fontSize: 14 }}>{t.loadingText}</p>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <Button variant="outline" onClick={onBack} style={{ flex: 1 }}>{t.back}</Button>
        </div>
      </StepCard>
    );
  }

  return (
    <StepCard
      title={t.title}
      subtitle={t.subtitle}
      icon={<Star className="w-5 h-5" />}
    >
      {loadError && (
        <div
          data-testid="skills-error"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
            padding: "12px 16px",
            marginBottom: 16,
            borderRadius: 10,
            border: "1px solid #fca5a5",
            backgroundColor: "#fef2f2",
            fontSize: 13.5,
          }}
        >
          <span>{t.loadError}</span>
          <Button size="sm" variant="outline" onClick={loadSkills} data-testid="skills-retry">
            {t.retry}
          </Button>
        </div>
      )}

      <div data-testid="skills-selection" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {SECTIONS.map((section) => {
          const items = pool[section.key];
          const selected = selectionSets[section.key];
          const count = selected.size;
          const color = counterColor(count, section.min, section.max);

          return (
            <div
              key={section.key}
              data-testid={section.testId}
              style={{ border: "1px solid var(--hairline)", borderRadius: 10, padding: "14px 16px", background: "#FAFAFA" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{t.sections[section.key]}</span>
                <span style={{ fontSize: 13, color, fontWeight: 500 }}>
                  {t.counter(count, items.length, section.recommended)}
                </span>
              </div>

              {items.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--faint)" }}>{t.noItems}</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "6px 12px" }}>
                  {items.map((skill) => (
                    <label
                      key={skill}
                      style={{
                        display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                        fontSize: 13, color: selected.has(skill) ? "#111827" : "#4B5563", padding: "3px 0",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(skill)}
                        onChange={() => toggleSkill(section.key, skill)}
                        style={{ width: 15, height: 15, accentColor: "var(--primary)", cursor: "pointer" }}
                      />
                      {skill}
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Manual add */}
        <div style={{ border: "1px dashed var(--input-border)", borderRadius: 10, padding: "14px 16px" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", marginBottom: 10 }}>
            {t.manualTitle}
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              data-testid="manual-skill-input"
              type="text"
              placeholder={t.manualPlaceholder}
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isFormatting && handleAddManual()}
              style={{
                flex: 1, padding: "10px 16px", border: "1px solid var(--hairline)",
                borderRadius: 8, fontSize: 14, outline: "none",
              }}
            />
            <button
              data-testid="btn-add-manual"
              onClick={handleAddManual}
              disabled={isFormatting || !manualInput.trim()}
              style={{
                padding: "8px 16px",
                background: isFormatting || !manualInput.trim() ? "var(--hairline)" : "var(--primary)",
                color: isFormatting || !manualInput.trim() ? "var(--faint)" : "#fff",
                border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500,
                cursor: isFormatting ? "default" : "pointer",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              {isFormatting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {t.add}
            </button>
          </div>

          {customSkills.length > 0 && (
            <div data-testid="custom-skills-list" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
              {customSkills.map((skill, i) => (
                <span
                  key={i}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "4px 10px", background: "var(--wash)", border: "1px solid #f3c4ac",
                    borderRadius: 20, fontSize: 13, color: "var(--primary-strong)",
                  }}
                >
                  {skill}
                  <button
                    onClick={() => setCustomSkills((prev) => prev.filter((_, idx) => idx !== i))}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", color: "var(--primary)" }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        <Button variant="outline" onClick={onBack} style={{ flex: 1 }}>{t.back}</Button>
        <Button onClick={handleContinue} style={{ flex: 2 }} iconRight={<ArrowRight className="w-4 h-4" />}>
          {t.continue}
        </Button>
      </div>
    </StepCard>
  );
}
