import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { CVData } from "@/lib/types/cv";
import { registerFonts } from "../fonts";
import { fullNameOf, eduMetaOf, photoSrcOf } from "../shared";
import { pdfLabels, type PdfLabels } from "../labels";
import { firstNameOf, lastNameOf, roleOf, localityOf, streetOf, licenseTextOf } from "./_shared";

registerFonts();

/* „Riviera" — după model-03: fundal alb-bleu pal, PANGLICĂ verticală teal
   din marginea de sus în spatele pozei; POZĂ CERC MARE cu inel teal gros;
   nume negru enorm pe 2 rânduri + rol italic teal; etichete secțiuni =
   PILL-uri teal cu text alb; stânga contact/liste, dreapta profil + istoric. */

const C = {
  teal: "#1fbcb4",
  tealDark: "#17a099",
  ink: "#17181c",
  text: "#3d4451",
  muted: "#6b7280",
  bg: "#f4fafa",
};

const PHOTO = 132;
const RIBBON_W = 46;
/* panglica e CENTRATĂ pe axa verticală a pozei (poza: left 40, diametru 132
   → centru la x=106), exact ca în model — altfel compoziția pare dezechilibrată */
const RIBBON_X = 40 + PHOTO / 2 - RIBBON_W / 2;

const s = StyleSheet.create({
  page: { backgroundColor: C.bg, fontFamily: "Lato", fontSize: 9.5, color: C.text, lineHeight: 1.5 },
  ribbon: { position: "absolute", top: 0, left: RIBBON_X, width: RIBBON_W, height: 210, backgroundColor: C.teal },
  photoWrap: {
    position: "absolute", top: 40, left: 40,
    width: PHOTO, height: PHOTO, borderRadius: PHOTO / 2,
    borderWidth: 6, borderColor: C.teal, overflow: "hidden", backgroundColor: "#fff",
  },
  photo: { width: PHOTO - 12, height: PHOTO - 12, borderRadius: (PHOTO - 12) / 2 },
  headRight: { position: "absolute", top: 52, left: 215, right: 36 },
  name: { fontSize: 30, fontWeight: 900, color: C.ink, textTransform: "uppercase", letterSpacing: 1, lineHeight: 1.08, textAlign: "right" },
  role: { fontSize: 12, fontStyle: "italic", color: C.teal, marginTop: 5, textAlign: "right" },
  body: { flexDirection: "row", paddingTop: 216, paddingHorizontal: 36, paddingBottom: 32, gap: 26 },
  colL: { width: "37%" },
  colR: { flex: 1 },
  pill: {
    backgroundColor: C.teal, borderRadius: 11, paddingVertical: 4.5, paddingHorizontal: 16,
    alignSelf: "flex-start", marginBottom: 8,
  },
  pillRight: {
    backgroundColor: C.teal, borderRadius: 11, paddingVertical: 4.5, paddingHorizontal: 16,
    alignSelf: "flex-end", marginBottom: 8,
  },
  pillText: { fontSize: 9.5, fontWeight: 700, color: "#fff", letterSpacing: 0.4 },
  section: { marginBottom: 14 },
  lItem: { fontSize: 9, color: C.text, marginBottom: 4, lineHeight: 1.45 },
  summary: { fontSize: 9.2, lineHeight: 1.6, color: C.text },
  entry: { marginBottom: 9 },
  entryYears: { fontSize: 9.5, fontWeight: 900, color: C.ink },
  entryTitle: { fontSize: 9.6, fontWeight: 700, color: C.text, marginTop: 0.5 },
  entryMeta: { fontSize: 8.6, color: C.muted, marginTop: 0.5, marginBottom: 2 },
  entryText: { fontSize: 8.8, color: C.text, lineHeight: 1.45, marginBottom: 1.5 },
});

