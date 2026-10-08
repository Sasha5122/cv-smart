import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { CVData } from "@/lib/types/cv";
import { registerFonts } from "../fonts";
import { fullNameOf, photoSrcOf } from "../shared";
import {
  roleOf, localityOf, licenseTextOf,
  IconPhone, IconMail, IconPin,
} from "./_shared";
import { pdfLabels, type PdfLabels } from "../labels";

registerFonts();

/* „Velvet" — după model-02: sidebar mov-navy foarte închis pe stânga cu
   contact sus + Educație/Certificări/Limbi cu titluri roz-mauve; poză CERC
   pe granița sidebar/main cu inel bleu; bandă roz-mauve cu numele mare alb
   + strip navy cu rolul; main alb cu Profil, Experiență (coloană De la/Până
   la) și Competențe inline separate cu „•". */

const C = {
  plum: "#232244",
  plumDark: "#1b1a36",
  mauve: "#c98fa6",
  ring: "#bcd7e8",
  ink: "#23272f",
  text: "#3d4451",
  muted: "#6b7280",
  hair: "#e5e7eb",
  sideText: "#d9d8e6",
};

const SIDE_W = 205;
const PHOTO = 92;
const BAND_TOP = 34;

const s = StyleSheet.create({
  page: { backgroundColor: "#fff", fontFamily: "Lato", fontSize: 9.5, color: C.text, lineHeight: 1.45 },
  sideBg: { position: "absolute", top: 0, bottom: 0, left: 0, width: SIDE_W, backgroundColor: C.plum },
  band: {
    position: "absolute", top: BAND_TOP, left: SIDE_W - 14, right: 0, height: 46,
    backgroundColor: C.mauve, justifyContent: "center", paddingLeft: 96, paddingRight: 20,
  },
  bandName: { fontSize: 21, fontWeight: 400, color: "#fff", letterSpacing: 1, textAlign: "right" },
  roleStrip: {
    position: "absolute", top: BAND_TOP + 46, left: SIDE_W - 14, right: 0, height: 20,
    backgroundColor: C.plumDark, justifyContent: "center", paddingRight: 20,
  },
  roleText: { fontSize: 8.5, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: 2, textAlign: "right" },
  photoWrap: {
    position: "absolute", top: BAND_TOP - 12, left: SIDE_W - PHOTO / 2 + 4,
    width: PHOTO, height: PHOTO, borderRadius: PHOTO / 2,
    borderWidth: 3, borderColor: C.ring, overflow: "hidden", backgroundColor: "#fff",
  },
  photo: { width: PHOTO - 6, height: PHOTO - 6, borderRadius: (PHOTO - 6) / 2 },
  row: { flexDirection: "row" },
  side: { width: SIDE_W, paddingHorizontal: 18, paddingTop: 26 },
  cRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 5 },
  cText: { fontSize: 8.2, color: C.sideText, flex: 1, lineHeight: 1.35 },
  sideSecTitle: {
    fontSize: 9.5, fontWeight: 900, color: C.mauve, textTransform: "uppercase",
    letterSpacing: 1.4, marginTop: 16, marginBottom: 6,
  },
  sideRule: { height: 0.75, backgroundColor: "#3c3b63", marginBottom: 7 },
  sYears: { fontSize: 7.8, color: "#9a99b8", marginBottom: 0.5 },
  sTitle: { fontSize: 8.8, fontWeight: 700, color: "#fff", lineHeight: 1.3 },
  sSub: { fontSize: 8, color: C.sideText, fontStyle: "italic", marginBottom: 6 },
  main: { flex: 1, paddingLeft: 26, paddingRight: 30, paddingTop: 118 },
  secTitle: {
    fontSize: 11, fontWeight: 900, color: C.ink, textTransform: "uppercase", letterSpacing: 1,
    paddingBottom: 3, borderBottomWidth: 1.5, borderBottomColor: C.ink, marginBottom: 8, alignSelf: "flex-start",
  },
  section: { marginBottom: 14 },
  summary: { fontSize: 9.4, lineHeight: 1.55 },
  expRow: { flexDirection: "row", gap: 12, marginBottom: 10 },
  expLeft: { width: 62 },
  fromTo: { fontSize: 7.6, color: "#9aa0ab", textTransform: "uppercase", letterSpacing: 0.5 },
  fromToVal: { fontSize: 8.2, color: C.muted, marginBottom: 4 },
  expBody: { flex: 1 },
  expCompany: { fontSize: 10.5, fontWeight: 900, color: C.ink },
  expRole: { fontSize: 9, color: C.mauve, fontWeight: 700, marginTop: 0.5, marginBottom: 3 },
  bulletRow: { flexDirection: "row", gap: 5, marginBottom: 2 },
  dot: { color: C.plum, fontSize: 8.5 },
  bulletText: { flex: 1, fontSize: 8.8, lineHeight: 1.42 },
  skillsInline: { fontSize: 9.2, lineHeight: 1.7, color: C.text },
});

/** Desparte perioada „X – Y" în (de la, până la) pentru coloana din model. */
function splitPeriod(period: string): { from: string; to: string } {
  const parts = period.split(/\s*[–—-]\s*/);
  if (parts.length >= 2) return { from: parts[0], to: parts.slice(1).join("–") };
  return { from: period, to: "" };
}

