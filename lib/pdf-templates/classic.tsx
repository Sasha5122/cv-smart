import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { CVData } from "@/lib/types/cv";
import { registerFonts } from "./fonts";

registerFonts();

const COLORS = {
  navy: "#1e3a8a",
  text: "#1e293b",
  secondary: "#475569",
  white: "#FFFFFF",
  light: "#f8fafc",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.white,
    fontFamily: "Lato",
    fontSize: 10,
    color: COLORS.text,
  },
  header: {
    backgroundColor: COLORS.navy,
    padding: 24,
    paddingTop: 28,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  photo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  name: {
    fontFamily: "Playfair Display",
    fontWeight: 700,
    fontSize: 26,
    color: COLORS.white,
  },
  titleText: {
    fontFamily: "Lato",
    fontSize: 13,
    color: COLORS.white,
    opacity: 0.85,
    marginTop: 3,
  },
  body: {
    padding: 20,
  },
  contactRow: {
    fontSize: 9.5,
    color: COLORS.secondary,
    marginBottom: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sectionHeading: {
    fontFamily: "Playfair Display",
    fontWeight: 700,
    fontSize: 12,
    color: COLORS.navy,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginTop: 14,
    marginBottom: 3,
  },
  divider: {
    borderBottomWidth: 0.75,
    borderBottomColor: COLORS.navy,
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: COLORS.text,
  },
  company: {
    fontFamily: "Lato",
    fontSize: 10,
    color: COLORS.navy,
    marginTop: 1,
  },
  periodLocation: {
    fontSize: 9,
    color: COLORS.secondary,
    marginBottom: 3,
  },
  bullet: {
    fontSize: 9.5,
    color: COLORS.text,
    lineHeight: 1.4,
    marginLeft: 8,
    marginBottom: 1.5,
  },
  summaryText: {
    fontSize: 10,
    color: COLORS.text,
    lineHeight: 1.5,
    marginBottom: 4,
  },
});

export function ClassicTemplate({ data }: { data: CVData }) {
  const fullName = `${data.personal?.firstName ?? ""} ${data.personal?.lastName ?? ""}`.trim();
  const contactItems = [
    data.personal?.email,
    data.personal?.phone,
    [data.personal?.city, data.personal?.county].filter(Boolean).join(", "),
  ].filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            {data.personal?.photoUrl && (
              <Image src={data.personal.photoUrl} style={styles.photo} />
            )}
            <View>
              <Text style={styles.name}>{fullName || "Prenume Nume"}</Text>
              {data.targetTitle && (
                <Text style={styles.titleText}>{data.targetTitle}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {/* Contact */}
          {contactItems.length > 0 && (
            <View style={styles.contactRow}>
              {contactItems.map((item, i) => (
                <Text key={i}>{item}{i < contactItems.length - 1 ? "  ·  " : ""}</Text>
              ))}
            </View>
          )}

          {/* Summary */}
          {data.summary && (
            <>
              <Text style={styles.sectionHeading}>Rezumat Profesional</Text>
              <View style={styles.divider} />
              <Text style={styles.summaryText}>{data.summary}</Text>
            </>
          )}

          {/* Experience */}
          {data.experience.length > 0 && (
            <>
              <Text style={styles.sectionHeading}>Experiență Profesională</Text>
              <View style={styles.divider} />
              {data.experience.map((exp, i) => (
                <View key={i} style={{ marginBottom: 10 }}>
                  <Text style={styles.jobTitle}>{exp.title}</Text>
                  <Text style={styles.company}>{exp.company}{exp.location ? ` — ${exp.location}` : ""}</Text>
                  <Text style={styles.periodLocation}>{exp.period}</Text>
                  {exp.responsibilities.map((r, j) => (
                    <Text key={j} style={styles.bullet}>• {r}</Text>
                  ))}
                  {exp.achievements.map((a, j) => (
                    <Text key={j} style={styles.bullet}>✓ {a}</Text>
                  ))}
                </View>
              ))}
            </>
          )}

          {/* Education */}
          {data.education.length > 0 && (
            <>
              <Text style={styles.sectionHeading}>Educație</Text>
              <View style={styles.divider} />
              {data.education.map((edu, i) => (
                <View key={i} style={{ marginBottom: 8 }}>
                  <Text style={styles.jobTitle}>{edu.level} — {edu.field}</Text>
                  <Text style={styles.company}>{edu.institution}</Text>
                  <Text style={styles.periodLocation}>{edu.years}</Text>
                  {edu.thesis && (
                    <Text style={{ fontSize: 9, color: COLORS.secondary, fontStyle: "italic" }}>
                      Lucrare: {edu.thesis}
                    </Text>
                  )}
                </View>
              ))}
            </>
          )}

          {/* Courses */}
          {data.courses.length > 0 && (
            <>
              <Text style={styles.sectionHeading}>Cursuri & Certificări</Text>
              <View style={styles.divider} />
              {data.courses.map((c, i) => (
                <Text key={i} style={styles.bullet}>
                  • {c.name}{c.provider ? ` — ${c.provider}` : ""}{c.year ? ` (${c.year})` : ""}
                </Text>
              ))}
            </>
          )}

          {/* Skills */}
          {data.skills.length > 0 && (
            <>
              <Text style={styles.sectionHeading}>Competențe</Text>
              <View style={styles.divider} />
              <Text style={{ fontSize: 9.5, color: COLORS.text, lineHeight: 1.6 }}>
                {data.skills.map((s) => s.name).join("  ·  ")}
              </Text>
            </>
          )}

          {/* Languages */}
          {data.languages.length > 0 && (
            <>
              <Text style={styles.sectionHeading}>Limbi Străine</Text>
              <View style={styles.divider} />
              {data.languages.map((l, i) => (
                <Text key={i} style={styles.bullet}>• {l.name}: {l.level}</Text>
              ))}
            </>
          )}

          {/* License */}
          {data.license?.hasLicense && data.license.categories.length > 0 && (
            <>
              <Text style={styles.sectionHeading}>Permis de Conducere</Text>
              <View style={styles.divider} />
              <Text style={styles.bullet}>Categorii: {data.license.categories.join(", ")}</Text>
            </>
          )}

          {/* Qualifications */}
          {data.qualifications && (
            <>
              <Text style={styles.sectionHeading}>Calificări Profesionale</Text>
              <View style={styles.divider} />
              <Text style={styles.summaryText}>{data.qualifications}</Text>
            </>
          )}

          {/* Hobbies */}
          {data.hobbies.length > 0 && (
            <>
              <Text style={styles.sectionHeading}>Hobby-uri & Interese</Text>
              <View style={styles.divider} />
              <Text style={styles.summaryText}>{data.hobbies.join(", ")}</Text>
            </>
          )}
        </View>
      </Page>
    </Document>
  );
}
