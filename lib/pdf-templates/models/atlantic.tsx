import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { CVData } from "@/lib/types/cv";
import { registerFonts } from "../fonts";
import { fullNameOf, photoSrcOf } from "../shared";
import {
  firstNameOf, lastNameOf, roleOf, localityOf, licenseTextOf,
  IconPhone, IconMail, IconPin, IconLinkedin, IconCheck,
} from "./_shared";

registerFonts();

/* „Atlantic" — după model-05: banner albastru royal sus (nume stânga, poză
   cerc central peste marginea de jos, contact dreapta); corp 2 coloane:
   stânga îngustă (Social/Competențe/Educație cu titluri negre + linie
   albastră), dreapta lată (Rezumat + Experiență cu ani în coloana gri). */

const C = {
  blue: "#1b5fb5",
  ink: "#111827",
  text: "#374151",
  muted: "#6b7280",
  faint: "#9ca3af",
  hair: "#e5e7eb",
};

const BANNER_H = 120;
const PHOTO = 96;

const s = StyleSheet.create({
  page: { backgroundColor: "#fff", fontFamily: "Lato", fontSize: 9.5, color: C.text, lineHeight: 1.45 },
  banner: { backgroundColor: C.blue, height: BANNER_H, flexDirection: "row", alignItems: "center", paddingHorizontal: 28 },
  nameFirst: { fontSize: 20, color: "#fff", fontWeight: 400, lineHeight: 1.1 },
  nameLast: { fontSize: 26, color: "#fff", fontWeight: 900, textTransform: "uppercase", lineHeight: 1.1 },
  role: { fontSize: 10, color: "#cfe0f5", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginTop: 4 },
  photoWrap: {
    position: "absolute",
    top: BANNER_H - PHOTO + 26,
    left: "50%",
    marginLeft: -(PHOTO / 2),
    width: PHOTO,
    height: PHOTO,
    borderRadius: PHOTO / 2,
    borderWidth: 3,
    borderColor: "#fff",
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  photo: { width: PHOTO - 6, height: PHOTO - 6, borderRadius: (PHOTO - 6) / 2 },
  bannerContact: { marginLeft: "auto", alignItems: "flex-start", gap: 5 },
  bcItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  bcText: { fontSize: 8.4, color: "#e3edf9" },
  body: { flexDirection: "row", paddingHorizontal: 28, paddingTop: 40, paddingBottom: 30, gap: 22 },
  colL: { width: "32%" },
  colR: { flex: 1 },
  secTitle: {
    fontSize: 10, fontWeight: 900, color: C.ink, textTransform: "uppercase", letterSpacing: 0.8,
    paddingBottom: 3, borderBottomWidth: 2, borderBottomColor: C.blue, marginBottom: 7, alignSelf: "flex-start",
  },
  section: { marginBottom: 14 },
  lItem: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  lText: { fontSize: 8.6, color: C.text, flex: 1 },
  eduYears: { fontSize: 8, color: C.faint, marginBottom: 1 },
  eduTitle: { fontSize: 9.2, fontWeight: 700, color: C.ink },
  eduInst: { fontSize: 8.6, color: C.muted, fontStyle: "italic", marginBottom: 6 },
  summary: { fontSize: 9.4, lineHeight: 1.55, color: C.text },
  expRow: { flexDirection: "row", gap: 12, marginBottom: 11 },
  expYears: { width: 74, fontSize: 8.2, color: C.muted, lineHeight: 1.4 },
  expBody: { flex: 1 },
  expCompany: { fontSize: 10.5, fontWeight: 900, color: C.ink, textTransform: "uppercase", letterSpacing: 0.3 },
  expRole: { fontSize: 9, color: C.blue, fontWeight: 700, marginTop: 1, marginBottom: 3 },
  bulletRow: { flexDirection: "row", gap: 5, marginBottom: 2 },
  dot: { color: C.ink, fontSize: 8.5 },
  bulletText: { flex: 1, fontSize: 8.8, color: C.text, lineHeight: 1.42 },
});

export function AtlanticTemplate({ data }: { data: CVData }) {
  const fullName = fullNameOf(data);
  const photo = photoSrcOf(data);
  const p = data.personal;
  const licenseText = licenseTextOf(data);

  return (
    <Document title={`CV ${fullName}`.trim()} author={fullName || "CVexpres"} creator="CVexpres">
      <Page size="A4" style={s.page}>
        <View style={s.banner}>
          <View style={{ maxWidth: "38%" }}>
            <Text style={s.nameFirst}>{firstNameOf(data) || "Prenume"}</Text>
            <Text style={s.nameLast}>{lastNameOf(data) || "Nume"}</Text>
            {roleOf(data) ? <Text style={s.role}>{roleOf(data)}</Text> : null}
          </View>
          <View style={s.bannerContact}>
            {localityOf(data) ? (
              <View style={s.bcItem}>
                <IconPin color="#fff" size={9} />
                <Text style={s.bcText}>{localityOf(data)}</Text>
              </View>
            ) : null}
            {p?.phone ? (
              <View style={s.bcItem}>
                <IconPhone color="#fff" size={9} />
                <Text style={s.bcText}>{p.phone}</Text>
              </View>
            ) : null}
            {p?.email ? (
              <View style={s.bcItem}>
                <IconMail color="#fff" size={9} />
                <Text style={s.bcText}>{p.email}</Text>
              </View>
            ) : null}
            {p?.linkedin ? (
              <View style={s.bcItem}>
                <IconLinkedin color="#fff" size={9} />
                <Text style={s.bcText}>{p.linkedin}</Text>
              </View>
            ) : null}
          </View>
        </View>
        {photo && (
          <View style={s.photoWrap}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={photo} style={s.photo} />
          </View>
        )}

        <View style={s.body}>
          {/* Stânga îngustă */}
          <View style={s.colL}>
            {data.skills.length > 0 && (
              <View style={s.section}>
                <Text style={s.secTitle}>Competențe</Text>
                {data.skills.map((sk, i) => (
                  <View key={i} style={s.lItem}>
                    <IconCheck color={C.blue} size={8} />
                    <Text style={s.lText}>{sk.name}</Text>
                  </View>
                ))}
              </View>
            )}

            {data.languages.length > 0 && (
              <View style={s.section}>
                <Text style={s.secTitle}>Limbi străine</Text>
                {data.languages.map((l, i) => (
                  <View key={i} style={s.lItem}>
                    <IconCheck color={C.blue} size={8} />
                    <Text style={s.lText}>
                      {l.name} — {l.level}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {data.education.length > 0 && (
              <View style={s.section}>
                <Text style={s.secTitle}>Educație</Text>
                {data.education.map((edu, i) => (
                  <View key={i} wrap={false}>
                    <Text style={s.eduYears}>{edu.years}</Text>
                    <Text style={s.eduTitle}>
                      {edu.level}
                      {edu.field ? ` — ${edu.field}` : ""}
                    </Text>
                    <Text style={s.eduInst}>{edu.institution}</Text>
                  </View>
                ))}
              </View>
            )}

            {(licenseText || data.qualifications?.trim()) && (
              <View style={s.section}>
                <Text style={s.secTitle}>Permis & Calificări</Text>
                {licenseText ? (
                  <View style={s.lItem}>
                    <IconCheck color={C.blue} size={8} />
                    <Text style={s.lText}>{licenseText}</Text>
                  </View>
                ) : null}
                {data.qualifications?.trim() ? (
                  <View style={s.lItem}>
                    <IconCheck color={C.blue} size={8} />
                    <Text style={s.lText}>{data.qualifications.trim()}</Text>
                  </View>
                ) : null}
              </View>
            )}

            {data.hobbies.length > 0 && (
              <View style={s.section}>
                <Text style={s.secTitle}>Hobby-uri</Text>
                {data.hobbies.map((h, i) => (
                  <View key={i} style={s.lItem}>
                    <IconCheck color={C.blue} size={8} />
                    <Text style={s.lText}>{h}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Dreapta lată */}
          <View style={s.colR}>
            {data.summary ? (
              <View style={s.section}>
                <Text style={s.secTitle}>Profil</Text>
                <Text style={s.summary}>{data.summary}</Text>
              </View>
            ) : null}

            {data.experience.length > 0 && (
              <View style={s.section}>
                <Text style={s.secTitle}>Experiență profesională</Text>
                {data.experience.map((exp, i) => (
                  <View key={i} wrap={false} style={s.expRow}>
                    <Text style={s.expYears}>
                      {exp.period}
                      {exp.location ? `\n(${exp.location})` : ""}
                    </Text>
                    <View style={s.expBody}>
                      <Text style={s.expCompany}>{exp.company}</Text>
                      <Text style={s.expRole}>{exp.title}</Text>
                      {[...exp.responsibilities, ...exp.achievements].map((r, j) => (
                        <View key={j} style={s.bulletRow}>
                          <Text style={s.dot}>•</Text>
                          <Text style={s.bulletText}>{r}</Text>
                        </View>
                      ))}
                    </View>
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
        </View>
      </Page>
    </Document>
  );
}
