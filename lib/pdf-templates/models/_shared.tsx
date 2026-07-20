import { Svg, Path, Circle, Rect } from "@react-pdf/renderer";
import type { CVData } from "@/lib/types/cv";

/* Helpers + iconițe SVG comune template-urilor „model" (replici după modele_cv).
   Iconițele sunt path-uri simple pe viewBox 24×24, colorate prin prop `color`. */

export function firstNameOf(d: CVData) {
  return (d.personal?.firstName ?? "").trim();
}
export function lastNameOf(d: CVData) {
  return (d.personal?.lastName ?? "").trim();
}
export function roleOf(d: CVData) {
  return (d.targetTitle ?? "").trim();
}

/** Localitatea scurtă pentru antet (oraș, județ) sau adresa din străinătate. */
export function localityOf(d: CVData): string {
  const p = d.personal;
  if (p?.country && p.country !== "România") {
    return [p?.street, p?.country].filter(Boolean).join(", ");
  }
  return [p?.city, p?.county].filter(Boolean).join(", ");
}

/** Adresa pe un rând (stradă nr, ap.). */
export function streetOf(d: CVData): string {
  const p = d.personal;
  return [
    [p?.street, p?.streetNumber].filter(Boolean).join(" "),
    p?.apartment ? `ap. ${p.apartment}` : "",
  ]
    .filter(Boolean)
    .join(", ");
}

export function licenseTextOf(d: CVData): string {
  if (d.license?.hasLicense && d.license.categories.length > 0) {
    return `Permis categoria ${d.license.categories.join(", ")}`;
  }
  return "";
}

/** Lățimile decorative pentru barele de skill (3 trepte ciclice). */

type IconProps = { color?: string; size?: number };

export function IconPhone({ color = "#000", size = 10 }: IconProps) {
  return (
    <Svg viewBox="0 0 24 24" style={{ width: size, height: size }}>
      <Path
        d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.3 1.1L6.6 10.8z"
        fill={color}
      />
    </Svg>
  );
}
export function IconMail({ color = "#000", size = 10 }: IconProps) {
  return (
    <Svg viewBox="0 0 24 24" style={{ width: size, height: size }}>
      <Path
        d="M3 5h18c.6 0 1 .4 1 1v12c0 .6-.4 1-1 1H3c-.6 0-1-.4-1-1V6c0-.6.4-1 1-1zm9 7L4 6.5V18h16V6.5L12 12z"
        fill={color}
      />
    </Svg>
  );
}
export function IconPin({ color = "#000", size = 10 }: IconProps) {
  return (
    <Svg viewBox="0 0 24 24" style={{ width: size, height: size }}>
      <Path
        d="M12 2c3.9 0 7 3.1 7 7 0 5-7 13-7 13S5 14 5 9c0-3.9 3.1-7 7-7zm0 4.5A2.5 2.5 0 1012 11.5 2.5 2.5 0 0012 6.5z"
        fill={color}
      />
    </Svg>
  );
}
export function IconGlobe({ color = "#000", size = 10 }: IconProps) {
  return (
    <Svg viewBox="0 0 24 24" style={{ width: size, height: size }}>
      <Path
        d="M12 2a10 10 0 100 20 10 10 0 000-20zm6.9 6h-2.9a15 15 0 00-1.3-3.6A8 8 0 0118.9 8zM12 4c.8 1.1 1.4 2.5 1.8 4h-3.6C10.6 6.5 11.2 5.1 12 4zM4.3 14a8 8 0 010-4h3.3a17 17 0 000 4H4.3zm.8 2h2.9c.3 1.3.8 2.5 1.3 3.6A8 8 0 015.1 16zM8 8H5.1a8 8 0 013.1-3.6C7.7 5.5 7.3 6.7 8 8zm4 12c-.8-1.1-1.4-2.5-1.8-4h3.6c-.4 1.5-1 2.9-1.8 4zm2.2-6H9.8a15 15 0 010-4h4.4a15 15 0 010 4zm.6 5.6c.5-1.1 1-2.3 1.3-3.6h2.9a8 8 0 01-4.2 3.6zM16.4 14a17 17 0 000-4h3.3a8 8 0 010 4h-3.3z"
        fill={color}
      />
    </Svg>
  );
}
export function IconLinkedin({ color = "#000", size = 10 }: IconProps) {
  return (
    <Svg viewBox="0 0 24 24" style={{ width: size, height: size }}>
      <Rect x="2" y="2" width="20" height="20" rx="3" fill={color} />
      <Circle cx="6.5" cy="7" r="1.6" fill="#fff" />
      <Rect x="5.1" y="10" width="2.8" height="8" fill="#fff" />
      <Path d="M10 10h2.7v1.2c.5-.9 1.5-1.4 2.6-1.4 2.2 0 3.2 1.3 3.2 3.8V18h-2.8v-3.9c0-1.1-.4-1.8-1.4-1.8s-1.5.7-1.5 1.8V18H10v-8z" fill="#fff" />
    </Svg>
  );
}
export function IconUser({ color = "#000", size = 10 }: IconProps) {
  return (
    <Svg viewBox="0 0 24 24" style={{ width: size, height: size }}>
      <Circle cx="12" cy="8" r="4" fill={color} />
      <Path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" fill={color} />
    </Svg>
  );
}
export function IconStar({ color = "#000", size = 10 }: IconProps) {
  return (
    <Svg viewBox="0 0 24 24" style={{ width: size, height: size }}>
      <Path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.7L12 17.3 5.9 21l1.5-6.7L2.2 9l6.9-.7L12 2z" fill={color} />
    </Svg>
  );
}
export function IconCheck({ color = "#000", size = 8 }: IconProps) {
  return (
    <Svg viewBox="0 0 24 24" style={{ width: size, height: size }}>
      <Path d="M9.5 16.2L5.3 12l-1.6 1.6 5.8 5.8L21.9 7l-1.6-1.6z" fill={color} />
    </Svg>
  );
}
export function IconBriefcase({ color = "#000", size = 10 }: IconProps) {
  return (
    <Svg viewBox="0 0 24 24" style={{ width: size, height: size }}>
      <Path d="M9 4h6c.6 0 1 .4 1 1v2h4c.6 0 1 .4 1 1v11c0 .6-.4 1-1 1H3c-.6 0-1-.4-1-1V8c0-.6.4-1 1-1h4V5c0-.6.4-1 1-1zm1 3h4V6h-4v1z" fill={color} />
    </Svg>
  );
}
export function IconCap({ color = "#000", size = 10 }: IconProps) {
  return (
    <Svg viewBox="0 0 24 24" style={{ width: size, height: size }}>
      <Path d="M12 3l10 5-10 5L2 8l10-5zm-6 8.5L12 15l6-3.5V15c0 1.7-2.7 3-6 3s-6-1.3-6-3v-3.5z" fill={color} />
    </Svg>
  );
}