export function VelvetTemplate({ data, L = pdfLabels("ro") }: { data: CVData; L?: PdfLabels }) {
  const fullName = fullNameOf(data);
  const photo = photoSrcOf(data);
  const p = data.personal;
  const licenseText = licenseTextOf(data, L);

  return (
    <Document title={`CV ${fullName}`.trim()} author={fullName || "CVexpres"} creator="CVexpres">
      <Page size="A4" style={s.page}>
        <View style={s.sideBg} fixed />
        {/* banda cu numele + strip-ul cu rolul + poza pe graniță */}
        <View style={s.band}>
          <Text style={s.bandName}>{fullName || L.fullName}</Text>
        </View>
        {roleOf(data) ? (
          <View style={s.roleStrip}>
            <Text style={s.roleText}>{roleOf(data)}</Text>
          </View>
        ) : null}
        {photo && (
          <View style={s.photoWrap}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={photo} style={s.photo} />
          </View>
        )}

        <View style={s.row}>
          {/* Sidebar */}
          <View style={s.side}>
            {localityOf(data) ? (
              <View style={s.cRow}>
                <IconPin color={C.mauve} size={9} />
                <Text style={s.cText}>{localityOf(data)}</Text>
              </View>
            ) : null}
            {p?.phone ? (
              <View style={s.cRow}>
                <IconPhone color={C.mauve} size={9} />
                <Text style={s.cText}>{p.phone}</Text>
              </View>
            ) : null}
            {p?.email ? (
              <View style={s.cRow}>
                <IconMail color={C.mauve} size={9} />
                <Text style={s.cText}>{p.email}</Text>
              </View>
            ) : null}

            {data.education.length > 0 && (
              <>
                <Text style={s.sideSecTitle}>{L.education}</Text>
                <View style={s.sideRule} />
                {data.education.map((edu, i) => (
                  <View key={i} wrap={false}>
                    <Text style={s.sYears}>{edu.years}</Text>
                    <Text style={s.sTitle}>
                      {edu.level}
                      {edu.field ? ` — ${edu.field}` : ""}
                    </Text>
                    <Text style={s.sSub}>{edu.institution}</Text>
                  </View>
                ))}
              </>
            )}

            {(data.courses.length > 0 || data.qualifications?.trim() || licenseText) && (
              <>
                <Text style={s.sideSecTitle}>{L.certifications}</Text>
                <View style={s.sideRule} />
                {data.courses.map((c, i) => (
                  <View key={i} wrap={false}>
                    <Text style={s.sYears}>{c.year ?? ""}</Text>
                    <Text style={s.sTitle}>{c.name}</Text>
                    <Text style={s.sSub}>{c.provider ?? ""}</Text>
                  </View>
                ))}
                {data.qualifications?.trim() ? (
                  <Text style={[s.sTitle, { marginBottom: 5 }]}>{data.qualifications.trim()}</Text>
                ) : null}
                {licenseText ? <Text style={s.sTitle}>{licenseText}</Text> : null}
              </>
            )}

            {data.languages.length > 0 && (
              <>
                <Text style={s.sideSecTitle}>{L.languages}</Text>
                <View style={s.sideRule} />
                {data.languages.map((l, i) => (
                  <View key={i} wrap={false}>
                    <Text style={s.sTitle}>{l.name}</Text>
                    <Text style={s.sSub}>{l.level}</Text>
                  </View>
                ))}
              </>
            )}

            {data.hobbies.length > 0 && (
              <>
                <Text style={s.sideSecTitle}>{L.hobbies}</Text>
                <View style={s.sideRule} />
                {data.hobbies.map((h, i) => (
                  <Text key={i} style={[s.sTitle, { marginBottom: 3 }]}>
                    {h}
                  </Text>
                ))}
              </>
            )}
          </View>

          {/* Main */}
          <View style={s.main}>
            {data.summary ? (
              <View style={s.section}>
                <Text style={s.secTitle}>{L.profile}</Text>
                <Text style={s.summary}>{data.summary}</Text>
              </View>
            ) : null}

            {data.experience.length > 0 && (
              <View style={s.section}>
                <Text style={s.secTitle}>{L.experience}</Text>
                {data.experience.map((exp, i) => {
                  const { from, to } = splitPeriod(exp.period);
                  return (
                    <View key={i} wrap={false} style={s.expRow}>
                      <View style={s.expLeft}>
                        <Text style={s.fromTo}>{L.from}</Text>
                        <Text style={s.fromToVal}>{from}</Text>
                        <Text style={s.fromTo}>{L.to}</Text>
                        <Text style={s.fromToVal}>{to || "—"}</Text>
                      </View>
                      <View style={s.expBody}>
                        <Text style={s.expCompany}>{exp.company}</Text>
                        <Text style={s.expRole}>
                          {exp.title}
                          {exp.location ? ` · ${exp.location}` : ""}
                        </Text>
                        {[...exp.responsibilities, ...exp.achievements].map((r, j) => (
                          <View key={j} style={s.bulletRow}>
                            <Text style={s.dot}>•</Text>
                            <Text style={s.bulletText}>{r}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {data.skills.length > 0 && (
              <View style={s.section}>
                <Text style={s.secTitle}>{L.skills}</Text>
                <Text style={s.skillsInline}>{data.skills.map((sk) => sk.name).join("  •  ")}</Text>
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
}
