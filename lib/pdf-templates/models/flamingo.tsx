import { Document, Page, View, Text, Image, StyleSheet, Svg, Path } from "@react-pdf/renderer";
import type { CVData } from "@/lib/types/cv";
import { registerFonts } from "../fonts";
import { fullNameOf, eduMetaOf, photoSrcOf } from "../shared";
import { roleOf, localityOf, streetOf, licenseTextOf, IconPhone, IconMail, IconPin, IconGlobe } from "./_shared";

registerFonts();

/* „Flamingo" — după model-04: colț stânga-sus ROZ curbat cu poza cerc în el;
   nume serif roz mare dreapta-sus; panou DREAPTA gri-antracit cu margine
   stângă CURBATĂ (Contacte + Găsește-mă cu pill-uri roz); coloana stângă
   albă cu PILL-uri roz aliniate spre dreapta (Profil/Educație/Experiență). */

const C = {
  pink: "#f5b5bb",
  pinkDeep: "#e795a0",
  gray: "#5b6066",
  grayDark: "#4d5257",
  ink: "#3a3f45",
  text: "#4b5157",
  muted: "#7a8087",
  hair: "#eadfe0",
};

const A4W = 595;
const A4H = 842;
const PANEL_W = 200;
const PHOTO = 84;

const s = StyleSheet.create({
  page: { backgroundColor: "#fff", fontFamily: "Lato", fontSize: 9.5, color: C.text, lineHeight: 1.5 },
  deco: { position: "absolute", top: 0, left: 0 },
  panelSvg: { position: "absolute", top: 0, right: 0 },
  photoWrap: {
    position: "absolute", top: 26, left: 40,
    width: PHOTO, height: PHOTO, borderRadius: PHOTO / 2,
    borderWidth: 3, borderColor: "#fff", overflow: "hidden", backgroundColor: "#fff",
  },
  photo: { width: PHOTO - 6, height: PHOTO - 6, borderRadius: (PHOTO - 6) / 2 },
  headRight: { position: "absolute", top: 28, left: 190, right: PANEL_W + 18 },
  name: { fontFamily: "PT Serif", fontSize: 23, fontWeight: 700, color: "#463c40", lineHeight: 1.12 },
  role: { fontSize: 10.5, color: C.muted, marginTop: 3, letterSpacing: 1 },
  main: { paddingTop: 150, paddingLeft: 38, paddingBottom: 34, width: A4W - PANEL_W - 20 },
  pill: {
    backgroundColor: C.pink, borderRadius: 12, paddingVertical: 5, paddingHorizontal: 20,
    alignSelf: "flex-end", marginBottom: 9,
  },
  pillText: { fontFamily: "PT Serif", fontSize: 10, fontWeight: 700, color: "#fff", letterSpacing: 1.6, textTransform: "uppercase" },
  section: { marginBottom: 14 },
  summary: { fontSize: 9.2, lineHeight: 1.6 },
  entry: { marginBottom: 8, paddingBottom: 7, borderBottomWidth: 0.75, borderBottomColor: C.hair },
  entryTitle: { fontSize: 10.2, fontWeight: 700, color: C.ink },
  entryMeta: { fontSize: 8.6, color: C.pinkDeep, fontWeight: 700, marginTop: 0.5, marginBottom: 2.5 },
  entryText: { fontSize: 8.8, lineHeight: 1.45, marginBottom: 1.5 },
  /* mai îngust decât panoul: marginea curbată din stânga nu taie textul */
  panelContent: { position: "absolute", top: 190, right: 0, width: PANEL_W - 52, paddingRight: 20 },
  pPill: {
    backgroundColor: C.pink, borderRadius: 12, paddingVertical: 5, paddingHorizontal: 18,
    alignSelf: "flex-start", marginBottom: 9, marginLeft: -8,
  },
  pItemRow: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 6 },
  pText: { fontSize: 8.4, color: "#e8eaec", flex: 1, lineHeight: 1.4 },
  pSection: { marginBottom: 16 },
});

