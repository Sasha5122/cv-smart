import type { CVData } from "@/lib/types/cv";

/**
 * Logica de conținut comună tuturor template-urilor PDF — identică cu
 * preview-ul live (paritate preview ↔ PDF pentru orice design).
 */

export function fullNameOf(data: CVData): string {
  return `${data.personal?.firstName ?? ""} ${data.personal?.lastName ?? ""}`.trim();
}

/** Rândul de contact: adresa completă RO sau adresa liberă + țara (diaspora). */
export function contactItemsOf(data: CVData): string[] {
  const p = data.personal;
  const isAbroad = Boolean(p?.country && p.country !== "România");
  const roStreet = [
    [p?.street, p?.streetNumber].filter(Boolean).join(" "),
    p?.apartment ? `ap. ${p.apartment}` : "",
  ]
    .filter(Boolean)
    .join(", ");
  const items = isAbroad
    ? [p?.email, p?.phone, p?.street, p?.country]
    : [p?.email, p?.phone, roStreet, [p?.city, p?.county].filter(Boolean).join(", ")];
  return items.filter((x): x is string => Boolean(x && x.trim()));
}

export function hasLicenseInfoOf(data: CVData): boolean {
  return (
    (Boolean(data.license?.hasLicense) && (data.license?.categories.length ?? 0) > 0) ||
    Boolean(data.qualifications?.trim())
  );
}

/** „Medie: 9.50 · Lucrare: „..."" — sub intrarea de educație. */
export function eduMetaOf(edu: { grade?: string; thesis?: string }): string {
  return [
    edu.grade ? `Medie: ${edu.grade}` : "",
    edu.thesis ? `Lucrare: „${edu.thesis}"` : "",
  ]
    .filter(Boolean)
    .join("  ·  ");
}
