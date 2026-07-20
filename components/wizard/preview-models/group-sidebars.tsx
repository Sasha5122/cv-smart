"use client";
/* eslint-disable @next/next/no-img-element */
import type { CVData } from "@/lib/types/cv";
import {
  Sheet, Row, Bullet, pt, DISPLAY,
  fullNameOf, roleOf, localityOf, streetOf, licenseTextOf, eduMetaOf, photoOf, splitPeriod,
  IPhone, IMail, IPin, IGlobe, IUser, IStar, IBriefcase, ICap,
} from "./shared";

/* Replici HTML fidele ale template-urilor PDF cu SIDEBAR:
   Cobalt (albastru regal), Amber (antracit + galben), Velvet (prună + bandă
   mauve), Sapphire (cyan + navy), Graphite (alb + slate). */

/* ── COBALT ───────────────────────────────────────────────── */
const CC = { blue: "#25429e", blueDark: "#182e73", ink: "#1f2430", text: "#3d4451", muted: "#6b7280", hair: "#e5e7eb" };
const C_SIDE = 225;
const C_PHOTO = 118;

export function CobaltPreview({ data }: { data: CVData }) {
  const photo = photoOf(data);
  const p = data.personal;
  const licenseText = licenseTextOf(data);
  const sidePill = (label: string) => (
    <div style={{ backgroundColor: CC.blueDark, borderRadius: pt(12), padding: `${pt(5)}px ${pt(14)}px`, alignSelf: "flex-start", display: "inline-block", margin: `${pt(8)}px 0` }}>
      <span style={{ fontSize: pt(9.5), fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: pt(1) }}>{label}</span>
    </div>
  );
  const mainPill = (label: string) => (
    <div style={{ backgroundColor: CC.blue, borderRadius: pt(14), padding: `${pt(6)}px ${pt(18)}px`, display: "inline-block", marginBottom: pt(9) }}>
      <span style={{ fontSize: pt(10.5), fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: pt(1) }}>{label}</span>
    </div>
  );
  const cLabel: React.CSSProperties = { fontSize: pt(8), fontWeight: 900, color: "#c9d4f5", textTransform: "uppercase", letterSpacing: pt(0.6), marginBottom: pt(1) };
  const cValue: React.CSSProperties = { fontSize: pt(8.6), color: "#fff", marginBottom: pt(6), lineHeight: 1.4, wordBreak: "break-word" };

  return (
    <Sheet id="cobalt" style={{ color: CC.text }}>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: pt(C_SIDE), backgroundColor: CC.blue }} />
      <Row>
        <div style={{ width: pt(C_SIDE), flexShrink: 0, padding: `${pt(26)}px ${pt(20)}px 0`, boxSizing: "border-box", position: "relative" }}>
          {photo && (
            <div style={{ width: pt(C_PHOTO), height: pt(C_PHOTO), borderRadius: "50%", border: "4px solid #fff", overflow: "hidden", margin: "0 auto", backgroundColor: "#fff", boxSizing: "border-box" }}>
              <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
            </div>
          )}
          <div style={{ backgroundColor: CC.blueDark, borderRadius: pt(14), padding: `${pt(7)}px ${pt(14)}px`, margin: `${pt(14)}px auto 0`, width: "fit-content", maxWidth: "100%" }}>
            <div style={{ fontSize: pt(14), fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: pt(0.5), textAlign: "center" }}>
              {fullNameOf(data) || "Prenume Nume"}
            </div>
          </div>
          {roleOf(data) && <div style={{ fontSize: pt(9.5), color: "#d8e0f8", textAlign: "center", marginTop: pt(5), marginBottom: pt(14) }}>{roleOf(data)}</div>}

          {sidePill("Contact")}
          {(streetOf(data) || localityOf(data)) && (
            <>
              <div style={cLabel}>Adresă</div>
              <div style={cValue}>{[streetOf(data), localityOf(data)].filter(Boolean).join(", ")}</div>
            </>
          )}
          {p?.phone && (
            <>
              <div style={cLabel}>Telefon</div>
              <div style={cValue}>{p.phone}</div>
            </>
          )}
          {p?.email && (
            <>
              <div style={cLabel}>Email</div>
              <div style={cValue}>{p.email}</div>
            </>
          )}

          {data.skills.length > 0 && (
            <>
              {sidePill("Competențe")}
              {data.skills.map((sk, i) => (
                <Bullet key={i} markColor="#c9d4f5" markSize={pt(9)} gap={pt(6)} mb={pt(3.5)} textStyle={{ fontSize: pt(8.8), color: "#fff", lineHeight: 1.4 }}>
                  {sk.name}
                </Bullet>
              ))}
            </>
          )}

          {data.languages.length > 0 && (
            <>
              {sidePill("Limbi")}
              {data.languages.map((l, i) => (
                <div key={i}>
                  <div style={cLabel}>{l.name}</div>
                  <div style={cValue}>{l.level}</div>
                </div>
              ))}
            </>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0, padding: `${pt(30)}px ${pt(30)}px 0 ${pt(24)}px` }}>
          {data.summary && (
            <div style={{ marginBottom: pt(14) }}>
              {mainPill("Despre mine")}
              <div style={{ fontSize: pt(9.4), lineHeight: 1.55 }}>{data.summary}</div>
            </div>
          )}
          {data.education.length > 0 && (
            <div style={{ marginBottom: pt(14) }}>
              {mainPill("Educație")}
              {data.education.map((edu, i) => (
                <Row key={i} gap={pt(9)} style={{ marginBottom: pt(8) }}>
                  <div style={{ width: pt(10), flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: pt(7), height: pt(7), borderRadius: "50%", backgroundColor: CC.blue, marginTop: pt(3) }} />
                    {i < data.education.length - 1 && <div style={{ flex: 1, width: 1.2, backgroundColor: CC.hair, marginTop: pt(2) }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: pt(10), fontWeight: 700, color: CC.ink }}>
                      {edu.level}
                      {edu.field ? ` în ${edu.field}` : ""}
                    </div>
                    <div style={{ fontSize: pt(9), color: CC.blue, fontWeight: 700 }}>{edu.institution}</div>
                    <div style={{ fontSize: pt(8.2), color: CC.muted }}>{edu.years}</div>
                    {(edu.grade || edu.thesis) && (
                      <div style={{ fontSize: pt(8), color: CC.muted, fontStyle: "italic", marginTop: pt(1) }}>{eduMetaOf(edu)}</div>
                    )}
                  </div>
                </Row>
              ))}
            </div>
          )}
          {data.experience.length > 0 && (
            <div style={{ marginBottom: pt(14) }}>
              {mainPill("Experiență")}
              {data.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: pt(9) }}>
                  <div style={{ fontSize: pt(10.5), fontWeight: 900, color: CC.ink }}>
                    {exp.title}, {exp.company}
                  </div>
                  <div style={{ fontSize: pt(8.8), color: CC.muted, marginTop: pt(1), marginBottom: pt(3) }}>
                    {exp.period}
                    {exp.location ? ` · ${exp.location}` : ""}
                  </div>
                  {[...exp.responsibilities, ...exp.achievements].map((r, j) => (
                    <Bullet key={j} markColor={CC.blue} markSize={pt(9)} textStyle={{ fontSize: pt(8.8), lineHeight: 1.42 }}>{r}</Bullet>
                  ))}
                </div>
              ))}
            </div>
          )}
          {(data.courses.length > 0 || licenseText || data.qualifications?.trim() || data.hobbies.length > 0) && (
            <div style={{ marginBottom: pt(14) }}>
              {mainPill("Extra")}
              {data.courses.map((c, i) => (
                <Bullet key={i} markColor={CC.blue} markSize={pt(9)} textStyle={{ fontSize: pt(8.8), lineHeight: 1.42 }}>
                  {c.name}
                  {c.provider ? ` · ${c.provider}` : ""}
                  {c.year ? ` (${c.year})` : ""}
                </Bullet>
              ))}
              {licenseText && <Bullet markColor={CC.blue} markSize={pt(9)} textStyle={{ fontSize: pt(8.8), lineHeight: 1.42 }}>{licenseText}</Bullet>}
              {data.qualifications?.trim() && (
                <Bullet markColor={CC.blue} markSize={pt(9)} textStyle={{ fontSize: pt(8.8), lineHeight: 1.42 }}>{data.qualifications.trim()}</Bullet>
              )}
              {data.hobbies.length > 0 && (
                <Bullet markColor={CC.blue} markSize={pt(9)} textStyle={{ fontSize: pt(8.8), lineHeight: 1.42 }}>
                  Hobby-uri: {data.hobbies.join(", ")}
                </Bullet>
              )}
            </div>
          )}
        </div>
      </Row>
    </Sheet>
  );
}

