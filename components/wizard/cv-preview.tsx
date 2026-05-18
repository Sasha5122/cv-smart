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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200 text-[10px] leading-relaxed font-[serif]">
      {/* CV Header */}
      <div className="bg-slate-900 px-5 py-4 text-white">
        <div className="flex items-start gap-3">
          {/* Photo placeholder */}
          <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
            {personal?.photoUrl ? (
              <img
                src={personal.photoUrl}
                alt="Foto"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-slate-400" />
            )}
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight">
              {hasName
                ? `${personal?.firstName ?? ""} ${personal?.lastName ?? ""}`.trim()
                : "Prenume Nume"}
            </h1>
            {cvData.targetTitle && (
              <p className="text-slate-300 text-[11px] mt-0.5">{cvData.targetTitle}</p>
            )}
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2 text-slate-300">
              {personal?.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-2.5 h-2.5" />
                  {personal.email}
                </span>
              )}
              {personal?.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-2.5 h-2.5" />
                  {personal.phone}
                </span>
              )}
              {personal?.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5" />
                  {personal.city}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Summary */}
        {cvData.summary && (
          <div>
            <SectionHeader icon={<Star className="w-3 h-3" />} title="Rezumat" />
            <p className="text-slate-700 mt-1">{cvData.summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div>
            <SectionHeader icon={<Briefcase className="w-3 h-3" />} title="Experiență" />
            <div className="space-y-2 mt-1">
              {experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-slate-900">{exp.title}</span>
                    <span className="text-slate-400">{exp.period}</span>
                  </div>
                  <p className="text-indigo-700">{exp.company}</p>
                  {exp.responsibilities.slice(0, 2).map((r, j) => (
                    <p key={j} className="text-slate-600">• {r}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div>
            <SectionHeader icon={<GraduationCap className="w-3 h-3" />} title="Educație" />
            <div className="space-y-1.5 mt-1">
              {education.map((edu, i) => (
                <div key={i}>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-900">{edu.level} — {edu.field}</span>
                    <span className="text-slate-400">{edu.years}</span>
                  </div>
                  <p className="text-slate-600">{edu.institution}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div>
            <SectionHeader icon={<Star className="w-3 h-3" />} title="Abilități" />
            <div className="flex flex-wrap gap-1 mt-1">
              {skills.map((s, i) => (
                <span key={i} className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[9px]">
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <div>
            <SectionHeader icon={<Star className="w-3 h-3" />} title="Limbi" />
            <div className="flex flex-wrap gap-x-3 mt-1">
              {languages.map((l, i) => (
                <span key={i} className="text-slate-700">
                  {l.name} <span className="text-slate-400">({l.level})</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Hobbies */}
        {hobbies.length > 0 && (
          <div>
            <SectionHeader icon={<Star className="w-3 h-3" />} title="Hobby-uri" />
            <p className="text-slate-700 mt-1">{hobbies.join(", ")}</p>
          </div>
        )}

        {/* Empty state */}
        {!hasName && experience.length === 0 && education.length === 0 && (
          <div className="py-6 text-center text-slate-300">
            <p className="text-sm">Preview-ul CV-ului</p>
            <p className="text-xs mt-1">completează datele din stânga</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-1.5 mb-1">
      <span className="text-indigo-600">{icon}</span>
      <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
        {title}
      </h3>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}
