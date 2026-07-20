"use client";
import type { CVData, TemplateId } from "@/lib/types/cv";
import { User } from "lucide-react";
import { MODEL_PREVIEWS } from "./preview-models";

interface CVPreviewProps {
  cvData: CVData;
  /** designul ales (pasul final) — preview-ul oglindește template-ul PDF */
  template?: TemplateId;
}

/* ────────────────────────────────────────────────────────────────
   Preview-ul live al CV-ului, TEMATIZAT: fiecare design de PDF are
   aici corespondentul lui vizual 1:1 (culori, tipografie, layout).
   ──────────────────────────────────────────────────────────────── */

interface Theme {
  font: string;
  ink: string;
  text: string;
  muted: string;
  faint: string;
  accent: string;
  hairline: string;
  bulletMark: string;
  headerAlign: "left" | "center";
  nameTransform?: "uppercase";
  nameSpacing?: string;
  rule: "ink" | "accent" | "double";
  secAlign: "left" | "center";
  skills: "chips" | "inline";
}

const SANS = "var(--font-body), sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";

const THEMES: Record<TemplateId, Theme> = {
  classic: {
    font: SANS, ink: "#0f172a", text: "#334155", muted: "#64748b", faint: "#94a3b8",
    accent: "#2563eb", hairline: "#e2e8f0", bulletMark: "—", headerAlign: "left",
    rule: "ink", secAlign: "left", skills: "chips",
  },
  modern: {
    font: SANS, ink: "#0f172a", text: "#334155", muted: "#64748b", faint: "#94a3b8",
    accent: "#2563eb", hairline: "#e2e8f0", bulletMark: "•", headerAlign: "left",
    rule: "accent", secAlign: "left", skills: "inline",
  },
  elegant: {
    font: SERIF, ink: "#1c1917", text: "#44403c", muted: "#78716c", faint: "#a8a29e",
    accent: "#a16207", hairline: "#e7e5e4", bulletMark: "•", headerAlign: "center",
    rule: "double", secAlign: "center", skills: "inline",
  },
  compact: {
    font: SANS, ink: "#0f172a", text: "#334155", muted: "#64748b", faint: "#94a3b8",
    accent: "#0f766e", hairline: "#e2e8f0", bulletMark: "›", headerAlign: "left",
    rule: "accent", secAlign: "left", skills: "inline",
  },
  minimal: {
    font: SANS, ink: "#111111", text: "#3d3d3d", muted: "#7a7a7a", faint: "#ababab",
    accent: "#111111", hairline: "#e5e5e5", bulletMark: "–", headerAlign: "left",
    nameTransform: "uppercase", nameSpacing: "0.18em",
    rule: "ink", secAlign: "left", skills: "inline",
  },
  /* ── cele 14 modele noi: preview pe o coloană, în culorile modelului ── */
  meridian: {
    font: SANS, ink: "#1e2a38", text: "#37424e", muted: "#67727e", faint: "#98a2ad",
    accent: "#6aa63c", hairline: "#dfe5ea", bulletMark: "•", headerAlign: "left",
    rule: "accent", secAlign: "left", skills: "chips",
  },
  atlantic: {
    font: SANS, ink: "#16202c", text: "#374250", muted: "#68737f", faint: "#99a3ae",
    accent: "#1b5fb5", hairline: "#dfe6ee", bulletMark: "•", headerAlign: "left",
    rule: "accent", secAlign: "left", skills: "chips",
  },
  manhattan: {
    font: SANS, ink: "#20303c", text: "#3a4854", muted: "#6a7681", faint: "#9aa5af",
    accent: "#2077b4", hairline: "#dce7ee", bulletMark: "•", headerAlign: "left",
    nameTransform: "uppercase", nameSpacing: "0.04em",
    rule: "accent", secAlign: "left", skills: "chips",
  },
  cobalt: {
    font: SANS, ink: "#1d2c52", text: "#39445e", muted: "#6a7590", faint: "#9aa4bb",
    accent: "#25429e", hairline: "#dfe4f2", bulletMark: "•", headerAlign: "left",
    rule: "accent", secAlign: "left", skills: "chips",
  },
  amber: {
    font: SANS, ink: "#2c3038", text: "#41454d", muted: "#70747c", faint: "#a0a4ab",
    accent: "#d9a412", hairline: "#e8e5dd", bulletMark: "•", headerAlign: "left",
    rule: "accent", secAlign: "left", skills: "chips",
  },
  sapphire: {
    font: SANS, ink: "#0e1c4e", text: "#333d61", muted: "#666f8d", faint: "#979fb8",
    accent: "#29b7d3", hairline: "#dde6ef", bulletMark: "•", headerAlign: "left",
    nameTransform: "uppercase", nameSpacing: "0.06em",
    rule: "accent", secAlign: "left", skills: "chips",
  },
  velvet: {
    font: SANS, ink: "#232244", text: "#3c3b5e", muted: "#6d6c88", faint: "#9d9cb3",
    accent: "#c98fa6", hairline: "#e7e2e8", bulletMark: "•", headerAlign: "left",
    rule: "accent", secAlign: "left", skills: "inline",
  },
  blush: {
    font: SANS, ink: "#3f4448", text: "#4f545a", muted: "#7c8187", faint: "#aaafb4",
    accent: "#e795a0", hairline: "#f0e2e3", bulletMark: "•", headerAlign: "left",
    nameTransform: "uppercase", nameSpacing: "0.14em",
    rule: "accent", secAlign: "left", skills: "inline",
  },
  sage: {
    font: SERIF, ink: "#31413d", text: "#465753", muted: "#71827e", faint: "#9fadaa",
    accent: "#7fa199", hairline: "#e0e7e4", bulletMark: "•", headerAlign: "left",
    rule: "accent", secAlign: "left", skills: "inline",
  },
  graphite: {
    font: SANS, ink: "#2b3138", text: "#3d4451", muted: "#6b7280", faint: "#9aa1ab",
    accent: "#5d7386", hairline: "#e2e6ea", bulletMark: "–", headerAlign: "left",
    nameTransform: "uppercase", nameSpacing: "0.1em",
    rule: "accent", secAlign: "left", skills: "chips",
  },
  riviera: {
    font: SANS, ink: "#17181c", text: "#3d4451", muted: "#6b7280", faint: "#9aa1ab",
    accent: "#1fbcb4", hairline: "#d9ecea", bulletMark: "•", headerAlign: "left",
    nameTransform: "uppercase", nameSpacing: "0.06em",
    rule: "accent", secAlign: "left", skills: "chips",
  },
  sterling: {
    font: SANS, ink: "#23272f", text: "#3d4451", muted: "#6b7280", faint: "#9aa1ab",
    accent: "#3f6ad8", hairline: "#dfe2e7", bulletMark: "•", headerAlign: "left",
    rule: "accent", secAlign: "left", skills: "chips",
  },
  flamingo: {
    font: SERIF, ink: "#463c40", text: "#4b5157", muted: "#7a8087", faint: "#a8adb3",
    accent: "#e795a0", hairline: "#f2e4e6", bulletMark: "•", headerAlign: "left",
    rule: "accent", secAlign: "left", skills: "inline",
  },
  petrol: {
    font: SANS, ink: "#263435", text: "#3d4a4b", muted: "#64777a", faint: "#96a5a7",
    accent: "#4a7d80", hairline: "#d3e4e4", bulletMark: "•", headerAlign: "left",
    rule: "accent", secAlign: "left", skills: "inline",
  },
};

