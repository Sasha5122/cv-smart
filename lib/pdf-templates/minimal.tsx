import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { CVData } from "@/lib/types/cv";
import { registerFonts } from "./fonts";
import { fullNameOf, contactItemsOf, hasLicenseInfoOf, eduMetaOf } from "./shared";
import { pdfLabels, type PdfLabels } from "./labels";

registerFonts();

/* „Minimalist" — alb-negru pur, spațiu generos, tipografie ca singur
   element de design. Fără fotografie, fără culoare — doar conținut. */

const C = {
  ink: "#111111",
  text: "#3d3d3d",
  muted: "#7a7a7a",
  faint: "#ababab",
  hairline: "#e5e5e5",
};

const s = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    fontFamily: "Lato",
    fontSize: 10,
    color: C.text,
    paddingTop: 56,
    paddingBottom: 56,
    paddingHorizontal: 60,
    lineHeight: 1.6,
  },
  name: {
    fontFamily: "Lato",
    fontWeight: 900,
    fontSize: 21,
    color: C.ink,
    textTransform: "uppercase",
    letterSpacing: 4,
    lineHeight: 1.2,
  },
  contact: { fontSize: 8.4, color: C.muted, marginTop: 6, letterSpacing: 0.4 },
  rule: { height: 0.75, backgroundColor: C.ink, marginTop: 16 },
  section: { marginTop: 18 },
  secTitle: {
    fontSize: 8,
    fontWeight: 700,
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 3,
    marginBottom: 8,
  },
  entryHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  entryTitle: { fontSize: 11, fontWeight: 700, color: C.ink },
  entryPeriod: { fontSize: 8.4, color: C.faint, letterSpacing: 0.4 },
  entrySub: { fontSize: 9.6, color: C.muted, marginTop: 1, marginBottom: 5 },
  bulletRow: { flexDirection: "row", gap: 8, marginBottom: 3 },
  bulletMark: { color: C.faint, fontSize: 9.6 },
  bulletText: { flex: 1, fontSize: 9.6, color: C.text, lineHeight: 1.55 },
  meta: { fontSize: 8.8, color: C.muted, fontStyle: "italic", marginTop: 1 },
  inline: { fontSize: 9.6, color: C.text, lineHeight: 1.7 },
  footer: {
    position: "absolute",
    bottom: 26,
    left: 60,
    right: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7.5,
    color: C.faint,
    letterSpacing: 0.6,
  },
});

export function MinimalTemplate({ data, L = pdfLabels("ro") }: { data: CVData; L?: PdfLabels }) {
  const fullName = fullNameOf(data);
  const contactItems = contactItemsOf(data);
  const hasLicenseInfo = hasLicenseInfoOf(data);

  return (
    <Document title={`CV ${fullName}`.trim()} author={fullName || "CVexpres"} creator="CVexpres">
      <Page size="A4" style={s.page}>
        <Text style={s.name}>{fullName || L.fullName}</Text>
        {data.targetTitle ? (
          <Text style={{ fontSize: 9.6, color: C.muted, marginTop: 4, letterSpacing: 1 }}>
            {data.targetTitle}
          </Text>
        ) : null}
        {contactItems.length > 0 && <Text style={s.contact}>{contactItems.join("    /    ")}</Text>}
        <View style={s.rule} />

        {data.summary ? (
          <View style={s.section}>
            <Text style={s.secTitle}>{L.summary}</Text>
            <Text style={{ fontSize: 9.8, lineHeight: 1.6 }}>{data.summary}</Text>
          </View>
        ) : null}

        {data.experience.length > 0 && (
          <View style={s.section}>
            <Text style={s.secTitle}>{L.experienceShort}</Text>
            {data.experience.map((exp, i) => (
              <View key={i} wrap={false} style={{ marginBottom: i < data.experience.length - 1 ? 12 : 0 }}>
                <View style={s.entryHead}>
                  <Text style={s.entryTitle}>{exp.title}</Text>
                  <Text style={s.entryPeriod}>{exp.period}</Text>
                </View>
                <Text style={s.entrySub}>
                  {exp.company}
                  {exp.location ? ` — ${exp.location}` : ""}
                </Text>
                {[...exp.responsibilities, ...exp.achievements].map((r, j) => (
                  <View key={j} style={s.bulletRow}>
                    <Text style={s.bulletMark}>–</Text>
                    <Text style={s.bulletText}>{r}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {data.education.length > 0 && (
          <View style={s.section}>
            <Text style={s.secTitle}>{L.education}</Text>
            {data.education.map((edu, i) => (
              <View key={i} wrap={false} style={{ marginBottom: i < data.education.length - 1 ? 8 : 0 }}>
                <View style={s.entryHead}>
                  <Text style={s.entryTitle}>
                    {edu.level}
                    {edu.field ? ` — ${edu.field}` : ""}
                  </Text>
                  <Text style={s.entryPeriod}>{edu.years}</Text>
                </View>
                <Text style={{ fontSize: 9.6, marginTop: 1 }}>
                  {edu.institution}
                  {edu.location ? ` — ${edu.location}` : ""}
                </Text>
                {(edu.grade || edu.thesis) && <Text style={s.meta}>{eduMetaOf(edu, L)}</Text>}
              </View>
            ))}
          </View>
        )}

        {data.courses.length > 0 && (
          <View style={s.section}>
            <Text style={s.secTitle}>{L.courses}</Text>
            {data.courses.map((c, i) => (
              <View key={i} style={s.bulletRow}>
                <Text style={s.bulletMark}>–</Text>
                <Text style={s.bulletText}>
                  {c.name}
                  {c.provider ? ` — ${c.provider}` : ""}
                  {c.year ? ` (${c.year})` : ""}
                </Text>
              </View>
            ))}
          </View>
        )}

        {data.skills.length > 0 && (
          <View style={s.section} wrap={false}>
            <Text style={s.secTitle}>{L.skills}</Text>
            <Text style={s.inline}>{data.skills.map((sk) => sk.name).join("    /    ")}</Text>
          </View>
        )}

        {data.languages.length > 0 && (
          <View style={s.section} wrap={false}>
            <Text style={s.secTitle}>{L.languages}</Text>
            <Text style={s.inline}>
              {data.languages.map((l) => `${l.name} (${l.level})`).join("    /    ")}
            </Text>
          </View>
        )}

        {hasLicenseInfo && (
          <View style={s.section} wrap={false}>
            <Text style={s.secTitle}>{L.licenseQualifications}</Text>
            {data.license?.hasLicense && data.license.categories.length > 0 && (
              <Text style={s.inline}>
                {L.licenseLine(data.license.categories.join(", "))}
              </Text>
            )}
            {data.qualifications?.trim() ? (
              <Text style={s.inline}>{data.qualifications.trim()}</Text>
            ) : null}
          </View>
        )}

        {data.hobbies.length > 0 && (
          <View style={s.section} wrap={false}>
            <Text style={s.secTitle}>{L.hobbies}</Text>
            <Text style={s.inline}>{data.hobbies.join("    /    ")}</Text>
          </View>
        )}

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
