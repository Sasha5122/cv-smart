import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { CVData } from "@/lib/types/cv";
import { registerFonts } from "./fonts";
import { fullNameOf, contactItemsOf, hasLicenseInfoOf, eduMetaOf, photoSrcOf } from "./shared";

registerFonts();

/* „Modern" — sidebar navy pe stânga (contact, competențe, limbi, permis,
   hobby-uri), coloana principală albă cu nume mare + experiență/educație. */

const C = {
  navy: "#0b1220",
  sideText: "#cbd5e1",
  sideMuted: "#7c8aa0",
  sideTitle: "#93c5fd",
  ink: "#0f172a",
  text: "#334155",
  muted: "#64748b",
  faint: "#94a3b8",
  primary: "#2563eb",
  hairline: "#e2e8f0",
};

const SIDEBAR_W = 176;

const s = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    fontFamily: "Lato",
    fontSize: 10,
    color: C.text,
    lineHeight: 1.5,
    // padding-ul vertical stă pe Page (nu pe coloane): coloanele care se
    // sparg pe mai multe pagini își „revarsă" paddingBottom într-un fragment
    // gol → pagină goală la final. Page-ul nu are problema asta.
    paddingTop: 40,
    paddingBottom: 44,
  },
  sideBg: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: SIDEBAR_W,
    backgroundColor: C.navy,
  },
  row: { flexDirection: "row" },
  side: {
    width: SIDEBAR_W,
    paddingHorizontal: 20,
    color: C.sideText,
  },
  main: {
    flex: 1,
    paddingLeft: 26,
    paddingRight: 40,
  },
  photo: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: "#334155",
    alignSelf: "center",
    marginBottom: 18,
  },
  sideSection: { marginBottom: 16 },
  sideTitle: {
    fontSize: 8,
    fontWeight: 700,
    color: C.sideTitle,
    textTransform: "uppercase",
    letterSpacing: 1.6,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 0.75,
    borderBottomColor: "#1e293b",
  },
  sideText: { fontSize: 8.8, color: C.sideText, lineHeight: 1.55, marginBottom: 3 },
  sideItem: { fontSize: 8.8, color: C.sideText, lineHeight: 1.5, marginBottom: 2.5 },
  name: {
    fontFamily: "Lato",
    fontWeight: 900,
    fontSize: 24,
    color: C.ink,
    letterSpacing: -0.4,
    lineHeight: 1.15,
  },
  accentBar: {
    width: 44,
    height: 4,
    backgroundColor: C.primary,
    borderRadius: 2,
    marginTop: 8,
    marginBottom: 4,
  },
  section: { marginTop: 14 },
  secTitle: {
    fontSize: 9,
    fontWeight: 900,
    color: C.ink,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    marginBottom: 7,
  },
  entryHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  entryTitle: { fontSize: 11.5, fontWeight: 700, color: C.ink },
  entryPeriod: { fontSize: 8.8, color: C.faint },
  entrySub: { fontSize: 9.8, color: C.primary, marginTop: 1, marginBottom: 4, fontWeight: 700 },
  bulletRow: { flexDirection: "row", gap: 7, marginBottom: 2.5 },
  bulletDot: { color: C.primary, fontWeight: 900, fontSize: 10 },
  bulletText: { flex: 1, fontSize: 9.6, color: C.text, lineHeight: 1.45 },
  meta: { fontSize: 8.8, color: C.muted, fontStyle: "italic", marginTop: 1 },
  footer: {
    position: "absolute",
    bottom: 20,
    left: SIDEBAR_W + 26,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7.5,
    color: C.faint,
  },
});

