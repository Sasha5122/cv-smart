import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { CVData } from "@/lib/types/cv";
import { registerFonts } from "../fonts";
import { fullNameOf, eduMetaOf, photoSrcOf } from "../shared";
import { pdfLabels, type PdfLabels } from "../labels";
import { roleOf, localityOf, streetOf, licenseTextOf } from "./_shared";

registerFonts();

/* „Graphite" — după model-10: coloana stângă ALBĂ cu poză dreptunghi mare
   sus (lățimea coloanei), nume caps, Contact și Competențe cu bullets;
   coloana dreaptă (~60%) slate-albastru cu BARE DE TITLU mai închise
   (rol+rezumat, Experiență, Certificări) și text alb. */

const C = {
  slate: "#5d7386",
  slateDark: "#3e5468",
  ink: "#2b3138",
  text: "#3d4451",
  muted: "#6b7280",
  hair: "#e2e6ea",
  white: "#f3f6f8",
};

const LEFT_W = 218;

const s = StyleSheet.create({
  page: { backgroundColor: "#fff", fontFamily: "Lato", fontSize: 9.5, color: C.text, lineHeight: 1.45 },
  rightBg: { position: "absolute", top: 0, bottom: 0, left: LEFT_W, right: 0, backgroundColor: C.slate },
  row: { flexDirection: "row" },
  left: { width: LEFT_W, paddingLeft: 26, paddingRight: 18, paddingTop: 26 },
  photo: { width: LEFT_W - 44, height: 168, objectFit: "cover", marginBottom: 14 },
  name: { fontSize: 17, fontWeight: 900, color: C.ink, textTransform: "uppercase", letterSpacing: 1.2, lineHeight: 1.2 },
  role: { fontSize: 9, color: C.slate, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginTop: 2, marginBottom: 12 },
  lSecTitle: {
    fontSize: 9.5, fontWeight: 900, color: C.ink, textTransform: "uppercase", letterSpacing: 1.4,
    marginTop: 12, marginBottom: 5, paddingBottom: 2.5, borderBottomWidth: 1.5, borderBottomColor: C.slate,
    alignSelf: "flex-start",
  },
  lText: { fontSize: 8.6, color: C.muted, lineHeight: 1.5, marginBottom: 2.5 },
  bulletRow: { flexDirection: "row", gap: 5, marginBottom: 2.5 },
  lDot: { color: C.slate, fontSize: 9 },
  lBullet: { flex: 1, fontSize: 8.6, color: C.text, lineHeight: 1.4 },
  right: { flex: 1, paddingLeft: 20, paddingRight: 26, paddingTop: 26 },
  titleBar: {
    backgroundColor: C.slateDark, paddingVertical: 6, paddingHorizontal: 12,
    marginBottom: 9, marginTop: 4,
  },
  titleBarText: { fontSize: 10, fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: 1.4 },
  rText: { fontSize: 8.9, color: C.white, lineHeight: 1.5 },
  rEntry: { marginBottom: 10 },
  rEntryTitle: { fontSize: 10, fontWeight: 900, color: "#fff" },
  rEntryMeta: { fontSize: 8.4, color: "#c6d2dc", fontStyle: "italic", marginTop: 0.5, marginBottom: 3 },
  rBulletRow: { flexDirection: "row", gap: 5, marginBottom: 2 },
  rDot: { color: "#c6d2dc", fontSize: 8.5 },
  rBullet: { flex: 1, fontSize: 8.7, color: C.white, lineHeight: 1.45 },
});