/* ── AMBER ────────────────────────────────────────────────── */
const AM = { charcoal: "#2c3038", yellow: "#ffc31e", ink: "#23272f", text: "#3d4451", muted: "#6b7280", hair: "#e5e7eb", sideText: "#d3d6db" };
const A_SIDE = 210;
const A_PHOTO = 108;

export function AmberPreview({ data }: { data: CVData }) {
  const photo = photoOf(data);
  const p = data.personal;
  const licenseText = licenseTextOf(data);
  const sideHead = (icon: React.ReactNode, label: string) => (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: pt(7), marginBottom: pt(3), marginTop: pt(12) }}>
        <div style={{ width: pt(16), height: pt(16), borderRadius: "50%", backgroundColor: AM.yellow, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {icon}
        </div>
        <span style={{ fontSize: pt(9.5), fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: pt(1) }}>{label}</span>
      </div>
      <div style={{ height: 1.5, backgroundColor: AM.yellow, marginBottom: pt(7) }} />
    </>
  );
  const mainHead = (icon: React.ReactNode, label: string) => (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: pt(8), marginBottom: pt(3) }}>
        <div style={{ width: pt(20), height: pt(20), borderRadius: "50%", backgroundColor: AM.yellow, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {icon}
        </div>
        <span style={{ fontSize: pt(12), fontWeight: 900, color: AM.ink }}>{label}</span>
      </div>
      <div style={{ height: 1, backgroundColor: AM.hair, marginBottom: pt(8) }} />
    </>
  );
  const cLabel: React.CSSProperties = { fontSize: pt(8), fontWeight: 900, color: AM.yellow, textTransform: "uppercase", letterSpacing: pt(0.5), marginBottom: pt(1) };
  const cValue: React.CSSProperties = { fontSize: pt(8.4), color: AM.sideText, marginBottom: pt(5), lineHeight: 1.4, wordBreak: "break-word" };

  return (
    <Sheet id="amber" style={{ color: AM.text }}>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: pt(A_SIDE), backgroundColor: AM.charcoal }} />
      <Row>
        <div style={{ width: pt(A_SIDE), flexShrink: 0, padding: `${pt(28)}px ${pt(20)}px 0`, boxSizing: "border-box", position: "relative" }}>
          {photo && (
            <div style={{ width: pt(A_PHOTO), height: pt(A_PHOTO), borderRadius: "50%", border: `4px solid ${AM.yellow}`, overflow: "hidden", margin: `0 auto ${pt(12)}px`, backgroundColor: AM.charcoal, boxSizing: "border-box" }}>
              <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
            </div>
          )}
          <div style={{ fontSize: pt(19), fontWeight: 900, color: AM.yellow, textAlign: "center", lineHeight: 1.15 }}>
            {fullNameOf(data) || "Prenume Nume"}
          </div>
          {roleOf(data) && <div style={{ fontSize: pt(9.5), color: AM.sideText, textAlign: "center", marginTop: pt(3), marginBottom: pt(16) }}>{roleOf(data)}</div>}

          {sideHead(<IPhone color={AM.charcoal} size={pt(9)} />, "Contact")}
          {p?.email && (
            <>
              <div style={cLabel}>Email</div>
              <div style={cValue}>{p.email}</div>
            </>
          )}
          {p?.phone && (
            <>
              <div style={cLabel}>Telefon</div>
              <div style={cValue}>{p.phone}</div>
            </>
          )}
          {localityOf(data) && (
            <>
              <div style={cLabel}>Oraș</div>
              <div style={cValue}>{localityOf(data)}</div>
            </>
          )}
          {p?.linkedin && (
            <>
              <div style={cLabel}>LinkedIn</div>
              <div style={cValue}>{p.linkedin}</div>
            </>
          )}

          {data.skills.length > 0 && (
            <>
              {sideHead(<IStar color={AM.charcoal} size={pt(9)} />, "Competențe")}
              {data.skills.map((sk, i) => (
                <Bullet key={i} markColor={AM.yellow} markSize={pt(9)} gap={pt(6)} mb={pt(3.5)} textStyle={{ fontSize: pt(8.6), color: AM.sideText, lineHeight: 1.4 }}>
                  {sk.name}
                </Bullet>
              ))}
            </>
          )}

          {(data.hobbies.length > 0 || data.languages.length > 0) && (
            <>
              {sideHead(<IUser color={AM.charcoal} size={pt(9)} />, "Interese & Limbi")}
              {data.languages.map((l, i) => (
                <div key={`l${i}`} style={{ fontSize: pt(8.6), color: AM.sideText, marginBottom: pt(3) }}>
                  {l.name} — {l.level}
                </div>
              ))}
              {data.hobbies.map((h, i) => (
                <div key={i} style={{ fontSize: pt(8.6), color: AM.sideText, marginBottom: pt(3) }}>{h}</div>
              ))}
            </>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0, padding: `${pt(30)}px ${pt(30)}px 0 ${pt(26)}px` }}>
          {data.summary && (
            <div style={{ marginBottom: pt(14) }}>
              {mainHead(<IUser color={AM.charcoal} size={pt(10)} />, "Profil")}
              <div style={{ fontSize: pt(9.4), lineHeight: 1.55 }}>{data.summary}</div>
            </div>
          )}
          {data.experience.length > 0 && (
            <div style={{ marginBottom: pt(14) }}>
              {mainHead(<IBriefcase color={AM.charcoal} size={pt(10)} />, "Experiență")}
              {data.experience.map((exp, i) => (
                <Row key={i} gap={pt(9)} style={{ marginBottom: pt(9) }}>
                  <div style={{ width: pt(10), flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: pt(8), height: pt(8), borderRadius: "50%", backgroundColor: AM.yellow, marginTop: pt(3) }} />
                    {i < data.experience.length - 1 && <div style={{ flex: 1, width: 1.2, backgroundColor: AM.hair, marginTop: pt(2) }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: pt(10.5), fontWeight: 900, color: AM.ink }}>{exp.title}</div>
                    <div style={{ fontSize: pt(8.6), color: AM.muted, marginTop: pt(1), marginBottom: pt(3) }}>
                      {exp.company}
                      {exp.location ? ` | ${exp.location}` : ""} | {exp.period}
                    </div>
                    {[...exp.responsibilities, ...exp.achievements].map((r, j) => (
                      <Bullet key={j} markColor={AM.yellow} markSize={pt(10)} textStyle={{ fontSize: pt(8.8), lineHeight: 1.42 }}>{r}</Bullet>
                    ))}
                  </div>
                </Row>
              ))}
            </div>
          )}
          {data.education.length > 0 && (
            <div style={{ marginBottom: pt(14) }}>
              {mainHead(<ICap color={AM.charcoal} size={pt(10)} />, "Educație")}
              {data.education.map((edu, i) => (
                <div key={i} style={{ marginBottom: pt(6) }}>
                  <div style={{ fontSize: pt(10.5), fontWeight: 900, color: AM.ink }}>
                    {edu.level}
                    {edu.field ? ` — ${edu.field}` : ""}
                  </div>
                  <div style={{ fontSize: pt(8.6), color: AM.muted, marginTop: pt(1) }}>
                    {edu.institution} | {edu.years}
                  </div>
                  {(edu.grade || edu.thesis) && (
                    <div style={{ fontSize: pt(8.2), color: AM.muted, fontStyle: "italic" }}>{eduMetaOf(edu)}</div>
                  )}
                </div>
              ))}
            </div>
          )}
          {(data.courses.length > 0 || licenseText || data.qualifications?.trim()) && (
            <div style={{ marginBottom: pt(14) }}>
              {mainHead(<IStar color={AM.charcoal} size={pt(10)} />, "Certificări & Calificări")}
              {data.courses.map((c, i) => (
                <Bullet key={i} markColor={AM.yellow} markSize={pt(10)} textStyle={{ fontSize: pt(8.8), lineHeight: 1.42 }}>
                  {c.name}
                  {c.provider ? ` · ${c.provider}` : ""}
                  {c.year ? ` (${c.year})` : ""}
                </Bullet>
              ))}
              {licenseText && <Bullet markColor={AM.yellow} markSize={pt(10)} textStyle={{ fontSize: pt(8.8), lineHeight: 1.42 }}>{licenseText}</Bullet>}
              {data.qualifications?.trim() && (
                <Bullet markColor={AM.yellow} markSize={pt(10)} textStyle={{ fontSize: pt(8.8), lineHeight: 1.42 }}>{data.qualifications.trim()}</Bullet>
              )}
            </div>
          )}
        </div>
      </Row>
    </Sheet>
  );
}

