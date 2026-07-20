import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { CVData } from "@/lib/types/cv";
import { registerFonts } from "../fonts";
import { fullNameOf, eduMetaOf, photoSrcOf } from "../shared";
import {
  roleOf, localityOf, licenseTextOf,
  IconPhone, IconMail, IconPin, IconLinkedin,
} from "./_shared";

registerFonts();

/* „Meridian" — după model-01: header navy plin cu poză cerc + nume caps alb
   și rol verde; bandă de contact foarte închisă; corp 2 coloane (stânga lată
   experiență/educație, dreapta îngustă competențe/limbi/hobby). */

const C = {
  navy: "#1e2a38",
  navyDark: "#141c26",
  green: "#6aa63c",
  greenLt: "#7cb342",
  ink: "#1f2937",
  text: "#374151",
  muted: "#6b7280",
  faint: "#9ca3af",
  hair: "#e5e7eb",
};

const s = StyleSheet.create({
  page: { backgroundColor: "#fff", fontFamily: "Lato", fontSize: 9.5, color: C.text, lineHeight: 1.45 },
  header: { backgroundColor: C.navy, flexDirection: "row", alignItems: "center", gap: 18, paddingHorizontal: 30, paddingVertical: 20 },
  photo: { width: 78, height: 78, borderRadius: 39, borderWidth: 2, borderColor: "#fff" },
  name: { fontSize: 24, fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: 0.5, lineHeight: 1.1 },
  role: { fontSize: 12, fontWeight: 700, color: C.greenLt, marginTop: 2, marginBottom: 5 },
  headerDesc: { fontSize: 8.6, color: "#c8cfd8", lineHeight: 1.5 },
  contactStrip: { backgroundColor: C.navyDark, flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 14, paddingHorizontal: 30, paddingVertical: 7 },
  contactItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  contactText: { fontSize: 8, color: "#d5dbe2" },
  body: { flexDirection: "row", paddingHorizontal: 30, paddingTop: 16, paddingBottom: 30, gap: 20 },
  colL: { width: "60%" },
  colR: { width: "40%" },
  section: { marginBottom: 13 },
  secTitle: { fontSize: 11, fontWeight: 900, color: C.green, marginBottom: 6 },
  entry: { marginBottom: 9 },
  entryHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  entryTitle: { fontSize: 10.5, fontWeight: 700, color: C.ink, flex: 1 },
  entryDate: { fontSize: 8, color: C.faint, marginLeft: 6 },
  entryCompany: { fontSize: 9, fontStyle: "italic", color: C.muted, marginTop: 0.5, marginBottom: 3 },
  bulletRow: { flexDirection: "row", gap: 5, marginBottom: 2 },
  dot: { color: C.green, fontSize: 9 },
  bulletText: { flex: 1, fontSize: 8.8, color: C.text, lineHeight: 1.4 },
  rItem: { flexDirection: "row", gap: 5, marginBottom: 2.5 },
  rDot: { color: C.green, fontSize: 9 },
  rText: { flex: 1, fontSize: 8.8, color: C.text },
  rSubTitle: { fontSize: 9, fontWeight: 700, color: C.ink, marginTop: 3, marginBottom: 3 },
});

function Bullets({ items }: { items: string[] }) {
  return (
    <>
      {items.map((t, i) => (
        <View key={i} style={s.bulletRow}>
          <Text style={s.dot}>•</Text>
          <Text style={s.bulletText}>{t}</Text>
        </View>
      ))}
    </>
  );
}

