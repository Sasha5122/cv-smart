"use client";
import type { CVData } from "@/lib/types/cv";
import { User } from "lucide-react";

interface CVPreviewProps {
  cvData: CVData;
}

/**
 * Preview-ul live al CV-ului — o foaie tipărită în miniatură:
 * nume în Spectral, rigla de cerneală, secțiuni cu hairline,
 * bullet-uri cu em-dash amber. Aceeași estetică cu produsul final.
 */
export function CVPreview({ cvData }: CVPreviewProps) {
  const { personal, experience, education, skills, languages, hobbies, license, qualifications } = cvData;
  const hasName = personal?.firstName || personal?.lastName;

  // Adresa completă în antet, exact cum a introdus-o utilizatorul.
  const isAbroad = Boolean(personal?.country && personal.country !== "România");
  // România: „Str. Mihai Eminescu 12, ap. 4" + „Cluj-Napoca, Cluj"
  const roStreet = [
    [personal?.street, personal?.streetNumber].filter(Boolean).join(" "),
    personal?.apartment ? `ap. ${personal.apartment}` : "",
  ]
    .filter(Boolean)
    .join(", ");
  const roLocality = [personal?.city, personal?.county].filter(Boolean).join(", ");
  // Străinătate: adresa liberă din modal + țara
  const contactItems = (
    isAbroad
      ? [personal?.email, personal?.phone, personal?.street, personal?.country]
      : [personal?.email, personal?.phone, roStreet, roLocality]
  ).filter((item): item is string => Boolean(item && item.trim()));

  const hasLicenseInfo =
    (license?.hasLicense && license.categories.length > 0) ||
    Boolean(qualifications?.trim());

  return (
    <div
      className="overflow-hidden"
      style={{
        backgroundColor: "#ffffff",
        fontFamily: "var(--font-body), sans-serif",
        fontSize: 12,
        lineHeight: 1.55,
        color: "var(--foreground)",
      }}
    >
      {/* Antet — foaie, nu banner */}
      <div style={{ padding: "22px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          {personal?.photoUrl ? (
            <img
              src={personal.photoUrl}
              alt="Foto"
              style={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                objectFit: "cover",
                border: "1px solid var(--hairline-strong)",
                flexShrink: 0,
              }}
            />
          ) : hasName ? null : (
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                backgroundColor: "var(--paper-deep)",
                border: "1px solid var(--hairline)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <User style={{ width: 20, height: 20, color: "var(--faint)" }} />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1
              style={{
                fontFamily: "var(--font-display), sans-serif",
                fontSize: 21,
                fontWeight: 600,
                color: hasName ? "var(--ink-strong)" : "var(--faint)",
                lineHeight: 1.15,
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              {hasName
                ? `${personal?.firstName ?? ""} ${personal?.lastName ?? ""}`.trim()
                : "Prenume Nume"}
            </h1>
            {cvData.targetTitle && (
              <p style={{ fontSize: 11.5, color: "var(--primary)", fontWeight: 600, margin: "3px 0 0" }}>
                {cvData.targetTitle}
              </p>
            )}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "2px 10px",
                marginTop: 5,
                color: "var(--muted-foreground)",
                fontSize: 10.5,
              }}
            >
              {contactItems.map((item, i, arr) => (
                <span key={i}>
                  {item}
                  {i < arr.length - 1 && <span style={{ color: "var(--faint)", marginLeft: 10 }}>·</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
        {/* rigla de cerneală */}
        <div style={{ height: 2, backgroundColor: "var(--ink)", marginTop: 14 }} />
      </div>

      <div style={{ padding: "14px 24px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Rezumat */}
        {cvData.summary && (
          <div>
            <SectionHeader title="Rezumat" />
            <p style={{ color: "#334155", margin: "5px 0 0", fontSize: 11.5, lineHeight: 1.6 }}>
              {cvData.summary}
            </p>
          </div>
        )}

        {/* Experiență */}
        {experience.length > 0 && (
          <div>
            <SectionHeader title="Experiență" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 6 }}>
              {experience.map((exp, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontWeight: 700, color: "var(--ink-strong)", fontSize: 12.5 }}>
                      {exp.title}
                    </span>
                    <span
                      style={{
                        color: "var(--faint)",
                        fontSize: 10,
                        flexShrink: 0,
                        marginLeft: 8,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {exp.period}
                    </span>
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-display), sans-serif",
                      color: "var(--primary)",
                      fontSize: 11.5,
                      margin: "1px 0 4px",
                    }}
                  >
                    {exp.company}
                    {exp.location ? ` · ${exp.location}` : ""}
                  </p>
                  {exp.responsibilities.length > 0 && (
                    <ul
                      style={{
                        margin: 0,
                        padding: 0,
                        listStyle: "none",
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                      }}
                    >
                      {exp.responsibilities.map((r, j) => (
                        <li
                          key={j}
                          style={{
                            display: "flex",
                            gap: 7,
                            alignItems: "flex-start",
                            color: "#334155",
                            fontSize: 11,
                            lineHeight: 1.5,
                          }}
                        >
                          <span style={{ color: "var(--amber)", flexShrink: 0, fontWeight: 600 }}>—</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Educație */}
        {education.length > 0 && (
          <div>
            <SectionHeader title="Educație" />
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
              {education.map((edu, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontWeight: 700, color: "var(--ink-strong)", fontSize: 12 }}>
                      {edu.level}
                      {edu.field ? ` — ${edu.field}` : ""}
                    </span>
                    <span style={{ color: "var(--faint)", fontSize: 10, flexShrink: 0, marginLeft: 8 }}>
                      {edu.years}
                    </span>
                  </div>
                  <p style={{ color: "#334155", fontSize: 11.5, margin: "1px 0 0" }}>
                    {edu.institution}
                    {edu.location ? ` · ${edu.location}` : ""}
                  </p>
                  {(edu.grade || edu.thesis) && (
                    <p style={{ color: "var(--muted-foreground)", fontSize: 10.5, margin: "2px 0 0" }}>
                      {[
                        edu.grade ? `Medie: ${edu.grade}` : "",
                        edu.thesis ? `Lucrare: „${edu.thesis}"` : "",
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Abilități */}
        {skills.length > 0 && (
          <div>
            <SectionHeader title="Competențe" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 6px", marginTop: 7 }}>
              {skills.map((s, i) => (
                <span
                  key={i}
                  style={{
                    color: "var(--ink)",
                    border: "1px solid var(--hairline-strong)",
                    padding: "2px 8px",
                    borderRadius: 3,
                    fontSize: 10.5,
                    fontWeight: 500,
                    backgroundColor: "transparent",
                  }}
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Limbi */}
        {languages.length > 0 && (
          <div>
            <SectionHeader title="Limbi străine" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 16px", marginTop: 6 }}>
              {languages.map((l, i) => (
                <span key={i} style={{ color: "#334155", fontSize: 11.5 }}>
                  {l.name}{" "}
                  <span style={{ color: "var(--faint)", fontStyle: "italic" }}>({l.level})</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Permis & Calificări */}
        {hasLicenseInfo && (
          <div>
            <SectionHeader title="Permis & Calificări" />
            <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 6 }}>
              {license?.hasLicense && license.categories.length > 0 && (
                <p style={{ color: "#334155", fontSize: 11.5, margin: 0 }}>
                  Permis de conducere: categoria {license.categories.join(", ")}
                </p>
              )}
              {qualifications?.trim() && (
                <p style={{ color: "#334155", fontSize: 11.5, margin: 0, lineHeight: 1.55 }}>
                  {qualifications.trim()}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Hobby-uri */}
        {hobbies.length > 0 && (
          <div>
            <SectionHeader title="Hobby-uri" />
            <p style={{ color: "#334155", fontSize: 11.5, margin: "5px 0 0" }}>{hobbies.join(", ")}</p>
          </div>
        )}

        {/* Stare goală */}
        {!hasName && experience.length === 0 && education.length === 0 && (
          <div style={{ padding: "28px 0 20px", textAlign: "center" }}>
            <p
              style={{
                fontFamily: "var(--font-display), sans-serif",
                fontSize: 13,
                color: "var(--faint)",
                margin: 0,
              }}
            >
              Foaia ta e încă albă.
            </p>
            <p style={{ fontSize: 11, color: "var(--faint)", margin: "5px 0 0" }}>
              Se completează pe măsură ce răspunzi.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <h3
        style={{
          fontSize: 9.5,
          fontWeight: 700,
          color: "var(--muted-foreground)",
          textTransform: "uppercase",
          letterSpacing: "0.16em",
          margin: 0,
        }}
      >
        {title}
      </h3>
      <div style={{ flex: 1, height: 1, backgroundColor: "var(--hairline)" }} />
    </div>
  );
}
