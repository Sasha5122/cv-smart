import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { CVData } from "@/lib/types/cv";
import { registerFonts } from "../fonts";
import { fullNameOf, eduMetaOf, photoSrcOf } from "../shared";
import { roleOf, localityOf, streetOf, licenseTextOf } from "./_shared";
import { pdfLabels, type PdfLabels } from "../labels";

registerFonts();

/* „Cobalt" — după model-11: panou stânga albastru regal închis cu poză cerc
   mare (inel alb), pill bleumarin cu numele, contact cu etichete bold, listă
   de competențe; dreapta albă cu PILL-uri albastre pe post de titluri
   (Despre mine / Educație cu timeline / Experiență). */

const C = {
  blue: "#25429e",
  blueDark: "#182e73",
  ink: "#1f2430",
  text: "#3d4451",
  muted: "#6b7280",
  hair: "#e5e7eb",
};

const SIDE_W = 225;
const PHOTO = 118;

const s = StyleSheet.create({
  page: { backgroundColor: "#fff", fontFamily: "Lato", fontSize: 9.5, color: C.text, lineHeight: 1.45 },
  sideBg: { position: "absolute", top: 0, bottom: 0, left: 0, width: SIDE_W, backgroundColor: C.blue },
  row: { flexDirection: "row" },
  side: { width: SIDE_W, paddingHorizontal: 20, paddingTop: 26, color: "#fff" },
  main: { flex: 1, paddingLeft: 24, paddingRight: 30, paddingTop: 30 },
  photoWrap: {
    width: PHOTO, height: PHOTO, borderRadius: PHOTO / 2,
    borderWidth: 4, borderColor: "#fff", overflow: "hidden", alignSelf: "center", backgroundColor: "#fff",
  },
  photo: { width: PHOTO - 8, height: PHOTO - 8, borderRadius: (PHOTO - 8) / 2 },
  namePill: {
    backgroundColor: C.blueDark, borderRadius: 14, paddingVertical: 7, paddingHorizontal: 14,
    alignSelf: "center", marginTop: 14,
  },
  nameText: { fontSize: 14, fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: 0.5, textAlign: "center" },
  roleText: { fontSize: 9.5, color: "#d8e0f8", textAlign: "center", marginTop: 5, marginBottom: 14 },
  sidePill: {
    backgroundColor: C.blueDark, borderRadius: 12, paddingVertical: 5, paddingHorizontal: 14,
    alignSelf: "flex-start", marginBottom: 8, marginTop: 8,
  },
  sidePillText: { fontSize: 9.5, fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: 1 },
  cLabel: { fontSize: 8, fontWeight: 900, color: "#c9d4f5", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 1 },
  cValue: { fontSize: 8.6, color: "#fff", marginBottom: 6, lineHeight: 1.4 },
  skillRow: { flexDirection: "row", gap: 6, marginBottom: 3.5 },
  skillDot: { color: "#c9d4f5", fontSize: 9 },
  skillName: { flex: 1, fontSize: 8.8, color: "#fff", lineHeight: 1.4 },
  mainPill: {
    backgroundColor: C.blue, borderRadius: 14, paddingVertical: 6, paddingHorizontal: 18,
    alignSelf: "flex-start", marginBottom: 9,
  },
  mainPillText: { fontSize: 10.5, fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: 1 },
  section: { marginBottom: 14 },
  summary: { fontSize: 9.4, lineHeight: 1.55 },
  tlRow: { flexDirection: "row", gap: 9, marginBottom: 8 },
  tlDotCol: { width: 10, alignItems: "center" },
  tlDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: C.blue, marginTop: 3 },
  tlLine: { flex: 1, width: 1.2, backgroundColor: C.hair, marginTop: 2 },
  tlBody: { flex: 1 },
  eduTitle: { fontSize: 10, fontWeight: 700, color: C.ink },
  eduInst: { fontSize: 9, color: C.blue, fontWeight: 700, marginTop: 0.5 },
  eduYears: { fontSize: 8.2, color: C.muted, marginTop: 0.5 },
  expTitle: { fontSize: 10.5, fontWeight: 900, color: C.ink },
  expMeta: { fontSize: 8.8, color: C.muted, marginTop: 1, marginBottom: 3 },
  bulletRow: { flexDirection: "row", gap: 5, marginBottom: 2 },
  dot: { color: C.blue, fontSize: 9 },
  bulletText: { flex: 1, fontSize: 8.8, lineHeight: 1.42 },
});