/* ── VELVET ───────────────────────────────────────────────── */
const VC = { plum: "#232244", plumDark: "#1b1a36", mauve: "#c98fa6", ring: "#bcd7e8", ink: "#23272f", text: "#3d4451", muted: "#6b7280", sideText: "#d9d8e6" };
const V_SIDE = 205;
const V_PHOTO = 92;
const V_BAND_TOP = 34;

export function VelvetPreview({ data }: { data: CVData }) {
  const photo = photoOf(data);
  const p = data.personal;
  const licenseText = licenseTextOf(data);
  const sideSecTitle: React.CSSProperties = { fontSize: pt(9.5), fontWeight: 900, color: VC.mauve, textTransform: "uppercase", letterSpacing: pt(1.4), marginTop: pt(16), marginBottom: pt(6) };
  const sideRule = <div style={{ height: 0.75, backgroundColor: "#3c3b63", marginBottom: pt(7) }} />;
  const sYears: React.CSSProperties = { fontSize: pt(7.8), color: "#9a99b8", marginBottom: pt(0.5) };
  const sTitle: React.CSSProperties = { fontSize: pt(8.8), fontWeight: 700, color: "#fff", lineHeight: 1.3 };
  const sSub: React.CSSProperties = { fontSize: pt(8), color: VC.sideText, fontStyle: "italic", marginBottom: pt(6) };
  const secTitle = (label: string) => (
    <div style={{ display: "inline-block", fontSize: pt(11), fontWeight: 900, color: VC.ink, textTransform: "uppercase", letterSpacing: pt(1), paddingBottom: pt(3), borderBottom: `1.5px solid ${VC.ink}`, marginBottom: pt(8) }}>
      {label}
    </div>
  );

  return (
    <Sheet id="velvet" style={{ color: VC.text }}>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: pt(V_SIDE), backgroundColor: VC.plum }} />
      {/* banda cu numele + strip-ul cu rolul */}
      <div style={{ position: "absolute", top: pt(V_BAND_TOP), left: pt(V_SIDE - 14), right: 0, height: pt(46), backgroundColor: VC.mauve, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: pt(20), boxSizing: "border-box" }}>
        <span style={{ fontSize: pt(21), color: "#fff", letterSpacing: pt(1), textAlign: "right" }}>{fullNameOf(data) || "Prenume Nume"}</span>
      </div>
      {roleOf(data) && (
        <div style={{ position: "absolute", top: pt(V_BAND_TOP + 46), left: pt(V_SIDE - 14), right: 0, height: pt(20), backgroundColor: VC.plumDark, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: pt(20), boxSizing: "border-box" }}>
          <span style={{ fontSize: pt(8.5), fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: pt(2) }}>{roleOf(data)}</span>
        </div>
      )}
      {photo && (
        <div style={{ position: "absolute", top: pt(V_BAND_TOP - 12), left: pt(V_SIDE - V_PHOTO / 2 + 4), width: pt(V_PHOTO), height: pt(V_PHOTO), borderRadius: "50%", border: `3px solid ${VC.ring}`, overflow: "hidden", backgroundColor: "#fff", boxSizing: "border-box" }}>
          <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
        </div>
      )}
      <Row>
        <div style={{ width: pt(V_SIDE), flexShrink: 0, padding: `${pt(26)}px ${pt(18)}px 0`, boxSizing: "border-box", position: "relative" }}>
          {localityOf(data) && (
            <div style={{ display: "flex", alignItems: "center", gap: pt(6), marginBottom: pt(5) }}>
              <IPin color={VC.mauve} size={pt(9)} />
              <span style={{ fontSize: pt(8.2), color: VC.sideText, flex: 1, lineHeight: 1.35 }}>{localityOf(data)}</span>
            </div>
          )}
          {p?.phone && (
            <div style={{ display: "flex", alignItems: "center", gap: pt(6), marginBottom: pt(5) }}>
              <IPhone color={VC.mauve} size={pt(9)} />
              <span style={{ fontSize: pt(8.2), color: VC.sideText, flex: 1, lineHeight: 1.35 }}>{p.phone}</span>
            </div>
          )}
          {p?.email && (
            <div style={{ display: "flex", alignItems: "center", gap: pt(6), marginBottom: pt(5) }}>
              <IMail color={VC.mauve} size={pt(9)} />
              <span style={{ fontSize: pt(8.2), color: VC.sideText, flex: 1, lineHeight: 1.35, wordBreak: "break-word" }}>{p.email}</span>
            </div>
          )}

          {data.education.length > 0 && (
            <>
              <div style={sideSecTitle}>Educație</div>
              {sideRule}
              {data.education.map((edu, i) => (
                <div key={i}>
                  <div style={sYears}>{edu.years}</div>
                  <div style={sTitle}>
                    {edu.level}
                    {edu.field ? ` — ${edu.field}` : ""}
                  </div>
                  <div style={sSub}>{edu.institution}</div>
                </div>
              ))}
            </>
          )}

          {(data.courses.length > 0 || data.qualifications?.trim() || licenseText) && (
            <>
              <div style={sideSecTitle}>Certificări</div>
              {sideRule}
              {data.courses.map((c, i) => (
                <div key={i}>
                  <div style={sYears}>{c.year ?? ""}</div>
                  <div style={sTitle}>{c.name}</div>
                  <div style={sSub}>{c.provider ?? ""}</div>
                </div>
              ))}
              {data.qualifications?.trim() && <div style={{ ...sTitle, marginBottom: pt(5) }}>{data.qualifications.trim()}</div>}
              {licenseText && <div style={sTitle}>{licenseText}</div>}
            </>
          )}

          {data.languages.length > 0 && (
            <>
              <div style={sideSecTitle}>Limbi străine</div>
              {sideRule}
              {data.languages.map((l, i) => (
                <div key={i}>
                  <div style={sTitle}>{l.name}</div>
                  <div style={sSub}>{l.level}</div>
                </div>
              ))}
            </>
          )}

          {data.hobbies.length > 0 && (
            <>
              <div style={sideSecTitle}>Hobby-uri</div>
              {sideRule}
              {data.hobbies.map((h, i) => (
                <div key={i} style={{ ...sTitle, marginBottom: pt(3) }}>{h}</div>
              ))}
            </>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0, padding: `${pt(118)}px ${pt(30)}px 0 ${pt(26)}px` }}>
          {data.summary && (
            <div style={{ marginBottom: pt(14) }}>
              {secTitle("Profil")}
              <div style={{ fontSize: pt(9.4), lineHeight: 1.55 }}>{data.summary}</div>
            </div>
          )}
          {data.experience.length > 0 && (
            <div style={{ marginBottom: pt(14) }}>
              {secTitle("Experiență profesională")}
              {data.experience.map((exp, i) => {
                const { from, to } = splitPeriod(exp.period);
                return (
                  <Row key={i} gap={pt(12)} style={{ marginBottom: pt(10) }}>
                    <div style={{ width: pt(62), flexShrink: 0 }}>
                      <div style={{ fontSize: pt(7.6), color: "#9aa0ab", textTransform: "uppercase", letterSpacing: pt(0.5) }}>De la:</div>
                      <div style={{ fontSize: pt(8.2), color: VC.muted, marginBottom: pt(4) }}>{from}</div>
                      <div style={{ fontSize: pt(7.6), color: "#9aa0ab", textTransform: "uppercase", letterSpacing: pt(0.5) }}>Până la:</div>
                      <div style={{ fontSize: pt(8.2), color: VC.muted, marginBottom: pt(4) }}>{to || "—"}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: pt(10.5), fontWeight: 900, color: VC.ink }}>{exp.company}</div>
                      <div style={{ fontSize: pt(9), color: VC.mauve, fontWeight: 700, marginTop: pt(0.5), marginBottom: pt(3) }}>
                        {exp.title}
                        {exp.location ? ` · ${exp.location}` : ""}
                      </div>
                      {[...exp.responsibilities, ...exp.achievements].map((r, j) => (
                        <Bullet key={j} markColor={VC.plum} markSize={pt(8.5)} textStyle={{ fontSize: pt(8.8), lineHeight: 1.42 }}>{r}</Bullet>
                      ))}
                    </div>
                  </Row>
                );
              })}
            </div>
          )}
          {data.skills.length > 0 && (
            <div style={{ marginBottom: pt(14) }}>
              {secTitle("Competențe")}
              <div style={{ fontSize: pt(9.2), lineHeight: 1.7, color: VC.text }}>{data.skills.map((sk) => sk.name).join("  •  ")}</div>
            </div>
          )}
        </div>
      </Row>
    </Sheet>
  );
}

