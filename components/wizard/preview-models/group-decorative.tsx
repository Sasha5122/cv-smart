"use client";
/* eslint-disable @next/next/no-img-element */
import type { CVData } from "@/lib/types/cv";
import { useMessages } from "@/lib/i18n/context";
import { PREVIEW_LABELS } from "@/lib/i18n/wizard/preview-labels";
import {
  Sheet, Row, Bullet, pt, SERIF,
  fullNameOf, firstNameOf, lastNameOf, roleOf, localityOf, streetOf, licenseTextOf,
  eduMetaOf, photoOf,
  IPhone, IMail, IPin, IGlobe,
} from "./shared";

/* Replici HTML fidele ale template-urilor PDF DECORATIVE:
   Riviera (panglică teal + poză mare), Blush (triunghiuri pastel),
   Flamingo (curbe roz/gri), Sage (panou salvie + bandă roz, serif),
   Sterling (coloană gri pal + accente albastre). */

const A4W = 595;

/* ── RIVIERA ──────────────────────────────────────────────── */
const RC = { teal: "#1fbcb4", ink: "#17181c", text: "#3d4451", muted: "#6b7280", bg: "#f4fafa" };
const R_PHOTO = 132;
const R_RIBBON_W = 46;
const R_RIBBON_X = 40 + R_PHOTO / 2 - R_RIBBON_W / 2;