export function CobaltTemplate({ data, L = pdfLabels("ro") }: { data: CVData; L?: PdfLabels }) {
  const fullName = fullNameOf(data);
  const photo = photoSrcOf(data);
  const p = data.personal;
  const licenseText = licenseTextOf(data, L);

  return (
    <Document title={`CV ${fullName}`.trim()} author={fullName || "CVexpres"} creator="CVexpres">
      <Page size="A4" style={s.page}>
        <View style={s.sideBg} fixed />
        <View style={s.row}>
          {/* Sidebar albastru */}
          <View style={s.side}>
            {photo && (
              <View style={s.photoWrap}>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image src={photo} style={s.photo} />
              </View>
            )}
            <View style={s.namePill}>
              <Text style={s.nameText}>{fullName || L.fullName}</Text>
            </View>
            {roleOf(data) ? <Text style={s.roleText}>{roleOf(data)}</Text> : null}

            <View style={s.sidePill}>
              <Text style={s.sidePillText}>{L.contact}</Text>
            </View>
            {(streetOf(data) || localityOf(data)) ? (
              <>
                <Text style={s.cLabel}>{L.address}</Text>
                <Text style={s.cValue}>{[streetOf(data), localityOf(data)].filter(Boolean).join(", ")}</Text>
              </>
            ) : null}
            {p?.phone ? (
              <>
                <Text style={s.cLabel}>{L.phone}</Text>
                <Text style={s.cValue}>{p.phone}</Text>
              </>
            ) : null}
            {p?.email ? (
              <>
                <Text style={s.cLabel}>{L.email}</Text>
                <Text style={s.cValue}>{p.email}</Text>
              </>
            ) : null}

            {data.skills.length > 0 && (
              <>
                <View style={s.sidePill}>
                  <Text style={s.sidePillText}>{L.skills}</Text>
                </View>
                {data.skills.map((sk, i) => (
                  <View key={i} style={s.skillRow}>
                    <Text style={s.skillDot}>•</Text>
                    <Text style={s.skillName}>{sk.name}</Text>
                  </View>
                ))}
              </>
            )}

            {data.languages.length > 0 && (
              <>
                <View style={s.sidePill}>
                  <Text style={s.sidePillText}>{L.languagesShort}</Text>
                </View>
                {data.languages.map((l, i) => (
                  <View key={i}>
                    <Text style={s.cLabel}>{l.name}</Text>
                    <Text style={s.cValue}>{l.level}</Text>
                  </View>
                ))}
              </>
            )}
          </View>

          {/* Coloana albă */}
          <View style={s.main}>
            {data.summary ? (
              <View style={s.section}>
                <View style={s.mainPill}>
                  <Text style={s.mainPillText}>{L.about}</Text>
                </View>
                <Text style={s.summary}>{data.summary}</Text>
              </View>
            ) : null}

            {data.education.length > 0 && (
              <View style={s.section}>
                <View style={s.mainPill}>
                  <Text style={s.mainPillText}>{L.education}</Text>
                </View>
                {data.education.map((edu, i) => (
                  <View key={i} wrap={false} style={s.tlRow}>
                    <View style={s.tlDotCol}>
                      <View style={s.tlDot} />
                      {i < data.education.length - 1 ? <View style={s.tlLine} /> : null}
                    </View>
                    <View style={s.tlBody}>
                      <Text style={s.eduTitle}>
                        {edu.level}
                        {edu.field ? L.inField(edu.field) : ""}
                      </Text>
                      <Text style={s.eduInst}>{edu.institution}</Text>
                      <Text style={s.eduYears}>{edu.years}</Text>
                      {(edu.grade || edu.thesis) && (
                        <Text style={{ fontSize: 8, color: C.muted, fontStyle: "italic", marginTop: 1 }}>
                          {eduMetaOf(edu, L)}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {data.experience.length > 0 && (
              <View style={s.section}>
                <View style={s.mainPill}>
                  <Text style={s.mainPillText}>{L.experienceShort}</Text>
                </View>
                {data.experience.map((exp, i) => (
                  <View key={i} wrap={false} style={{ marginBottom: 9 }}>
                    <Text style={s.expTitle}>
                      {exp.title}, {exp.company}
                    </Text>
                    <Text style={s.expMeta}>
                      {exp.period}
                      {exp.location ? ` · ${exp.location}` : ""}
                    </Text>
                    {[...exp.responsibilities, ...exp.achievements].map((r, j) => (
                      <View key={j} style={s.bulletRow}>
                        <Text style={s.dot}>•</Text>
                        <Text style={s.bulletText}>{r}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            )}

            {(data.courses.length > 0 || licenseText || data.qualifications?.trim() || data.hobbies.length > 0) && (
              <View style={s.section}>
                <View style={s.mainPill}>
                  <Text style={s.mainPillText}>{L.extra}</Text>
                </View>
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
                {data.hobbies.length > 0 && (
                  <View style={s.bulletRow}>
                    <Text style={s.dot}>•</Text>
                    <Text style={s.bulletText}>{L.hobbiesLabel} {data.hobbies.join(", ")}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
}
