import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { CVData } from "@/lib/types/cv";
import { registerFonts } from "./fonts";
import { fullNameOf, contactItemsOf, hasLicenseInfoOf, eduMetaOf } from "./shared";

registerFonts();

/* ────────────────────────────────────────────────────────────────
   Template „Classic" — aceeași estetică cu preview-ul live din
   wizard: nume mare + riglă de cerneală, secțiuni cu titlu uppercase
   și hairline, bullet-uri cu em-dash, accente albastre.
   ──────────────────────────────────────────────────────────────── */

const COLORS = {
  ink: "#0f172a",
  text: "#334155",
  muted: "#64748b",
  faint: "#94a3b8",
  primary: "#2563eb",
  hairline: "#e2e8f0",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    fontFamily: "Lato",
    fontSize: 10,
    color: COLORS.text,
    paddingTop: 42,
    paddingBottom: 48,
    paddingHorizontal: 48,
    lineHeight: 1.5,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  photo: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 1,
    borderColor: COLORS.hairline,
  },
  name: {
    fontFamily: "Lato",
    fontWeight: 900,
    fontSize: 25,
    color: COLORS.ink,
    letterSpacing: -0.4,
    // fără lineHeight moștenit (1.5) — evită suprapunerea peste rândul de contact
    lineHeight: 1.15,
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
    fontSize: 9,
    color: COLORS.muted,
  },
  inkRule: {
    height: 2.5,
    backgroundColor: COLORS.ink,
    marginTop: 14,
    marginBottom: 4,
  },
  section: {
    marginTop: 14,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 7,
  },
  sectionTitle: {
    fontSize: 8.5,
    fontWeight: 700,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 1.6,
  },
  sectionLine: {
    flex: 1,
    height: 0.75,
    backgroundColor: COLORS.hairline,
  },
  entryHeadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  entryTitle: {
    fontSize: 11.5,
    fontWeight: 700,
    color: COLORS.ink,
  },
  entryPeriod: {
    fontSize: 9,
    color: COLORS.faint,
  },
  entrySub: {
    fontSize: 10,
    color: COLORS.primary,
    marginTop: 1,
    marginBottom: 4,
  },
  entryMeta: {
    fontSize: 9,
    color: COLORS.muted,
    fontStyle: "italic",
    marginTop: 1,
  },
  bulletRow: {
    flexDirection: "row",
    gap: 7,
    marginBottom: 2.5,
  },
  bulletDash: {
    color: COLORS.primary,
    fontWeight: 700,
    fontSize: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 9.8,
    color: COLORS.text,
    lineHeight: 1.45,
  },
  skillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  skillChip: {
    fontSize: 8.8,
    color: COLORS.ink,
    borderWidth: 0.75,
    borderColor: "#cbd5e1",
    borderRadius: 3,
    paddingVertical: 2.5,
    paddingHorizontal: 7,
  },
  langsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  bodyText: {
    fontSize: 10,
    color: COLORS.text,
    lineHeight: 1.5,
  },
  footer: {
    position: "absolute",
    bottom: 22,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7.5,
    color: COLORS.faint,
  },
});

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeaderRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionLine} />
    </View>
  );
}

