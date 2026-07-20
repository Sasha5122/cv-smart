import { z } from "zod";

// ─── Sub-schemas ───────────────────────────────────────────────────────────

export const PersonalInfoSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  street: z.string().optional(),
  streetNumber: z.string().optional(),
  apartment: z.string().optional(),
  city: z.string().optional(),
  county: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default("România"),
  photoUrl: z.string().optional(),
  /** imaginea ÎNTREAGĂ (necropată, max ~1000px) — sursa pentru ajustarea
   *  manuală a încadrării; PDF-ul folosește DOAR photoUrl */
  photoFull: z.string().optional(),
  linkedin: z.string().optional(),
});

export const EducationSchema = z.object({
  level: z.string(),
  institution: z.string(),
  field: z.string(),
  years: z.string(),
  location: z.string().optional(),
  thesis: z.string().optional(),
  grade: z.string().optional(),
});

export const CourseSchema = z.object({
  name: z.string(),
  provider: z.string().optional(),
  year: z.string().optional(),
});

export const ExperienceSchema = z.object({
  company: z.string(),
  location: z.string().optional(),
  title: z.string(),
  period: z.string(),
  responsibilities: z.array(z.string()).default([]),
  achievements: z.array(z.string()).default([]),
});

export const SkillSchema = z.object({
  name: z.string(),
  source: z.string().optional(),
  category: z.enum(["hard", "software", "soft"]).optional(),
});

export const LanguageSchema = z.object({
  name: z.string(),
  level: z.string(),
});

export const DrivingLicenseSchema = z.object({
  hasLicense: z.boolean().default(false),
  categories: z.array(z.string()).default([]),
});

export const CVDataSchema = z.object({
  personal: PersonalInfoSchema.partial(),
  education: z.array(EducationSchema).default([]),
  courses: z.array(CourseSchema).default([]),
  experience: z.array(ExperienceSchema).default([]),
  skills: z.array(SkillSchema).default([]),
  languages: z.array(LanguageSchema).default([]),
  license: DrivingLicenseSchema.optional(),
  qualifications: z.string().optional(),
  hobbies: z.array(z.string()).default([]),
  summary: z.string().optional(),
  targetTitle: z.string().optional(),
});

// ─── TypeScript Types ──────────────────────────────────────────────────────

export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Course = z.infer<typeof CourseSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type Language = z.infer<typeof LanguageSchema>;
export type DrivingLicense = z.infer<typeof DrivingLicenseSchema>;
export type CVData = z.infer<typeof CVDataSchema>;

// ─── Initial State ─────────────────────────────────────────────────────────

export const EMPTY_CV_DATA: CVData = {
  personal: { country: "România" },
  education: [],
  courses: [],
  experience: [],
  skills: [],
  languages: [],
  license: { hasLicense: false, categories: [] },
  qualifications: "",
  hobbies: [],
  summary: "",
  targetTitle: "",
};

// ─── Chat Message ──────────────────────────────────────────────────────────

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

// ─── Session ───────────────────────────────────────────────────────────────

export type SessionStatus = "in_progress" | "draft_generated" | "paid" | "downloaded";

/**
 * Sesiunea e într-o stare plătită? — UNICUL loc care definește asta.
 * (Nota: sursa completă de adevăr include și evenimentul `payment_completed`
 * din tabela events — vezi isSessionPaid din lib/db/queries.)
 */
export function isPaidStatus(status: SessionStatus | string | undefined): boolean {
  return status === "paid" || status === "downloaded";
}

export interface Session {
  id: string;
  email?: string;
  status: SessionStatus;
  cv_data: CVData;
  job_description?: string;
  ideal_profile?: IdealProfile;
  draft_cv?: string;
  final_cv?: string;
  photo_url?: string;
  template_id?: TemplateId;
  created_at: string;
  updated_at: string;
}

// ─── Ideal Profile (from AI Research) ─────────────────────────────────────

export interface IdealProfile {
  role: string;
  industry: string;
  seniority: string;
  responsibilities: string[];
  hardSkills: string[];
  softSkills: string[];
  atsKeywords: string[];
}

// ─── Template ──────────────────────────────────────────────────────────────

export type TemplateId =
  | "classic"
  | "modern"
  | "elegant"
  | "compact"
  | "minimal"
  // replici după modelele din modele_cv (id = numele fancy, lowercase)
  | "meridian"
  | "velvet"
  | "riviera"
  | "flamingo"
  | "atlantic"
  | "petrol"
  | "manhattan"
  | "blush"
  | "sage"
  | "graphite"
  | "cobalt"
  | "amber"
  | "sterling"
  | "sapphire";

/** Toate designurile valide — sursa unică pentru validări (DB, API, preview). */
export const ALL_TEMPLATE_IDS: TemplateId[] = [
  "classic", "modern", "elegant", "compact", "minimal",
  "meridian", "velvet", "riviera", "flamingo", "atlantic", "petrol",
  "manhattan", "blush", "sage", "graphite", "cobalt", "amber", "sterling", "sapphire",
];

// ─── Wizard Step ───────────────────────────────────────────────────────────

export type WizardStep =
  | 1  // Contact
  | 2  // Fotografie
  | 3  // Job vizat
  | 4  // Experiență
  | 5  // Educație
  | 6  // Abilități
  | 7  // Limbi
  | 8  // Permis
  | 9  // Hobby-uri
  | 10; // Finalizare

export const TOTAL_STEPS = 10;

export const STEP_LABELS: Record<WizardStep, string> = {
  1: "Contact",
  2: "Poză",
  3: "Unde aplici",
  4: "Experiență",
  5: "Educație",
  6: "Abilități",
  7: "Limbi",
  8: "Permis",
  9: "Hobby-uri",
  10: "Finalizare",
};