export function GraphiteTemplate({ data, L = pdfLabels("ro") }: { data: CVData; L?: PdfLabels }) {
  const fullName = fullNameOf(data);
  const photo = photoSrcOf(data);
  const p = data.personal;
  const licenseText = licenseTextOf(data, L);

  return (
    <Document title={`CV ${fullName}`.trim()} author={fullName || "CVexpres"} creator="CVexpres">
      <Page size="A4" style={s.page}>
        <View style={s.rightBg} fixed />
        <View style={s.row}>
          {/* Stânga albă */}
          <View style={s.left}>
            {photo && (
              /* eslint-disable-next-line jsx-a11y/alt-text */
              <Image src={photo} style={s.photo} />
            )}
            <Text style={s.name}>{fullName || L.fullName}</Text>
            {roleOf(data) ? <Text style={s.role}>{roleOf(data)}</Text> : null}

            <Text style={s.lSecTitle}>{L.contact}</Text>
            {p?.email ? <Text style={s.lText}>{p.email}</Text> : null}
            {p?.phone ? <Text style={s.lText}>{p.phone}</Text> : null}
            {p?.linkedin ? <Text style={s.lText}>{p.linkedin}</Text> : null}
            {(streetOf(data) || localityOf(data)) ? (
              <Text style={s.lText}>{[streetOf(data), localityOf(data)].filter(Boolean).join(", ")}</Text>
            ) : null}

            {data.skills.length > 0 && (
              <>
                <Text style={s.lSecTitle}>{L.skills}</Text>
                {data.skills.map((sk, i) => (
                  <View key={i} style={s.bulletRow}>
                    <Text style={s.lDot}>•</Text>
                    <Text style={s.lBullet}>{sk.name}</Text>
                  </View>
                ))}
              </>
            )}

            {data.languages.length > 0 && (
              <>
                <Text style={s.lSecTitle}>{L.languages}</Text>
                {data.languages.map((l, i) => (
                  <View key={i} style={s.bulletRow}>
                    <Text style={s.lDot}>•</Text>
                    <Text style={s.lBullet}>
                      {l.name} — {l.level}
                    </Text>
                  </View>
                ))}
              </>
            )}

            {(licenseText || data.qualifications?.trim() || data.hobbies.length > 0) && (
              <>
                <Text style={s.lSecTitle}>{L.extra}</Text>
                {licenseText ? (
                  <View style={s.bulletRow}>
                    <Text style={s.lDot}>•</Text>
                    <Text style={s.lBullet}>{licenseText}</Text>
                  </View>
                ) : null}
                {data.qualifications?.trim() ? (
                  <View style={s.bulletRow}>
                    <Text style={s.lDot}>•</Text>
                    <Text style={s.lBullet}>{data.qualifications.trim()}</Text>
                  </View>
                ) : null}
                {data.hobbies.length > 0 && (
                  <View style={s.bulletRow}>
                    <Text style={s.lDot}>•</Text>
                    <Text style={s.lBullet}>Hobby-uri: {data.hobbies.join(", ")}</Text>
                  </View>
                )}
              </>
            )}
          </View>

          {/* Dreapta slate */}
          <View style={s.right}>
            {(roleOf(data) || data.summary) && (
              <>
                <View style={s.titleBar}>
                  <Text style={s.titleBarText}>{roleOf(data) || L.profile}</Text>
                </View>
                {data.summary ? <Text style={s.rText}>{data.summary}</Text> : null}
              </>
            )}

            {data.experience.length > 0 && (
              <>
                <View style={[s.titleBar, { marginTop: 16 }]}>
                  <Text style={s.titleBarText}>{L.experience}</Text>
                </View>
                {data.experience.map((exp, i) => (
                  <View key={i} wrap={false} style={s.rEntry}>
                    <Text style={s.rEntryTitle}>
                      {exp.title} | {exp.company}
                    </Text>
                    <Text style={s.rEntryMeta}>
                      {exp.location ? `${exp.location} · ` : ""}
                      {exp.period}
                    </Text>
                    {[...exp.responsibilities, ...exp.achievements].map((r, j) => (
                      <View key={j} style={s.rBulletRow}>
                        <Text style={s.rDot}>–</Text>
                        <Text style={s.rBullet}>{r}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </>
            )}

            {data.education.length > 0 && (
              <>
                <View style={[s.titleBar, { marginTop: 16 }]}>
                  <Text style={s.titleBarText}>{L.education}</Text>
                </View>
                {data.education.map((edu, i) => (
                  <View key={i} wrap={false} style={s.rEntry}>
                    <Text style={s.rEntryTitle}>
                      {edu.level}
                      {edu.field ? ` — ${edu.field}` : ""}
                    </Text>
                    <Text style={s.rEntryMeta}>
                      {edu.institution} · {edu.years}
                    </Text>
                    {(edu.grade || edu.thesis) && <Text style={s.rText}>{eduMetaOf(edu, L)}</Text>}
                  </View>
                ))}
              </>
            )}

            {data.courses.length > 0 && (
              <>
                <View style={[s.titleBar, { marginTop: 16 }]}>
                  <Text style={s.titleBarText}>{L.certifications}</Text>
                </View>
                {data.courses.map((c, i) => (
                  <View key={i} style={s.rBulletRow}>
                    <Text style={s.rDot}>–</Text>
                    <Text style={s.rBullet}>
                      {c.name}
                      {c.provider ? ` · ${c.provider}` : ""}
                      {c.year ? ` (${c.year})` : ""}
                    </Text>
                  </View>
                ))}
              </>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
}
