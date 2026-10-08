import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { CVData } from "@/lib/types/cv";
import { registerFonts } from "../fonts";
import { fullNameOf, eduMetaOf, photoSrcOf } from "../shared";
import {
  roleOf, localityOf, licenseTextOf,
  IconPhone, IconUser, IconBriefcase, IconCap, IconStar,
} from "./_shared";
import { pdfLabels, type PdfLabels } from "../labels";

registerFonts();

/* „Amber" — după model-12: sidebar antracit cu poză cerc centrată cu inel
   galben-orange, nume galben; secțiuni sidebar cu titlu alb caps + linie
   galbenă (Contact cu etichete galbene, Competențe listate, Interese);
   dreapta albă cu cerc galben + iconiță la fiecare titlu de secțiune,
   experiență cu timeline cu puncte galbene. */

const C = {
  charcoal: "#2c3038",
  yellow: "#ffc31e",
  ink: "#23272f",
  text: "#3d4451",
  muted: "#6b7280",
  hair: "#e5e7eb",
  sideText: "#d3d6db",
};

const SIDE_W = 210;
const PHOTO = 108;

const s = StyleSheet.create({
  page: { backgroundColor: "#fff", fontFamily: "Lato", fontSize: 9.5, color: C.text, lineHeight: 1.45 },
  sideBg: { position: "absolute", top: 0, bottom: 0, left: 0, width: SIDE_W, backgroundColor: C.charcoal },
  row: { flexDirection: "row" },
  side: { width: SIDE_W, paddingHorizontal: 20, paddingTop: 28 },
  main: { flex: 1, paddingLeft: 26, paddingRight: 30, paddingTop: 30 },
  /* poză simplă: cerc centrat în panoul antracit, cu inel galben-orange în
     culoarea de accent a modelului */
  photoWrap: {
    width: PHOTO, height: PHOTO, borderRadius: PHOTO / 2, overflow: "hidden",
    borderWidth: 4, borderColor: C.yellow, backgroundColor: C.charcoal,
    alignSelf: "center", marginBottom: 12,
  },
  photo: { width: PHOTO - 8, height: PHOTO - 8, borderRadius: (PHOTO - 8) / 2 },
  name: { fontSize: 19, fontWeight: 900, color: C.yellow, textAlign: "center", lineHeight: 1.15 },
  role: { fontSize: 9.5, color: C.sideText, textAlign: "center", marginTop: 3, marginBottom: 16 },
  sideSecHead: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 3, marginTop: 12 },
  sideIconPill: {
    width: 16, height: 16, borderRadius: 8, backgroundColor: C.yellow,
    alignItems: "center", justifyContent: "center",
  },
  sideSecTitle: { fontSize: 9.5, fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: 1 },
  sideRule: { height: 1.5, backgroundColor: C.yellow, marginBottom: 7 },
  cLabel: { fontSize: 8, fontWeight: 900, color: C.yellow, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 1 },
  cValue: { fontSize: 8.4, color: C.sideText, marginBottom: 5, lineHeight: 1.4 },
  skillRow: { flexDirection: "row", gap: 6, marginBottom: 3.5 },
  skillDot: { color: C.yellow, fontSize: 9 },
  skillName: { flex: 1, fontSize: 8.6, color: C.sideText, lineHeight: 1.4 },
  interest: { fontSize: 8.6, color: C.sideText, marginBottom: 3 },
  mainSecHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 },
  mainIconCircle: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: C.yellow,
    alignItems: "center", justifyContent: "center",
  },
  mainSecTitle: { fontSize: 12, fontWeight: 900, color: C.ink },
  mainRule: { height: 1, backgroundColor: C.hair, marginBottom: 8 },
  section: { marginBottom: 14 },
  summary: { fontSize: 9.4, lineHeight: 1.55 },
  tlRow: { flexDirection: "row", gap: 9, marginBottom: 9 },
  tlDotCol: { width: 10, alignItems: "center" },
  tlDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.yellow, marginTop: 3 },
  tlLine: { flex: 1, width: 1.2, backgroundColor: C.hair, marginTop: 2 },
  tlBody: { flex: 1 },
  expTitle: { fontSize: 10.5, fontWeight: 900, color: C.ink },
  expMeta: { fontSize: 8.6, color: C.muted, marginTop: 1, marginBottom: 3 },
  bulletRow: { flexDirection: "row", gap: 5, marginBottom: 2 },
  dot: { color: C.yellow, fontSize: 10, fontWeight: 900 },
  bulletText: { flex: 1, fontSize: 8.8, lineHeight: 1.42 },
});

