import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { CVData } from "@/lib/types/cv";
import { registerFonts } from "../fonts";
import { fullNameOf, eduMetaOf, photoSrcOf } from "../shared";
import { roleOf, localityOf, licenseTextOf, IconPhone, IconMail, IconPin, IconGlobe } from "./_shared";

registerFonts();

/* „Petrol" — după model-06: header teal-petrol cu numele alb stânga și POZĂ
   PĂTRATĂ dreapta; bandă de contact sub header; corp dens pe fundal teal
   foarte pal, 2 coloane cu titluri caps mici pe benzi teal pal. */

const C = {
  teal: "#4a7d80",
  tealDark: "#3d686b",
  band: "#d3e4e4",
  bg: "#eef4f4",
  ink: "#263435",
  text: "#3d4a4b",
  muted: "#64777a",
};

const s = StyleSheet.create({
  page: { backgroundColor: C.bg, fontFamily: "Lato", fontSize: 9, color: C.text, lineHeight: 1.4 },
  header: { backgroundColor: C.teal, flexDirection: "row", alignItems: "center", paddingHorizontal: 30, paddingVertical: 18 },
  headLeft: { flex: 1, paddingRight: 14 },
  name: { fontSize: 21, fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: 1, lineHeight: 1.15 },
  role: { fontSize: 10, color: "#d8e6e6", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.6, marginTop: 5, lineHeight: 1.2 },
  photo: { width: 72, height: 72, marginLeft: "auto", borderWidth: 2, borderColor: "#fff" },
  contactStrip: {
    backgroundColor: C.tealDark, flexDirection: "row", flexWrap: "wrap",
    alignItems: "center", gap: 14, paddingHorizontal: 30, paddingVertical: 6,
  },
  cItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  cText: { fontSize: 7.8, color: "#dcebe9" },
  body: { flexDirection: "row", paddingHorizontal: 26, paddingTop: 14, paddingBottom: 26, gap: 16 },
  colL: { width: "56%" },
  colR: { flex: 1 },
  secBand: {
    backgroundColor: C.band, paddingVertical: 4, paddingHorizontal: 10, marginBottom: 6,
  },
  secBandText: { fontSize: 8.5, fontWeight: 900, color: C.ink, textTransform: "uppercase", letterSpacing: 1.2 },
  section: { marginBottom: 11 },
  text: { fontSize: 8.6, lineHeight: 1.45 },
  entry: { marginBottom: 7 },
  entryHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  entryTitle: { fontSize: 9.4, fontWeight: 700, color: C.ink, flex: 1 },
  entryDate: { fontSize: 7.8, color: C.muted, marginLeft: 6 },
  entryMeta: { fontSize: 8.2, color: C.teal, fontWeight: 700, marginTop: 0.5, marginBottom: 2 },
  bulletRow: { flexDirection: "row", gap: 4.5, marginBottom: 1.5 },
  dot: { color: C.teal, fontSize: 8 },
  bulletText: { flex: 1, fontSize: 8.4, lineHeight: 1.38 },
  rItem: { fontSize: 8.5, marginBottom: 2.5, lineHeight: 1.4 },
});

