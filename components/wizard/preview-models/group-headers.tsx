"use client";
/* eslint-disable @next/next/no-img-element */
import type { CVData } from "@/lib/types/cv";
import { useMessages } from "@/lib/i18n/context";
import { PREVIEW_LABELS } from "@/lib/i18n/wizard/preview-labels";
import {
  Sheet, Row, Bullet, pt, DISPLAY,
  fullNameOf, firstNameOf, lastNameOf, roleOf, localityOf, streetOf, licenseTextOf,
  eduMetaOf, photoOf,
  IPhone, IMail, IPin, ILinkedin, IGlobe, ICheck,
} from "./shared";

/* Replici HTML fidele ale template-urilor PDF cu ANTET plin:
   Meridian (navy+verde), Petrol (teal dens), Atlantic (banner albastru cu
   poză centrată), Manhattan (nume mare albastru + casetă contact). Toate
   dimensiunile vin din fișierele PDF prin pt(). */

/* ── MERIDIAN ─────────────────────────────────────────────── */
const MC = { navy: "#1e2a38", navyDark: "#141c26", green: "#6aa63c", greenLt: "#7cb342", ink: "#1f2937", text: "#374151", muted: "#6b7280", faint: "#9ca3af" };

export function MeridianPreview({ data }: { data: CVData }) {
  const L = useMessages(PREVIEW_LABELS);
  const photo = photoOf(data);
  const p = data.personal;
  const tech = data.skills.filter((sk) => sk.category !== "soft");
  const soft = data.skills.filter((sk) => sk.category === "soft");
  const licenseText = licenseTextOf(data, L);
  const secTitle: React.CSSProperties = { fontSize: pt(11), fontWeight: 900, color: MC.green, marginBottom: pt(6) };
  const bulletText: React.CSSProperties = { fontSize: pt(8.8), color: MC.text, lineHeight: 1.4 };
  const rText: React.CSSProperties = { fontSize: pt(8.8), color: MC.text, lineHeight: 1.45 };
  const contacts = [
    p?.phone && { ic: <IPhone color={MC.greenLt} size={pt(9)} />, t: p.phone },
    p?.email && { ic: <IMail color={MC.greenLt} size={pt(9)} />, t: p.email },
    p?.linkedin && { ic: <ILinkedin color={MC.greenLt} size={pt(9)} />, t: p.linkedin },
    localityOf(data) && { ic: <IPin color={MC.greenLt} size={pt(9)} />, t: localityOf(data) },
  ].filter(Boolean) as { ic: React.ReactNode; t: string }[];

  return (
    <Sheet id="meridian" style={{ color: MC.text }}>
      <div style={{ backgroundColor: MC.navy, display: "flex", alignItems: "center", gap: pt(18), padding: `${pt(20)}px ${pt(30)}px` }}>
        {photo && (
          <img src={photo} alt="" style={{ width: pt(78), height: pt(78), borderRadius: "50%", border: "2px solid #fff", objectFit: "cover", flexShrink: 0 }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: pt(24), fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: pt(0.5), lineHeight: 1.1 }}>
            {fullNameOf(data) || L.fullName}
          </div>
          {roleOf(data) && <div style={{ fontSize: pt(12), fontWeight: 700, color: MC.greenLt, marginTop: pt(2), marginBottom: pt(5) }}>{roleOf(data)}</div>}
          {data.summary && <div style={{ fontSize: pt(8.6), color: "#c8cfd8", lineHeight: 1.5 }}>{data.summary}</div>}
        </div>
      </div>
      {contacts.length > 0 && (
        <div style={{ backgroundColor: MC.navyDark, display: "flex", flexWrap: "wrap", alignItems: "center", gap: pt(14), padding: `${pt(7)}px ${pt(30)}px` }}>
          {contacts.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: pt(4) }}>
              {c.ic}
              <span style={{ fontSize: pt(8), color: "#d5dbe2" }}>{c.t}</span>
            </div>
          ))}
        </div>
      )}
      <Row gap={pt(20)} style={{ padding: `${pt(16)}px ${pt(30)}px ${pt(30)}px` }}>
        <div style={{ width: "60%" }}>
          {data.experience.length > 0 && (
            <div style={{ marginBottom: pt(13) }}>
              <div style={secTitle}>{L.experienceShort}</div>
              {data.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: pt(9) }}>
                  <Row style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span style={{ fontSize: pt(10.5), fontWeight: 700, color: MC.ink, flex: 1 }}>{exp.title}</span>
                    <span style={{ fontSize: pt(8), color: MC.faint, marginLeft: pt(6), flexShrink: 0 }}>{exp.period}</span>
                  </Row>
                  <div style={{ fontSize: pt(9), fontStyle: "italic", color: MC.muted, marginBottom: pt(3) }}>
                    {exp.company}
                    {exp.location ? ` — ${exp.location}` : ""}
                  </div>
                  {[...exp.responsibilities, ...exp.achievements].map((r, j) => (
                    <Bullet key={j} markColor={MC.green} markSize={pt(9)} textStyle={bulletText}>{r}</Bullet>
                  ))}
                </div>
              ))}
            </div>
          )}
          {data.education.length > 0 && (
            <div style={{ marginBottom: pt(13) }}>
              <div style={secTitle}>{L.education}</div>
              {data.education.map((edu, i) => (
                <div key={i} style={{ marginBottom: pt(9) }}>
                  <Row style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span style={{ fontSize: pt(10.5), fontWeight: 700, color: MC.ink, flex: 1 }}>
                      {edu.level}
                      {edu.field ? ` — ${edu.field}` : ""}
                    </span>
                    <span style={{ fontSize: pt(8), color: MC.faint, marginLeft: pt(6), flexShrink: 0 }}>{edu.years}</span>
                  </Row>
                  <div style={{ fontSize: pt(9), fontStyle: "italic", color: MC.muted, marginBottom: pt(3) }}>
                    {edu.institution}
                    {edu.location ? ` — ${edu.location}` : ""}
                  </div>
                  {(edu.grade || edu.thesis) && (
                    <div style={{ fontSize: pt(8.4), color: MC.muted, fontStyle: "italic" }}>{eduMetaOf(edu, L)}</div>
                  )}
                </div>
              ))}
            </div>
          )}
          {data.courses.length > 0 && (
            <div style={{ marginBottom: pt(13) }}>
              <div style={secTitle}>{L.certifications}</div>
              {data.courses.map((c, i) => (
                <Bullet key={i} markColor={MC.green} markSize={pt(9)} textStyle={bulletText}>
                  {c.name}
                  {c.provider ? ` · ${c.provider}` : ""}
                  {c.year ? ` (${c.year})` : ""}
                </Bullet>
              ))}
            </div>
          )}
        </div>
        <div style={{ width: "40%" }}>
          {data.skills.length > 0 && (
            <div style={{ marginBottom: pt(13) }}>
              <div style={secTitle}>{L.skills}</div>
              {tech.length > 0 && <div style={{ fontSize: pt(9), fontWeight: 700, color: MC.ink, margin: `${pt(3)}px 0` }}>{L.technical}</div>}
              {tech.map((sk, i) => (
                <Bullet key={i} markColor={MC.green} markSize={pt(9)} textStyle={rText} mb={pt(2.5)}>{sk.name}</Bullet>
              ))}
              {soft.length > 0 && <div style={{ fontSize: pt(9), fontWeight: 700, color: MC.ink, margin: `${pt(3)}px 0` }}>{L.personal}</div>}
              {soft.map((sk, i) => (
                <Bullet key={i} markColor={MC.green} markSize={pt(9)} textStyle={rText} mb={pt(2.5)}>{sk.name}</Bullet>
              ))}
            </div>
          )}
          {data.languages.length > 0 && (
            <div style={{ marginBottom: pt(13) }}>
              <div style={secTitle}>{L.languagesShort}</div>
              {data.languages.map((l, i) => (
                <Bullet key={i} markColor={MC.green} markSize={pt(9)} textStyle={rText} mb={pt(2.5)}>
                  {l.name}: {l.level}
                </Bullet>
              ))}
            </div>
          )}
          {(licenseText || data.qualifications?.trim()) && (
            <div style={{ marginBottom: pt(13) }}>
              <div style={secTitle}>{L.licenseQualifications}</div>
              {licenseText && <Bullet markColor={MC.green} markSize={pt(9)} textStyle={rText} mb={pt(2.5)}>{licenseText}</Bullet>}
              {data.qualifications?.trim() && (
                <Bullet markColor={MC.green} markSize={pt(9)} textStyle={rText} mb={pt(2.5)}>{data.qualifications.trim()}</Bullet>
              )}
            </div>
          )}
          {data.hobbies.length > 0 && (
            <div style={{ marginBottom: pt(13) }}>
              <div style={secTitle}>{L.hobbies}</div>
              {data.hobbies.map((h, i) => (
                <Bullet key={i} markColor={MC.green} markSize={pt(9)} textStyle={rText} mb={pt(2.5)}>{h}</Bullet>
              ))}
            </div>
          )}
        </div>
      </Row>
    </Sheet>
  );
}