export function ClassicTemplate({ data }: { data: CVData }) {
  const fullName = fullNameOf(data);
  const contactItems = contactItemsOf(data);
  const hasLicenseInfo = hasLicenseInfoOf(data);

  return (
    <Document
      title={`CV ${fullName}`.trim()}
      author={fullName || "CVexpress"}
      creator="CVexpress"
    >
      <Page size="A4" style={styles.page}>
        {/* Antet */}
        <View style={styles.headerRow}>
          {data.personal?.photoUrl && (
            /* eslint-disable-next-line jsx-a11y/alt-text */
            <Image src={data.personal.photoUrl} style={styles.photo} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{fullName || "Prenume Nume"}</Text>
            {data.targetTitle ? (
              <Text style={{ fontSize: 10.5, color: COLORS.primary, fontWeight: 700, marginTop: 2 }}>
                {data.targetTitle}
              </Text>
            ) : null}
            {contactItems.length > 0 && (
              <View style={styles.contactRow}>
                {contactItems.map((item, i) => (
                  <Text key={i}>
                    {item}
                    {i < contactItems.length - 1 ? "   ·   " : ""}
                  </Text>
                ))}
              </View>
            )}
          </View>
        </View>
        <View style={styles.inkRule} />

        {/* Rezumat */}
        {data.summary ? (
          <View style={styles.section}>
            <SectionHeader title="Rezumat" />
            <Text style={styles.bodyText}>{data.summary}</Text>
          </View>
        ) : null}

        {/* Experiență */}
        {data.experience.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Experiență profesională" />
            {data.experience.map((exp, i) => (
              <View key={i} wrap={false} style={{ marginBottom: i < data.experience.length - 1 ? 10 : 0 }}>
                <View style={styles.entryHeadRow}>
                  <Text style={styles.entryTitle}>{exp.title}</Text>
                  <Text style={styles.entryPeriod}>{exp.period}</Text>
                </View>
                <Text style={styles.entrySub}>
                  {exp.company}
                  {exp.location ? ` · ${exp.location}` : ""}
                </Text>
                {exp.responsibilities.map((r, j) => (
                  <View key={j} style={styles.bulletRow}>
                    <Text style={styles.bulletDash}>—</Text>
                    <Text style={styles.bulletText}>{r}</Text>
                  </View>
                ))}
                {exp.achievements.map((a, j) => (
                  <View key={`a${j}`} style={styles.bulletRow}>
                    <Text style={styles.bulletDash}>—</Text>
                    <Text style={styles.bulletText}>{a}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Educație */}
        {data.education.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Educație" />
            {data.education.map((edu, i) => (
              <View key={i} wrap={false} style={{ marginBottom: i < data.education.length - 1 ? 7 : 0 }}>
                <View style={styles.entryHeadRow}>
                  <Text style={styles.entryTitle}>
                    {edu.level}
                    {edu.field ? ` — ${edu.field}` : ""}
                  </Text>
                  <Text style={styles.entryPeriod}>{edu.years}</Text>
                </View>
                <Text style={{ fontSize: 10, color: COLORS.text, marginTop: 1 }}>
                  {edu.institution}
                  {edu.location ? ` · ${edu.location}` : ""}
                </Text>
                {(edu.grade || edu.thesis) && (
                  <Text style={styles.entryMeta}>{eduMetaOf(edu)}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Cursuri */}
        {data.courses.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Cursuri & certificări" />
            {data.courses.map((c, i) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.bulletDash}>—</Text>
                <Text style={styles.bulletText}>
                  {c.name}
                  {c.provider ? ` · ${c.provider}` : ""}
                  {c.year ? ` (${c.year})` : ""}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Competențe */}
        {data.skills.length > 0 && (
          <View style={styles.section} wrap={false}>
            <SectionHeader title="Competențe" />
            <View style={styles.skillsWrap}>
              {data.skills.map((s, i) => (
                <Text key={i} style={styles.skillChip}>
                  {s.name}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Limbi străine */}
        {data.languages.length > 0 && (
          <View style={styles.section} wrap={false}>
            <SectionHeader title="Limbi străine" />
            <View style={styles.langsRow}>
              {data.languages.map((l, i) => (
                <Text key={i} style={styles.bodyText}>
                  {l.name} <Text style={{ color: COLORS.muted, fontStyle: "italic" }}>({l.level})</Text>
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Permis & Calificări */}
        {hasLicenseInfo && (
          <View style={styles.section} wrap={false}>
            <SectionHeader title="Permis & Calificări" />
            {data.license?.hasLicense && data.license.categories.length > 0 && (
              <Text style={styles.bodyText}>
                Permis de conducere: categoria {data.license.categories.join(", ")}
              </Text>
            )}
            {data.qualifications?.trim() ? (
              <Text style={[styles.bodyText, { marginTop: 2 }]}>
                {data.qualifications.trim()}
              </Text>
            ) : null}
          </View>
        )}

        {/* Hobby-uri */}
        {data.hobbies.length > 0 && (
          <View style={styles.section} wrap={false}>
            <SectionHeader title="Hobby-uri" />
            <Text style={styles.bodyText}>{data.hobbies.join(", ")}</Text>
          </View>
        )}

        {/* Footer cu paginare */}
        <View style={styles.footer} fixed>
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
