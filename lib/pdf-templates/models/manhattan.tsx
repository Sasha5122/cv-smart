import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { CVData } from "@/lib/types/cv";
import { registerFonts } from "../fonts";
import { fullNameOf, eduMetaOf, photoSrcOf } from "../shared";
import { roleOf, localityOf, streetOf, licenseTextOf } from "./_shared";

registerFonts();

/* „Manhattan" — după model-07: nume albastru enorm stânga-sus (Montserrat),
   POZĂ PĂTRATĂ MARE dreapta-sus, casetă albastră plină „Informații de
   contact" cu grilă 2 coloane; corp alb cu secțiuni cu titlu albastru bold
   + linie gri; Competențe pe 3 coloane; Experiență pe rânduri cu linie
   albastră sus (stânga perioadă+firmă, dreapta descriere). */

const C = {
  blue: "#2077b4",
  blueDark: "#1a6096",
  teal: "#1aa39b",
  ink: "#1f2430",
  text: "#3d4451",
  muted: "#6b7280",
  hair: "#d7dbe0",
};

const s = StyleSheet.create({
  page: { backgroundColor: "#fff", fontFamily: "Lato", fontSize: 9.5, color: C.text, lineHeight: 1.45, paddingTop: 40, paddingBottom: 34, paddingHorizontal: 36 },
  topBar: { position: "absolute", top: 0, left: 0, right: 0, height: 8, backgroundColor: C.teal },
  topRow: { flexDirection: "row", gap: 20 },
  topLeft: { flex: 1 },
  name: { fontFamily: "Montserrat", fontWeight: 800, fontSize: 30, color: C.blue, lineHeight: 1.05 },
  subtitle: { fontSize: 10, color: C.muted, marginTop: 4 },
  photo: { width: 150, height: 186, objectFit: "cover" },
  contactBox: { backgroundColor: C.blue, paddingVertical: 14, paddingHorizontal: 18, marginTop: 16, width: "100%" },
  contactTitle: { fontSize: 12, fontWeight: 900, color: "#fff", marginBottom: 8 },
  cGrid: { flexDirection: "row", flexWrap: "wrap" },
  cCell: { width: "50%", marginBottom: 7, paddingRight: 12 },
  cLabel: { fontSize: 8.5, fontWeight: 700, color: "#bcd9ee", marginBottom: 1.5 },
  cValue: { fontSize: 9, color: "#fff" },
  section: { marginTop: 15 },
  secTitle: { fontFamily: "Montserrat", fontSize: 11.5, fontWeight: 700, color: C.blue, marginBottom: 3 },
  secLine: { height: 1, backgroundColor: C.hair, marginBottom: 7 },
  statementRow: { flexDirection: "row", gap: 22 },
  statement: { flex: 1, fontSize: 9.4, lineHeight: 1.55 },
  bio: { width: 150 },
  bioRow: { flexDirection: "row", marginBottom: 3 },
  bioLabel: { fontSize: 8.6, fontWeight: 700, color: C.ink, width: 52 },
  bioValue: { fontSize: 8.6, color: C.muted, flex: 1 },
  eduGrid: { flexDirection: "row", flexWrap: "wrap", gap: 18 },
  eduCell: { width: "46%" },
  eduTop: { fontSize: 8.4, color: C.muted },
  eduName: { fontSize: 9.6, fontWeight: 700, color: C.ink, marginTop: 1 },
  eduField: { fontSize: 8.8, color: C.text, marginTop: 1 },
  skillsGrid: { flexDirection: "row", flexWrap: "wrap" },
  skillCell: { width: "33.33%", flexDirection: "row", gap: 5, marginBottom: 4, paddingRight: 8 },
  dot: { color: C.blue, fontSize: 9 },
  skillText: { flex: 1, fontSize: 8.8 },
  expBlock: { marginBottom: 10, paddingTop: 7, borderTopWidth: 2, borderTopColor: C.blue },
  expRow: { flexDirection: "row", gap: 18 },
  expLeft: { width: 160 },
  expPeriod: { fontSize: 8.6, color: C.muted },
  expCompany: { fontSize: 9.8, fontWeight: 900, color: C.ink, marginTop: 1 },
  expRole: { fontSize: 8.8, color: C.blue, fontWeight: 700 },
  expRight: { flex: 1 },
  bulletRow: { flexDirection: "row", gap: 5, marginBottom: 2 },
  bulletText: { flex: 1, fontSize: 8.8, lineHeight: 1.42 },
});

