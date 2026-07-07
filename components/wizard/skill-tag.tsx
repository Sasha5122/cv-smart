"use client";
import { X } from "lucide-react";
import type { Skill } from "@/lib/types/cv";

interface SkillTagProps {
  skill: Skill;
  onRemove: () => void;
}

export function SkillTag({ skill, onRemove }: SkillTagProps) {
  return (
    <div className="group flex items-center gap-2 bg-[var(--card)] border border-[var(--hairline)] rounded-xl px-3 py-2 hover:border-indigo-300 hover:bg-[var(--wash)]/50 transition-all duration-150">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--ink)] truncate">{skill.name}</p>
        {skill.source && (
          <p className="text-xs text-[var(--faint)] truncate">{skill.source}</p>
        )}
      </div>
      <button
        onClick={onRemove}
        className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-400 hover:text-red-600 transition-colors shrink-0"
        aria-label={`Șterge ${skill.name}`}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
