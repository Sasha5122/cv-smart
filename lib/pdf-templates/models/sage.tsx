import { Document, Page, View, Text, Image, StyleSheet, Svg, Path } from "@react-pdf/renderer";
import type { CVData } from "@/lib/types/cv";
import { registerFonts } from "../fonts";
import { fullNameOf, eduMetaOf, photoSrcOf } from "../shared";
import {
  roleOf, localityOf, streetOf, licenseTextOf,
  IconPhone, IconMail, IconPin,
} from "./_shared";

registerFonts();

/* „Sage" — după model-09: ramă albă; panou verde-salvie ROTUNJIT pe stânga
   (cu margine albă vizibilă), bandă roz prăfuit orizontală în spate sus;
   poză cerc cu inel alb pe panou; sidebar cu Profil + Contact (text alb);
   main cu nume mare serif, secțiuni cu chevron verde + titlu caps, corp
   serif — aspect editorial cald. */

const C = {
  sage: "#7fa199",
  sageDark: "#6b8d85",
  rose: "#e5c1b5",
  ink: "#2b2b2b",
  text: "#3f3f3f",
  muted: "#6f6f6f",
  hair: "#e5e5e5",
};

const MARGIN = 18;
const SIDE_W = 190;
const PHOTO = 104;

const s = StyleSheet.create({
  page: { backgroundColor: "#fff", fontFamily: "PT Serif", fontSize: 9.5, color: C.text, lineHeight: 1.5 },
  roseBand: { position: "absolute", top: 44, left: 0, right: 0, height: 118, backgroundColor: C.rose },
  panel: {
    position: "absolute", top: MARGIN, bottom: MARGIN, left: MARGIN, width: SIDE_W,
    backgroundColor: C.sage, borderRadius: 14,
  },
  side: { width: SIDE_W + MARGIN, paddingLeft: MARGIN + 18, paddingRight: 18, paddingTop: 34 },
  photoWrap: {
    width: PHOTO, height: PHOTO, borderRadius: PHOTO / 2,
    borderWidth: 4, borderColor: "#fff", overflow: "hidden",
    alignSelf: "center", marginBottom: 18, backgroundColor: "#fff",
  },
  photo: { width: PHOTO - 8, height: PHOTO - 8, borderRadius: (PHOTO - 8) / 2 },
  sideSecTitle: {
    fontFamily: "Lato", fontSize: 9.5, fontWeight: 900, color: "#fff",
    textTransform: "uppercase", letterSpacing: 1.6, marginBottom: 6, marginTop: 14,
  },
  sideText: { fontSize: 8.8, color: "#f2f6f4", lineHeight: 1.55 },
  cRow: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 6 },
  cText: { fontSize: 8.4, color: "#f2f6f4", flex: 1, lineHeight: 1.4 },
  row: { flexDirection: "row" },
  main: { flex: 1, paddingLeft: 26, paddingRight: 30, paddingTop: 60 },
  name: { fontSize: 25, fontWeight: 700, color: C.ink, textTransform: "uppercase", letterSpacing: 1.5, lineHeight: 1.15 },
  /* marginBottom mare: prima secțiune trebuie să înceapă SUB banda roz (se
     termină la y≈162), altfel titlurile se intercalează cu banda */
  role: { fontSize: 11, fontStyle: "italic", color: C.muted, marginTop: 3, marginBottom: 66 },
  secHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 7 },
  secTitle: { fontFamily: "Lato", fontSize: 10.5, fontWeight: 900, color: C.ink, textTransform: "uppercase", letterSpacing: 1.6 },
  section: { marginBottom: 14 },
  eName: { fontSize: 10.5, fontWeight: 700, color: C.ink },
  eSub: { fontSize: 9, fontStyle: "italic", color: C.muted, marginTop: 0.5, marginBottom: 3 },
  eText: { fontSize: 9, color: C.text, lineHeight: 1.5, marginBottom: 1.5 },
  years: { fontSize: 8.6, color: C.sageDark, fontWeight: 700 },
});

function Chevron() {
  return (
    <Svg viewBox="0 0 24 24" style={{ width: 11, height: 11 }}>
      <Path d="M4 3l9 9-9 9V3z" fill="#7fa199" />
      <Path d="M12 3l9 9-9 9V3z" fill="#a9c2bb" />
    </Svg>
  );
}

