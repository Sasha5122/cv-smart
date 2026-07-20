import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { CVData } from "@/lib/types/cv";
import { registerFonts } from "../fonts";
import { fullNameOf, eduMetaOf, photoSrcOf } from "../shared";
import {
  roleOf, localityOf, licenseTextOf,
  IconPhone, IconMail, IconPin, IconGlobe,
} from "./_shared";

registerFonts();

/* „Sapphire" — după model-14: sidebar cu bloc CYAN sus (poză dreptunghi pe
   toată lățimea) + rest NAVY foarte închis cu accente galbene (contact cu
   iconițe galbene rotunde, competențe listate cu bullets galbene,
   interese/limbi cu bullets galbene pe 2 coloane); main alb cu nume navy
   enorm, rol spațiat, linie navy, experiență/educație cu timeline navy
   (stânga firmă+ani, dreapta rol+descriere) și Software listat pe 2 coloane. */

const C = {
  cyan: "#29b7d3",
  navy: "#0e1c4e",
  yellow: "#ffc31e",
  ink: "#101733",
  text: "#3d4451",
  muted: "#6b7280",
  hair: "#d8dce5",
  sideText: "#e6e9f2",
};

const SIDE_W = 200;
const PHOTO_H = 190;

const s = StyleSheet.create({
  page: { backgroundColor: "#fff", fontFamily: "Lato", fontSize: 9.5, color: C.text, lineHeight: 1.45 },
  sideBgNavy: { position: "absolute", top: 0, bottom: 0, left: 0, width: SIDE_W, backgroundColor: C.navy },
  sideBgCyan: { position: "absolute", top: 0, left: 0, width: SIDE_W, height: PHOTO_H, backgroundColor: C.cyan },
  vLine: { position: "absolute", top: 0, bottom: 0, left: SIDE_W, width: 2, backgroundColor: C.navy },
  row: { flexDirection: "row" },
  side: { width: SIDE_W },
  photo: { width: SIDE_W, height: PHOTO_H, objectFit: "cover" },
  sideInner: { paddingHorizontal: 18, paddingTop: 16 },
  sideSecTitle: {
    fontSize: 10.5, fontWeight: 900, color: C.yellow, textTransform: "uppercase",
    letterSpacing: 1.2, marginTop: 14, marginBottom: 8,
  },
  cRow: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 6 },
  cIcon: {
    width: 15, height: 15, borderRadius: 7.5, backgroundColor: C.yellow,
    alignItems: "center", justifyContent: "center",
  },
  cText: { fontSize: 8.2, color: C.sideText, flex: 1, lineHeight: 1.35 },
  skillRow: { flexDirection: "row", gap: 6, marginBottom: 3.5 },
  skillName: { flex: 1, fontSize: 8.6, color: C.sideText, lineHeight: 1.4 },
  twoCol: { flexDirection: "row", flexWrap: "wrap" },
  intCell: { width: "50%", flexDirection: "row", gap: 5, marginBottom: 4, paddingRight: 4 },
  intDot: { color: C.yellow, fontSize: 9, fontWeight: 900 },
  intText: { fontSize: 8.4, color: C.sideText, flex: 1 },
  main: { flex: 1, paddingLeft: 26, paddingRight: 30, paddingTop: 34 },
  name: { fontFamily: "Montserrat", fontWeight: 800, fontSize: 26, color: C.navy, textTransform: "uppercase", lineHeight: 1.1 },
  role: { fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 2.4, marginTop: 4 },
  nameRule: { height: 2, backgroundColor: C.navy, marginTop: 10, marginBottom: 12, width: "100%" },
  secTitle: { fontFamily: "Montserrat", fontSize: 12, fontWeight: 700, color: C.ink, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 7 },
  section: { marginBottom: 14 },
  summary: { fontSize: 9.4, lineHeight: 1.55 },
  tlRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  tlDotCol: { width: 10, alignItems: "center" },
  tlDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.navy, marginTop: 2 },
  tlLine: { flex: 1, width: 1.2, backgroundColor: C.hair, marginTop: 2 },
  entryRow: { flexDirection: "row", gap: 14, flex: 1 },
  entryLeft: { width: 120 },
  entryCompany: { fontSize: 9.4, fontWeight: 900, color: C.ink, textTransform: "uppercase" },
  entryYears: { fontSize: 8.6, color: C.muted, fontWeight: 700, marginTop: 1 },
  entryRight: { flex: 1 },
  entryRole: { fontSize: 9.6, fontWeight: 700, color: C.ink, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 2 },
  bulletText: { fontSize: 8.8, lineHeight: 1.42, marginBottom: 1.5 },
  swGrid: { flexDirection: "row", flexWrap: "wrap", columnGap: 24 },
  swCell: { width: "45%", flexDirection: "row", gap: 6, marginBottom: 4 },
  swDot: { color: C.navy, fontSize: 9, fontWeight: 900 },
  swName: { flex: 1, fontSize: 8.8, fontWeight: 700, color: C.ink },
});

