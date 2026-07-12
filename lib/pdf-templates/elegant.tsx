import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { CVData } from "@/lib/types/cv";
import { registerFonts } from "./fonts";
import { fullNameOf, contactItemsOf, hasLicenseInfoOf, eduMetaOf } from "./shared";

registerFonts();

/* „Elegant" — serif (PT Serif), antet centrat, accent auriu discret,
   rigle duble fine. Sobru, potrivit pentru roluri administrative/senioare. */

const C = {
  ink: "#1c1917",
  text: "#44403c",
  muted: "#78716c",
  faint: "#a8a29e",
  gold: "#a16207",
  hairline: "#e7e5e4",
};

const s = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    fontFamily: "PT Serif",
    fontSize: 10,
    color: C.text,
    paddingTop: 46,
    paddingBottom: 50,
    paddingHorizontal: 54,
    lineHeight: 1.55,
  },
  name: {
    fontFamily: "PT Serif",
    fontWeight: 700,
    fontSize: 24,
    color: C.ink,
    textAlign: "center",
    lineHeight: 1.15,
  },
  title: {
    fontSize: 10.5,
    color: C.gold,
    textAlign: "center",
    marginTop: 3,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 7,
    fontSize: 8.6,
    color: C.muted,
    fontFamily: "Lato",
  },
  doubleRuleOuter: {
    height: 1,
    backgroundColor: C.ink,
    marginTop: 14,
  },
  doubleRuleInner: {
    height: 0.5,
    backgroundColor: C.hairline,
    marginTop: 2,
    marginBottom: 2,
  },
  section: { marginTop: 15 },
  secTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  secLine: { flex: 1, height: 0.5, backgroundColor: C.hairline },
  secTitle: {
    fontFamily: "Lato",
    fontSize: 8.5,
    fontWeight: 700,
    color: C.gold,
    textTransform: "uppercase",
    letterSpacing: 2.2,
  },
  entryHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  entryTitle: { fontSize: 11.5, fontWeight: 700, color: C.ink },
  entryPeriod: { fontSize: 8.8, color: C.faint, fontFamily: "Lato" },
  entrySub: { fontSize: 10, color: C.muted, fontStyle: "italic", marginTop: 1, marginBottom: 4 },
  bulletRow: { flexDirection: "row", gap: 8, marginBottom: 2.5 },
  bulletMark: { color: C.gold, fontSize: 10 },
  bulletText: { flex: 1, fontSize: 9.8, color: C.text, lineHeight: 1.5 },
  meta: { fontSize: 9, color: C.muted, fontStyle: "italic", marginTop: 1 },
  inlineList: { fontSize: 10, color: C.text, lineHeight: 1.65 },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 54,
    right: 54,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7.5,
    color: C.faint,
    fontFamily: "Lato",
  },
});

function Sec({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <View style={s.secTitleRow}>
        <View style={s.secLine} />
        <Text style={s.secTitle}>{title}</Text>
        <View style={s.secLine} />
      </View>
      {children}
    </View>
  );
}

export function ElegantTemplate({ data }: { data: CVData }) {
  const fullName = fullNameOf(data);
  const contactItems = contactItemsOf(data);
  const hasLicenseInfo = hasLicenseInfoOf(data);

  return (
    <Document title={`CV ${fullName}`.trim()} author={fullName || "CVexpress"} creator="CVexpress">
      <Page size="A4" style={s.page}>
        {/* Antet centrat */}
        {data.personal?.photoUrl && (
          /* eslint-disable-next-line jsx-a11y/alt-text */
          <Image
            src={data.personal.photoUrl}
            style={{
              width: 66,
              height: 66,
              borderRadius: 33,
              alignSelf: "center",
              marginBottom: 10,
              borderWidth: 1,
              borderColor: C.hairline,
            }}
          />
        )}
        <Text style={s.name}>{fullName || "Prenume Nume"}</Text>
        {data.targetTitle ? <Text style={s.title}>{data.targetTitle}</Text> : null}
        {contactItems.length > 0 && (
          <View style={s.contactRow}>
            {contactItems.map((item, i) => (
              <Text key={i}>
                {item}
                {i < contactItems.length - 1 ? "    ·    " : ""}
              </Text>
            ))}
          </View>
        )}
        <View style={s.doubleRuleOuter} />
        <View style={s.doubleRuleInner} />

        {data.summary ? (
          <Sec title="Profil">
            <Text style={{ fontSize: 10, lineHeight: 1.6, textAlign: "center", fontStyle: "italic" }}>
              {data.summary}
            </Text>
          </Sec>
        ) : null}

        {data.experience.length > 0 && (
          <Sec title="Experiență profesională">
            {data.experience.map((exp, i) => (
              <View key={i} wrap={false} style={{ marginBottom: i < data.experience.length - 1 ? 11 : 0 }}>
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
                    <Text style={s.bulletMark}>•</Text>
                    <Text style={s.bulletText}>{r}</Text>
                  </View>
                ))}
              </View>
            ))}
          </Sec>
        )}

        {data.education.length > 0 && (
          <Sec title="Educație">
            {data.education.map((edu, i) => (
              <View key={i} wrap={false} style={{ marginBottom: i < data.education.length - 1 ? 7 : 0 }}>
                <View style={s.entryHead}>
                  <Text style={s.entryTitle}>
                    {edu.level}
                    {edu.field ? ` — ${edu.field}` : ""}
                  </Text>
                  <Text style={s.entryPeriod}>{edu.years}</Text>
                </View>
                <Text style={{ fontSize: 10, marginTop: 1 }}>
                  {edu.institution}
                  {edu.location ? ` · ${edu.location}` : ""}
                </Text>
                {(edu.grade || edu.thesis) && <Text style={s.meta}>{eduMetaOf(edu)}</Text>}
              </View>
            ))}
          </Sec>
        )}

        {data.courses.length > 0 && (
          <Sec title="Cursuri & certificări">
            {data.courses.map((c, i) => (
              <View key={i} style={s.bulletRow}>
                <Text style={s.bulletMark}>•</Text>
                <Text style={s.bulletText}>
                  {c.name}
                  {c.provider ? ` · ${c.provider}` : ""}
                  {c.year ? ` (${c.year})` : ""}
                </Text>
              </View>
            ))}
          </Sec>
        )}

        {data.skills.length > 0 && (
          <Sec title="Competențe">
            <Text style={[s.inlineList, { textAlign: "center" }]}>
              {data.skills.map((sk) => sk.name).join("   ·   ")}
            </Text>
          </Sec>
        )}

        {data.languages.length > 0 && (
          <Sec title="Limbi străine">
            <Text style={[s.inlineList, { textAlign: "center" }]}>
              {data.languages.map((l) => `${l.name} (${l.level})`).join("   ·   ")}
            </Text>
          </Sec>
        )}

        {hasLicenseInfo && (
          <Sec title="Permis & Calificări">
            <Text style={[s.inlineList, { textAlign: "center" }]}>
              {[
                data.license?.hasLicense && data.license.categories.length > 0
                  ? `Permis de conducere: categoria ${data.license.categories.join(", ")}`
                  : "",
                data.qualifications?.trim() ?? "",
              ]
                .filter(Boolean)
                .join("   ·   ")}
            </Text>
          </Sec>
        )}

        {data.hobbies.length > 0 && (
          <Sec title="Hobby-uri">
            <Text style={[s.inlineList, { textAlign: "center" }]}>{data.hobbies.join("   ·   ")}</Text>
          </Sec>
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
