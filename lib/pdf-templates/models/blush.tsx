import { Document, Page, View, Text, Image, StyleSheet, Svg, Polygon } from "@react-pdf/renderer";
import type { CVData } from "@/lib/types/cv";
import { registerFonts } from "../fonts";
import { fullNameOf, eduMetaOf, photoSrcOf } from "../shared";
import {
  roleOf, localityOf, streetOf, licenseTextOf,
  IconPhone, IconMail, IconPin,
} from "./_shared";
import { pdfLabels, type PdfLabels } from "../labels";

registerFonts();

/* „Blush" — după model-08: decor cu triunghiuri gri + roz pal sus, poză
   CERC MARE stânga-sus cu inel roz; coloană stângă cu nume caps spațiat,
   rol roz, „Despre mine", bare de competențe roz/gri, contact; dreapta cu
   Educație și Experiență pe timeline cu ani în stânga. Aerisit, pastel. */

const C = {
  pink: "#f3c4bd",
  pinkDeep: "#e8a79e",
  gray: "#8b8b8b",
  ink: "#3a3a3a",
  text: "#4b4b4b",
  muted: "#7a7a7a",
  faint: "#a5a5a5",
  hair: "#e8e8e8",
};

const PHOTO = 118;
const A4W = 595;

const s = StyleSheet.create({
  page: { backgroundColor: "#fff", fontFamily: "Lato", fontSize: 9.5, color: C.text, lineHeight: 1.5 },
  deco: { position: "absolute", top: 0, left: 0 },
  photoWrap: {
    position: "absolute", top: 34, left: 36,
    width: PHOTO, height: PHOTO, borderRadius: PHOTO / 2,
    borderWidth: 4, borderColor: C.pink, overflow: "hidden", backgroundColor: "#fff",
  },
  photo: { width: PHOTO - 8, height: PHOTO - 8, borderRadius: (PHOTO - 8) / 2 },
  body: { flexDirection: "row", paddingTop: 172, paddingHorizontal: 36, paddingBottom: 34, gap: 26 },
  colL: { width: "38%" },
  colR: { flex: 1 },
  name: { fontSize: 17, fontWeight: 700, color: C.ink, textTransform: "uppercase", letterSpacing: 3, lineHeight: 1.25 },
  role: { fontSize: 9, fontWeight: 700, color: C.pinkDeep, textTransform: "uppercase", letterSpacing: 2, marginTop: 4 },
  nameRule: { width: 46, height: 2, backgroundColor: C.pink, marginTop: 8, marginBottom: 14 },
  secTitle: {
    fontSize: 9.5, fontWeight: 900, color: C.ink, textTransform: "uppercase", letterSpacing: 2, marginBottom: 6,
  },
  secRule: { width: 30, height: 1.5, backgroundColor: C.pink, marginBottom: 8 },
  section: { marginBottom: 15 },
  about: { fontSize: 8.8, lineHeight: 1.55, color: C.muted },
  skillRow: { flexDirection: "row", gap: 6, marginBottom: 3 },
  skillDot: { color: C.pinkDeep, fontSize: 9 },
  skillName: { flex: 1, fontSize: 8.4, color: C.text, lineHeight: 1.4 },
  cRow: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 5 },
  cText: { fontSize: 8.4, color: C.muted, flex: 1, lineHeight: 1.4 },
  // pentru texte de sine stătătoare (NU în rând): fără flex — cu flex:1 în
  // coloană, react-pdf le colapsează înălțimea și se suprapun
  xText: { fontSize: 8.4, color: C.muted, lineHeight: 1.4, marginBottom: 2.5 },
  tlRow: { flexDirection: "row", gap: 12, marginBottom: 10 },
  tlYears: { width: 66, fontSize: 8.2, color: C.faint, textAlign: "left" },
  tlDotCol: { width: 10, alignItems: "center" },
  tlDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.pinkDeep, marginTop: 3 },
  tlLine: { flex: 1, width: 1, backgroundColor: C.hair, marginTop: 2 },
  tlBody: { flex: 1 },
  eTitle: { fontSize: 10, fontWeight: 700, color: C.ink },
  eSub: { fontSize: 8.6, color: C.pinkDeep, fontWeight: 700, marginTop: 0.5, marginBottom: 2.5 },
  eText: { fontSize: 8.6, color: C.muted, lineHeight: 1.45, marginBottom: 1.5 },
});