export function AmberTemplate({ data, L = pdfLabels("ro") }: { data: CVData; L?: PdfLabels }) {
  const fullName = fullNameOf(data);
  const photo = photoSrcOf(data);
  const p = data.personal;
  const licenseText = licenseTextOf(data, L);

  return (
    <Document title={`CV ${fullName}`.trim()} author={fullName || "CVexpres"} creator="CVexpres">
      <Page size="A4" style={s.page}>
        <View style={s.sideBg} fixed />
        <View style={s.row}>
          {/* Sidebar antracit */}
          <View style={s.side}>
            {photo && (
              <View style={s.photoWrap}>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image src={photo} style={s.photo} />
              </View>
            )}
            <Text style={s.name}>{fullName || L.fullName}</Text>
            {roleOf(data) ? <Text style={s.role}>{roleOf(data)}</Text> : null}

            <View style={s.sideSecHead}>
              <View style={s.sideIconPill}>
                <IconPhone color={C.charcoal} size={9} />
              </View>
              <Text style={s.sideSecTitle}>{L.contact}</Text>
            </View>
            <View style={s.sideRule} />
            {p?.email ? (
              <>
                <Text style={s.cLabel}>{L.email}</Text>
                <Text style={s.cValue}>{p.email}</Text>
              </>
            ) : null}
            {p?.phone ? (
              <>
                <Text style={s.cLabel}>{L.phone}</Text>
                <Text style={s.cValue}>{p.phone}</Text>
              </>
            ) : null}
            {localityOf(data) ? (
              <>
                <Text style={s.cLabel}>{L.city}</Text>
                <Text style={s.cValue}>{localityOf(data)}</Text>
              </>
            ) : null}
            {p?.linkedin ? (
              <>
                <Text style={s.cLabel}>{L.linkedin}</Text>
                <Text style={s.cValue}>{p.linkedin}</Text>
              </>
            ) : null}

            {data.skills.length > 0 && (
              <>
                <View style={s.sideSecHead}>
                  <View style={s.sideIconPill}>
                    <IconStar color={C.charcoal} size={9} />
                  </View>
                  <Text style={s.sideSecTitle}>{L.skills}</Text>
                </View>
                <View style={s.sideRule} />
                {data.skills.map((sk, i) => (
                  <View key={i} style={s.skillRow}>
                    <Text style={s.skillDot}>•</Text>
                    <Text style={s.skillName}>{sk.name}</Text>
                  </View>
                ))}
              </>
            )}

            {(data.hobbies.length > 0 || data.languages.length > 0) && (
              <>
                <View style={s.sideSecHead}>
                  <View style={s.sideIconPill}>
                    <IconUser color={C.charcoal} size={9} />
                  </View>
                  <Text style={s.sideSecTitle}>{L.interestsLanguages}</Text>
                </View>
                <View style={s.sideRule} />
                {data.languages.map((l, i) => (
                  <Text key={`l${i}`} style={s.interest}>
                    {l.name} — {l.level}
                  </Text>
                ))}
                {data.hobbies.map((h, i) => (
                  <Text key={i} style={s.interest}>
                    {h}
                  </Text>
                ))}
              </>
            )}
          </View>

          {/* Coloana albă */}
          <View style={s.main}>
            {data.summary ? (
              <View style={s.section}>
                <View style={s.mainSecHead}>
                  <View style={s.mainIconCircle}>
                    <IconUser color={C.charcoal} size={10} />
                  </View>
                  <Text style={s.mainSecTitle}>{L.profile}</Text>
                </View>
                <View style={s.mainRule} />
                <Text style={s.summary}>{data.summary}</Text>
              </View>
            ) : null}

            {data.experience.length > 0 && (
              <View style={s.section}>
                <View style={s.mainSecHead}>
                  <View style={s.mainIconCircle}>
                    <IconBriefcase color={C.charcoal} size={10} />
                  </View>
                  <Text style={s.mainSecTitle}>{L.experienceShort}</Text>
                </View>
                <View style={s.mainRule} />
                {data.experience.map((exp, i) => (
                  <View key={i} wrap={false} style={s.tlRow}>
                    <View style={s.tlDotCol}>
                      <View style={s.tlDot} />
                      {i < data.experience.length - 1 ? <View style={s.tlLine} /> : null}
                    </View>
                    <View style={s.tlBody}>
                      <Text style={s.expTitle}>{exp.title}</Text>
                      <Text style={s.expMeta}>
                        {exp.company}
                        {exp.location ? ` | ${exp.location}` : ""} | {exp.period}
                      </Text>
                      {[...exp.responsibilities, ...exp.achievements].map((r, j) => (
                        <View key={j} style={s.bulletRow}>
                          <Text style={s.dot}>•</Text>
                          <Text style={s.bulletText}>{r}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {data.education.length > 0 && (
              <View style={s.section}>
                <View style={s.mainSecHead}>
                  <View style={s.mainIconCircle}>
                    <IconCap color={C.charcoal} size={10} />
                  </View>
                  <Text style={s.mainSecTitle}>{L.education}</Text>
                </View>
                <View style={s.mainRule} />
                {data.education.map((edu, i) => (
                  <View key={i} wrap={false} style={{ marginBottom: 6 }}>
                    <Text style={s.expTitle}>
                      {edu.level}
                      {edu.field ? ` — ${edu.field}` : ""}
                    </Text>
                    <Text style={s.expMeta}>
                      {edu.institution} | {edu.years}
                    </Text>
                    {(edu.grade || edu.thesis) && (
                      <Text style={{ fontSize: 8.2, color: C.muted, fontStyle: "italic" }}>{eduMetaOf(edu, L)}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {(data.courses.length > 0 || licenseText || data.qualifications?.trim()) && (
              <View style={s.section}>
                <View style={s.mainSecHead}>
                  <View style={s.mainIconCircle}>
                    <IconStar color={C.charcoal} size={10} />
                  </View>
                  <Text style={s.mainSecTitle}>{L.certificationsQualifications}</Text>
                </View>
                <View style={s.mainRule} />
                {data.courses.map((c, i) => (
                  <View key={i} style={s.bulletRow}>
                    <Text style={s.dot}>•</Text>
                    <Text style={s.bulletText}>
                      {c.name}
                      {c.provider ? ` · ${c.provider}` : ""}
                      {c.year ? ` (${c.year})` : ""}
                    </Text>
                  </View>
                ))}
                {licenseText ? (
                  <View style={s.bulletRow}>
                    <Text style={s.dot}>•</Text>
                    <Text style={s.bulletText}>{licenseText}</Text>
                  </View>
                ) : null}
                {data.qualifications?.trim() ? (
                  <View style={s.bulletRow}>
                    <Text style={s.dot}>•</Text>
                    <Text style={s.bulletText}>{data.qualifications.trim()}</Text>
                  </View>
                ) : null}
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
}