export function PetrolTemplate({ data }: { data: CVData }) {
  const fullName = fullNameOf(data);
  const photo = photoSrcOf(data);
  const p = data.personal;
  const licenseText = licenseTextOf(data);

  return (
    <Document title={`CV ${fullName}`.trim()} author={fullName || "CVexpres"} creator="CVexpres">
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View style={s.headLeft}>
            <Text style={s.name}>{fullName || "Prenume Nume"}</Text>
            {roleOf(data) ? <Text style={s.role}>{roleOf(data)}</Text> : null}
          </View>
          {photo && (
            /* eslint-disable-next-line jsx-a11y/alt-text */
            <Image src={photo} style={s.photo} />
          )}
        </View>
        <View style={s.contactStrip}>
          {p?.phone ? (
            <View style={s.cItem}>
              <IconPhone color="#a9cbc9" size={8} />
              <Text style={s.cText}>{p.phone}</Text>
            </View>
          ) : null}
          {p?.email ? (
            <View style={s.cItem}>
              <IconMail color="#a9cbc9" size={8} />
              <Text style={s.cText}>{p.email}</Text>
            </View>
          ) : null}
          {localityOf(data) ? (
            <View style={s.cItem}>
              <IconPin color="#a9cbc9" size={8} />
              <Text style={s.cText}>{localityOf(data)}</Text>
            </View>
          ) : null}
          {p?.linkedin ? (
            <View style={s.cItem}>
              <IconGlobe color="#a9cbc9" size={8} />
              <Text style={s.cText}>{p.linkedin}</Text>
            </View>
          ) : null}
        </View>

        <View style={s.body}>
          {/* Stânga */}
          <View style={s.colL}>
            {data.summary ? (
              <View style={s.section}>
                <View style={s.secBand}>
                  <Text style={s.secBandText}>Obiectiv</Text>
                </View>
                <Text style={s.text}>{data.summary}</Text>
              </View>
            ) : null}

            {data.experience.length > 0 && (
              <View style={s.section}>
                <View style={s.secBand}>
                  <Text style={s.secBandText}>Experiență profesională</Text>
                </View>
                {data.experience.map((exp, i) => (
                  <View key={i} wrap={false} style={s.entry}>
                    <View style={s.entryHead}>
                      <Text style={s.entryTitle}>{exp.title}</Text>
                      <Text style={s.entryDate}>{exp.period}</Text>
                    </View>
                    <Text style={s.entryMeta}>
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
                <View style={s.secBand}>
                  <Text style={s.secBandText}>Educație</Text>
                </View>
                {data.education.map((edu, i) => (
                  <View key={i} wrap={false} style={s.entry}>
                    <View style={s.entryHead}>
                      <Text style={s.entryTitle}>
                        {edu.level}
                        {edu.field ? ` — ${edu.field}` : ""}
                      </Text>
                      <Text style={s.entryDate}>{edu.years}</Text>
                    </View>
                    <Text style={s.entryMeta}>{edu.institution}</Text>
                    {(edu.grade || edu.thesis) && (
                      <Text style={{ fontSize: 7.8, color: C.muted, fontStyle: "italic" }}>{eduMetaOf(edu)}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Dreapta */}
          <View style={s.colR}>
            {data.skills.length > 0 && (
              <View style={s.section}>
                <View style={s.secBand}>
                  <Text style={s.secBandText}>Competențe</Text>
                </View>
                {data.skills.map((sk, i) => (
                  <Text key={i} style={s.rItem}>
                    •  {sk.name}
                  </Text>
                ))}
              </View>
            )}

            {data.courses.length > 0 && (
              <View style={s.section}>
                <View style={s.secBand}>
                  <Text style={s.secBandText}>Certificări</Text>
                </View>
                {data.courses.map((c, i) => (
                  <Text key={i} style={s.rItem}>
                    •  {c.name}
                    {c.year ? ` (${c.year})` : ""}
                  </Text>
                ))}
              </View>
            )}

            {data.languages.length > 0 && (
              <View style={s.section}>
                <View style={s.secBand}>
                  <Text style={s.secBandText}>Limbi străine</Text>
                </View>
                {data.languages.map((l, i) => (
                  <Text key={i} style={s.rItem}>
                    •  {l.name} — {l.level}
                  </Text>
                ))}
              </View>
            )}

            {(licenseText || data.qualifications?.trim() || data.hobbies.length > 0) && (
              <View style={s.section}>
                <View style={s.secBand}>
                  <Text style={s.secBandText}>Extra</Text>
                </View>
                {licenseText ? <Text style={s.rItem}>•  {licenseText}</Text> : null}
                {data.qualifications?.trim() ? <Text style={s.rItem}>•  {data.qualifications.trim()}</Text> : null}
                {data.hobbies.map((h, i) => (
                  <Text key={i} style={s.rItem}>
                    •  {h}
                  </Text>
                ))}
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
}