export function CVPreview({ cvData, template = "classic" }: CVPreviewProps) {
  // cele 14 modele noi au preview-uri dedicate care oglindesc fidel PDF-ul
  const ModelPreview = MODEL_PREVIEWS[template];
  if (ModelPreview) return <ModelPreview data={cvData} />;

  const t = THEMES[template] ?? THEMES.classic;
  const { personal, experience, education, courses, skills, languages, hobbies, license, qualifications } = cvData;
  const hasName = personal?.firstName || personal?.lastName;
  const compact = template === "compact";

  // Adresa completă în antet, exact cum a introdus-o utilizatorul.
  const isAbroad = Boolean(personal?.country && personal.country !== "România");
  const roStreet = [
    [personal?.street, personal?.streetNumber].filter(Boolean).join(" "),
    personal?.apartment ? `ap. ${personal.apartment}` : "",
  ]
    .filter(Boolean)
    .join(", ");
  const roLocality = [personal?.city, personal?.county].filter(Boolean).join(", ");
  const contactItems = (
    isAbroad
      ? [personal?.email, personal?.phone, personal?.street, personal?.country]
      : [personal?.email, personal?.phone, roStreet, roLocality]
  ).filter((item): item is string => Boolean(item && item.trim()));

  const hasLicenseInfo =
    (license?.hasLicense && license.categories.length > 0) ||
    Boolean(qualifications?.trim());

  /* ── sub-componente tematizate ─────────────────────────────── */

  const SectionHeader = ({ title }: { title: string }) =>
    t.secAlign === "center" ? (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1, height: 1, backgroundColor: t.hairline }} />
        <h3 style={{ fontSize: 9, fontWeight: 700, color: t.accent, textTransform: "uppercase", letterSpacing: "0.2em", margin: 0, fontFamily: SANS }}>
          {title}
        </h3>
        <div style={{ flex: 1, height: 1, backgroundColor: t.hairline }} />
      </div>
    ) : (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <h3 style={{ fontSize: 9.5, fontWeight: 700, color: template === "modern" ? t.ink : template === "compact" ? t.accent : t.muted, textTransform: "uppercase", letterSpacing: "0.16em", margin: 0, fontFamily: SANS }}>
          {title}
        </h3>
        {template !== "modern" && <div style={{ flex: 1, height: 1, backgroundColor: t.hairline }} />}
      </div>
    );

  const Bullet = ({ children }: { children: React.ReactNode }) => (
    <li style={{ display: "flex", gap: 7, alignItems: "flex-start", color: t.text, fontSize: compact ? 10.5 : 11, lineHeight: 1.5 }}>
      <span style={{ color: t.accent, flexShrink: 0, fontWeight: 600 }}>{t.bulletMark}</span>
      <span>{children}</span>
    </li>
  );

  const ExperienceSection = () =>
    experience.length > 0 ? (
      <div>
        <SectionHeader title={template === "minimal" ? "Experiență" : "Experiență profesională"} />
        <div style={{ display: "flex", flexDirection: "column", gap: compact ? 7 : 10, marginTop: 6 }}>
          {experience.map((exp, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: 700, color: t.ink, fontSize: compact ? 12 : 12.5 }}>{exp.title}</span>
                <span style={{ color: t.faint, fontSize: 10, flexShrink: 0, marginLeft: 8, fontVariantNumeric: "tabular-nums" }}>
                  {exp.period}
                </span>
              </div>
              <p style={{ color: template === "elegant" ? t.muted : t.accent, fontSize: 11.5, margin: "1px 0 4px", fontStyle: template === "elegant" ? "italic" : undefined, fontWeight: template === "elegant" ? 400 : 600 }}>
                {exp.company}
                {exp.location ? ` · ${exp.location}` : ""}
              </p>
              {exp.responsibilities.length > 0 && (
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: compact ? 2 : 3 }}>
                  {exp.responsibilities.map((r, j) => (
                    <Bullet key={j}>{r}</Bullet>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    ) : null;

  const EducationSection = () =>
    education.length > 0 ? (
      <div>
        <SectionHeader title="Educație" />
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
          {education.map((edu, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: 700, color: t.ink, fontSize: 12 }}>
                  {edu.level}
                  {edu.field ? ` — ${edu.field}` : ""}
                </span>
                <span style={{ color: t.faint, fontSize: 10, flexShrink: 0, marginLeft: 8 }}>{edu.years}</span>
              </div>
              <p style={{ color: t.text, fontSize: 11.5, margin: "1px 0 0" }}>
                {edu.institution}
                {edu.location ? ` · ${edu.location}` : ""}
              </p>
              {(edu.grade || edu.thesis) && (
                <p style={{ color: t.muted, fontSize: 10.5, margin: "2px 0 0", fontStyle: "italic" }}>
                  {[edu.grade ? `Medie: ${edu.grade}` : "", edu.thesis ? `Lucrare: „${edu.thesis}"` : ""]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    ) : null;

  const CoursesSection = () =>
    courses.length > 0 ? (
      <div>
        <SectionHeader title="Cursuri & certificări" />
        <ul style={{ margin: "6px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 3 }}>
          {courses.map((c, i) => (
            <Bullet key={i}>
              {c.name}
              {c.provider ? ` · ${c.provider}` : ""}
              {c.year ? ` (${c.year})` : ""}
            </Bullet>
          ))}
        </ul>
      </div>
    ) : null;

  const SkillsSection = () =>
    skills.length > 0 ? (
      <div>
        <SectionHeader title="Competențe" />
        {t.skills === "chips" ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 6px", marginTop: 7 }}>
            {skills.map((sk, i) => (
              <span key={i} style={{ color: t.ink, border: `1px solid ${t.hairline}`, borderColor: "#cbd5e1", padding: "2px 8px", borderRadius: 3, fontSize: 10.5, fontWeight: 500 }}>
                {sk.name}
              </span>
            ))}
          </div>
        ) : (
          <p style={{ color: t.text, fontSize: 11, margin: "6px 0 0", lineHeight: 1.7, textAlign: t.secAlign }}>
            {skills.map((sk) => sk.name).join(template === "minimal" ? "    /    " : "  ·  ")}
          </p>
        )}
      </div>
    ) : null;

  const LanguagesSection = () =>
    languages.length > 0 ? (
      <div>
        <SectionHeader title="Limbi străine" />
        <p style={{ color: t.text, fontSize: 11.5, margin: "6px 0 0", lineHeight: 1.7, textAlign: t.secAlign }}>
          {languages.map((l, i) => (
            <span key={i}>
              {l.name} <span style={{ color: t.faint, fontStyle: "italic" }}>({l.level})</span>
              {i < languages.length - 1 ? (template === "minimal" ? "    /    " : "   ·   ") : ""}
            </span>
          ))}
        </p>
      </div>
    ) : null;

  const LicenseSection = () =>
    hasLicenseInfo ? (
      <div>
        <SectionHeader title="Permis & Calificări" />
        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 6, textAlign: t.secAlign }}>
          {license?.hasLicense && license.categories.length > 0 && (
            <p style={{ color: t.text, fontSize: 11.5, margin: 0 }}>
              Permis de conducere: categoria {license.categories.join(", ")}
            </p>
          )}
          {qualifications?.trim() && (
            <p style={{ color: t.text, fontSize: 11.5, margin: 0, lineHeight: 1.55 }}>{qualifications.trim()}</p>
          )}
        </div>
      </div>
    ) : null;

  const HobbiesSection = () =>
    hobbies.length > 0 ? (
      <div>
        <SectionHeader title="Hobby-uri" />
        <p style={{ color: t.text, fontSize: 11.5, margin: "5px 0 0", textAlign: t.secAlign }}>
          {hobbies.join(template === "minimal" ? "    /    " : ", ")}
        </p>
      </div>
    ) : null;

  const SummarySection = () =>
    cvData.summary ? (
      <div>
        <SectionHeader title={template === "elegant" ? "Profil" : "Rezumat"} />
        <p style={{ color: t.text, margin: "5px 0 0", fontSize: 11.5, lineHeight: 1.6, textAlign: t.secAlign, fontStyle: template === "elegant" ? "italic" : undefined }}>
          {cvData.summary}
        </p>
      </div>
    ) : null;

  const EmptyState = () =>
    !hasName && experience.length === 0 && education.length === 0 ? (
      <div style={{ padding: "28px 0 20px", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-display), sans-serif", fontSize: 13, color: "var(--faint)", margin: 0 }}>
          Foaia ta e încă albă.
        </p>
        <p style={{ fontSize: 11, color: "var(--faint)", margin: "5px 0 0" }}>
          Se completează pe măsură ce răspunzi.
        </p>
      </div>
    ) : null;

  const Photo = ({ size }: { size: number }) =>
    personal?.photoUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={personal.photoUrl}
        alt="Foto"
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: `1px solid ${t.hairline}`, flexShrink: 0 }}
      />
    ) : null;

  /* ── MODERN: layout cu sidebar navy ────────────────────────── */
  if (template === "modern") {
    const side = { title: "#93c5fd", text: "#cbd5e1", line: "#1e293b" };
    const SideTitle = ({ children }: { children: React.ReactNode }) => (
      <h4 style={{ fontSize: 8.5, fontWeight: 700, color: side.title, textTransform: "uppercase", letterSpacing: "0.16em", margin: "0 0 5px", paddingBottom: 3, borderBottom: `1px solid ${side.line}` }}>
        {children}
      </h4>
    );
    return (
      <div data-template="modern" style={{ display: "flex", minHeight: "100%", backgroundColor: "#fff", fontFamily: t.font, fontSize: 12, lineHeight: 1.55, color: t.text }}>
        {/* Sidebar */}
        <div style={{ width: "33%", backgroundColor: "#0b1220", color: side.text, padding: "20px 14px", display: "flex", flexDirection: "column", gap: 14 }}>
          {personal?.photoUrl ? (
            <div style={{ alignSelf: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={personal.photoUrl} alt="Foto" style={{ width: 62, height: 62, borderRadius: "50%", objectFit: "cover", border: "2px solid #334155" }} />
            </div>
          ) : null}
          {contactItems.length > 0 && (
            <div>
              <SideTitle>Contact</SideTitle>
              {contactItems.map((item, i) => (
                <p key={i} style={{ fontSize: 9.5, margin: "0 0 3px", lineHeight: 1.5, wordBreak: "break-word" }}>{item}</p>
              ))}
            </div>
          )}
          {skills.length > 0 && (
            <div>
              <SideTitle>Competențe</SideTitle>
              {skills.map((sk, i) => (
                <p key={i} style={{ fontSize: 9.5, margin: "0 0 2.5px" }}>•  {sk.name}</p>
              ))}
            </div>
          )}
          {languages.length > 0 && (
            <div>
              <SideTitle>Limbi străine</SideTitle>
              {languages.map((l, i) => (
                <p key={i} style={{ fontSize: 9.5, margin: "0 0 2.5px" }}>{l.name} ({l.level})</p>
              ))}
            </div>
          )}
          {hasLicenseInfo && (
            <div>
              <SideTitle>Permis & Calificări</SideTitle>
              {license?.hasLicense && license.categories.length > 0 && (
                <p style={{ fontSize: 9.5, margin: "0 0 3px" }}>Permis categoria {license.categories.join(", ")}</p>
              )}
              {qualifications?.trim() && <p style={{ fontSize: 9.5, margin: 0 }}>{qualifications.trim()}</p>}
            </div>
          )}
          {hobbies.length > 0 && (
            <div>
              <SideTitle>Hobby-uri</SideTitle>
              <p style={{ fontSize: 9.5, margin: 0 }}>{hobbies.join(", ")}</p>
            </div>
          )}
        </div>
        {/* Coloana principală */}
        <div style={{ flex: 1, padding: "22px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display), sans-serif", fontSize: 21, fontWeight: 700, color: hasName ? t.ink : t.faint, lineHeight: 1.15, margin: 0, letterSpacing: "-0.01em" }}>
              {hasName ? `${personal?.firstName ?? ""} ${personal?.lastName ?? ""}`.trim() : "Prenume Nume"}
            </h1>
            <div style={{ width: 40, height: 4, backgroundColor: t.accent, borderRadius: 2, marginTop: 8 }} />
          </div>
          <SummarySection />
          <ExperienceSection />
          <EducationSection />
          <CoursesSection />
          <EmptyState />
        </div>
      </div>
    );
  }

  /* ── layout pe o coloană (classic / elegant / compact / minimal) ── */
  return (
    <div data-template={template} className="overflow-hidden" style={{ backgroundColor: "#ffffff", fontFamily: t.font, fontSize: 12, lineHeight: 1.55, color: t.text }}>
      {/* Antet */}
      <div style={{ padding: compact ? "16px 18px 0" : "22px 24px 0" }}>
        <div style={{ display: "flex", alignItems: t.headerAlign === "center" ? "center" : "flex-start", gap: 14, flexDirection: t.headerAlign === "center" ? "column" : "row" }}>
          {t.headerAlign === "center" ? <Photo size={54} /> : template === "minimal" ? null : <Photo size={50} />}
          {!hasName && !personal?.photoUrl && t.headerAlign !== "center" && template !== "minimal" && (
            <div style={{ width: 50, height: 50, borderRadius: "50%", backgroundColor: "var(--paper-deep)", border: "1px solid var(--hairline)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <User style={{ width: 20, height: 20, color: "var(--faint)" }} />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0, textAlign: t.headerAlign }}>
            <h1
              style={{
                fontFamily: template === "elegant" ? SERIF : "var(--font-display), sans-serif",
                fontSize: template === "minimal" ? 18 : compact ? 19 : 21,
                fontWeight: 700,
                color: hasName ? t.ink : t.faint,
                lineHeight: 1.15,
                margin: 0,
                letterSpacing: t.nameSpacing ?? "-0.01em",
                textTransform: t.nameTransform,
              }}
            >
              {hasName ? `${personal?.firstName ?? ""} ${personal?.lastName ?? ""}`.trim() : "Prenume Nume"}
            </h1>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "2px 10px",
                marginTop: 5,
                color: t.muted,
                fontSize: 10.5,
                justifyContent: t.headerAlign === "center" ? "center" : "flex-start",
                fontFamily: SANS,
              }}
            >
              {contactItems.map((item, i, arr) => (
                <span key={i}>
                  {item}
                  {i < arr.length - 1 && (
                    <span style={{ color: t.faint, marginLeft: 10 }}>{template === "minimal" ? "/" : "·"}</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
        {/* rigla */}
        {t.rule === "double" ? (
          <div style={{ marginTop: 12 }}>
            <div style={{ height: 1.5, backgroundColor: t.ink }} />
            <div style={{ height: 1, backgroundColor: t.hairline, marginTop: 2 }} />
          </div>
        ) : (
          <div style={{ height: 2, backgroundColor: t.rule === "accent" ? t.accent : t.ink, marginTop: compact ? 10 : 14 }} />
        )}
      </div>

      <div style={{ padding: compact ? "10px 18px 16px" : "14px 24px 22px", display: "flex", flexDirection: "column", gap: compact ? 10 : 14 }}>
        <SummarySection />
        <ExperienceSection />
        <EducationSection />
        <CoursesSection />
        <SkillsSection />
        {compact ? (
          /* Compact grupează totul sub „Alte informații" — identic cu PDF-ul */
          (languages.length > 0 || hasLicenseInfo || hobbies.length > 0) && (
            <div>
              <SectionHeader title="Alte informații" />
              <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 6 }}>
                {languages.length > 0 && (
                  <p style={{ color: t.text, fontSize: 11, margin: 0 }}>
                    <span style={{ fontWeight: 700, color: t.ink }}>Limbi străine:  </span>
                    {languages.map((l) => `${l.name} (${l.level})`).join("  ·  ")}
                  </p>
                )}
                {license?.hasLicense && license.categories.length > 0 && (
                  <p style={{ color: t.text, fontSize: 11, margin: 0 }}>
                    <span style={{ fontWeight: 700, color: t.ink }}>Permis de conducere:  </span>
                    categoria {license.categories.join(", ")}
                  </p>
                )}
                {qualifications?.trim() && (
                  <p style={{ color: t.text, fontSize: 11, margin: 0 }}>
                    <span style={{ fontWeight: 700, color: t.ink }}>Calificări:  </span>
                    {qualifications.trim()}
                  </p>
                )}
                {hobbies.length > 0 && (
                  <p style={{ color: t.text, fontSize: 11, margin: 0 }}>
                    <span style={{ fontWeight: 700, color: t.ink }}>Hobby-uri:  </span>
                    {hobbies.join(", ")}
                  </p>
                )}
              </div>
            </div>
          )
        ) : (
          <>
            <LanguagesSection />
            <LicenseSection />
            <HobbiesSection />
          </>
        )}
        <EmptyState />
      </div>
    </div>
  );
}