export function FlamingoTemplate({ data }: { data: CVData }) {
  const fullName = fullNameOf(data);
  const photo = photoSrcOf(data);
  const p = data.personal;
  const licenseText = licenseTextOf(data);

  return (
    <Document title={`CV ${fullName}`.trim()} author={fullName || "CVexpres"} creator="CVexpres">
      <Page size="A4" style={s.page}>
        {/* colțul roz curbat din stânga-sus — curba coboară sub numele/rolul
            din antet (x 190–420), ca textul să rămână integral pe roz */}
        <View style={s.deco}>
          <Svg width={A4W} height={170}>
            <Path
              d={`M0,0 L${A4W},0 L${A4W},50 C520,88 460,80 420,100 C340,132 250,134 200,132 C120,150 55,155 0,138 Z`}
              fill={C.pink}
            />
          </Svg>
        </View>
        {/* panoul gri — margine stângă aproape dreaptă (ondulare subtilă),
            ca să nu taie textul din panou */}
        <View style={s.panelSvg}>
          <Svg width={PANEL_W} height={A4H}>
            <Path
              d={`M${PANEL_W},118 L${PANEL_W},${A4H} L34,${A4H} C28,600 24,420 30,300 C33,225 24,160 68,130 C105,106 158,112 ${PANEL_W},118 Z`}
              fill={C.gray}
            />
          </Svg>
        </View>

        {photo && (
          <View style={s.photoWrap}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={photo} style={s.photo} />
          </View>
        )}
        <View style={s.headRight}>
          <Text style={s.name}>{fullName || "Prenume Nume"}</Text>
          {roleOf(data) ? <Text style={s.role}>{roleOf(data)}</Text> : null}
        </View>

        {/* coloana principală stângă */}
        <View style={s.main}>
          {data.summary ? (
            <View style={s.section}>
              <View style={s.pill}>
                <Text style={s.pillText}>Profil</Text>
              </View>
              <Text style={s.summary}>{data.summary}</Text>
            </View>
          ) : null}

          {data.education.length > 0 && (
            <View style={s.section}>
              <View style={s.pill}>
                <Text style={s.pillText}>Educație</Text>
              </View>
              {data.education.map((edu, i) => (
                <View key={i} wrap={false} style={s.entry}>
                  <Text style={s.entryTitle}>
                    {edu.level}
                    {edu.field ? `, ${edu.field}` : ""}
                  </Text>
                  <Text style={s.entryMeta}>
                    ({edu.years}) · {edu.institution}
                  </Text>
                  {(edu.grade || edu.thesis) && <Text style={s.entryText}>{eduMetaOf(edu)}</Text>}
                </View>
              ))}
              {data.courses.map((c, i) => (
                <View key={`c${i}`} style={s.entry}>
                  <Text style={s.entryTitle}>{c.name}</Text>
                  <Text style={s.entryMeta}>
                    {c.year ? `(${c.year})` : ""} {c.provider ? `· ${c.provider}` : ""}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {data.experience.length > 0 && (
            <View style={s.section}>
              <View style={s.pill}>
                <Text style={s.pillText}>Experiență</Text>
              </View>
              {data.experience.map((exp, i) => (
                <View key={i} wrap={false} style={s.entry}>
                  <Text style={s.entryTitle}>{exp.company}</Text>
                  <Text style={s.entryMeta}>
                    {exp.title}
                    {exp.location ? ` · ${exp.location}` : ""} · {exp.period}
                  </Text>
                  {[...exp.responsibilities, ...exp.achievements].map((r, j) => (
                    <Text key={j} style={s.entryText}>
                      {r}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          )}

          {data.skills.length > 0 && (
            <View style={s.section}>
              <View style={s.pill}>
                <Text style={s.pillText}>Competențe</Text>
              </View>
              <Text style={s.entryText}>{data.skills.map((sk) => sk.name).join("  ·  ")}</Text>
            </View>
          )}
        </View>

        {/* conținutul panoului gri */}
        <View style={s.panelContent}>
          <View style={s.pSection}>
            <View style={s.pPill}>
              <Text style={s.pillText}>Contact</Text>
            </View>
            {p?.phone ? (
              <View style={s.pItemRow}>
                <IconPhone color={C.pink} size={9} />
                <Text style={s.pText}>{p.phone}</Text>
              </View>
            ) : null}
            {p?.email ? (
              <View style={s.pItemRow}>
                <IconMail color={C.pink} size={9} />
                <Text style={s.pText}>{p.email}</Text>
              </View>
            ) : null}
            {(streetOf(data) || localityOf(data)) ? (
              <View style={s.pItemRow}>
                <IconPin color={C.pink} size={9} />
                <Text style={s.pText}>{[streetOf(data), localityOf(data)].filter(Boolean).join(", ")}</Text>
              </View>
            ) : null}
            {p?.linkedin ? (
              <View style={s.pItemRow}>
                <IconGlobe color={C.pink} size={9} />
                <Text style={s.pText}>{p.linkedin}</Text>
              </View>
            ) : null}
          </View>

          {data.languages.length > 0 && (
            <View style={s.pSection}>
              <View style={s.pPill}>
                <Text style={s.pillText}>Limbi</Text>
              </View>
              {data.languages.map((l, i) => (
                <View key={i} style={s.pItemRow}>
                  <Text style={{ color: C.pink, fontSize: 9 }}>•</Text>
                  <Text style={s.pText}>
                    {l.name} — {l.level}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {(licenseText || data.qualifications?.trim() || data.hobbies.length > 0) && (
            <View style={s.pSection}>
              <View style={s.pPill}>
                <Text style={s.pillText}>Extra</Text>
              </View>
              {licenseText ? (
                <View style={s.pItemRow}>
                  <Text style={{ color: C.pink, fontSize: 9 }}>•</Text>
                  <Text style={s.pText}>{licenseText}</Text>
                </View>
              ) : null}
              {data.qualifications?.trim() ? (
                <View style={s.pItemRow}>
                  <Text style={{ color: C.pink, fontSize: 9 }}>•</Text>
                  <Text style={s.pText}>{data.qualifications.trim()}</Text>
                </View>
              ) : null}
              {data.hobbies.map((h, i) => (
                <View key={i} style={s.pItemRow}>
                  <Text style={{ color: C.pink, fontSize: 9 }}>•</Text>
                  <Text style={s.pText}>{h}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}