export function SageTemplate({ data }: { data: CVData }) {
  const fullName = fullNameOf(data);
  const photo = photoSrcOf(data);
  const p = data.personal;
  const licenseText = licenseTextOf(data);

  return (
    <Document title={`CV ${fullName}`.trim()} author={fullName || "CVexpres"} creator="CVexpres">
      <Page size="A4" style={s.page}>
        <View style={s.roseBand} />
        <View style={s.panel} fixed />
        <View style={s.row}>
          {/* Sidebar pe panoul salvie */}
          <View style={s.side}>
            {photo && (
              <View style={s.photoWrap}>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image src={photo} style={s.photo} />
              </View>
            )}
            {data.summary ? (
              <>
                <Text style={s.sideSecTitle}>Profil</Text>
                <Text style={s.sideText}>{data.summary}</Text>
              </>
            ) : null}

            <Text style={s.sideSecTitle}>Contact</Text>
            {p?.phone ? (
              <View style={s.cRow}>
                <IconPhone color="#fff" size={9} />
                <Text style={s.cText}>{p.phone}</Text>
              </View>
            ) : null}
            {p?.email ? (
              <View style={s.cRow}>
                <IconMail color="#fff" size={9} />
                <Text style={s.cText}>{p.email}</Text>
              </View>
            ) : null}
            {(streetOf(data) || localityOf(data)) ? (
              <View style={s.cRow}>
                <IconPin color="#fff" size={9} />
                <Text style={s.cText}>{[streetOf(data), localityOf(data)].filter(Boolean).join(", ")}</Text>
              </View>
            ) : null}

            {data.hobbies.length > 0 && (
              <>
                <Text style={s.sideSecTitle}>Hobby-uri</Text>
                {data.hobbies.map((h, i) => (
                  <Text key={i} style={[s.sideText, { marginBottom: 2.5 }]}>
                    {h}
                  </Text>
                ))}
              </>
            )}

            {(licenseText || data.qualifications?.trim()) && (
              <>
                <Text style={s.sideSecTitle}>Calificări</Text>
                {licenseText ? <Text style={[s.sideText, { marginBottom: 2.5 }]}>{licenseText}</Text> : null}
                {data.qualifications?.trim() ? (
                  <Text style={s.sideText}>{data.qualifications.trim()}</Text>
                ) : null}
              </>
            )}
          </View>

          {/* Main */}
          <View style={s.main}>
            <Text style={s.name}>{fullName || "Prenume Nume"}</Text>
            {roleOf(data) ? <Text style={s.role}>{roleOf(data)}</Text> : null}

            {data.education.length > 0 && (
              <View style={s.section}>
                <View style={s.secHead}>
                  <Chevron />
                  <Text style={s.secTitle}>Educație</Text>
                </View>
                {data.education.map((edu, i) => (
                  <View key={i} wrap={false} style={{ marginBottom: 7 }}>
                    <Text style={s.eName}>{edu.institution}</Text>
                    <Text style={s.eSub}>
                      {edu.level}
                      {edu.field ? ` în ${edu.field}` : ""} · <Text style={s.years}>{edu.years}</Text>
                    </Text>
                    {(edu.grade || edu.thesis) && <Text style={s.eText}>{eduMetaOf(edu)}</Text>}
                  </View>
                ))}
                {data.courses.map((c, i) => (
                  <View key={`c${i}`} wrap={false} style={{ marginBottom: 5 }}>
                    <Text style={s.eName}>{c.name}</Text>
                    <Text style={s.eSub}>
                      {c.provider ?? ""}
                      {c.year ? ` · ${c.year}` : ""}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {data.experience.length > 0 && (
              <View style={s.section}>
                <View style={s.secHead}>
                  <Chevron />
                  <Text style={s.secTitle}>Experiență</Text>
                </View>
                {data.experience.map((exp, i) => (
                  <View key={i} wrap={false} style={{ marginBottom: 8 }}>
                    <Text style={s.eName}>{exp.company}</Text>
                    <Text style={s.eSub}>
                      {exp.title}
                      {exp.location ? ` · ${exp.location}` : ""} · <Text style={s.years}>{exp.period}</Text>
                    </Text>
                    {[...exp.responsibilities, ...exp.achievements].map((r, j) => (
                      <Text key={j} style={s.eText}>
                        {r}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            )}

            {data.languages.length > 0 && (
              <View style={s.section}>
                <View style={s.secHead}>
                  <Chevron />
                  <Text style={s.secTitle}>Limbi străine</Text>
                </View>
                {data.languages.map((l, i) => (
                  <Text key={i} style={s.eText}>
                    {l.name} — {l.level}
                  </Text>
                ))}
              </View>
            )}

            {data.skills.length > 0 && (
              <View style={s.section}>
                <View style={s.secHead}>
                  <Chevron />
                  <Text style={s.secTitle}>Competențe</Text>
                </View>
                <Text style={s.eText}>{data.skills.map((sk) => sk.name).join(" · ")}</Text>
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
}