export function ModernTemplate({ data }: { data: CVData }) {
  const fullName = fullNameOf(data);
  const contactItems = contactItemsOf(data);
  const hasLicenseInfo = hasLicenseInfoOf(data);
  const photo = photoSrcOf(data);

  return (
    <Document title={`CV ${fullName}`.trim()} author={fullName || "CVexpres"} creator="CVexpres">
      <Page size="A4" style={s.page}>
        {/* fundalul sidebar-ului pe toată înălțimea, pe fiecare pagină */}
        <View style={s.sideBg} fixed />
        <View style={s.row}>
          {/* Sidebar */}
          <View style={s.side}>
            {photo && (
              /* eslint-disable-next-line jsx-a11y/alt-text */
              <Image src={photo} style={s.photo} />
            )}
            {contactItems.length > 0 && (
              <View style={s.sideSection}>
                <Text style={s.sideTitle}>Contact</Text>
                {contactItems.map((item, i) => (
                  <Text key={i} style={s.sideItem}>
                    {item}
                  </Text>
                ))}
              </View>
            )}
            {data.skills.length > 0 && (
              <View style={s.sideSection}>
                <Text style={s.sideTitle}>Competențe</Text>
                {data.skills.map((sk, i) => (
                  <Text key={i} style={s.sideItem}>
                    •  {sk.name}
                  </Text>
                ))}
              </View>
            )}
            {data.languages.length > 0 && (
              <View style={s.sideSection}>
                <Text style={s.sideTitle}>Limbi străine</Text>
                {data.languages.map((l, i) => (
                  <Text key={i} style={s.sideItem}>
                    {l.name} ({l.level})
                  </Text>
                ))}
              </View>
            )}
            {hasLicenseInfo && (
              <View style={s.sideSection}>
                <Text style={s.sideTitle}>Permis & Calificări</Text>
                {data.license?.hasLicense && data.license.categories.length > 0 && (
                  <Text style={s.sideText}>
                    Permis categoria {data.license.categories.join(", ")}
                  </Text>
                )}
                {data.qualifications?.trim() ? (
                  <Text style={s.sideText}>{data.qualifications.trim()}</Text>
                ) : null}
              </View>
            )}
            {data.hobbies.length > 0 && (
              <View style={s.sideSection}>
                <Text style={s.sideTitle}>Hobby-uri</Text>
                <Text style={s.sideText}>{data.hobbies.join(", ")}</Text>
              </View>
            )}
          </View>

          {/* Coloana principală */}
          <View style={s.main}>
            <Text style={s.name}>{fullName || "Prenume Nume"}</Text>
            {data.targetTitle ? (
              <Text style={{ fontSize: 10.5, color: C.primary, fontWeight: 700, marginTop: 3 }}>
                {data.targetTitle}
              </Text>
            ) : null}
            <View style={s.accentBar} />

            {data.summary ? (
              <View style={s.section}>
                <Text style={s.secTitle}>Rezumat</Text>
                <Text style={{ fontSize: 9.8, lineHeight: 1.5 }}>{data.summary}</Text>
              </View>
            ) : null}

            {data.experience.length > 0 && (
              <View style={s.section}>
                <Text style={s.secTitle}>Experiență profesională</Text>
                {data.experience.map((exp, i) => (
                  <View key={i} wrap={false} style={{ marginBottom: i < data.experience.length - 1 ? 10 : 0 }}>
                    <View style={s.entryHead}>
                      <Text style={s.entryTitle}>{exp.title}</Text>
                      <Text style={s.entryPeriod}>{exp.period}</Text>
                    </View>
                    <Text style={s.entrySub}>
                      {exp.company}
                      {exp.location ? ` · ${exp.location}` : ""}
                    </Text>
                    {[...exp.responsibilities, ...exp.achievements].map((r, j) => (
                      <View key={j} style={s.bulletRow}>
                        <Text style={s.bulletDot}>•</Text>
                        <Text style={s.bulletText}>{r}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            )}

            {data.education.length > 0 && (
              <View style={s.section}>
                <Text style={s.secTitle}>Educație</Text>
                {data.education.map((edu, i) => (
                  <View key={i} wrap={false} style={{ marginBottom: i < data.education.length - 1 ? 7 : 0 }}>
                    <View style={s.entryHead}>
                      <Text style={s.entryTitle}>
                        {edu.level}
                        {edu.field ? ` — ${edu.field}` : ""}
                      </Text>
                      <Text style={s.entryPeriod}>{edu.years}</Text>
                    </View>
                    <Text style={{ fontSize: 9.8, marginTop: 1 }}>
                      {edu.institution}
                      {edu.location ? ` · ${edu.location}` : ""}
                    </Text>
                    {(edu.grade || edu.thesis) && <Text style={s.meta}>{eduMetaOf(edu)}</Text>}
                  </View>
                ))}
              </View>
            )}

            {data.courses.length > 0 && (
              <View style={s.section}>
                <Text style={s.secTitle}>Cursuri & certificări</Text>
                {data.courses.map((c, i) => (
                  <View key={i} style={s.bulletRow}>
                    <Text style={s.bulletDot}>•</Text>
                    <Text style={s.bulletText}>
                      {c.name}
                      {c.provider ? ` · ${c.provider}` : ""}
                      {c.year ? ` (${c.year})` : ""}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={s.footer} fixed>
          <Text>{fullName}</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              totalPages > 1 ? `${pageNumber} / ${totalPages}` : ""
            }
          />
        </View>
      </Page>
    </Document>
  );
}