export function ManhattanTemplate({ data }: { data: CVData }) {
  const fullName = fullNameOf(data);
  const photo = photoSrcOf(data);
  const p = data.personal;
  const licenseText = licenseTextOf(data);

  const bioItems = [
    localityOf(data) && { l: "Oraș", v: localityOf(data) },
    licenseText && { l: "Permis", v: data.license!.categories.join(", ") },
    data.languages.length > 0 && { l: "Limbi", v: data.languages.map((x) => x.name).join(", ") },
    data.hobbies.length > 0 && { l: "Hobby", v: data.hobbies.join(", ") },
  ].filter(Boolean) as { l: string; v: string }[];

  return (
    <Document title={`CV ${fullName}`.trim()} author={fullName || "CVexpres"} creator="CVexpres">
      <Page size="A4" style={s.page}>
        <View style={s.topBar} fixed />
        {/* Antet: nume stânga + poză mare dreapta */}
        <View style={s.topRow}>
          <View style={s.topLeft}>
            <Text style={s.name}>{fullName || "Prenume Nume"}</Text>
            {roleOf(data) ? <Text style={s.subtitle}>{roleOf(data)}</Text> : null}

            <View style={s.contactBox}>
              <Text style={s.contactTitle}>Informații de contact</Text>
              <View style={s.cGrid}>
                {p?.phone ? (
                  <View style={s.cCell}>
                    <Text style={s.cLabel}>Telefon</Text>
                    <Text style={s.cValue}>{p.phone}</Text>
                  </View>
                ) : null}
                {(streetOf(data) || localityOf(data)) ? (
                  <View style={s.cCell}>
                    <Text style={s.cLabel}>Adresă</Text>
                    <Text style={s.cValue}>{[streetOf(data), localityOf(data)].filter(Boolean).join(", ")}</Text>
                  </View>
                ) : null}
                {p?.email ? (
                  <View style={s.cCell}>
                    <Text style={s.cLabel}>Email</Text>
                    <Text style={s.cValue}>{p.email}</Text>
                  </View>
                ) : null}
                {p?.linkedin ? (
                  <View style={s.cCell}>
                    <Text style={s.cLabel}>LinkedIn</Text>
                    <Text style={s.cValue}>{p.linkedin}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
          {photo && (
            /* eslint-disable-next-line jsx-a11y/alt-text */
            <Image src={photo} style={s.photo} />
          )}
        </View>

        {/* Profil + mini-bio */}
        {(data.summary || bioItems.length > 0) && (
          <View style={s.section}>
            <View style={s.statementRow}>
              {data.summary ? (
                <View style={s.statement}>
                  <Text style={s.secTitle}>Profil personal</Text>
                  <View style={s.secLine} />
                  <Text style={{ fontSize: 9.4, lineHeight: 1.55 }}>{data.summary}</Text>
                </View>
              ) : null}
              {bioItems.length > 0 && (
                <View style={s.bio}>
                  <Text style={s.secTitle}>Pe scurt</Text>
                  <View style={s.secLine} />
                  {bioItems.map((b, i) => (
                    <View key={i} style={s.bioRow}>
                      <Text style={s.bioLabel}>{b.l}:</Text>
                      <Text style={s.bioValue}>{b.v}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Educație pe 2 coloane */}
        {data.education.length > 0 && (
          <View style={s.section}>
            <Text style={s.secTitle}>Educație</Text>
            <View style={s.secLine} />
            <View style={s.eduGrid}>
              {data.education.map((edu, i) => (
                <View key={i} style={s.eduCell}>
                  <Text style={s.eduTop}>{edu.years}</Text>
                  <Text style={s.eduName}>{edu.institution}</Text>
                  <Text style={s.eduField}>
                    {edu.level}
                    {edu.field ? ` — ${edu.field}` : ""}
                  </Text>
                  {(edu.grade || edu.thesis) && (
                    <Text style={{ fontSize: 8, color: C.muted, fontStyle: "italic", marginTop: 1 }}>
                      {eduMetaOf(edu)}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Competențe pe 3 coloane */}
        {(data.skills.length > 0 || data.qualifications?.trim()) && (
          <View style={s.section}>
            <Text style={s.secTitle}>Competențe</Text>
            <View style={s.secLine} />
            <View style={s.skillsGrid}>
              {data.skills.map((sk, i) => (
                <View key={i} style={s.skillCell}>
                  <Text style={s.dot}>•</Text>
                  <Text style={s.skillText}>{sk.name}</Text>
                </View>
              ))}
              {data.qualifications?.trim()
                ? data.qualifications.split(",").map((q, i) => (
                    <View key={`q${i}`} style={s.skillCell}>
                      <Text style={s.dot}>•</Text>
                      <Text style={s.skillText}>{q.trim()}</Text>
                    </View>
                  ))
                : null}
              {data.courses.map((c, i) => (
                <View key={`c${i}`} style={s.skillCell}>
                  <Text style={s.dot}>•</Text>
                  <Text style={s.skillText}>
                    {c.name}
                    {c.year ? ` (${c.year})` : ""}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Experiență */}
        {data.experience.length > 0 && (
          <View style={s.section}>
            <Text style={s.secTitle}>Experiență profesională</Text>
            <View style={s.secLine} />
            {data.experience.map((exp, i) => (
              <View key={i} wrap={false} style={s.expBlock}>
                <View style={s.expRow}>
                  <View style={s.expLeft}>
                    <Text style={s.expPeriod}>{exp.period}</Text>
                    <Text style={s.expCompany}>{exp.company}</Text>
                    <Text style={s.expRole}>{exp.title}</Text>
                  </View>
                  <View style={s.expRight}>
                    {[...exp.responsibilities, ...exp.achievements].map((r, j) => (
                      <View key={j} style={s.bulletRow}>
                        <Text style={s.dot}>•</Text>
                        <Text style={s.bulletText}>{r}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

      </Page>
    </Document>
  );
}