export function MeridianTemplate({ data }: { data: CVData }) {
  const fullName = fullNameOf(data);
  const photo = photoSrcOf(data);
  const role = roleOf(data);
  const p = data.personal;
  const tech = data.skills.filter((sk) => sk.category !== "soft");
  const soft = data.skills.filter((sk) => sk.category === "soft");
  const licenseText = licenseTextOf(data);

  const contacts = [
    p?.phone && { icon: <IconPhone color={C.greenLt} size={9} />, t: p.phone },
    p?.email && { icon: <IconMail color={C.greenLt} size={9} />, t: p.email },
    p?.linkedin && { icon: <IconLinkedin color={C.greenLt} size={9} />, t: p.linkedin },
    localityOf(data) && { icon: <IconPin color={C.greenLt} size={9} />, t: localityOf(data) },
  ].filter(Boolean) as { icon: React.ReactNode; t: string }[];

  return (
    <Document title={`CV ${fullName}`.trim()} author={fullName || "CVexpres"} creator="CVexpres">
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          {photo && (
            /* eslint-disable-next-line jsx-a11y/alt-text */
            <Image src={photo} style={s.photo} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{fullName || "Prenume Nume"}</Text>
            {role ? <Text style={s.role}>{role}</Text> : null}
            {data.summary ? <Text style={s.headerDesc}>{data.summary}</Text> : null}
          </View>
        </View>

        {contacts.length > 0 && (
          <View style={s.contactStrip}>
            {contacts.map((c, i) => (
              <View key={i} style={s.contactItem}>
                {c.icon}
                <Text style={s.contactText}>{c.t}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={s.body}>
          {/* Coloana stângă */}
          <View style={s.colL}>
            {data.experience.length > 0 && (
              <View style={s.section}>
                <Text style={s.secTitle}>Experiență</Text>
                {data.experience.map((exp, i) => (
                  <View key={i} wrap={false} style={s.entry}>
                    <View style={s.entryHead}>
                      <Text style={s.entryTitle}>{exp.title}</Text>
                      <Text style={s.entryDate}>{exp.period}</Text>
                    </View>
                    <Text style={s.entryCompany}>
                      {exp.company}
                      {exp.location ? ` — ${exp.location}` : ""}
                    </Text>
                    <Bullets items={[...exp.responsibilities, ...exp.achievements]} />
                  </View>
                ))}
              </View>
            )}

            {data.education.length > 0 && (
              <View style={s.section}>
                <Text style={s.secTitle}>Educație</Text>
                {data.education.map((edu, i) => (
                  <View key={i} wrap={false} style={s.entry}>
                    <View style={s.entryHead}>
                      <Text style={s.entryTitle}>
                        {edu.level}
                        {edu.field ? ` — ${edu.field}` : ""}
                      </Text>
                      <Text style={s.entryDate}>{edu.years}</Text>
                    </View>
                    <Text style={s.entryCompany}>
                      {edu.institution}
                      {edu.location ? ` — ${edu.location}` : ""}
                    </Text>
                    {(edu.grade || edu.thesis) && (
                      <Text style={{ fontSize: 8.4, color: C.muted, fontStyle: "italic" }}>{eduMetaOf(edu)}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {data.courses.length > 0 && (
              <View style={s.section}>
                <Text style={s.secTitle}>Certificări</Text>
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

          {/* Coloana dreaptă */}
          <View style={s.colR}>
            {data.skills.length > 0 && (
              <View style={s.section}>
                <Text style={s.secTitle}>Competențe</Text>
                {tech.length > 0 && <Text style={s.rSubTitle}>Tehnice</Text>}
                {tech.map((sk, i) => (
                  <View key={i} style={s.rItem}>
                    <Text style={s.rDot}>•</Text>
                    <Text style={s.rText}>{sk.name}</Text>
                  </View>
                ))}
                {soft.length > 0 && <Text style={s.rSubTitle}>Personale</Text>}
                {soft.map((sk, i) => (
                  <View key={i} style={s.rItem}>
                    <Text style={s.rDot}>•</Text>
                    <Text style={s.rText}>{sk.name}</Text>
                  </View>
                ))}
              </View>
            )}

            {data.languages.length > 0 && (
              <View style={s.section}>
                <Text style={s.secTitle}>Limbi</Text>
                {data.languages.map((l, i) => (
                  <View key={i} style={s.rItem}>
                    <Text style={s.rDot}>•</Text>
                    <Text style={s.rText}>
                      {l.name}: {l.level}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {(licenseText || data.qualifications?.trim()) && (
              <View style={s.section}>
                <Text style={s.secTitle}>Permis & Calificări</Text>
                {licenseText ? (
                  <View style={s.rItem}>
                    <Text style={s.rDot}>•</Text>
                    <Text style={s.rText}>{licenseText}</Text>
                  </View>
                ) : null}
                {data.qualifications?.trim() ? (
                  <View style={s.rItem}>
                    <Text style={s.rDot}>•</Text>
                    <Text style={s.rText}>{data.qualifications.trim()}</Text>
                  </View>
                ) : null}
              </View>
            )}

            {data.hobbies.length > 0 && (
              <View style={s.section}>
                <Text style={s.secTitle}>Hobby-uri</Text>
                {data.hobbies.map((h, i) => (
                  <View key={i} style={s.rItem}>
                    <Text style={s.rDot}>•</Text>
                    <Text style={s.rText}>{h}</Text>
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