/* ── PETROL ───────────────────────────────────────────────── */
const PC = { teal: "#4a7d80", tealDark: "#3d686b", band: "#d3e4e4", bg: "#eef4f4", ink: "#263435", text: "#3d4a4b", muted: "#64777a" };

export function PetrolPreview({ data }: { data: CVData }) {
  const L = useMessages(PREVIEW_LABELS);
  const photo = photoOf(data);
  const p = data.personal;
  const licenseText = licenseTextOf(data, L);
  const secBand = (label: string) => (
    <div style={{ backgroundColor: PC.band, padding: `${pt(4)}px ${pt(10)}px`, marginBottom: pt(6) }}>
      <span style={{ fontSize: pt(8.5), fontWeight: 900, color: PC.ink, textTransform: "uppercase", letterSpacing: pt(1.2) }}>{label}</span>
    </div>
  );
  const rItem: React.CSSProperties = { fontSize: pt(8.5), marginBottom: pt(2.5), lineHeight: 1.4 };
  const cItem = (ic: React.ReactNode, t: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: pt(4) }}>
      {ic}
      <span style={{ fontSize: pt(7.8), color: "#dcebe9" }}>{t}</span>
    </div>
  );

  return (
    <Sheet id="petrol" style={{ backgroundColor: PC.bg, color: PC.text, fontSize: pt(9), lineHeight: 1.4 }}>
      <div style={{ backgroundColor: PC.teal, display: "flex", alignItems: "center", padding: `${pt(18)}px ${pt(30)}px` }}>
        <div style={{ flex: 1, paddingRight: pt(14), minWidth: 0 }}>
          <div style={{ fontSize: pt(21), fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: pt(1), lineHeight: 1.15 }}>
            {fullNameOf(data) || L.fullName}
          </div>
          {roleOf(data) && (
            <div style={{ fontSize: pt(10), color: "#d8e6e6", fontWeight: 700, textTransform: "uppercase", letterSpacing: pt(1.6), marginTop: pt(5), lineHeight: 1.2 }}>
              {roleOf(data)}
            </div>
          )}
        </div>
        {photo && <img src={photo} alt="" style={{ width: pt(72), height: pt(72), border: "2px solid #fff", objectFit: "cover", flexShrink: 0 }} />}
      </div>
      <div style={{ backgroundColor: PC.tealDark, display: "flex", flexWrap: "wrap", alignItems: "center", gap: pt(14), padding: `${pt(6)}px ${pt(30)}px` }}>
        {p?.phone && cItem(<IPhone color="#a9cbc9" size={pt(8)} />, p.phone)}
        {p?.email && cItem(<IMail color="#a9cbc9" size={pt(8)} />, p.email)}
        {localityOf(data) && cItem(<IPin color="#a9cbc9" size={pt(8)} />, localityOf(data))}
        {p?.linkedin && cItem(<IGlobe color="#a9cbc9" size={pt(8)} />, p.linkedin)}
      </div>
      <Row gap={pt(16)} style={{ padding: `${pt(14)}px ${pt(26)}px ${pt(26)}px` }}>
        <div style={{ width: "56%" }}>
          {data.summary && (
            <div style={{ marginBottom: pt(11) }}>
              {secBand(L.objective)}
              <div style={{ fontSize: pt(8.6), lineHeight: 1.45 }}>{data.summary}</div>
            </div>
          )}
          {data.experience.length > 0 && (
            <div style={{ marginBottom: pt(11) }}>
              {secBand(L.experience)}
              {data.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: pt(7) }}>
                  <Row style={{ justifyContent: "space-between", alignItems: "flex-end" }}>
                    <span style={{ fontSize: pt(9.4), fontWeight: 700, color: PC.ink, flex: 1 }}>{exp.title}</span>
                    <span style={{ fontSize: pt(7.8), color: PC.muted, marginLeft: pt(6), flexShrink: 0 }}>{exp.period}</span>
                  </Row>
                  <div style={{ fontSize: pt(8.2), color: PC.teal, fontWeight: 700, marginBottom: pt(2) }}>
                    {exp.company}
                    {exp.location ? ` · ${exp.location}` : ""}
                  </div>
                  {[...exp.responsibilities, ...exp.achievements].map((r, j) => (
                    <Bullet key={j} markColor={PC.teal} markSize={pt(8)} gap={pt(4.5)} mb={pt(1.5)} textStyle={{ fontSize: pt(8.4), lineHeight: 1.38 }}>
                      {r}
                    </Bullet>
                  ))}
                </div>
              ))}
            </div>
          )}
          {data.education.length > 0 && (
            <div style={{ marginBottom: pt(11) }}>
              {secBand(L.education)}
              {data.education.map((edu, i) => (
                <div key={i} style={{ marginBottom: pt(7) }}>
                  <Row style={{ justifyContent: "space-between", alignItems: "flex-end" }}>
                    <span style={{ fontSize: pt(9.4), fontWeight: 700, color: PC.ink, flex: 1 }}>
                      {edu.level}
                      {edu.field ? ` — ${edu.field}` : ""}
                    </span>
                    <span style={{ fontSize: pt(7.8), color: PC.muted, marginLeft: pt(6), flexShrink: 0 }}>{edu.years}</span>
                  </Row>
                  <div style={{ fontSize: pt(8.2), color: PC.teal, fontWeight: 700 }}>{edu.institution}</div>
                  {(edu.grade || edu.thesis) && (
                    <div style={{ fontSize: pt(7.8), color: PC.muted, fontStyle: "italic" }}>{eduMetaOf(edu, L)}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {data.skills.length > 0 && (
            <div style={{ marginBottom: pt(11) }}>
              {secBand(L.skills)}
              {data.skills.map((sk, i) => (
                <div key={i} style={rItem}>•  {sk.name}</div>
              ))}
            </div>
          )}
          {data.courses.length > 0 && (
            <div style={{ marginBottom: pt(11) }}>
              {secBand(L.certifications)}
              {data.courses.map((c, i) => (
                <div key={i} style={rItem}>
                  •  {c.name}
                  {c.year ? ` (${c.year})` : ""}
                </div>
              ))}
            </div>
          )}
          {data.languages.length > 0 && (
            <div style={{ marginBottom: pt(11) }}>
              {secBand(L.languages)}
              {data.languages.map((l, i) => (
                <div key={i} style={rItem}>
                  •  {l.name} — {l.level}
                </div>
              ))}
            </div>
          )}
          {(licenseText || data.qualifications?.trim() || data.hobbies.length > 0) && (
            <div style={{ marginBottom: pt(11) }}>
              {secBand(L.extra)}
              {licenseText && <div style={rItem}>•  {licenseText}</div>}
              {data.qualifications?.trim() && <div style={rItem}>•  {data.qualifications.trim()}</div>}
              {data.hobbies.map((h, i) => (
                <div key={i} style={rItem}>•  {h}</div>
              ))}
            </div>
          )}
        </div>
      </Row>
    </Sheet>
  );
}

/* ── ATLANTIC ─────────────────────────────────────────────── */
const AC = { blue: "#1b5fb5", ink: "#111827", text: "#374151", muted: "#6b7280", faint: "#9ca3af" };
const A_BANNER_H = 120;
const A_PHOTO = 96;

export function AtlanticPreview({ data }: { data: CVData }) {
  const L = useMessages(PREVIEW_LABELS);
  const photo = photoOf(data);
  const p = data.personal;
  const licenseText = licenseTextOf(data, L);
  const secTitle = (label: string) => (
    <div style={{ fontSize: pt(10), fontWeight: 900, color: AC.ink, textTransform: "uppercase", letterSpacing: pt(0.8), paddingBottom: pt(3), borderBottom: `2px solid ${AC.blue}`, marginBottom: pt(7), alignSelf: "flex-start", display: "inline-block" }}>
      {label}
    </div>
  );
  const lItem = (t: string, i: number) => (
    <div key={i} style={{ display: "flex", alignItems: "center", gap: pt(6), marginBottom: pt(4) }}>
      <ICheck color={AC.blue} size={pt(8)} />
      <span style={{ fontSize: pt(8.6), color: AC.text, flex: 1 }}>{t}</span>
    </div>
  );
  const bcItem = (ic: React.ReactNode, t: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: pt(5) }}>
      {ic}
      <span style={{ fontSize: pt(8.4), color: "#e3edf9" }}>{t}</span>
    </div>
  );

  return (
    <Sheet id="atlantic" style={{ color: AC.text }}>
      <div style={{ backgroundColor: AC.blue, height: pt(A_BANNER_H), display: "flex", alignItems: "center", padding: `0 ${pt(28)}px` }}>
        <div style={{ maxWidth: "38%" }}>
          <div style={{ fontSize: pt(20), color: "#fff", lineHeight: 1.1 }}>{firstNameOf(data) || L.firstName}</div>
          <div style={{ fontSize: pt(26), color: "#fff", fontWeight: 900, textTransform: "uppercase", lineHeight: 1.1 }}>{lastNameOf(data) || L.lastName}</div>
          {roleOf(data) && (
            <div style={{ fontSize: pt(10), color: "#cfe0f5", fontWeight: 700, textTransform: "uppercase", letterSpacing: pt(1), marginTop: pt(4) }}>{roleOf(data)}</div>
          )}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: pt(5) }}>
          {localityOf(data) && bcItem(<IPin color="#fff" size={pt(9)} />, localityOf(data))}
          {p?.phone && bcItem(<IPhone color="#fff" size={pt(9)} />, p.phone)}
          {p?.email && bcItem(<IMail color="#fff" size={pt(9)} />, p.email)}
          {p?.linkedin && bcItem(<ILinkedin color="#fff" size={pt(9)} />, p.linkedin)}
        </div>
      </div>
      {photo && (
        <div
          style={{
            position: "absolute", top: pt(A_BANNER_H - A_PHOTO + 26), left: "50%", marginLeft: -pt(A_PHOTO / 2),
            width: pt(A_PHOTO), height: pt(A_PHOTO), borderRadius: "50%",
            border: "3px solid #fff", overflow: "hidden", backgroundColor: "#fff", boxSizing: "border-box",
          }}
        >
          <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
        </div>
      )}
      <Row gap={pt(22)} style={{ padding: `${pt(40)}px ${pt(28)}px ${pt(30)}px` }}>
        <div style={{ width: "32%" }}>
          {data.skills.length > 0 && (
            <div style={{ marginBottom: pt(14) }}>
              {secTitle(L.skills)}
              {data.skills.map((sk, i) => lItem(sk.name, i))}
            </div>
          )}
          {data.languages.length > 0 && (
            <div style={{ marginBottom: pt(14) }}>
              {secTitle(L.languages)}
              {data.languages.map((l, i) => lItem(`${l.name} — ${l.level}`, i))}
            </div>
          )}
          {data.education.length > 0 && (
            <div style={{ marginBottom: pt(14) }}>
              {secTitle(L.education)}
              {data.education.map((edu, i) => (
                <div key={i}>
                  <div style={{ fontSize: pt(8), color: AC.faint, marginBottom: pt(1) }}>{edu.years}</div>
                  <div style={{ fontSize: pt(9.2), fontWeight: 700, color: AC.ink }}>
                    {edu.level}
                    {edu.field ? ` — ${edu.field}` : ""}
                  </div>
                  <div style={{ fontSize: pt(8.6), color: AC.muted, fontStyle: "italic", marginBottom: pt(6) }}>{edu.institution}</div>
                </div>
              ))}
            </div>
          )}
          {(licenseText || data.qualifications?.trim()) && (
            <div style={{ marginBottom: pt(14) }}>
              {secTitle(L.licenseQualifications)}
              {licenseText && lItem(licenseText, 0)}
              {data.qualifications?.trim() && lItem(data.qualifications.trim(), 1)}
            </div>
          )}
          {data.hobbies.length > 0 && (
            <div style={{ marginBottom: pt(14) }}>
              {secTitle(L.hobbies)}
              {data.hobbies.map((h, i) => lItem(h, i))}
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {data.summary && (
            <div style={{ marginBottom: pt(14) }}>
              {secTitle(L.profile)}
              <div style={{ fontSize: pt(9.4), lineHeight: 1.55 }}>{data.summary}</div>
            </div>
          )}
          {data.experience.length > 0 && (
            <div style={{ marginBottom: pt(14) }}>
              {secTitle(L.experience)}
              {data.experience.map((exp, i) => (
                <Row key={i} gap={pt(12)} style={{ marginBottom: pt(11) }}>
                  <div style={{ width: pt(74), flexShrink: 0, fontSize: pt(8.2), color: AC.muted, lineHeight: 1.4 }}>
                    {exp.period}
                    {exp.location ? <><br />({exp.location})</> : null}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: pt(10.5), fontWeight: 900, color: AC.ink, textTransform: "uppercase", letterSpacing: pt(0.3) }}>{exp.company}</div>
                    <div style={{ fontSize: pt(9), color: AC.blue, fontWeight: 700, marginTop: pt(1), marginBottom: pt(3) }}>{exp.title}</div>
                    {[...exp.responsibilities, ...exp.achievements].map((r, j) => (
                      <Bullet key={j} markColor={AC.ink} markSize={pt(8.5)} textStyle={{ fontSize: pt(8.8), color: AC.text, lineHeight: 1.42 }}>{r}</Bullet>
                    ))}
                  </div>
                </Row>
              ))}
            </div>
          )}
          {data.courses.length > 0 && (
            <div style={{ marginBottom: pt(14) }}>
              {secTitle(L.certifications)}
              {data.courses.map((c, i) => (
                <Bullet key={i} markColor={AC.ink} markSize={pt(8.5)} textStyle={{ fontSize: pt(8.8), color: AC.text, lineHeight: 1.42 }}>
                  {c.name}
                  {c.provider ? ` · ${c.provider}` : ""}
                  {c.year ? ` (${c.year})` : ""}
                </Bullet>
              ))}
            </div>
          )}
        </div>
      </Row>
    </Sheet>
  );
}

/* ── MANHATTAN ────────────────────────────────────────────── */
const HC = { blue: "#2077b4", teal: "#1aa39b", ink: "#1f2430", text: "#3d4451", muted: "#6b7280", hair: "#d7dbe0" };

export function ManhattanPreview({ data }: { data: CVData }) {
  const L = useMessages(PREVIEW_LABELS);
  const photo = photoOf(data);
  const p = data.personal;
  const licenseText = licenseTextOf(data, L);
  const bioItems = [
    localityOf(data) && { l: L.city, v: localityOf(data) },
    licenseText && { l: L.licenseShort, v: data.license!.categories.join(", ") },
    data.languages.length > 0 && { l: L.languagesShort, v: data.languages.map((x) => x.name).join(", ") },
    data.hobbies.length > 0 && { l: L.hobbyShort, v: data.hobbies.join(", ") },
  ].filter(Boolean) as { l: string; v: string }[];
  const secTitle = (label: string) => (
    <div style={{ fontFamily: DISPLAY, fontSize: pt(11.5), fontWeight: 700, color: HC.blue, marginBottom: pt(3) }}>{label}</div>
  );
  const secLine = <div style={{ height: 1, backgroundColor: HC.hair, marginBottom: pt(7) }} />;
  const skillCell = (t: string, i: number | string) => (
    <div key={i} style={{ width: "33.33%", display: "flex", gap: pt(5), marginBottom: pt(4), paddingRight: pt(8), boxSizing: "border-box" }}>
      <span style={{ color: HC.blue, fontSize: pt(9), flexShrink: 0 }}>•</span>
      <span style={{ flex: 1, fontSize: pt(8.8), minWidth: 0 }}>{t}</span>
    </div>
  );

  return (
    <Sheet id="manhattan" style={{ color: HC.text, padding: `${pt(40)}px ${pt(36)}px ${pt(34)}px` }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: pt(8), backgroundColor: HC.teal }} />
      <Row gap={pt(20)}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: pt(30), color: HC.blue, lineHeight: 1.05 }}>
            {fullNameOf(data) || L.fullName}
          </div>
          {roleOf(data) && <div style={{ fontSize: pt(10), color: HC.muted, marginTop: pt(4) }}>{roleOf(data)}</div>}
          <div style={{ backgroundColor: HC.blue, padding: `${pt(14)}px ${pt(18)}px`, marginTop: pt(16), width: "100%", boxSizing: "border-box" }}>
            <div style={{ fontSize: pt(12), fontWeight: 900, color: "#fff", marginBottom: pt(8) }}>{L.contactInfo}</div>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {p?.phone && (
                <div style={{ width: "50%", marginBottom: pt(7), paddingRight: pt(12), boxSizing: "border-box" }}>
                  <div style={{ fontSize: pt(8.5), fontWeight: 700, color: "#bcd9ee", marginBottom: pt(1.5) }}>{L.phone}</div>
                  <div style={{ fontSize: pt(9), color: "#fff" }}>{p.phone}</div>
                </div>
              )}
              {(streetOf(data) || localityOf(data)) && (
                <div style={{ width: "50%", marginBottom: pt(7), paddingRight: pt(12), boxSizing: "border-box" }}>
                  <div style={{ fontSize: pt(8.5), fontWeight: 700, color: "#bcd9ee", marginBottom: pt(1.5) }}>{L.address}</div>
                  <div style={{ fontSize: pt(9), color: "#fff" }}>{[streetOf(data), localityOf(data)].filter(Boolean).join(", ")}</div>
                </div>
              )}
              {p?.email && (
                <div style={{ width: "50%", marginBottom: pt(7), paddingRight: pt(12), boxSizing: "border-box" }}>
                  <div style={{ fontSize: pt(8.5), fontWeight: 700, color: "#bcd9ee", marginBottom: pt(1.5) }}>{L.email}</div>
                  <div style={{ fontSize: pt(9), color: "#fff", wordBreak: "break-word" }}>{p.email}</div>
                </div>
              )}
              {p?.linkedin && (
                <div style={{ width: "50%", marginBottom: pt(7), paddingRight: pt(12), boxSizing: "border-box" }}>
                  <div style={{ fontSize: pt(8.5), fontWeight: 700, color: "#bcd9ee", marginBottom: pt(1.5) }}>{L.linkedin}</div>
                  <div style={{ fontSize: pt(9), color: "#fff", wordBreak: "break-word" }}>{p.linkedin}</div>
                </div>
              )}
            </div>
          </div>
        </div>
        {photo && <img src={photo} alt="" style={{ width: pt(150), height: pt(186), objectFit: "cover", flexShrink: 0 }} />}
      </Row>

      {(data.summary || bioItems.length > 0) && (
        <div style={{ marginTop: pt(15) }}>
          <Row gap={pt(22)}>
            {data.summary && (
              <div style={{ flex: 1, minWidth: 0 }}>
                {secTitle(L.profilePersonal)}
                {secLine}
                <div style={{ fontSize: pt(9.4), lineHeight: 1.55 }}>{data.summary}</div>
              </div>
            )}
            {bioItems.length > 0 && (
              <div style={{ width: pt(150), flexShrink: 0 }}>
                {secTitle(L.atAGlance)}
                {secLine}
                {bioItems.map((b, i) => (
                  <Row key={i} style={{ marginBottom: pt(3) }}>
                    <span style={{ fontSize: pt(8.6), fontWeight: 700, color: HC.ink, width: pt(52), flexShrink: 0 }}>{b.l}:</span>
                    <span style={{ fontSize: pt(8.6), color: HC.muted, flex: 1 }}>{b.v}</span>
                  </Row>
                ))}
              </div>
            )}
          </Row>
        </div>
      )}

      {data.education.length > 0 && (
        <div style={{ marginTop: pt(15) }}>
          {secTitle(L.education)}
          {secLine}
          <div style={{ display: "flex", flexWrap: "wrap", gap: pt(18) }}>
            {data.education.map((edu, i) => (
              <div key={i} style={{ width: "46%" }}>
                <div style={{ fontSize: pt(8.4), color: HC.muted }}>{edu.years}</div>
                <div style={{ fontSize: pt(9.6), fontWeight: 700, color: HC.ink, marginTop: pt(1) }}>{edu.institution}</div>
                <div style={{ fontSize: pt(8.8), marginTop: pt(1) }}>
                  {edu.level}
                  {edu.field ? ` — ${edu.field}` : ""}
                </div>
                {(edu.grade || edu.thesis) && (
                  <div style={{ fontSize: pt(8), color: HC.muted, fontStyle: "italic", marginTop: pt(1) }}>{eduMetaOf(edu, L)}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {(data.skills.length > 0 || data.qualifications?.trim()) && (
        <div style={{ marginTop: pt(15) }}>
          {secTitle(L.skills)}
          {secLine}
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {data.skills.map((sk, i) => skillCell(sk.name, i))}
            {data.qualifications?.trim()
              ? data.qualifications.split(",").map((q, i) => skillCell(q.trim(), `q${i}`))
              : null}
            {data.courses.map((c, i) => skillCell(`${c.name}${c.year ? ` (${c.year})` : ""}`, `c${i}`))}
          </div>
        </div>
      )}

      {data.experience.length > 0 && (
        <div style={{ marginTop: pt(15) }}>
          {secTitle(L.experience)}
          {secLine}
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: pt(10), paddingTop: pt(7), borderTop: `2px solid ${HC.blue}` }}>
              <Row gap={pt(18)}>
                <div style={{ width: pt(160), flexShrink: 0 }}>
                  <div style={{ fontSize: pt(8.6), color: HC.muted }}>{exp.period}</div>
                  <div style={{ fontSize: pt(9.8), fontWeight: 900, color: HC.ink, marginTop: pt(1) }}>{exp.company}</div>
                  <div style={{ fontSize: pt(8.8), color: HC.blue, fontWeight: 700 }}>{exp.title}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {[...exp.responsibilities, ...exp.achievements].map((r, j) => (
                    <Bullet key={j} markColor={HC.blue} markSize={pt(9)} textStyle={{ fontSize: pt(8.8), lineHeight: 1.42 }}>{r}</Bullet>
                  ))}
                </div>
              </Row>
            </div>
          ))}
        </div>
      )}
    </Sheet>
  );
}