export function BlushTemplate({ data, L = pdfLabels("ro") }: { data: CVData; L?: PdfLabels }) {
  const fullName = fullNameOf(data);
  const photo = photoSrcOf(data);
  const p = data.personal;
  const licenseText = licenseTextOf(data, L);

  return (
    <Document title={`CV ${fullName}`.trim()} author={fullName || "CVexpres"} creator="CVexpres">
      <Page size="A4" style={s.page}>
        {/* Decor: triunghi gri + triunghi roz în colțul din dreapta-sus,
            bandă roz diagonală sub poză (ca în model) */}
        <View style={s.deco}>
          <Svg width={A4W} height={170}>
            <Polygon points={`0,0 ${A4W},0 ${A4W},34 150,120 0,150`} fill="#f6f6f6" />
            <Polygon points={`${A4W - 320},0 ${A4W},0 ${A4W},96`} fill={C.gray} opacity={0.85} />
            <Polygon points={`${A4W - 200},0 ${A4W},0 ${A4W},130`} fill={C.pink} />
            <Polygon points={`0,96 128,150 0,168`} fill={C.pink} />
          </Svg>
        </View>
        {photo && (
          <View style={s.photoWrap}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={photo} style={s.photo} />
          </View>
        )}

        <View style={s.body}>
          {/* Stânga */}
          <View style={s.colL}>
            <Text style={s.name}>{fullName || L.fullName}</Text>
            {roleOf(data) ? <Text style={s.role}>{roleOf(data)}</Text> : null}
            <View style={s.nameRule} />

            {data.summary ? (
              <View style={s.section}>
                <Text style={s.secTitle}>{L.about}</Text>
                <View style={s.secRule} />
                <Text style={s.about}>{data.summary}</Text>
              </View>
            ) : null}

            {data.skills.length > 0 && (
              <View style={s.section}>
                <Text style={s.secTitle}>{L.skills}</Text>
                <View style={s.secRule} />
                {data.skills.map((sk, i) => (
                  <View key={i} style={s.skillRow}>
                    <Text style={s.skillDot}>•</Text>
                    <Text style={s.skillName}>{sk.name}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={s.section}>
              <Text style={s.secTitle}>{L.contact}</Text>
              <View style={s.secRule} />
              {p?.phone ? (
                <View style={s.cRow}>
                  <IconPhone color={C.pinkDeep} size={9} />
                  <Text style={s.cText}>{p.phone}</Text>
                </View>
              ) : null}
              {p?.email ? (
                <View style={s.cRow}>
                  <IconMail color={C.pinkDeep} size={9} />
                  <Text style={s.cText}>{p.email}</Text>
                </View>
              ) : null}
              {(streetOf(data) || localityOf(data)) ? (
                <View style={s.cRow}>
                  <IconPin color={C.pinkDeep} size={9} />
                  <Text style={s.cText}>{[streetOf(data), localityOf(data)].filter(Boolean).join(", ")}</Text>
                </View>
              ) : null}
            </View>

            {(data.languages.length > 0 || licenseText || data.qualifications?.trim() || data.hobbies.length > 0) && (
              <View style={s.section}>
                <Text style={s.secTitle}>{L.extra}</Text>
                <View style={s.secRule} />
                {data.languages.map((l, i) => (
                  <Text key={i} style={s.xText}>
                    {l.name} — {l.level}
                  </Text>
                ))}
                {licenseText ? <Text style={s.xText}>{licenseText}</Text> : null}
                {data.qualifications?.trim() ? (
                  <Text style={s.xText}>{data.qualifications.trim()}</Text>
                ) : null}
                {data.hobbies.length > 0 && (
                  <Text style={s.xText}>{L.hobbiesLabel} {data.hobbies.join(", ")}</Text>
                )}
              </View>
            )}
          </View>

          {/* Dreapta */}
          <View style={s.colR}>
            {data.education.length > 0 && (
              <View style={s.section}>
                <Text style={s.secTitle}>{L.education}</Text>
                <View style={s.secRule} />
                {data.education.map((edu, i) => (
                  <View key={i} wrap={false} style={s.tlRow}>
                    <Text style={s.tlYears}>{edu.years}</Text>
                    <View style={s.tlDotCol}>
                      <View style={s.tlDot} />
                      {i < data.education.length - 1 ? <View style={s.tlLine} /> : null}
                    </View>
                    <View style={s.tlBody}>
                      <Text style={s.eTitle}>
                        {edu.level}
                        {edu.field ? ` — ${edu.field}` : ""}
                      </Text>
                      <Text style={s.eSub}>{edu.institution}</Text>
                      {(edu.grade || edu.thesis) && <Text style={s.eText}>{eduMetaOf(edu, L)}</Text>}
                    </View>
                  </View>
                ))}
                {data.courses.map((c, i) => (
                  <View key={`c${i}`} wrap={false} style={s.tlRow}>
                    <Text style={s.tlYears}>{c.year ?? ""}</Text>
                    <View style={s.tlDotCol}>
                      <View style={s.tlDot} />
                    </View>
                    <View style={s.tlBody}>
                      <Text style={s.eTitle}>{c.name}</Text>
                      {c.provider ? <Text style={s.eSub}>{c.provider}</Text> : null}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {data.experience.length > 0 && (
              <View style={s.section}>
                <Text style={s.secTitle}>{L.experienceShort}</Text>
                <View style={s.secRule} />
                {data.experience.map((exp, i) => (
                  <View key={i} wrap={false} style={s.tlRow}>
                    <Text style={s.tlYears}>{exp.period}</Text>
                    <View style={s.tlDotCol}>
                      <View style={s.tlDot} />
                      {i < data.experience.length - 1 ? <View style={s.tlLine} /> : null}
                    </View>
                    <View style={s.tlBody}>
                      <Text style={s.eTitle}>{exp.title}</Text>
                      <Text style={s.eSub}>
                        {exp.company}
                        {exp.location ? ` · ${exp.location}` : ""}
                      </Text>
                      {[...exp.responsibilities, ...exp.achievements].map((r, j) => (
                        <Text key={j} style={s.eText}>
                          {r}
                        </Text>
                      ))}
                    </View>
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