/* ── SAPPHIRE ─────────────────────────────────────────────── */
const SC = { cyan: "#29b7d3", navy: "#0e1c4e", yellow: "#ffc31e", ink: "#101733", text: "#3d4451", muted: "#6b7280", hair: "#d8dce5", sideText: "#e6e9f2" };
const S_SIDE = 200;
const S_PHOTO_H = 190;

export function SapphirePreview({ data }: { data: CVData }) {
  const photo = photoOf(data);
  const p = data.personal;
  const licenseText = licenseTextOf(data);
  const softwareSkills = data.skills.filter((sk) => sk.category === "software");
  const otherSkills = data.skills.filter((sk) => sk.category !== "software");
  const sideSecTitle: React.CSSProperties = { fontSize: pt(10.5), fontWeight: 900, color: SC.yellow, textTransform: "uppercase", letterSpacing: pt(1.2), marginTop: pt(14), marginBottom: pt(8) };
  const cRow = (ic: React.ReactNode, t: string, i?: number | string) => (
    <div key={i} style={{ display: "flex", alignItems: "center", gap: pt(7), marginBottom: pt(6) }}>
      <div style={{ width: pt(15), height: pt(15), borderRadius: "50%", backgroundColor: SC.yellow, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {ic}
      </div>
      <span style={{ fontSize: pt(8.2), color: SC.sideText, flex: 1, lineHeight: 1.35, wordBreak: "break-word" }}>{t}</span>
    </div>
  );
  const secTitle = (label: string) => (
    <div style={{ fontFamily: DISPLAY, fontSize: pt(12), fontWeight: 700, color: SC.ink, textTransform: "uppercase", letterSpacing: pt(0.8), marginBottom: pt(7) }}>{label}</div>
  );
  const tlEntry = (left1: string, left2: string, right1: string, right2: React.ReactNode, i: number | string, last: boolean) => (
    <Row key={i} gap={pt(10)} style={{ marginBottom: pt(10) }}>
      <div style={{ width: pt(10), flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: pt(8), height: pt(8), borderRadius: "50%", backgroundColor: SC.navy, marginTop: pt(2) }} />
        {!last && <div style={{ flex: 1, width: 1.2, backgroundColor: SC.hair, marginTop: pt(2) }} />}
      </div>
      <Row gap={pt(14)} style={{ flex: 1, minWidth: 0 }}>
        <div style={{ width: pt(120), flexShrink: 0 }}>
          <div style={{ fontSize: pt(9.4), fontWeight: 900, color: SC.ink, textTransform: "uppercase" }}>{left1}</div>
          <div style={{ fontSize: pt(8.6), color: SC.muted, fontWeight: 700, marginTop: pt(1) }}>{left2}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: pt(9.6), fontWeight: 700, color: SC.ink, textTransform: "uppercase", letterSpacing: pt(0.4), marginBottom: pt(2) }}>{right1}</div>
          {right2}
        </div>
      </Row>
    </Row>
  );

  return (
    <Sheet id="sapphire" style={{ color: SC.text }}>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: pt(S_SIDE), backgroundColor: SC.navy }} />
      <div style={{ position: "absolute", top: 0, left: 0, width: pt(S_SIDE), height: pt(S_PHOTO_H), backgroundColor: SC.cyan }} />
      <div style={{ position: "absolute", top: 0, bottom: 0, left: pt(S_SIDE), width: 2, backgroundColor: SC.navy }} />
      <Row>
        <div style={{ width: pt(S_SIDE), flexShrink: 0, position: "relative", boxSizing: "border-box" }}>
          {photo ? (
            <img src={photo} alt="" style={{ width: pt(S_SIDE), height: pt(S_PHOTO_H), objectFit: "cover", display: "block" }} />
          ) : (
            <div style={{ width: pt(S_SIDE), height: pt(S_PHOTO_H) }} />
          )}
          <div style={{ padding: `${pt(16)}px ${pt(18)}px 0` }}>
            <div style={sideSecTitle}>Contact</div>
            {p?.phone && cRow(<IPhone color={SC.navy} size={pt(8)} />, p.phone, "ph")}
            {p?.email && cRow(<IMail color={SC.navy} size={pt(8)} />, p.email, "em")}
            {p?.linkedin && cRow(<IGlobe color={SC.navy} size={pt(8)} />, p.linkedin, "li")}
            {localityOf(data) && cRow(<IPin color={SC.navy} size={pt(8)} />, localityOf(data), "lo")}

            {otherSkills.length > 0 && (
              <>
                <div style={sideSecTitle}>Competențe</div>
                {otherSkills.map((sk, i) => (
                  <Bullet key={i} markColor={SC.yellow} markSize={pt(9)} gap={pt(6)} mb={pt(3.5)} textStyle={{ fontSize: pt(8.6), color: SC.sideText, lineHeight: 1.4 }}>
                    {sk.name}
                  </Bullet>
                ))}
              </>
            )}

            {data.hobbies.length > 0 && (
              <>
                <div style={sideSecTitle}>Interese</div>
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                  {data.hobbies.map((h, i) => (
                    <div key={i} style={{ width: "50%", display: "flex", gap: pt(5), marginBottom: pt(4), paddingRight: pt(4), boxSizing: "border-box" }}>
                      <span style={{ color: SC.yellow, fontSize: pt(9), fontWeight: 900, flexShrink: 0 }}>•</span>
                      <span style={{ fontSize: pt(8.4), color: SC.sideText, flex: 1, minWidth: 0 }}>{h}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {data.languages.length > 0 && (
              <>
                <div style={sideSecTitle}>Limbi</div>
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                  {data.languages.map((l, i) => (
                    <div key={i} style={{ width: "50%", display: "flex", gap: pt(5), marginBottom: pt(4), paddingRight: pt(4), boxSizing: "border-box" }}>
                      <span style={{ color: SC.yellow, fontSize: pt(9), fontWeight: 900, flexShrink: 0 }}>•</span>
                      <span style={{ fontSize: pt(8.4), color: SC.sideText, flex: 1, minWidth: 0 }}>
                        {l.name} ({l.level.split(" ")[0]})
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {(licenseText || data.qualifications?.trim()) && (
              <>
                <div style={sideSecTitle}>Calificări</div>
                {licenseText && (
                  <Bullet markColor={SC.yellow} markSize={pt(9)} gap={pt(6)} mb={pt(4)} textStyle={{ fontSize: pt(8.2), color: SC.sideText, lineHeight: 1.35 }}>
                    {licenseText}
                  </Bullet>
                )}
                {data.qualifications?.trim() && (
                  <Bullet markColor={SC.yellow} markSize={pt(9)} gap={pt(6)} mb={pt(4)} textStyle={{ fontSize: pt(8.2), color: SC.sideText, lineHeight: 1.35 }}>
                    {data.qualifications.trim()}
                  </Bullet>
                )}
              </>
            )}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0, padding: `${pt(34)}px ${pt(30)}px 0 ${pt(26)}px` }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: pt(26), color: SC.navy, textTransform: "uppercase", lineHeight: 1.1 }}>
            {fullNameOf(data) || "Prenume Nume"}
          </div>
          {roleOf(data) && (
            <div style={{ fontSize: pt(10), color: SC.muted, textTransform: "uppercase", letterSpacing: pt(2.4), marginTop: pt(4) }}>{roleOf(data)}</div>
          )}
          <div style={{ height: 2, backgroundColor: SC.navy, marginTop: pt(10), marginBottom: pt(12) }} />

          {data.summary && (
            <div style={{ marginBottom: pt(14) }}>
              {secTitle("Despre mine")}
              <div style={{ fontSize: pt(9.4), lineHeight: 1.55 }}>{data.summary}</div>
            </div>
          )}

          {data.experience.length > 0 && (
            <div style={{ marginBottom: pt(14) }}>
              {secTitle("Experiență profesională")}
              {data.experience.map((exp, i) =>
                tlEntry(
                  exp.company,
                  exp.period,
                  exp.title,
                  [...exp.responsibilities, ...exp.achievements].map((r, j) => (
                    <div key={j} style={{ fontSize: pt(8.8), lineHeight: 1.42, marginBottom: pt(1.5) }}>{r}</div>
                  )),
                  i,
                  i === data.experience.length - 1
                )
              )}
            </div>
          )}

          {data.education.length > 0 && (
            <div style={{ marginBottom: pt(14) }}>
              {secTitle("Educație")}
              {data.education.map((edu, i) =>
                tlEntry(
                  edu.institution,
                  edu.years,
                  `${edu.level}${edu.field ? ` — ${edu.field}` : ""}`,
                  (edu.grade || edu.thesis) ? (
                    <div style={{ fontSize: pt(8.4), color: SC.muted, fontStyle: "italic" }}>{eduMetaOf(edu)}</div>
                  ) : null,
                  i,
                  i === data.education.length - 1 && data.courses.length === 0
                )
              )}
              {data.courses.map((c, i) =>
                tlEntry(c.provider ?? "Certificare", c.year ?? "", c.name, null, `c${i}`, true)
              )}
            </div>
          )}

          {softwareSkills.length > 0 && (
            <div style={{ marginBottom: pt(14) }}>
              {secTitle("Software")}
              <div style={{ display: "flex", flexWrap: "wrap", columnGap: pt(24) }}>
                {softwareSkills.map((sk, i) => (
                  <div key={i} style={{ width: "45%", display: "flex", gap: pt(6), marginBottom: pt(4) }}>
                    <span style={{ color: SC.navy, fontSize: pt(9), fontWeight: 900, flexShrink: 0 }}>•</span>
                    <span style={{ flex: 1, fontSize: pt(8.8), fontWeight: 700, color: SC.ink, minWidth: 0 }}>{sk.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Row>
    </Sheet>
  );
}

/* ── GRAPHITE ─────────────────────────────────────────────── */
const GC = { slate: "#5d7386", slateDark: "#3e5468", ink: "#2b3138", text: "#3d4451", muted: "#6b7280", white: "#f3f6f8" };
const G_LEFT = 218;

export function GraphitePreview({ data }: { data: CVData }) {
  const photo = photoOf(data);
  const p = data.personal;
  const licenseText = licenseTextOf(data);
  const lSecTitle = (label: string) => (
    <div style={{ display: "inline-block", fontSize: pt(9.5), fontWeight: 900, color: GC.ink, textTransform: "uppercase", letterSpacing: pt(1.4), marginTop: pt(12), marginBottom: pt(5), paddingBottom: pt(2.5), borderBottom: `1.5px solid ${GC.slate}` }}>
      {label}
    </div>
  );
  const titleBar = (label: string, mt = 0) => (
    <div style={{ backgroundColor: GC.slateDark, padding: `${pt(6)}px ${pt(12)}px`, marginBottom: pt(9), marginTop: mt }}>
      <span style={{ fontSize: pt(10), fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: pt(1.4) }}>{label}</span>
    </div>
  );
  const lText: React.CSSProperties = { fontSize: pt(8.6), color: GC.muted, lineHeight: 1.5, marginBottom: pt(2.5), wordBreak: "break-word" };

  return (
    <Sheet id="graphite" style={{ color: GC.text }}>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: pt(G_LEFT), right: 0, backgroundColor: GC.slate }} />
      <Row>
        <div style={{ width: pt(G_LEFT), flexShrink: 0, padding: `${pt(26)}px ${pt(18)}px 0 ${pt(26)}px`, boxSizing: "border-box", position: "relative" }}>
          {photo && <img src={photo} alt="" style={{ width: pt(G_LEFT - 44), height: pt(168), objectFit: "cover", marginBottom: pt(14) }} />}
          <div style={{ fontSize: pt(17), fontWeight: 900, color: GC.ink, textTransform: "uppercase", letterSpacing: pt(1.2), lineHeight: 1.2 }}>
            {fullNameOf(data) || "Prenume Nume"}
          </div>
          {roleOf(data) && (
            <div style={{ fontSize: pt(9), color: GC.slate, fontWeight: 700, textTransform: "uppercase", letterSpacing: pt(1), marginTop: pt(2), marginBottom: pt(12) }}>
              {roleOf(data)}
            </div>
          )}
          <div>{lSecTitle("Contact")}</div>
          {p?.email && <div style={lText}>{p.email}</div>}
          {p?.phone && <div style={lText}>{p.phone}</div>}
          {p?.linkedin && <div style={lText}>{p.linkedin}</div>}
          {(streetOf(data) || localityOf(data)) && <div style={lText}>{[streetOf(data), localityOf(data)].filter(Boolean).join(", ")}</div>}

          {data.skills.length > 0 && (
            <>
              <div>{lSecTitle("Competențe")}</div>
              {data.skills.map((sk, i) => (
                <Bullet key={i} markColor={GC.slate} markSize={pt(9)} mb={pt(2.5)} textStyle={{ fontSize: pt(8.6), color: GC.text, lineHeight: 1.4 }}>{sk.name}</Bullet>
              ))}
            </>
          )}

          {data.languages.length > 0 && (
            <>
              <div>{lSecTitle("Limbi străine")}</div>
              {data.languages.map((l, i) => (
                <Bullet key={i} markColor={GC.slate} markSize={pt(9)} mb={pt(2.5)} textStyle={{ fontSize: pt(8.6), color: GC.text, lineHeight: 1.4 }}>
                  {l.name} — {l.level}
                </Bullet>
              ))}
            </>
          )}

          {(licenseText || data.qualifications?.trim() || data.hobbies.length > 0) && (
            <>
              <div>{lSecTitle("Extra")}</div>
              {licenseText && <Bullet markColor={GC.slate} markSize={pt(9)} mb={pt(2.5)} textStyle={{ fontSize: pt(8.6), color: GC.text, lineHeight: 1.4 }}>{licenseText}</Bullet>}
              {data.qualifications?.trim() && (
                <Bullet markColor={GC.slate} markSize={pt(9)} mb={pt(2.5)} textStyle={{ fontSize: pt(8.6), color: GC.text, lineHeight: 1.4 }}>{data.qualifications.trim()}</Bullet>
              )}
              {data.hobbies.length > 0 && (
                <Bullet markColor={GC.slate} markSize={pt(9)} mb={pt(2.5)} textStyle={{ fontSize: pt(8.6), color: GC.text, lineHeight: 1.4 }}>
                  Hobby-uri: {data.hobbies.join(", ")}
                </Bullet>
              )}
            </>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0, padding: `${pt(26)}px ${pt(26)}px 0 ${pt(20)}px`, position: "relative" }}>
          {(roleOf(data) || data.summary) && (
            <>
              {titleBar(roleOf(data) || "Profil")}
              {data.summary && <div style={{ fontSize: pt(8.9), color: GC.white, lineHeight: 1.5 }}>{data.summary}</div>}
            </>
          )}
          {data.experience.length > 0 && (
            <>
              {titleBar("Experiență profesională", pt(16))}
              {data.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: pt(10) }}>
                  <div style={{ fontSize: pt(10), fontWeight: 900, color: "#fff" }}>
                    {exp.title} | {exp.company}
                  </div>
                  <div style={{ fontSize: pt(8.4), color: "#c6d2dc", fontStyle: "italic", marginTop: pt(0.5), marginBottom: pt(3) }}>
                    {exp.location ? `${exp.location} · ` : ""}
                    {exp.period}
                  </div>
                  {[...exp.responsibilities, ...exp.achievements].map((r, j) => (
                    <Bullet key={j} mark="–" markColor="#c6d2dc" markSize={pt(8.5)} textStyle={{ fontSize: pt(8.7), color: GC.white, lineHeight: 1.45 }}>{r}</Bullet>
                  ))}
                </div>
              ))}
            </>
          )}
          {data.education.length > 0 && (
            <>
              {titleBar("Educație", pt(16))}
              {data.education.map((edu, i) => (
                <div key={i} style={{ marginBottom: pt(10) }}>
                  <div style={{ fontSize: pt(10), fontWeight: 900, color: "#fff" }}>
                    {edu.level}
                    {edu.field ? ` — ${edu.field}` : ""}
                  </div>
                  <div style={{ fontSize: pt(8.4), color: "#c6d2dc", fontStyle: "italic", marginTop: pt(0.5), marginBottom: pt(3) }}>
                    {edu.institution} · {edu.years}
                  </div>
                  {(edu.grade || edu.thesis) && <div style={{ fontSize: pt(8.9), color: GC.white, lineHeight: 1.5 }}>{eduMetaOf(edu)}</div>}
                </div>
              ))}
            </>
          )}
          {data.courses.length > 0 && (
            <>
              {titleBar("Certificări", pt(16))}
              {data.courses.map((c, i) => (
                <Bullet key={i} mark="–" markColor="#c6d2dc" markSize={pt(8.5)} textStyle={{ fontSize: pt(8.7), color: GC.white, lineHeight: 1.45 }}>
                  {c.name}
                  {c.provider ? ` · ${c.provider}` : ""}
                  {c.year ? ` (${c.year})` : ""}
                </Bullet>
              ))}
            </>
          )}
        </div>
      </Row>
    </Sheet>
  );
}
