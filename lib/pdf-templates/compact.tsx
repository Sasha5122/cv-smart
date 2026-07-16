import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { CVData } from "@/lib/types/cv";
import { registerFonts } from "./fonts";
import { fullNameOf, contactItemsOf, hasLicenseInfoOf, eduMetaOf, photoSrcOf } from "./shared";

registerFonts();

/* „Compact" — dens, gândit să încapă totul pe O SINGURĂ pagină:
   margini mici, tipografie strânsă, secțiuni economice, liste inline. */

const C = {
  ink: "#0f172a",
  text: "#334155",
  muted: "#64748b",
  faint: "#94a3b8",
  accent: "#0f766e",
  hairline: "#e2e8f0",
};

const s = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    fontFamily: "Lato",
    fontSize: 9,
    color: C.text,
    paddingTop: 32,
    paddingBottom: 36,
    paddingHorizontal: 38,
    lineHeight: 1.4,
  },
  headRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  name: {
    fontFamily: "Lato",
    fontWeight: 900,
    fontSize: 19,
    color: C.ink,
    letterSpacing: -0.3,
    lineHeight: 1.1,
  },
  contact: { fontSize: 8, color: C.muted, marginTop: 4, lineHeight: 1.4 },
  photo: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, borderColor: C.hairline },
  rule: { height: 1.5, backgroundColor: C.accent, marginTop: 8, marginBottom: 2 },
  section: { marginTop: 9 },
  secTitle: {
    fontSize: 8,
    fontWeight: 900,
    color: C.accent,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 4,
    paddingBottom: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: C.hairline,
  },
  entryHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  entryTitle: { fontSize: 10, fontWeight: 700, color: C.ink },
  entryPeriod: { fontSize: 7.8, color: C.faint },
  entrySub: { fontSize: 8.6, color: C.accent, fontWeight: 700, marginTop: 0.5, marginBottom: 2.5 },
  bulletRow: { flexDirection: "row", gap: 5, marginBottom: 1.5 },
  bulletMark: { color: C.accent, fontWeight: 700, fontSize: 8.6 },
  bulletText: { flex: 1, fontSize: 8.6, color: C.text, lineHeight: 1.35 },
  meta: { fontSize: 7.8, color: C.muted, fontStyle: "italic", marginTop: 0.5 },
  inline: { fontSize: 8.6, color: C.text, lineHeight: 1.5 },
  inlineLabel: { fontWeight: 700, color: C.ink },
  footer: {
    position: "absolute",
    bottom: 16,
    left: 38,
    right: 38,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: C.faint,
  },
});

export function CompactTemplate({ data }: { data: CVData }) {
  const fullName = fullNameOf(data);
  const contactItems = contactItemsOf(data);
  const hasLicenseInfo = hasLicenseInfoOf(data);
  const photo = photoSrcOf(data);

  return (
    <Document title={`CV ${fullName}`.trim()} author={fullName || "CVexpres"} creator="CVexpres">
      <Page size="A4" style={s.page}>
        {/* Antet economic */}
        <View style={s.headRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{fullName || "Prenume Nume"}</Text>
            {data.targetTitle ? (
              <Text style={{ fontSize: 9, color: C.accent, fontWeight: 700, marginTop: 2 }}>
                {data.targetTitle}
              </Text>
            ) : null}
            {contactItems.length > 0 && (
              <Text style={s.contact}>{contactItems.join("   ·   ")}</Text>
            )}
          </View>
          {photo && (
            /* eslint-disable-next-line jsx-a11y/alt-text */
            <Image src={photo} style={s.photo} />
          )}
        </View>
        <View style={s.rule} />

        {data.summary ? (
          <View style={s.section}>
            <Text style={s.secTitle}>Rezumat</Text>
            <Text style={{ fontSize: 8.6, lineHeight: 1.4 }}>{data.summary}</Text>
          </View>
        ) : null}

        {data.experience.length > 0 && (
          <View style={s.section}>
            <Text style={s.secTitle}>Experiență profesională</Text>
            {data.experience.map((exp, i) => (
              <View key={i} wrap={false} style={{ marginBottom: i < data.experience.length - 1 ? 6 : 0 }}>
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
                    <Text style={s.bulletMark}>›</Text>
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
              <View key={i} wrap={false} style={{ marginBottom: i < data.education.length - 1 ? 4 : 0 }}>
                <View style={s.entryHead}>
                  <Text style={s.entryTitle}>
                    {edu.level}
                    {edu.field ? ` — ${edu.field}` : ""}
                  </Text>
                  <Text style={s.entryPeriod}>{edu.years}</Text>
                </View>
                <Text style={{ fontSize: 8.6, marginTop: 0.5 }}>
                  {edu.institution}
                  {edu.location ? ` · ${edu.location}` : ""}
                  {(edu.grade || edu.thesis) ? `  —  ${eduMetaOf(edu)}` : ""}
                </Text>
              </View>
            ))}
          </View>
        )}

        {data.courses.length > 0 && (
          <View style={s.section}>
            <Text style={s.secTitle}>Cursuri & certificări</Text>
            <Text style={s.inline}>
              {data.courses
                .map((c) =>
                  [c.name, c.provider, c.year ? `(${c.year})` : ""].filter(Boolean).join(" · ")
                )
                .join("   |   ")}
            </Text>
          </View>
        )}

        {data.skills.length > 0 && (
          <View style={s.section} wrap={false}>
            <Text style={s.secTitle}>Competențe</Text>
            <Text style={s.inline}>{data.skills.map((sk) => sk.name).join("  ·  ")}</Text>
          </View>
        )}

        {(data.languages.length > 0 || hasLicenseInfo || data.hobbies.length > 0) && (
          <View style={s.section} wrap={false}>
            <Text style={s.secTitle}>Alte informații</Text>
            {data.languages.length > 0 && (
              <Text style={[s.inline, { marginBottom: 1.5 }]}>
                <Text style={s.inlineLabel}>Limbi străine:  </Text>
                {data.languages.map((l) => `${l.name} (${l.level})`).join("  ·  ")}
              </Text>
            )}
            {data.license?.hasLicense && data.license.categories.length > 0 && (
              <Text style={[s.inline, { marginBottom: 1.5 }]}>
                <Text style={s.inlineLabel}>Permis de conducere:  </Text>
                categoria {data.license.categories.join(", ")}
              </Text>
            )}
            {data.qualifications?.trim() ? (
              <Text style={[s.inline, { marginBottom: 1.5 }]}>
                <Text style={s.inlineLabel}>Calificări:  </Text>
                {data.qualifications.trim()}
              </Text>
            ) : null}
            {data.hobbies.length > 0 && (
              <Text style={s.inline}>
                <Text style={s.inlineLabel}>Hobby-uri:  </Text>
                {data.hobbies.join(", ")}
              </Text>
            )}
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
