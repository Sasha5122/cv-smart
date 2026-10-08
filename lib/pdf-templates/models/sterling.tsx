import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { CVData } from "@/lib/types/cv";
import { registerFonts } from "../fonts";
import { fullNameOf, eduMetaOf, photoSrcOf } from "../shared";
import { pdfLabels, type PdfLabels } from "../labels";
import { firstNameOf, lastNameOf, roleOf, localityOf, streetOf, licenseTextOf } from "./_shared";

registerFonts();

/* „Sterling" — după model-13: coloană stângă gri foarte pal cu POZĂ PĂTRATĂ
   pe lățimea coloanei, Contact/Limbi/Hobby-uri cu titluri albastre mici;
   dreapta: prenumele negru + NUMELE albastru pe rândul doi, Rezumat,
   Competențe pe 2 coloane, Experiență (roluri bold, firme albastre),
   Educație, Certificări. Profesional, curat. */

const C = {
  blue: "#3f6ad8",
  ink: "#23272f",
  text: "#3d4451",
  muted: "#6b7280",
  panel: "#f0f1f3",
  hair: "#dfe2e7",
};

const LEFT_W = 172;

const s = StyleSheet.create({
  page: { backgroundColor: "#fff", fontFamily: "Lato", fontSize: 9.5, color: C.text, lineHeight: 1.45 },
  leftBg: { position: "absolute", top: 0, bottom: 0, left: 0, width: LEFT_W, backgroundColor: C.panel },
  row: { flexDirection: "row" },
  left: { width: LEFT_W, paddingHorizontal: 16, paddingTop: 22 },
  photo: { width: LEFT_W - 32, height: 150, objectFit: "cover", marginBottom: 12 },
  lSecTitle: {
    fontSize: 8.5, fontWeight: 900, color: C.blue, textTransform: "uppercase", letterSpacing: 1.4,
    marginTop: 12, marginBottom: 4,
  },
  lText: { fontSize: 8.4, color: C.text, lineHeight: 1.5, marginBottom: 2.5 },
  main: { flex: 1, paddingLeft: 24, paddingRight: 30, paddingTop: 26 },
  nameFirst: { fontSize: 22, fontWeight: 400, color: C.ink, lineHeight: 1.1 },
  nameLast: { fontSize: 22, fontWeight: 900, color: C.blue, lineHeight: 1.1 },
  role: { fontSize: 9.5, color: C.muted, marginTop: 3, marginBottom: 12 },
  secTitle: {
    fontSize: 10, fontWeight: 900, color: C.ink, textTransform: "uppercase", letterSpacing: 1,
    paddingBottom: 3, borderBottomWidth: 1, borderBottomColor: C.hair, marginBottom: 7,
  },
  section: { marginBottom: 13 },
  summary: { fontSize: 9.2, lineHeight: 1.55 },
  skillsGrid: { flexDirection: "row", flexWrap: "wrap" },
  skillCell: { width: "50%", flexDirection: "row", gap: 5, marginBottom: 3, paddingRight: 8 },
  dot: { color: C.blue, fontSize: 9 },
  skillText: { flex: 1, fontSize: 8.8 },
  entry: { marginBottom: 9 },
  entryHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  entryTitle: { fontSize: 10.5, fontWeight: 700, color: C.ink, flex: 1 },
  entryDate: { fontSize: 8.2, color: C.muted, marginLeft: 8 },
  entryCompany: { fontSize: 9.2, color: C.blue, fontWeight: 700, marginTop: 0.5, marginBottom: 3 },
  bulletRow: { flexDirection: "row", gap: 5, marginBottom: 2 },
  bulletText: { flex: 1, fontSize: 8.8, lineHeight: 1.42 },
});