export function RivieraPreview({ data }: { data: CVData }) {
  const L = useMessages(PREVIEW_LABELS);
  const photo = photoOf(data);
  const p = data.personal;
  const licenseText = licenseTextOf(data, L);
  const pill = (label: string, right = false) => (
    <div style={{ backgroundColor: RC.teal, borderRadius: pt(11), padding: `${pt(4.5)}px ${pt(16)}px`, display: "inline-block", alignSelf: right ? "flex-end" : "flex-start", marginBottom: pt(8) }}>
      <span style={{ fontSize: pt(9.5), fontWeight: 700, color: "#fff", letterSpacing: pt(0.4) }}>{label}</span>
    </div>
  );
  const lItem: React.CSSProperties = { fontSize: pt(9), color: RC.text, marginBottom: pt(4), lineHeight: 1.45 };
  const entryYears: React.CSSProperties = { fontSize: pt(9.5), fontWeight: 900, color: RC.ink };
  const entryTitle: React.CSSProperties = { fontSize: pt(9.6), fontWeight: 700, color: RC.text, marginTop: pt(0.5) };
  const entryMeta: React.CSSProperties = { fontSize: pt(8.6), color: RC.muted, marginTop: pt(0.5), marginBottom: pt(2) };
  const entryText: React.CSSProperties = { fontSize: pt(8.8), color: RC.text, lineHeight: 1.45, marginBottom: pt(1.5) };

  return (
    <Sheet id="riviera" style={{ backgroundColor: RC.bg, color: RC.text, lineHeight: 1.5 }}>
      <div style={{ position: "absolute", top: 0, left: pt(R_RIBBON_X), width: pt(R_RIBBON_W), height: pt(210), backgroundColor: RC.teal }} />
      {photo && (
        <div style={{ position: "absolute", top: pt(40), left: pt(40), width: pt(R_PHOTO), height: pt(R_PHOTO), borderRadius: "50%", border: `6px solid ${RC.teal}`, overflow: "hidden", backgroundColor: "#fff", boxSizing: "border-box" }}>
          <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
        </div>
      )}
      <div style={{ position: "absolute", top: pt(52), left: pt(215), right: pt(36), textAlign: "right" }}>
        <div style={{ fontSize: pt(30), fontWeight: 900, color: RC.ink, textTransform: "uppercase", letterSpacing: pt(1), lineHeight: 1.08 }}>
          {firstNameOf(data) || L.firstName}
          <br />
          {lastNameOf(data) || L.lastName}
        </div>
        {roleOf(data) && <div style={{ fontSize: pt(12), fontStyle: "italic", color: RC.teal, marginTop: pt(5) }}>{roleOf(data)}</div>}
      </div>

      <Row gap={pt(26)} style={{ paddingTop: pt(216), paddingLeft: pt(36), paddingRight: pt(36), paddingBottom: pt(32) }}>
        <div style={{ width: "37%" }}>
          <div style={{ marginBottom: pt(14), display: "flex", flexDirection: "column" }}>
            {pill(L.contact)}
            {p?.phone && <div style={lItem}>{p.phone}</div>}
            {p?.email && <div style={lItem}>{p.email}</div>}
            {(streetOf(data) || localityOf(data)) && <div style={lItem}>{[streetOf(data), localityOf(data)].filter(Boolean).join(", ")}</div>}
            {p?.linkedin && <div style={lItem}>{p.linkedin}</div>}
          </div>
          {data.skills.length > 0 && (
            <div style={{ marginBottom: pt(14), display: "flex", flexDirection: "column" }}>
              {pill(L.skills)}
              {data.skills.map((sk, i) => (
                <div key={i} style={lItem}>{sk.name}</div>
              ))}
            </div>
          )}
          {data.languages.length > 0 && (
            <div style={{ marginBottom: pt(14), display: "flex", flexDirection: "column" }}>
              {pill(L.languages)}
              {data.languages.map((l, i) => (
                <div key={i} style={lItem}>{l.name} — {l.level}</div>
              ))}
            </div>
          )}
          {(licenseText || data.qualifications?.trim() || data.hobbies.length > 0) && (
            <div style={{ marginBottom: pt(14), display: "flex", flexDirection: "column" }}>
              {pill(L.extra)}
              {licenseText && <div style={lItem}>{licenseText}</div>}
              {data.qualifications?.trim() && <div style={lItem}>{data.qualifications.trim()}</div>}
              {data.hobbies.length > 0 && <div style={lItem}>{L.hobbiesLabel} {data.hobbies.join(", ")}</div>}
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {data.summary && (
            <div style={{ marginBottom: pt(14), display: "flex", flexDirection: "column" }}>
              {pill(L.profile, true)}
              <div style={{ fontSize: pt(9.2), lineHeight: 1.6, color: RC.text }}>{data.summary}</div>
            </div>
          )}
          {data.experience.length > 0 && (
            <div style={{ marginBottom: pt(14), display: "flex", flexDirection: "column" }}>
              {pill(L.experienceShort, true)}
              {data.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: pt(9) }}>
                  <div style={entryYears}>{exp.period}</div>
                  <div style={entryTitle}>{exp.title}</div>
                  <div style={entryMeta}>
                    {exp.company}
                    {exp.location ? ` · ${exp.location}` : ""}
                  </div>
                  {[...exp.responsibilities, ...exp.achievements].map((r, j) => (
                    <div key={j} style={entryText}>{r}</div>
                  ))}
                </div>
              ))}
            </div>
          )}
          {data.education.length > 0 && (
            <div style={{ marginBottom: pt(14), display: "flex", flexDirection: "column" }}>
              {pill(L.education, true)}
              {data.education.map((edu, i) => (
                <div key={i} style={{ marginBottom: pt(9) }}>
                  <div style={entryYears}>{edu.years}</div>
                  <div style={entryTitle}>
                    {edu.level}
                    {edu.field ? ` — ${edu.field}` : ""}
                  </div>
                  <div style={entryMeta}>{edu.institution}</div>
                  {(edu.grade || edu.thesis) && <div style={entryText}>{eduMetaOf(edu, L)}</div>}
                </div>
              ))}
              {data.courses.map((c, i) => (
                <div key={`c${i}`} style={{ marginBottom: pt(9) }}>
                  <div style={entryYears}>{c.year ?? ""}</div>
                  <div style={entryTitle}>{c.name}</div>
                  {c.provider && <div style={entryMeta}>{c.provider}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </Row>
    </Sheet>
  );
}

/* ── BLUSH ────────────────────────────────────────────────── */
const BC = { pink: "#f3c4bd", pinkDeep: "#e8a79e", gray: "#8b8b8b", ink: "#3a3a3a", text: "#4b4b4b", muted: "#7a7a7a", faint: "#a5a5a5", hair: "#e8e8e8" };
const B_PHOTO = 118;

export function BlushPreview({ data }: { data: CVData }) {
  const L = useMessages(PREVIEW_LABELS);
  const photo = photoOf(data);
  const p = data.personal;
  const licenseText = licenseTextOf(data, L);
  const secTitle: React.CSSProperties = { fontSize: pt(9.5), fontWeight: 900, color: BC.ink, textTransform: "uppercase", letterSpacing: pt(2), marginBottom: pt(6) };
  const secRule = <div style={{ width: pt(30), height: 1.5, backgroundColor: BC.pink, marginBottom: pt(8) }} />;
  const xText: React.CSSProperties = { fontSize: pt(8.4), color: BC.muted, lineHeight: 1.4, marginBottom: pt(2.5) };
  const eTitle: React.CSSProperties = { fontSize: pt(10), fontWeight: 700, color: BC.ink };
  const eSub: React.CSSProperties = { fontSize: pt(8.6), color: BC.pinkDeep, fontWeight: 700, marginTop: pt(0.5), marginBottom: pt(2.5) };
  const eText: React.CSSProperties = { fontSize: pt(8.6), color: BC.muted, lineHeight: 1.45, marginBottom: pt(1.5) };
  const tlEntry = (years: string, title: React.ReactNode, sub: string, body: React.ReactNode, i: number | string, last: boolean) => (
    <Row key={i} gap={pt(12)} style={{ marginBottom: pt(10) }}>
      <div style={{ width: pt(66), flexShrink: 0, fontSize: pt(8.2), color: BC.faint }}>{years}</div>
      <div style={{ width: pt(10), flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: pt(6), height: pt(6), borderRadius: "50%", backgroundColor: BC.pinkDeep, marginTop: pt(3) }} />
        {!last && <div style={{ flex: 1, width: 1, backgroundColor: BC.hair, marginTop: pt(2) }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={eTitle}>{title}</div>
        <div style={eSub}>{sub}</div>
        {body}
      </div>
    </Row>
  );

  return (
    <Sheet id="blush" style={{ color: BC.text, lineHeight: 1.5 }}>
      {/* decor triunghiuri */}
      <svg viewBox={`0 0 ${A4W} 170`} style={{ position: "absolute", top: 0, left: 0, width: "100%" }} preserveAspectRatio="none">
        <polygon points={`0,0 ${A4W},0 ${A4W},34 150,120 0,150`} fill="#f6f6f6" />
        <polygon points={`${A4W - 320},0 ${A4W},0 ${A4W},96`} fill={BC.gray} opacity={0.85} />
        <polygon points={`${A4W - 200},0 ${A4W},0 ${A4W},130`} fill={BC.pink} />
        <polygon points={`0,96 128,150 0,168`} fill={BC.pink} />
      </svg>
      {photo && (
        <div style={{ position: "absolute", top: pt(34), left: pt(36), width: pt(B_PHOTO), height: pt(B_PHOTO), borderRadius: "50%", border: `4px solid ${BC.pink}`, overflow: "hidden", backgroundColor: "#fff", boxSizing: "border-box" }}>
          <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
        </div>
      )}
      <Row gap={pt(26)} style={{ paddingTop: pt(172), paddingLeft: pt(36), paddingRight: pt(36), paddingBottom: pt(34) }}>
        <div style={{ width: "38%" }}>
          <div style={{ fontSize: pt(17), fontWeight: 700, color: BC.ink, textTransform: "uppercase", letterSpacing: pt(3), lineHeight: 1.25 }}>
            {fullNameOf(data) || L.fullName}
          </div>
          {roleOf(data) && <div style={{ fontSize: pt(9), fontWeight: 700, color: BC.pinkDeep, textTransform: "uppercase", letterSpacing: pt(2), marginTop: pt(4) }}>{roleOf(data)}</div>}
          <div style={{ width: pt(46), height: 2, backgroundColor: BC.pink, marginTop: pt(8), marginBottom: pt(14) }} />

          {data.summary && (
            <div style={{ marginBottom: pt(15) }}>
              <div style={secTitle}>{L.about}</div>
              {secRule}
              <div style={{ fontSize: pt(8.8), lineHeight: 1.55, color: BC.muted }}>{data.summary}</div>
            </div>
          )}
          {data.skills.length > 0 && (
            <div style={{ marginBottom: pt(15) }}>
              <div style={secTitle}>{L.skills}</div>
              {secRule}
              {data.skills.map((sk, i) => (
                <Bullet key={i} markColor={BC.pinkDeep} markSize={pt(9)} gap={pt(6)} mb={pt(3)} textStyle={{ fontSize: pt(8.4), color: BC.text, lineHeight: 1.4 }}>{sk.name}</Bullet>
              ))}
            </div>
          )}
          <div style={{ marginBottom: pt(15) }}>
            <div style={secTitle}>{L.contact}</div>
            {secRule}
            {p?.phone && (
              <div style={{ display: "flex", alignItems: "center", gap: pt(7), marginBottom: pt(5) }}>
                <IPhone color={BC.pinkDeep} size={pt(9)} />
                <span style={{ fontSize: pt(8.4), color: BC.muted, flex: 1, lineHeight: 1.4 }}>{p.phone}</span>
              </div>
            )}
            {p?.email && (
              <div style={{ display: "flex", alignItems: "center", gap: pt(7), marginBottom: pt(5) }}>
                <IMail color={BC.pinkDeep} size={pt(9)} />
                <span style={{ fontSize: pt(8.4), color: BC.muted, flex: 1, lineHeight: 1.4, wordBreak: "break-word" }}>{p.email}</span>
              </div>
            )}
            {(streetOf(data) || localityOf(data)) && (
              <div style={{ display: "flex", alignItems: "center", gap: pt(7), marginBottom: pt(5) }}>
                <IPin color={BC.pinkDeep} size={pt(9)} />
                <span style={{ fontSize: pt(8.4), color: BC.muted, flex: 1, lineHeight: 1.4 }}>{[streetOf(data), localityOf(data)].filter(Boolean).join(", ")}</span>
              </div>
            )}
          </div>
          {(data.languages.length > 0 || licenseText || data.qualifications?.trim() || data.hobbies.length > 0) && (
            <div style={{ marginBottom: pt(15) }}>
              <div style={secTitle}>{L.extra}</div>
              {secRule}
              {data.languages.map((l, i) => (
                <div key={i} style={xText}>{l.name} — {l.level}</div>
              ))}
              {licenseText && <div style={xText}>{licenseText}</div>}
              {data.qualifications?.trim() && <div style={xText}>{data.qualifications.trim()}</div>}
              {data.hobbies.length > 0 && <div style={xText}>{L.hobbiesLabel} {data.hobbies.join(", ")}</div>}
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {data.education.length > 0 && (
            <div style={{ marginBottom: pt(15) }}>
              <div style={secTitle}>{L.education}</div>
              {secRule}
              {data.education.map((edu, i) =>
                tlEntry(
                  edu.years,
                  <>{edu.level}{edu.field ? ` — ${edu.field}` : ""}</>,
                  edu.institution,
                  (edu.grade || edu.thesis) ? <div style={eText}>{eduMetaOf(edu, L)}</div> : null,
                  i,
                  i === data.education.length - 1 && data.courses.length === 0
                )
              )}
              {data.courses.map((c, i) =>
                tlEntry(c.year ?? "", c.name, c.provider ?? "", null, `c${i}`, i === data.courses.length - 1)
              )}
            </div>
          )}
          {data.experience.length > 0 && (
            <div style={{ marginBottom: pt(15) }}>
              <div style={secTitle}>{L.experienceShort}</div>
              {secRule}
              {data.experience.map((exp, i) =>
                tlEntry(
                  exp.period,
                  exp.title,
                  `${exp.company}${exp.location ? ` · ${exp.location}` : ""}`,
                  [...exp.responsibilities, ...exp.achievements].map((r, j) => (
                    <div key={j} style={eText}>{r}</div>
                  )),
                  i,
                  i === data.experience.length - 1
                )
              )}
            </div>
          )}
        </div>
      </Row>
    </Sheet>
  );
}

/* ── FLAMINGO ─────────────────────────────────────────────── */
const FC = { pink: "#f5b5bb", pinkDeep: "#e795a0", gray: "#5b6066", ink: "#3a3f45", text: "#4b5157", muted: "#7a8087", hair: "#eadfe0" };
const F_PANEL_W = 200;
const F_PHOTO = 84;
const A4H = 842;

export function FlamingoPreview({ data }: { data: CVData }) {
  const L = useMessages(PREVIEW_LABELS);
  const photo = photoOf(data);
  const p = data.personal;
  const licenseText = licenseTextOf(data, L);
  const pill = (label: string, right = false) => (
    <div style={{ backgroundColor: FC.pink, borderRadius: pt(12), padding: `${pt(5)}px ${right ? pt(18) : pt(20)}px`, display: "inline-block", alignSelf: right ? "flex-start" : "flex-end", marginBottom: pt(9), marginLeft: right ? pt(-8) : 0 }}>
      <span style={{ fontFamily: SERIF, fontSize: pt(10), fontWeight: 700, color: "#fff", letterSpacing: pt(1.6), textTransform: "uppercase" }}>{label}</span>
    </div>
  );
  const entryTitle: React.CSSProperties = { fontSize: pt(10.2), fontWeight: 700, color: FC.ink };
  const entryMeta: React.CSSProperties = { fontSize: pt(8.6), color: FC.pinkDeep, fontWeight: 700, marginTop: pt(0.5), marginBottom: pt(2.5) };
  const entryText: React.CSSProperties = { fontSize: pt(8.8), lineHeight: 1.45, marginBottom: pt(1.5) };
  const pText: React.CSSProperties = { fontSize: pt(8.4), color: "#e8eaec", flex: 1, lineHeight: 1.4, minWidth: 0 };

  return (
    <Sheet id="flamingo" style={{ color: FC.text, fontSize: pt(9.5), lineHeight: 1.5 }}>
      {/* colț roz curbat sus-stânga */}
      <svg viewBox={`0 0 ${A4W} 170`} style={{ position: "absolute", top: 0, left: 0, width: "100%" }} preserveAspectRatio="none">
        <path d={`M0,0 L${A4W},0 L${A4W},50 C520,88 460,80 420,100 C340,132 250,134 200,132 C120,150 55,155 0,138 Z`} fill={FC.pink} />
      </svg>
      {/* panou gri dreapta cu margine curbată */}
      <svg viewBox={`0 0 ${F_PANEL_W} ${A4H}`} style={{ position: "absolute", top: 0, right: 0, height: "100%", width: `${(F_PANEL_W / A4W) * 100}%` }} preserveAspectRatio="none">
        <path d={`M${F_PANEL_W},118 L${F_PANEL_W},${A4H} L34,${A4H} C28,600 24,420 30,300 C33,225 24,160 68,130 C105,106 158,112 ${F_PANEL_W},118 Z`} fill={FC.gray} />
      </svg>
      {photo && (
        <div style={{ position: "absolute", top: pt(26), left: pt(40), width: pt(F_PHOTO), height: pt(F_PHOTO), borderRadius: "50%", border: "3px solid #fff", overflow: "hidden", backgroundColor: "#fff", boxSizing: "border-box" }}>
          <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
        </div>
      )}
      <div style={{ position: "absolute", top: pt(28), left: pt(190), right: pt(F_PANEL_W + 18) }}>
        <div style={{ fontFamily: SERIF, fontSize: pt(23), fontWeight: 700, color: "#463c40", lineHeight: 1.12 }}>{fullNameOf(data) || L.fullName}</div>
        {roleOf(data) && <div style={{ fontSize: pt(10.5), color: FC.muted, marginTop: pt(3), letterSpacing: pt(1) }}>{roleOf(data)}</div>}
      </div>

      {/* coloana principală stânga */}
      <div style={{ paddingTop: pt(150), paddingLeft: pt(38), paddingBottom: pt(34), width: pt(A4W - F_PANEL_W - 20), boxSizing: "border-box" }}>
        {data.summary && (
          <div style={{ marginBottom: pt(14), display: "flex", flexDirection: "column" }}>
            {pill(L.profile)}
            <div style={{ fontSize: pt(9.2), lineHeight: 1.6 }}>{data.summary}</div>
          </div>
        )}
        {data.education.length > 0 && (
          <div style={{ marginBottom: pt(14), display: "flex", flexDirection: "column" }}>
            {pill(L.education)}
            {data.education.map((edu, i) => (
              <div key={i} style={{ marginBottom: pt(8), paddingBottom: pt(7), borderBottom: `0.75px solid ${FC.hair}` }}>
                <div style={entryTitle}>{edu.level}{edu.field ? `, ${edu.field}` : ""}</div>
                <div style={entryMeta}>({edu.years}) · {edu.institution}</div>
                {(edu.grade || edu.thesis) && <div style={entryText}>{eduMetaOf(edu, L)}</div>}
              </div>
            ))}
            {data.courses.map((c, i) => (
              <div key={`c${i}`} style={{ marginBottom: pt(8), paddingBottom: pt(7), borderBottom: `0.75px solid ${FC.hair}` }}>
                <div style={entryTitle}>{c.name}</div>
                <div style={entryMeta}>{c.year ? `(${c.year})` : ""} {c.provider ? `· ${c.provider}` : ""}</div>
              </div>
            ))}
          </div>
        )}
        {data.experience.length > 0 && (
          <div style={{ marginBottom: pt(14), display: "flex", flexDirection: "column" }}>
            {pill(L.experienceShort)}
            {data.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: pt(8), paddingBottom: pt(7), borderBottom: `0.75px solid ${FC.hair}` }}>
                <div style={entryTitle}>{exp.company}</div>
                <div style={entryMeta}>
                  {exp.title}
                  {exp.location ? ` · ${exp.location}` : ""} · {exp.period}
                </div>
                {[...exp.responsibilities, ...exp.achievements].map((r, j) => (
                  <div key={j} style={entryText}>{r}</div>
                ))}
              </div>
            ))}
          </div>
        )}
        {data.skills.length > 0 && (
          <div style={{ marginBottom: pt(14), display: "flex", flexDirection: "column" }}>
            {pill(L.skills)}
            <div style={entryText}>{data.skills.map((sk) => sk.name).join("  ·  ")}</div>
          </div>
        )}
      </div>

      {/* conținutul panoului gri */}
      <div style={{ position: "absolute", top: pt(190), right: 0, width: pt(F_PANEL_W - 52), paddingRight: pt(20), boxSizing: "border-box" }}>
        <div style={{ marginBottom: pt(16) }}>
          {pill(L.contact, true)}
          {p?.phone && (
            <div style={{ display: "flex", alignItems: "center", gap: pt(7), marginBottom: pt(6) }}>
              <IPhone color={FC.pink} size={pt(9)} />
              <span style={pText}>{p.phone}</span>
            </div>
          )}
          {p?.email && (
            <div style={{ display: "flex", alignItems: "center", gap: pt(7), marginBottom: pt(6) }}>
              <IMail color={FC.pink} size={pt(9)} />
              <span style={{ ...pText, wordBreak: "break-word" }}>{p.email}</span>
            </div>
          )}
          {(streetOf(data) || localityOf(data)) && (
            <div style={{ display: "flex", alignItems: "center", gap: pt(7), marginBottom: pt(6) }}>
              <IPin color={FC.pink} size={pt(9)} />
              <span style={pText}>{[streetOf(data), localityOf(data)].filter(Boolean).join(", ")}</span>
            </div>
          )}
          {p?.linkedin && (
            <div style={{ display: "flex", alignItems: "center", gap: pt(7), marginBottom: pt(6) }}>
              <IGlobe color={FC.pink} size={pt(9)} />
              <span style={{ ...pText, wordBreak: "break-word" }}>{p.linkedin}</span>
            </div>
          )}
        </div>
        {data.languages.length > 0 && (
          <div style={{ marginBottom: pt(16) }}>
            {pill(L.languagesShort, true)}
            {data.languages.map((l, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: pt(7), marginBottom: pt(6) }}>
                <span style={{ color: FC.pink, fontSize: pt(9) }}>•</span>
                <span style={pText}>{l.name} — {l.level}</span>
              </div>
            ))}
          </div>
        )}
        {(licenseText || data.qualifications?.trim() || data.hobbies.length > 0) && (
          <div style={{ marginBottom: pt(16) }}>
            {pill(L.extra, true)}
            {licenseText && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: pt(7), marginBottom: pt(6) }}>
                <span style={{ color: FC.pink, fontSize: pt(9) }}>•</span>
                <span style={pText}>{licenseText}</span>
              </div>
            )}
            {data.qualifications?.trim() && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: pt(7), marginBottom: pt(6) }}>
                <span style={{ color: FC.pink, fontSize: pt(9) }}>•</span>
                <span style={pText}>{data.qualifications.trim()}</span>
              </div>
            )}
            {data.hobbies.map((h, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: pt(7), marginBottom: pt(6) }}>
                <span style={{ color: FC.pink, fontSize: pt(9) }}>•</span>
                <span style={pText}>{h}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Sheet>
  );
}