export function SapphireTemplate({ data }: { data: CVData }) {
  const fullName = fullNameOf(data);
  const photo = photoSrcOf(data);
  const p = data.personal;
  const licenseText = licenseTextOf(data);
  const softwareSkills = data.skills.filter((sk) => sk.category === "software");
  const otherSkills = data.skills.filter((sk) => sk.category !== "software");

  return (
    <Document title={`CV ${fullName}`.trim()} author={fullName || "CVexpres"} creator="CVexpres">
      <Page size="A4" style={s.page}>
        <View style={s.sideBgNavy} fixed />
        <View style={s.sideBgCyan} />
        <View style={s.vLine} fixed />
        <View style={s.row}>
          {/* Sidebar */}
          <View style={s.side}>
            {photo ? (
              /* eslint-disable-next-line jsx-a11y/alt-text */
              <Image src={photo} style={s.photo} />
            ) : (
              <View style={{ width: SIDE_W, height: PHOTO_H }} />
            )}
            <View style={s.sideInner}>
              <Text style={s.sideSecTitle}>Contact</Text>
              {p?.phone ? (
                <View style={s.cRow}>
                  <View style={s.cIcon}>
                    <IconPhone color={C.navy} size={8} />
                  </View>
                  <Text style={s.cText}>{p.phone}</Text>
                </View>
              ) : null}
              {p?.email ? (
                <View style={s.cRow}>
                  <View style={s.cIcon}>
                    <IconMail color={C.navy} size={8} />
                  </View>
                  <Text style={s.cText}>{p.email}</Text>
                </View>
              ) : null}
              {p?.linkedin ? (
                <View style={s.cRow}>
                  <View style={s.cIcon}>
                    <IconGlobe color={C.navy} size={8} />
                  </View>
                  <Text style={s.cText}>{p.linkedin}</Text>
                </View>
              ) : null}
              {localityOf(data) ? (
                <View style={s.cRow}>
                  <View style={s.cIcon}>
                    <IconPin color={C.navy} size={8} />
                  </View>
                  <Text style={s.cText}>{localityOf(data)}</Text>
                </View>
              ) : null}

              {otherSkills.length > 0 && (
                <>
                  <Text style={s.sideSecTitle}>Competențe</Text>
                  {otherSkills.map((sk, i) => (
                    <View key={i} style={s.skillRow}>
                      <Text style={s.intDot}>•</Text>
                      <Text style={s.skillName}>{sk.name}</Text>
                    </View>
                  ))}
                </>
              )}

              {data.hobbies.length > 0 && (
                <>
                  <Text style={s.sideSecTitle}>Interese</Text>
                  <View style={s.twoCol}>
                    {data.hobbies.map((h, i) => (
                      <View key={i} style={s.intCell}>
                        <Text style={s.intDot}>•</Text>
                        <Text style={s.intText}>{h}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

              {data.languages.length > 0 && (
                <>
                  <Text style={s.sideSecTitle}>Limbi</Text>
                  <View style={s.twoCol}>
                    {data.languages.map((l, i) => (
                      <View key={i} style={s.intCell}>
                        <Text style={s.intDot}>•</Text>
                        <Text style={s.intText}>
                          {l.name} ({l.level.split(" ")[0]})
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

              {(licenseText || data.qualifications?.trim()) && (
                <>
                  <Text style={s.sideSecTitle}>Calificări</Text>
                  {licenseText ? (
                    <View style={s.cRow}>
                      <Text style={s.intDot}>•</Text>
                      <Text style={s.cText}>{licenseText}</Text>
                    </View>
                  ) : null}
                  {data.qualifications?.trim() ? (
                    <View style={s.cRow}>
                      <Text style={s.intDot}>•</Text>
                      <Text style={s.cText}>{data.qualifications.trim()}</Text>
                    </View>
                  ) : null}
                </>
              )}
            </View>
          </View>

          {/* Main */}
          <View style={s.main}>
            <Text style={s.name}>{fullName || "Prenume Nume"}</Text>
            {roleOf(data) ? <Text style={s.role}>{roleOf(data)}</Text> : null}
            <View style={s.nameRule} />

            {data.summary ? (
              <View style={s.section}>
                <Text style={s.secTitle}>Despre mine</Text>
                <Text style={s.summary}>{data.summary}</Text>
              </View>
            ) : null}

            {data.experience.length > 0 && (
              <View style={s.section}>
                <Text style={s.secTitle}>Experiență profesională</Text>
                {data.experience.map((exp, i) => (
                  <View key={i} wrap={false} style={s.tlRow}>
                    <View style={s.tlDotCol}>
                      <View style={s.tlDot} />
                      {i < data.experience.length - 1 ? <View style={s.tlLine} /> : null}
                    </View>
                    <View style={s.entryRow}>
                      <View style={s.entryLeft}>
                        <Text style={s.entryCompany}>{exp.company}</Text>
                        <Text style={s.entryYears}>{exp.period}</Text>
                      </View>
                      <View style={s.entryRight}>
                        <Text style={s.entryRole}>{exp.title}</Text>
                        {[...exp.responsibilities, ...exp.achievements].map((r, j) => (
                          <Text key={j} style={s.bulletText}>
                            {r}
                          </Text>
                        ))}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {data.education.length > 0 && (
              <View style={s.section}>
                <Text style={s.secTitle}>Educație</Text>
                {data.education.map((edu, i) => (
                  <View key={i} wrap={false} style={s.tlRow}>
                    <View style={s.tlDotCol}>
                      <View style={s.tlDot} />
                      {i < data.education.length - 1 ? <View style={s.tlLine} /> : null}
                    </View>
                    <View style={s.entryRow}>
                      <View style={s.entryLeft}>
                        <Text style={s.entryCompany}>{edu.institution}</Text>
                        <Text style={s.entryYears}>{edu.years}</Text>
                      </View>
                      <View style={s.entryRight}>
                        <Text style={s.entryRole}>
                          {edu.level}
                          {edu.field ? ` — ${edu.field}` : ""}
                        </Text>
                        {(edu.grade || edu.thesis) && (
                          <Text style={{ fontSize: 8.4, color: C.muted, fontStyle: "italic" }}>{eduMetaOf(edu)}</Text>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
                {data.courses.map((c, i) => (
                  <View key={`c${i}`} wrap={false} style={s.tlRow}>
                    <View style={s.tlDotCol}>
                      <View style={s.tlDot} />
                    </View>
                    <View style={s.entryRow}>
                      <View style={s.entryLeft}>
                        <Text style={s.entryCompany}>{c.provider ?? "Certificare"}</Text>
                        <Text style={s.entryYears}>{c.year ?? ""}</Text>
                      </View>
                      <View style={s.entryRight}>
                        <Text style={s.entryRole}>{c.name}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {softwareSkills.length > 0 && (
              <View style={s.section}>
                <Text style={s.secTitle}>Software</Text>
                <View style={s.swGrid}>
                  {softwareSkills.map((sk, i) => (
                    <View key={i} style={s.swCell}>
                      <Text style={s.swDot}>•</Text>
                      <Text style={s.swName}>{sk.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
}