export function SterlingTemplate({ data, L = pdfLabels("ro") }: { data: CVData; L?: PdfLabels }) {
  const fullName = fullNameOf(data);
  const photo = photoSrcOf(data);
  const p = data.personal;
  const licenseText = licenseTextOf(data, L);

  return (
    <Document title={`CV ${fullName}`.trim()} author={fullName || "CVexpres"} creator="CVexpres">
      <Page size="A4" style={s.page}>
        <View style={s.leftBg} fixed />
        <View style={s.row}>
          {/* Stânga gri pal */}
          <View style={s.left}>
            {photo && (
              /* eslint-disable-next-line jsx-a11y/alt-text */
              <Image src={photo} style={s.photo} />
            )}
            <Text style={s.lSecTitle}>{L.contact}</Text>
            {p?.phone ? <Text style={s.lText}>{p.phone}</Text> : null}
            {p?.email ? <Text style={s.lText}>{p.email}</Text> : null}
            {(streetOf(data) || localityOf(data)) ? (
              <Text style={s.lText}>{[streetOf(data), localityOf(data)].filter(Boolean).join(", ")}</Text>
            ) : null}
            {p?.linkedin ? <Text style={s.lText}>{p.linkedin}</Text> : null}

            {data.languages.length > 0 && (
              <>
                <Text style={s.lSecTitle}>{L.languages}</Text>
                {data.languages.map((l, i) => (
                  <Text key={i} style={s.lText}>
                    {l.name} — {l.level}
                  </Text>
                ))}
              </>
            )}

            {(licenseText || data.qualifications?.trim()) && (
              <>
                <Text style={s.lSecTitle}>{L.qualifications}</Text>
                {licenseText ? <Text style={s.lText}>{licenseText}</Text> : null}
                {data.qualifications?.trim() ? <Text style={s.lText}>{data.qualifications.trim()}</Text> : null}
              </>
            )}

            {data.hobbies.length > 0 && (
              <>
                <Text style={s.lSecTitle}>{L.hobbies}</Text>
                {data.hobbies.map((h, i) => (
                  <Text key={i} style={s.lText}>
                    {h}
                  </Text>
                ))}
              </>
            )}
          </View>

          {/* Main */}
          <View style={s.main}>
            <Text style={s.nameFirst}>{firstNameOf(data) || L.firstName}</Text>
            <Text style={s.nameLast}>{lastNameOf(data) || L.lastName}</Text>
            {roleOf(data) ? <Text style={s.role}>{roleOf(data)}</Text> : null}

            {data.summary ? (
              <View style={s.section}>
                <Text style={s.secTitle}>{L.summary}</Text>
                <Text style={s.summary}>{data.summary}</Text>
              </View>
            ) : null}

            {data.skills.length > 0 && (
              <View style={s.section}>
                <Text style={s.secTitle}>{L.skills}</Text>
                <View style={s.skillsGrid}>
                  {data.skills.map((sk, i) => (
                    <View key={i} style={s.skillCell}>
                      <Text style={s.dot}>•</Text>
                      <Text style={s.skillText}>{sk.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {data.experience.length > 0 && (
              <View style={s.section}>
                <Text style={s.secTitle}>{L.experience}</Text>
                {data.experience.map((exp, i) => (
                  <View key={i} wrap={false} style={s.entry}>
                    <View style={s.entryHead}>
                      <Text style={s.entryTitle}>{exp.title}</Text>
                      <Text style={s.entryDate}>{exp.period}</Text>
                    </View>
                    <Text style={s.entryCompany}>
                      {exp.company}
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

            {data.education.length > 0 && (
              <View style={s.section}>
                <Text style={s.secTitle}>{L.education}</Text>
                {data.education.map((edu, i) => (
                  <View key={i} wrap={false} style={s.entry}>
                    <View style={s.entryHead}>
                      <Text style={s.entryTitle}>
                        {edu.level}
                        {edu.field ? ` — ${edu.field}` : ""}
                      </Text>
                      <Text style={s.entryDate}>{edu.years}</Text>
                    </View>
                    <Text style={s.entryCompany}>{edu.institution}</Text>
                    {(edu.grade || edu.thesis) && (
                      <Text style={{ fontSize: 8.4, color: C.muted, fontStyle: "italic" }}>{eduMetaOf(edu, L)}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {data.courses.length > 0 && (
              <View style={s.section}>
                <Text style={s.secTitle}>{L.certifications}</Text>
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
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
}