/* ── SAGE ─────────────────────────────────────────────────── */
const GS = { sage: "#7fa199", sageDark: "#6b8d85", rose: "#e5c1b5", ink: "#2b2b2b", text: "#3f3f3f", muted: "#6f6f6f" };
const S_MARGIN = 18;
const S_SIDE = 190;
const S_PHOTO = 104;

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: pt(11), height: pt(11), flexShrink: 0 }}>
      <path d="M4 3l9 9-9 9V3z" fill="#7fa199" />
      <path d="M12 3l9 9-9 9V3z" fill="#a9c2bb" />
    </svg>
  );
}

export function SagePreview({ data }: { data: CVData }) {
  const L = useMessages(PREVIEW_LABELS);
  const photo = photoOf(data);
  const p = data.personal;
  const licenseText = licenseTextOf(data, L);
  const sideSecTitle: React.CSSProperties = { fontFamily: "var(--font-body), sans-serif", fontSize: pt(9.5), fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: pt(1.6), marginBottom: pt(6), marginTop: pt(14) };
  const sideText: React.CSSProperties = { fontSize: pt(8.8), color: "#f2f6f4", lineHeight: 1.55 };
  const secHead = (label: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: pt(8), marginBottom: pt(7) }}>
      <Chevron />
      <span style={{ fontFamily: "var(--font-body), sans-serif", fontSize: pt(10.5), fontWeight: 900, color: GS.ink, textTransform: "uppercase", letterSpacing: pt(1.6) }}>{label}</span>
    </div>
  );
  const eName: React.CSSProperties = { fontSize: pt(10.5), fontWeight: 700, color: GS.ink };
  const eSub: React.CSSProperties = { fontSize: pt(9), fontStyle: "italic", color: GS.muted, marginTop: pt(0.5), marginBottom: pt(3) };
  const eText: React.CSSProperties = { fontSize: pt(9), color: GS.text, lineHeight: 1.5, marginBottom: pt(1.5) };
  const years: React.CSSProperties = { fontSize: pt(8.6), color: GS.sageDark, fontWeight: 700 };

  return (
    <Sheet id="sage" style={{ fontFamily: SERIF, color: GS.text, lineHeight: 1.5 }}>
      <div style={{ position: "absolute", top: pt(44), left: 0, right: 0, height: pt(118), backgroundColor: GS.rose }} />
      <div style={{ position: "absolute", top: pt(S_MARGIN), bottom: pt(S_MARGIN), left: pt(S_MARGIN), width: pt(S_SIDE), backgroundColor: GS.sage, borderRadius: pt(14) }} />
      <Row>
        <div style={{ width: pt(S_SIDE + S_MARGIN), flexShrink: 0, paddingLeft: pt(S_MARGIN + 18), paddingRight: pt(18), paddingTop: pt(34), position: "relative", boxSizing: "border-box" }}>
          {photo && (
            <div style={{ width: pt(S_PHOTO), height: pt(S_PHOTO), borderRadius: "50%", border: "4px solid #fff", overflow: "hidden", margin: `0 auto ${pt(18)}px`, backgroundColor: "#fff", boxSizing: "border-box" }}>
              <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
            </div>
          )}
          {data.summary && (
            <>
              <div style={sideSecTitle}>{L.profile}</div>
              <div style={sideText}>{data.summary}</div>
            </>
          )}
          <div style={sideSecTitle}>{L.contact}</div>
          {p?.phone && (
            <div style={{ display: "flex", alignItems: "center", gap: pt(7), marginBottom: pt(6) }}>
              <IPhone color="#fff" size={pt(9)} />
              <span style={{ fontSize: pt(8.4), color: "#f2f6f4", flex: 1, lineHeight: 1.4 }}>{p.phone}</span>
            </div>
          )}
          {p?.email && (
            <div style={{ display: "flex", alignItems: "center", gap: pt(7), marginBottom: pt(6) }}>
              <IMail color="#fff" size={pt(9)} />
              <span style={{ fontSize: pt(8.4), color: "#f2f6f4", flex: 1, lineHeight: 1.4, wordBreak: "break-word" }}>{p.email}</span>
            </div>
          )}
          {(streetOf(data) || localityOf(data)) && (
            <div style={{ display: "flex", alignItems: "center", gap: pt(7), marginBottom: pt(6) }}>
              <IPin color="#fff" size={pt(9)} />
              <span style={{ fontSize: pt(8.4), color: "#f2f6f4", flex: 1, lineHeight: 1.4 }}>{[streetOf(data), localityOf(data)].filter(Boolean).join(", ")}</span>
            </div>
          )}
          {data.hobbies.length > 0 && (
            <>
              <div style={sideSecTitle}>{L.hobbies}</div>
              {data.hobbies.map((h, i) => (
                <div key={i} style={{ ...sideText, marginBottom: pt(2.5) }}>{h}</div>
              ))}
            </>
          )}
          {(licenseText || data.qualifications?.trim()) && (
            <>
              <div style={sideSecTitle}>{L.qualifications}</div>
              {licenseText && <div style={{ ...sideText, marginBottom: pt(2.5) }}>{licenseText}</div>}
              {data.qualifications?.trim() && <div style={sideText}>{data.qualifications.trim()}</div>}
            </>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0, paddingLeft: pt(26), paddingRight: pt(30), paddingTop: pt(60), position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: pt(25), fontWeight: 700, color: GS.ink, textTransform: "uppercase", letterSpacing: pt(1.5), lineHeight: 1.15 }}>
            {fullNameOf(data) || L.fullName}
          </div>
          {roleOf(data) && <div style={{ fontSize: pt(11), fontStyle: "italic", color: GS.muted, marginTop: pt(3), marginBottom: pt(66) }}>{roleOf(data)}</div>}

          {data.education.length > 0 && (
            <div style={{ marginBottom: pt(14) }}>
              {secHead(L.education)}
              {data.education.map((edu, i) => (
                <div key={i} style={{ marginBottom: pt(7) }}>
                  <div style={eName}>{edu.institution}</div>
                  <div style={eSub}>
                    {edu.level}
                    {edu.field ? L.inField(edu.field) : ""} · <span style={years}>{edu.years}</span>
                  </div>
                  {(edu.grade || edu.thesis) && <div style={eText}>{eduMetaOf(edu, L)}</div>}
                </div>
              ))}
              {data.courses.map((c, i) => (
                <div key={`c${i}`} style={{ marginBottom: pt(5) }}>
                  <div style={eName}>{c.name}</div>
                  <div style={eSub}>
                    {c.provider ?? ""}
                    {c.year ? ` · ${c.year}` : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
          {data.experience.length > 0 && (
            <div style={{ marginBottom: pt(14) }}>
              {secHead(L.experienceShort)}
              {data.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: pt(8) }}>
                  <div style={eName}>{exp.company}</div>
                  <div style={eSub}>
                    {exp.title}
                    {exp.location ? ` · ${exp.location}` : ""} · <span style={years}>{exp.period}</span>
                  </div>
                  {[...exp.responsibilities, ...exp.achievements].map((r, j) => (
                    <div key={j} style={eText}>{r}</div>
                  ))}
                </div>
              ))}
            </div>
          )}
          {data.languages.length > 0 && (
            <div style={{ marginBottom: pt(14) }}>
              {secHead(L.languages)}
              {data.languages.map((l, i) => (
                <div key={i} style={eText}>{l.name} — {l.level}</div>
              ))}
            </div>
          )}
          {data.skills.length > 0 && (
            <div style={{ marginBottom: pt(14) }}>
              {secHead(L.skills)}
              <div style={eText}>{data.skills.map((sk) => sk.name).join(" · ")}</div>
            </div>
          )}
        </div>
      </Row>
    </Sheet>
  );
}

/* ── STERLING ─────────────────────────────────────────────── */
const TC = { blue: "#3f6ad8", ink: "#23272f", text: "#3d4451", muted: "#6b7280", panel: "#f0f1f3", hair: "#dfe2e7" };
const T_LEFT = 172;

export function SterlingPreview({ data }: { data: CVData }) {
  const L = useMessages(PREVIEW_LABELS);
  const photo = photoOf(data);
  const p = data.personal;
  const licenseText = licenseTextOf(data, L);
  const lSecTitle: React.CSSProperties = { fontSize: pt(8.5), fontWeight: 900, color: TC.blue, textTransform: "uppercase", letterSpacing: pt(1.4), marginTop: pt(12), marginBottom: pt(4) };
  const lText: React.CSSProperties = { fontSize: pt(8.4), color: TC.text, lineHeight: 1.5, marginBottom: pt(2.5), wordBreak: "break-word" };
  const secTitle = (label: string) => (
    <div style={{ fontSize: pt(10), fontWeight: 900, color: TC.ink, textTransform: "uppercase", letterSpacing: pt(1), paddingBottom: pt(3), borderBottom: `1px solid ${TC.hair}`, marginBottom: pt(7) }}>{label}</div>
  );
  const entryHead = (title: React.ReactNode, date: string) => (
    <Row style={{ justifyContent: "space-between", alignItems: "flex-end" }}>
      <span style={{ fontSize: pt(10.5), fontWeight: 700, color: TC.ink, flex: 1 }}>{title}</span>
      <span style={{ fontSize: pt(8.2), color: TC.muted, marginLeft: pt(8), flexShrink: 0 }}>{date}</span>
    </Row>
  );

  return (
    <Sheet id="sterling" style={{ color: TC.text }}>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: pt(T_LEFT), backgroundColor: TC.panel }} />
      <Row>
        <div style={{ width: pt(T_LEFT), flexShrink: 0, padding: `${pt(22)}px ${pt(16)}px 0`, boxSizing: "border-box", position: "relative" }}>
          {photo && <img src={photo} alt="" style={{ width: pt(T_LEFT - 32), height: pt(150), objectFit: "cover", marginBottom: pt(12) }} />}
          <div style={lSecTitle}>{L.contact}</div>
          {p?.phone && <div style={lText}>{p.phone}</div>}
          {p?.email && <div style={lText}>{p.email}</div>}
          {(streetOf(data) || localityOf(data)) && <div style={lText}>{[streetOf(data), localityOf(data)].filter(Boolean).join(", ")}</div>}
          {p?.linkedin && <div style={lText}>{p.linkedin}</div>}

          {data.languages.length > 0 && (
            <>
              <div style={lSecTitle}>{L.languages}</div>
              {data.languages.map((l, i) => (
                <div key={i} style={lText}>{l.name} — {l.level}</div>
              ))}
            </>
          )}
          {(licenseText || data.qualifications?.trim()) && (
            <>
              <div style={lSecTitle}>{L.qualifications}</div>
              {licenseText && <div style={lText}>{licenseText}</div>}
              {data.qualifications?.trim() && <div style={lText}>{data.qualifications.trim()}</div>}
            </>
          )}
          {data.hobbies.length > 0 && (
            <>
              <div style={lSecTitle}>{L.hobbies}</div>
              {data.hobbies.map((h, i) => (
                <div key={i} style={lText}>{h}</div>
              ))}
            </>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0, paddingLeft: pt(24), paddingRight: pt(30), paddingTop: pt(26) }}>
          <div style={{ fontSize: pt(22), fontWeight: 400, color: TC.ink, lineHeight: 1.1 }}>{firstNameOf(data) || L.firstName}</div>
          <div style={{ fontSize: pt(22), fontWeight: 900, color: TC.blue, lineHeight: 1.1 }}>{lastNameOf(data) || L.lastName}</div>
          {roleOf(data) && <div style={{ fontSize: pt(9.5), color: TC.muted, marginTop: pt(3), marginBottom: pt(12) }}>{roleOf(data)}</div>}

          {data.summary && (
            <div style={{ marginBottom: pt(13) }}>
              {secTitle(L.summary)}
              <div style={{ fontSize: pt(9.2), lineHeight: 1.55 }}>{data.summary}</div>
            </div>
          )}
          {data.skills.length > 0 && (
            <div style={{ marginBottom: pt(13) }}>
              {secTitle(L.skills)}
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {data.skills.map((sk, i) => (
                  <div key={i} style={{ width: "50%", display: "flex", gap: pt(5), marginBottom: pt(3), paddingRight: pt(8), boxSizing: "border-box" }}>
                    <span style={{ color: TC.blue, fontSize: pt(9), flexShrink: 0 }}>•</span>
                    <span style={{ flex: 1, fontSize: pt(8.8), minWidth: 0 }}>{sk.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {data.experience.length > 0 && (
            <div style={{ marginBottom: pt(13) }}>
              {secTitle(L.experience)}
              {data.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: pt(9) }}>
                  {entryHead(exp.title, exp.period)}
                  <div style={{ fontSize: pt(9.2), color: TC.blue, fontWeight: 700, marginTop: pt(0.5), marginBottom: pt(3) }}>
                    {exp.company}
                    {exp.location ? ` · ${exp.location}` : ""}
                  </div>
                  {[...exp.responsibilities, ...exp.achievements].map((r, j) => (
                    <Bullet key={j} markColor={TC.blue} markSize={pt(9)} textStyle={{ fontSize: pt(8.8), lineHeight: 1.42 }}>{r}</Bullet>
                  ))}
                </div>
              ))}
            </div>
          )}
          {data.education.length > 0 && (
            <div style={{ marginBottom: pt(13) }}>
              {secTitle(L.education)}
              {data.education.map((edu, i) => (
                <div key={i} style={{ marginBottom: pt(9) }}>
                  {entryHead(<>{edu.level}{edu.field ? ` — ${edu.field}` : ""}</>, edu.years)}
                  <div style={{ fontSize: pt(9.2), color: TC.blue, fontWeight: 700, marginTop: pt(0.5), marginBottom: pt(3) }}>{edu.institution}</div>
                  {(edu.grade || edu.thesis) && <div style={{ fontSize: pt(8.4), color: TC.muted, fontStyle: "italic" }}>{eduMetaOf(edu, L)}</div>}
                </div>
              ))}
            </div>
          )}
          {data.courses.length > 0 && (
            <div style={{ marginBottom: pt(13) }}>
              {secTitle(L.certifications)}
              {data.courses.map((c, i) => (
                <Bullet key={i} markColor={TC.blue} markSize={pt(9)} textStyle={{ fontSize: pt(8.8), lineHeight: 1.42 }}>
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
