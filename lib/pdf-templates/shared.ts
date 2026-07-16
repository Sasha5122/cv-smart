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

/** Sursa imaginii pentru <Image> din react-pdf.
 *  Data-URI-urile NU se randează fiabil în react-pdf (eșuează silențios —
 *  bug prins la testul cu utilizatori reali), așa că le decodăm în Buffer,
 *  forma suportată garantat. URL-urile http(s) trec neschimbate. */
export function photoSrcOf(
  data: CVData
): string | { data: Buffer; format: "jpg" | "png" } | null {
  const url = data.personal?.photoUrl;
  if (!url) return null;
  const m = url.match(/^data:image\/(jpeg|jpg|png);base64,(.+)$/);
  if (m) {
    return { data: Buffer.from(m[2], "base64"), format: m[1] === "png" ? "png" : "jpg" };
  }
  // format nesuportat de PDF (ex. webp) → fără fotografie, nu PDF stricat
  if (url.startsWith("data:")) return null;
  return url;
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