export function RivieraTemplate({ data, L = pdfLabels("ro") }: { data: CVData; L?: PdfLabels }) {
  const fullName = fullNameOf(data);
  const photo = photoSrcOf(data);
  const p = data.personal;
  const licenseText = licenseTextOf(data, L);

  return (
    <Document title={`CV ${fullName}`.trim()} author={fullName || "CVexpres"} creator="CVexpres">
      <Page size="A4" style={s.page}>
        <View style={s.ribbon} />
        {photo && (
          <View style={s.photoWrap}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={photo} style={s.photo} />
          </View>
        )}
        <View style={s.headRight}>
          <Text style={s.name}>
            {firstNameOf(data) || L.firstName}
            {"\n"}
            {lastNameOf(data) || L.lastName}
          </Text>
          {roleOf(data) ? <Text style={s.role}>{roleOf(data)}</Text> : null}
        </View>

        <View style={s.body}>
          {/* Stânga */}
          <View style={s.colL}>
            <View style={s.section}>
              <View style={s.pill}>
                <Text style={s.pillText}>{L.contact}</Text>
              </View>
              {p?.phone ? <Text style={s.lItem}>{p.phone}</Text> : null}
              {p?.email ? <Text style={s.lItem}>{p.email}</Text> : null}
              {(streetOf(data) || localityOf(data)) ? (
                <Text style={s.lItem}>{[streetOf(data), localityOf(data)].filter(Boolean).join(", ")}</Text>
              ) : null}
              {p?.linkedin ? <Text style={s.lItem}>{p.linkedin}</Text> : null}
            </View>

            {data.skills.length > 0 && (
              <View style={s.section}>
                <View style={s.pill}>
                  <Text style={s.pillText}>{L.skills}</Text>
                </View>
                {data.skills.map((sk, i) => (
                  <Text key={i} style={s.lItem}>
                    {sk.name}
                  </Text>
                ))}
              </View>
            )}

            {data.languages.length > 0 && (
              <View style={s.section}>
                <View style={s.pill}>
                  <Text style={s.pillText}>{L.languages}</Text>
                </View>
                {data.languages.map((l, i) => (
                  <Text key={i} style={s.lItem}>
                    {l.name} — {l.level}
                  </Text>
                ))}
              </View>
            )}

            {(licenseText || data.qualifications?.trim() || data.hobbies.length > 0) && (
              <View style={s.section}>
                <View style={s.pill}>
                  <Text style={s.pillText}>{L.extra}</Text>
                </View>
                {licenseText ? <Text style={s.lItem}>{licenseText}</Text> : null}
                {data.qualifications?.trim() ? <Text style={s.lItem}>{data.qualifications.trim()}</Text> : null}
                {data.hobbies.length > 0 && <Text style={s.lItem}>Hobby-uri: {data.hobbies.join(", ")}</Text>}
              </View>
            )}
          </View>

          {/* Dreapta */}
          <View style={s.colR}>
            {data.summary ? (
              <View style={s.section}>
                <View style={s.pillRight}>
                  <Text style={s.pillText}>{L.profile}</Text>
                </View>
                <Text style={s.summary}>{data.summary}</Text>
              </View>
            ) : null}

            {data.experience.length > 0 && (
              <View style={s.section}>
                <View style={s.pillRight}>
                  <Text style={s.pillText}>{L.experienceShort}</Text>
                </View>
                {data.experience.map((exp, i) => (
                  <View key={i} wrap={false} style={s.entry}>
                    <Text style={s.entryYears}>{exp.period}</Text>
                    <Text style={s.entryTitle}>{exp.title}</Text>
                    <Text style={s.entryMeta}>
                      {exp.company}
                      {exp.location ? ` · ${exp.location}` : ""}
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

            {data.education.length > 0 && (
              <View style={s.section}>
                <View style={s.pillRight}>
                  <Text style={s.pillText}>{L.education}</Text>
                </View>
                {data.education.map((edu, i) => (
                  <View key={i} wrap={false} style={s.entry}>
                    <Text style={s.entryYears}>{edu.years}</Text>
                    <Text style={s.entryTitle}>
                      {edu.level}
                      {edu.field ? ` — ${edu.field}` : ""}
                    </Text>
                    <Text style={s.entryMeta}>{edu.institution}</Text>
                    {(edu.grade || edu.thesis) && <Text style={s.entryText}>{eduMetaOf(edu, L)}</Text>}
                  </View>
                ))}
                {data.courses.map((c, i) => (
                  <View key={`c${i}`} style={s.entry}>
                    <Text style={s.entryYears}>{c.year ?? ""}</Text>
                    <Text style={s.entryTitle}>{c.name}</Text>
                    {c.provider ? <Text style={s.entryMeta}>{c.provider}</Text> : null}
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
