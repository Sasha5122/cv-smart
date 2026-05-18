import { z } from "zod";

// ─── Sub-schemas ───────────────────────────────────────────────────────────

export const PersonalInfoSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  county: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default("România"),
  photoUrl: z.string().optional(),
});

export const EducationSchema = z.object({
  level: z.string(),
  institution: z.string(),
  field: z.string(),
  years: z.string(),
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

export type SessionStatus = "in_progress" | "draft_generated" | "downloaded";

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
  typicalKPIs: string[];
}

// ─── Template ──────────────────────────────────────────────────────────────

export type TemplateId = "classic" | "modern" | "elegant" | "compact";

// ─── Wizard Step ───────────────────────────────────────────────────────────

export type WizardStep =
  | 0  // CV upload
  | 1  // Job description
  | 2  // Photo
  | 3  // Last name
  | 4  // First name
  | 5  // Phone
  | 6  // Email
  | 7  // Address
  | 8  // Education (conversational)
  | 9  // Experience (conversational)
  | 10 // Skills (conversational)
  | 11 // Languages
  | 12 // License
  | 13 // Hobbies (conversational)
  | 14; // Draft

export const TOTAL_STEPS = 15;

export const STEP_LABELS: Record<WizardStep, string> = {
  0: "CV existent",
  1: "Job vizat",
  2: "Fotografie",
  3: "Nume",
  4: "Prenume",
  5: "Telefon",
  6: "Email",
  7: "Adresă",
  8: "Educație",
  9: "Experiență",
  10: "Abilități",
  11: "Limbi",
  12: "Permis",
  13: "Hobby-uri",
  14: "Draft CV",
};
