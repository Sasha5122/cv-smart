"use client";
import type { CVData } from "@/lib/types/cv";
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Star } from "lucide-react";

interface CVPreviewProps {
  cvData: CVData;
}

export function CVPreview({ cvData }: CVPreviewProps) {
  const { personal, experience, education, skills, languages, hobbies } = cvData;
  const hasName = personal?.firstName || personal?.lastName;

  return (
    <div className="bg-white overflow-hidden text-[12px] leading-relaxed" style={{ fontFamily: "'Georgia', serif" }}>
      {/* CV Header */}
      <div style={{ backgroundColor: "#0F172A", padding: "20px 24px 18px", color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          {/* Photo */}
          <div style={{ width: 52, height: 52, borderRadius: "50%", backgroundColor: "#334155", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "2px solid #475569" }}>
            {personal?.photoUrl ? (
              <img src={personal.photoUrl} alt="Foto" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <User style={{ width: 22, height: 22, color: "#94A3B8" }} />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "#fff", lineHeight: 1.2, margin: 0, letterSpacing: -0.3 }}>
              {hasName ? `${personal?.firstName ?? ""} ${personal?.lastName ?? ""}`.trim() : "Prenume Nume"}
            </h1>
            {cvData.targetTitle && (
              <p style={{ fontSize: 12, color: "#94A3B8", margin: "3px 0 0" }}>{cvData.targetTitle}</p>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 14px", marginTop: 7, color: "#94A3B8", fontSize: 11 }}>
              {personal?.email && (
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Mail style={{ width: 10, height: 10 }} />
                  {personal.email}
                </span>
              )}
              {personal?.phone && (
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Phone style={{ width: 10, height: 10 }} />
                  {personal.phone}
                </span>
              )}
              {personal?.city && (
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <MapPin style={{ width: 10, height: 10 }} />
                  {personal.city}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 24px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Summary */}
        {cvData.summary && (
          <div>
            <SectionHeader icon={<Star style={{ width: 11, height: 11 }} />} title="Rezumat" />
            <p style={{ color: "#475569", margin: "4px 0 0", fontSize: 12, lineHeight: 1.6 }}>{cvData.summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div>
            <SectionHeader icon={<Briefcase style={{ width: 11, height: 11 }} />} title="Experiență" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 6 }}>
              {experience.map((exp, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontWeight: 700, color: "#0F172A", fontSize: 13 }}>{exp.title}</span>
                    <span style={{ color: "#94A3B8", fontSize: 11, flexShrink: 0, marginLeft: 8 }}>{exp.period}</span>
                  </div>
                  <p style={{ color: "#4F46E5", fontSize: 12, margin: "1px 0 4px", fontWeight: 600 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</p>
                  {exp.responsibilities.length > 0 && (
                    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 2 }}>
                      {exp.responsibilities.map((r, j) => (
                        <li key={j} style={{ display: "flex", gap: 6, alignItems: "flex-start", color: "#475569", fontSize: 11.5, lineHeight: 1.5 }}>
                          <span style={{ color: "#4F46E5", fontWeight: 700, flexShrink: 0 }}>•</span>
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

        {/* Education */}
        {education.length > 0 && (
          <div>
            <SectionHeader icon={<GraduationCap style={{ width: 11, height: 11 }} />} title="Educație" />
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
              {education.map((edu, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontWeight: 700, color: "#0F172A", fontSize: 13 }}>{edu.level}{edu.field ? ` — ${edu.field}` : ""}</span>
                    <span style={{ color: "#94A3B8", fontSize: 11, flexShrink: 0, marginLeft: 8 }}>{edu.years}</span>
                  </div>
                  <p style={{ color: "#475569", fontSize: 12, margin: "1px 0 0" }}>{edu.institution}{edu.location ? ` · ${edu.location}` : ""}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div>
            <SectionHeader icon={<Star style={{ width: 11, height: 11 }} />} title="Abilități" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 6px", marginTop: 6 }}>
              {skills.map((s, i) => (
                <span key={i} style={{ backgroundColor: "#EEF2FF", color: "#4338CA", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 500 }}>
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <div>
            <SectionHeader icon={<Star style={{ width: 11, height: 11 }} />} title="Limbi" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 16px", marginTop: 6 }}>
              {languages.map((l, i) => (
                <span key={i} style={{ color: "#374151", fontSize: 12 }}>
                  {l.name} <span style={{ color: "#94A3B8" }}>({l.level})</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Hobbies */}
        {hobbies.length > 0 && (
          <div>
            <SectionHeader icon={<Star style={{ width: 11, height: 11 }} />} title="Hobby-uri" />
            <p style={{ color: "#475569", fontSize: 12, margin: "4px 0 0" }}>{hobbies.join(", ")}</p>
          </div>
        )}

        {/* Empty state */}
        {!hasName && experience.length === 0 && education.length === 0 && (
          <div style={{ padding: "32px 0", textAlign: "center", color: "#CBD5E1" }}>
            <p style={{ fontSize: 13, margin: 0 }}>Preview-ul CV-ului</p>
            <p style={{ fontSize: 11, margin: "4px 0 0" }}>completează datele din stânga</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
      <span style={{ color: "#4F46E5" }}>{icon}</span>
      <h3 style={{ fontSize: 10.5, fontWeight: 800, color: "#0F172A", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0, fontFamily: "'Inter', sans-serif" }}>
        {title}
      </h3>
      <div style={{ flex: 1, height: 1, backgroundColor: "#E2E8F0" }} />
    </div>
  );
}
