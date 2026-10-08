> **Historical document.** Design spec for the first 4 PDF templates. The product now ships 19 templates with local fonts (Lato, PT Serif, Montserrat) instead of Google Fonts URLs. Kept for context.

# TEMPLATES.md — Specificații CV Templates

Document complementar la PRD.md, CLAUDE.md și TASKS.md. Conține specificațiile complete pentru cele 4 template-uri PDF disponibile în CV Smart.

**Citește înainte**: CLAUDE.md (pentru context proiect) și PRD.md secțiunea 5, pasul 14 (Draft) și 15 (Paywall — va fi modificat în 16 pentru a face loc pasului nou de selecție template).

---

## 1. Filosofie design

### Principii pentru toate template-urile

1. **ATS-friendly absolut** — toate template-urile trebuie să poată fi parsate corect de Applicant Tracking Systems. Asta înseamnă:
   - Text real, niciodată imagini cu text
   - Ordine logică în PDF (header → experiență → educație → skills)
   - Fonturi standard universal-disponibile sau embedded
   - Fără tabele complexe pentru date critice
   - Fără text decorativ care confuză parserele

2. **Adaptat pieței românești** — diacritice perfecte (ă, â, î, ș, ț), denumiri secțiuni în română, format dată zi/lună/an, format adresă RO.

3. **Print-perfect A4** — format 595×842 puncte React-PDF (210×297mm). Margini minim 15mm, ideal 18-20mm.

4. **Single source of truth** — toate cele 4 template-uri primesc același obiect `CVData`. Doar styling-ul diferă.

5. **One-page first** — design-urile prioritizează încadrarea pe o singură pagină pentru juniori și mid-level. Compact template e explicit pentru cei cu experiență densă.

6. **Fonts disponibile** — folosim doar Google Fonts care funcționează nativ cu @react-pdf/renderer prin `Font.register()`. Lista safe: Inter, Lato, Roboto, Open Sans, Source Sans Pro, Playfair Display, Lora, Merriweather, Crimson Text, EB Garamond.

---

## 2. Cele 4 template-uri

### Template 1: CLASIC

**Pozitionare**: Cel mai conservativ. ATS-safe maxim. Recomandare default pentru utilizatorii care nu știu ce să aleagă.

**Pentru cine**: corporate, banking, finanțe, juridic, sector public, administrație, sănătate, educație, manageri tradiționali.

**Specificații vizuale**:

| Proprietate | Valoare |
|-------------|---------|
| Layout | Single column, lățime completă |
| Lățime conținut | 555pt (margini 20pt fiecare parte) |
| Font heading | `Playfair Display` (serif, weight 700) |
| Font body | `Lato` (sans, weight 400/700) |
| Culoare primară | `#1e3a8a` (navy) |
| Culoare text body | `#1e293b` (near black) |
| Culoare text secondary | `#475569` (slate) |
| Culoare divider | `#1e3a8a` (navy) |
| Background | `#FFFFFF` |

**Structura template:**

```
┌─────────────────────────────────────┐
│ [Header bandă navy 80pt height]     │
│   ALEXANDRU POPESCU (28pt, serif)   │
│   Șef Depozit (14pt italic, white)  │
├─────────────────────────────────────┤
│ alex@gmail.com · 0721 234 567       │
│ Cluj-Napoca, România                │
│                                     │
│ ──── REZUMAT PROFESIONAL ────       │
│ [2-3 propoziții]                    │
│                                     │
│ ──── EXPERIENȚĂ PROFESIONALĂ ────   │
│ Dedeman — Șef Depozit               │
│ Cluj-Napoca · Martie 2019 - Prezent │
│ • Bullet point 1                    │
│ • Bullet point 2                    │
│                                     │
│ ──── EDUCAȚIE ────                  │
│ [...]                               │
│                                     │
│ ──── COMPETENȚE ────                │
│ [...]                               │
│                                     │
│ ──── LIMBI STRĂINE ────             │
│ [...]                               │
└─────────────────────────────────────┘
```

**Detalii tipografice exacte**:
- Numele candidatului: Playfair Display, 28pt, bold, alb pe navy
- Titlu/funcție sub nume: Lato Italic, 13pt, alb 90% opacity pe navy
- Contact info: Lato, 10pt, regular, slate
- Secțiuni headings: Playfair Display, 13pt, bold, navy, ALL CAPS, letter-spacing 1.5pt
- Sub heading (job title, school name): Lato, 11pt, bold, near-black
- Companie/instituție: Lato, 10.5pt, navy, italic
- Perioada/locație: Lato, 9.5pt, slate
- Body text: Lato, 10pt, near-black, line-height 1.4
- Divider sub fiecare secțiune: linie 0.75pt navy, lățime 100%

**Poza opțională**:
- Plasare: stânga sus, înainte de bandă navy
- Format: cerc 80pt diametru cu border navy 1.5pt
- Dacă există poză, banda navy se ajustează pentru a face loc

**ATS notes**:
- Single column = parsing perfect
- Toate secțiunile clar delimitate cu headings explicite
- Risc ATS: 0/10 (cel mai safe)

---

### Template 2: MODERN

**Pozitionare**: Layout contemporan cu sidebar. Vizual atractiv pentru roluri în industrii moderne.

**Pentru cine**: IT, software development, marketing, design, startup, comunicare, project management modern, e-commerce.

**Specificații vizuale**:

| Proprietate | Valoare |
|-------------|---------|
| Layout | 2 coloane (35% sidebar + 65% main) |
| Lățime sidebar | 195pt |
| Lățime main | 360pt |
| Font heading | `Inter` (sans-serif, weight 600) |
| Font body | `Inter` (sans-serif, weight 400) |
| Culoare primară (sidebar bg) | `#0F6E56` (teal dark) |
| Culoare accent (main headings) | `#0F6E56` |
| Culoare divider sidebar | `#9FE1CB` (teal 100) |
| Culoare text sidebar | `#FFFFFF` |
| Culoare text main | `#1e293b` |
| Culoare text secondary main | `#64748b` |

**Structura template:**

```
┌──────────────┬──────────────────────┐
│  [Photo]     │ EXPERIENȚĂ           │
│   80pt       │                      │
│              │ Șef Depozit          │
│ ALEXANDRU    │ Dedeman · 2019-Prez. │
│ POPESCU      │ • Bullet 1           │
│              │ • Bullet 2           │
│ ─────────    │                      │
│ CONTACT      │ Asistent Logistică   │
│ 📞 telefon   │ Lidl · 2016-2019     │
│ ✉️ email     │ • Bullet 1           │
│ 📍 oraș      │                      │
│              │ EDUCAȚIE             │
│ ─────────    │                      │
│ COMPETENȚE   │ Master Informatică   │
│ • Skill 1    │ UBB Cluj · 2018-2020 │
│ • Skill 2    │ Teză: [titlu]        │
│ • Skill 3    │                      │
│              │ Licență Informatică  │
│ ─────────    │ UBB Cluj · 2015-2018 │
│ LIMBI        │                      │
│ Engleză C1   │ CURSURI              │
│ Franceză B1  │ • AWS Solutions      │
│              │ • Scrum Master       │
│ ─────────    │                      │
│ PERMIS       │ HOBBY-URI            │
│ B, C, CE     │ Alergat, fotografie  │
└──────────────┴──────────────────────┘
```

**Detalii tipografice exacte**:
- Numele candidatului (sidebar): Inter, 16pt, bold, alb, letter-spacing 1pt
- Sidebar section headings: Inter, 10pt, bold, alb, ALL CAPS, letter-spacing 1.5pt
- Sidebar body text: Inter, 9pt, regular, alb
- Main section headings: Inter, 13pt, bold, teal `#0F6E56`, ALL CAPS, letter-spacing 1pt
- Main job title: Inter, 11pt, bold, near-black
- Main companie: Inter, 10pt, medium (500), teal
- Main perioada: Inter, 9pt, regular, slate
- Main body text: Inter, 10pt, regular, near-black, line-height 1.45

**Poza recomandată** (nu opțională, lipsa lasă spațiu gol):
- Plasare: top sidebar, centrată
- Format: cerc 80pt diametru
- Border: alb 2pt
- Dacă nu există poză: înlocuiește cu inițiale mari (Inter 32pt bold alb pe teal mai închis)

**ATS notes**:
- 2 coloane = risc moderat pe ATS-uri vechi
- Soluție: ordinea în PDF (z-index) e linearizată — sidebar întâi, apoi main. ATS-urile mai noi parsează corect.
- Pentru ATS-uri din 2019+ (majoritatea companiilor mari): parsing OK
- Risc ATS: 3/10

---

### Template 3: ELEGANT

**Pozitionare**: Rafinament și sofisticare. Tipografie editorială cu ornamente discrete.

**Pentru cine**: HoReCa premium, hospitality, lux, real-estate, vânzări consultative, design interior, evenimente, fashion, beauty industry.

**Specificații vizuale**:

| Proprietate | Valoare |
|-------------|---------|
| Layout | Single column centrat |
| Lățime conținut | 515pt (margini 40pt fiecare parte — mai generoase) |
| Font heading | `Playfair Display` (serif, weight 700) |
| Font body | `Lora` (serif, weight 400/600) |
| Culoare primară | `#722A3E` (burgundy/wine) |
| Culoare text body | `#1e293b` (near-black, ușor mai cald) |
| Culoare text secondary | `#64748b` (slate) |
| Culoare ornament | `#722A3E` cu alfa 0.6 |
| Background | `#FFFEFB` (warm white, ușor cremos) |

**Structura template:**

```
┌─────────────────────────────────────┐
│                                     │
│   [Photo 90pt circle]               │
│                                     │
│       Alexandru Popescu             │
│     (32pt, Playfair, burgundy)      │
│           Șef Depozit               │
│        (12pt italic, slate)         │
│                                     │
│ alex@gmail.com  ·  0721 234 567     │
│           Cluj-Napoca               │
│                                     │
│             — · —                   │
│      (ornament burgundy)            │
│                                     │
│            EXPERIENȚĂ               │
│       (centered, all-caps)          │
│             — · —                   │
│                                     │
│        Dedeman — Șef Depozit        │
│            (centered, serif)        │
│           2019 — Prezent            │
│         (italic, burgundy)          │
│                                     │
│   Coordonarea echipei și            │
│   optimizarea fluxurilor logistice. │
│   (justified text, like a paragraph)│
│                                     │
│             — · —                   │
│            EDUCAȚIE                 │
│             — · —                   │
│   [...]                             │
│                                     │
└─────────────────────────────────────┘
```

**Detalii tipografice exacte**:
- Numele candidatului: Playfair Display, 32pt, bold, burgundy, text-align center
- Titlu/funcție: Lora Italic, 12pt, slate, center
- Contact line: Lora, 10pt, slate, center, cu separatori " · "
- Ornament între secțiuni: "— · —" cu letter-spacing 8pt, burgundy, center, font 12pt
- Section headings: Playfair Display, 14pt, bold, burgundy, ALL CAPS, center, letter-spacing 3pt
- Job/school title: Playfair Display, 12pt, bold, near-black, center
- Perioada: Lora Italic, 10pt, burgundy, center
- Body text: Lora, 10.5pt, regular, justified, line-height 1.6 (mai aerisit decât celelalte)
- Bullet points: înlocuite cu paragrafe scurte separate prin spațiu vertical (stil editorial, nu cu liste)

**Poza recomandată**:
- Plasare: top center, deasupra numelui
- Format: cerc 90pt diametru
- Border: burgundy 1.5pt cu un mic gap (2pt) intern alb (efect ramă)
- Dacă lipsește: doar nume centrat, fără spațiu gol

**Ornamente**:
- Între secțiuni: "— · —" cu spacing generos
- Sub nume: linie subțire 0.5pt burgundy, lățime 100pt, centrată
- Nu se folosesc bullet points clasici, ci paragrafe sau separatoare verbale

**ATS notes**:
- Single column = ATS-safe
- Atenție: paragrafele justified pot avea spațiere ciudată în unele ATS parsers
- Soluție: setează `textAlign: 'left'` pe body în React-PDF dar păstrează aspectul justified vizual prin width controlat
- Risc ATS: 1/10

---

### Template 4: COMPACT

**Pozitionare**: Densitate maximă de informație pe o pagină. Pentru seniori cu mult conținut.

**Pentru cine**: directori, manageri seniori, profesioniști cu 10+ ani experiență, multiple companii, multiple educații, certificări multe.

**Specificații vizuale**:

| Proprietate | Valoare |
|-------------|---------|
| Layout | Hibrid: header full + body 2 columns variabile |
| Lățime conținut | 575pt (margini 10pt fiecare parte — minim) |
| Font heading | `Inter` (sans-serif, weight 700) |
| Font body | `Inter` (sans-serif, weight 400) |
| Culoare primară | `#2C2C2A` (charcoal) |
| Culoare accent | `#BA7517` (amber dark) |
| Culoare text body | `#1e293b` |
| Culoare text secondary | `#64748b` |
| Background | `#FFFFFF` |

**Structura template:**

```
┌─────────────────────────────────────┐
│ ALEXANDRU POPESCU    0721 234 567   │
│ Șef Depozit · Logistică   alex@...  │
│ ─────────────────────  Cluj-Napoca  │ ← border 1.5pt charcoal
│                                     │
│ ┌──────────────────┬───────────────┐│
│ │ EXPERIENȚĂ       │ EDUCAȚIE      ││ ← amber section headers
│ │                  │               ││
│ │ Șef Depozit      │ Master UBB    ││
│ │ Dedeman 2019-Pr. │ 2018-2020     ││
│ │ • Bullet 1       │               ││
│ │ • Bullet 2       │ Licență UBB   ││
│ │                  │ 2015-2018     ││
│ │ Asist. Logistică │               ││
│ │ Lidl 2016-2019   │ SKILLS        ││
│ │ • Bullet 1       │ Excel · SAP · ││
│ │ • Bullet 2       │ Logistică ·   ││
│ │                  │ Negociere     ││
│ │ Vânzător         │               ││
│ │ Carrefour 14-16  │ LIMBI         ││
│ │ • Bullet 1       │ EN: C1        ││
│ │                  │ FR: B1        ││
│ │                  │               ││
│ │                  │ PERMIS        ││
│ │                  │ B, C, CE      ││
│ │                  │               ││
│ │                  │ CALIFICĂRI    ││
│ │                  │ Stivuitorist  ││
│ └──────────────────┴───────────────┘│
└─────────────────────────────────────┘
```

**Detalii tipografice exacte**:
- Numele: Inter, 18pt, bold, charcoal
- Titlu/funcție sub nume: Inter, 11pt, bold, amber `#BA7517`, ALL CAPS, letter-spacing 1pt
- Contact (right aligned in header): Inter, 9pt, slate, line-height 1.4
- Header divider: 1.5pt solid charcoal cu margine bottom 6pt
- Section headings: Inter, 10pt, bold, amber `#BA7517`, ALL CAPS, letter-spacing 1.5pt
- Job title: Inter, 9.5pt, bold, near-black
- Companie + perioada: Inter, 8.5pt, slate, regular
- Body bullets: Inter, 8.5pt, regular, near-black, line-height 1.35 (compact)
- Spațiu între intrări: 4pt (foarte compact)
- Spațiu între secțiuni: 8pt

**Poza opțională**:
- Plasare: dreapta sus, lângă contact info
- Format: pătrat 50pt cu colțuri 4pt rounded
- Dacă lipsește: nu lasă spațiu gol

**Specificul layout-ului**:
- Header full-width cu nume + contact split (stânga/dreapta)
- Body se împarte în 2 coloane: stânga 60% pentru experiență (cea mai importantă), dreapta 40% pentru toate celelalte
- Dacă userul are conținut puțin, layoutul se ajustează automat la single column
- Font sizes mai mici peste tot — explicit pentru densitate

**ATS notes**:
- 2 coloane = risc moderat
- Soluție: similar cu Modern, ordinea linearizată în PDF
- Risc ATS: 4/10 (cel mai riscant, dar publicul țintă lucrează în industrii care folosesc ATS-uri moderne)

---

## 3. Tabel comparativ rapid

| Atribut | Clasic | Modern | Elegant | Compact |
|---------|--------|--------|---------|---------|
| Layout | 1 col | 2 col | 1 col | 2 col + header |
| Font familie | Serif + sans | Sans | Serif | Sans |
| Culoare primară | Navy | Teal | Burgundy | Charcoal + amber |
| Pagini | 1-2 | 1-2 | 1 | 1 (densificat) |
| Risc ATS | 0/10 | 3/10 | 1/10 | 4/10 |
| Poză | Opțională | Recomandată | Recomandată | Opțională |
| Target seniority | Toate | Junior-Mid | Mid-Senior | Senior+ |
| Industrii | Toate corporate | Tech, marketing | HoReCa, lux | Senior generic |
| Densitate info | Medie | Medie | Joasă | Maximă |

---

## 4. Implementare în React-PDF

### Setup fonts

`lib/pdf-templates/fonts.ts`:

```typescript
import { Font } from "@react-pdf/renderer";

export function registerFonts() {
  Font.register({
    family: "Inter",
    fonts: [
      { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.ttf", fontWeight: 400 },
      { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMa2JL7SUc.ttf", fontWeight: 500 },
      { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMa1pL7SUc.ttf", fontWeight: 600 },
      { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMa25L7SUc.ttf", fontWeight: 700 },
    ],
  });

  Font.register({
    family: "Lato",
    fonts: [
      { src: "https://fonts.gstatic.com/s/lato/v24/S6uyw4BMUTPHjx4wXg.ttf", fontWeight: 400 },
      { src: "https://fonts.gstatic.com/s/lato/v24/S6uyw4BMUTPHjxAwXjeu.ttf", fontWeight: 400, fontStyle: "italic" },
      { src: "https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh6UVSwiPGQ3q5d0N7w.ttf", fontWeight: 700 },
    ],
  });

  Font.register({
    family: "Playfair Display",
    fonts: [
      { src: "https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvUDQ.ttf", fontWeight: 700 },
    ],
  });

  Font.register({
    family: "Lora",
    fonts: [
      { src: "https://fonts.gstatic.com/s/lora/v32/0QI6MX1D_JOuGQbT0gvTJPa787weuxJBkqg.ttf", fontWeight: 400 },
      { src: "https://fonts.gstatic.com/s/lora/v32/0QI8MX1D_JOuMw_LIftLAnfsBfL2_ZIBkqgw.ttf", fontWeight: 400, fontStyle: "italic" },
      { src: "https://fonts.gstatic.com/s/lora/v32/0QI6MX1D_JOuGQbT0gvTJPa787z8uxJBkqg.ttf", fontWeight: 600 },
    ],
  });
}
```

Apelează `registerFonts()` o singură dată la inițializarea aplicației (în `app/layout.tsx` server-side sau la primul PDF render).

### Structura folderului templates

```
lib/pdf-templates/
├── fonts.ts                 # Font registration
├── types.ts                 # CVData type (re-export from lib/types/cv.ts)
├── classic.tsx              # Template 1
├── modern.tsx               # Template 2
├── elegant.tsx              # Template 3
├── compact.tsx              # Template 4
├── shared/
│   ├── icons.tsx            # SVG icons pentru contact (telefon, email)
│   └── formatters.ts        # formatPeriod, formatPhone, etc.
└── index.ts                 # Registry + render function
```

### Template registry

`lib/pdf-templates/index.ts`:

```typescript
import { ClassicTemplate } from "./classic";
import { ModernTemplate } from "./modern";
import { ElegantTemplate } from "./elegant";
import { CompactTemplate } from "./compact";
import type { CVData } from "@/lib/types/cv";

export type TemplateId = "classic" | "modern" | "elegant" | "compact";

export const TEMPLATES = {
  classic: {
    id: "classic",
    name: "Clasic",
    description: "Single column, serif, navy. Maximum ATS-safe.",
    bestFor: ["corporate", "banking", "sector public"],
    component: ClassicTemplate,
    atsRisk: 0,
  },
  modern: {
    id: "modern",
    name: "Modern",
    description: "Sidebar + main, teal, sans-serif clean.",
    bestFor: ["tech", "startup", "marketing"],
    component: ModernTemplate,
    atsRisk: 3,
  },
  elegant: {
    id: "elegant",
    name: "Elegant",
    description: "Serif rafinat, burgundy, ornamente discrete.",
    bestFor: ["HoReCa", "lux", "creative"],
    component: ElegantTemplate,
    atsRisk: 1,
  },
  compact: {
    id: "compact",
    name: "Compact",
    description: "Dens, multi-column, amber accent. O pagină.",
    bestFor: ["senior", "10+ ani experiență"],
    component: CompactTemplate,
    atsRisk: 4,
  },
} as const;

export function getTemplate(id: TemplateId) {
  return TEMPLATES[id];
}
```

### Exemplu Classic template (skeleton)

`lib/pdf-templates/classic.tsx`:

```typescript
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { CVData } from "@/lib/types/cv";

const COLORS = {
  navy: "#1e3a8a",
  text: "#1e293b",
  secondary: "#475569",
  white: "#FFFFFF",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.white,
    fontFamily: "Lato",
    fontSize: 10,
    color: COLORS.text,
  },
  header: {
    backgroundColor: COLORS.navy,
    padding: 24,
    paddingTop: 28,
    paddingBottom: 24,
  },
  name: {
    fontFamily: "Playfair Display",
    fontWeight: 700,
    fontSize: 28,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: "Lato",
    fontStyle: "italic",
    fontSize: 13,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 4,
  },
  body: {
    padding: 20,
  },
  contactRow: {
    fontSize: 10,
    color: COLORS.secondary,
    marginBottom: 18,
  },
  sectionHeading: {
    fontFamily: "Playfair Display",
    fontWeight: 700,
    fontSize: 13,
    color: COLORS.navy,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginTop: 14,
    marginBottom: 4,
  },
  divider: {
    borderBottomWidth: 0.75,
    borderBottomColor: COLORS.navy,
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: COLORS.text,
  },
  company: {
    fontFamily: "Lato",
    fontStyle: "italic",
    fontSize: 10.5,
    color: COLORS.navy,
    marginTop: 1,
  },
  periodLocation: {
    fontSize: 9.5,
    color: COLORS.secondary,
    marginBottom: 4,
  },
  bullet: {
    fontSize: 10,
    color: COLORS.text,
    lineHeight: 1.4,
    marginLeft: 10,
    marginBottom: 2,
  },
});

export function ClassicTemplate({ data }: { data: CVData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{`${data.personal.firstName} ${data.personal.lastName}`.toUpperCase()}</Text>
          {data.targetTitle && <Text style={styles.title}>{data.targetTitle}</Text>}
        </View>

        <View style={styles.body}>
          <Text style={styles.contactRow}>
            {[data.personal.email, data.personal.phone, `${data.personal.city}, ${data.personal.country}`].filter(Boolean).join(" · ")}
          </Text>

          {data.summary && (
            <>
              <Text style={styles.sectionHeading}>Rezumat profesional</Text>
              <View style={styles.divider} />
              <Text style={{ lineHeight: 1.4 }}>{data.summary}</Text>
            </>
          )}

          <Text style={styles.sectionHeading}>Experiență profesională</Text>
          <View style={styles.divider} />
          {data.experience.map((exp, i) => (
            <View key={i} style={{ marginBottom: 10 }}>
              <Text style={styles.jobTitle}>{exp.title}</Text>
              <Text style={styles.company}>{exp.company}</Text>
              <Text style={styles.periodLocation}>{exp.period} · {exp.location}</Text>
              {exp.responsibilities.map((r, j) => (
                <Text key={j} style={styles.bullet}>• {r}</Text>
              ))}
              {exp.achievements.map((a, j) => (
                <Text key={j} style={styles.bullet}>• {a}</Text>
              ))}
            </View>
          ))}

          <Text style={styles.sectionHeading}>Educație</Text>
          <View style={styles.divider} />
          {data.education.map((edu, i) => (
            <View key={i} style={{ marginBottom: 8 }}>
              <Text style={styles.jobTitle}>{edu.level} — {edu.field}</Text>
              <Text style={styles.company}>{edu.institution}</Text>
              <Text style={styles.periodLocation}>{edu.years}</Text>
              {edu.thesis && <Text style={{ fontSize: 9.5, color: COLORS.secondary, fontStyle: "italic" }}>Lucrare: {edu.thesis}</Text>}
            </View>
          ))}

          {/* Continue with skills, languages, license, qualifications, hobbies */}
        </View>
      </Page>
    </Document>
  );
}
```

Aplică același pattern pentru Modern, Elegant, Compact — schimbând doar styling-ul și layout-ul.

### Render & download function

`lib/pdf-templates/render.ts`:

```typescript
import { renderToBuffer } from "@react-pdf/renderer";
import { getTemplate, TemplateId } from ".";
import type { CVData } from "@/lib/types/cv";

export async function renderCVPDF(data: CVData, templateId: TemplateId): Promise<Buffer> {
  const template = getTemplate(templateId);
  const Component = template.component;
  return await renderToBuffer(<Component data={data} />);
}
```

---

## 5. Pas nou în wizard: Selecția template

### Modificare în flow

PRD.md secțiunea 5 trebuie actualizată — pasul 15 nou (template selection), pasul 16 devine paywall (era 15).

### UI specificație

`components/wizard/steps/step-15-template.tsx`:

```typescript
"use client";
import { useState } from "react";
import { TEMPLATES, TemplateId } from "@/lib/pdf-templates";
import { CVPreview } from "@/components/preview/cv-preview";

export function TemplateSelectionStep({ cvData, onSelect, onBack }: Props) {
  const [selected, setSelected] = useState<TemplateId>("classic");
  const [previewExpanded, setPreviewExpanded] = useState(false);

  return (
    <div>
      <h2>Alege design-ul CV-ului tău</h2>
      <p>Toate template-urile sunt ATS-friendly și optimizate pentru piața din România.</p>

      <div className="template-grid">
        {Object.values(TEMPLATES).map(tpl => (
          <TemplateCard
            key={tpl.id}
            template={tpl}
            cvData={cvData}
            selected={selected === tpl.id}
            onClick={() => setSelected(tpl.id)}
          />
        ))}
      </div>

      <button onClick={() => onSelect(selected)}>
        Continuă cu {TEMPLATES[selected].name}
      </button>
    </div>
  );
}
```

### Preview live cu datele userului

Fiecare card de template trebuie să arate preview-ul cu **datele reale** ale userului, nu placeholder. Asta se face în 2 moduri:

**Opțiunea A (recomandată) — PDF rendered ca imagine**:
- La intrarea pe pas, generează toate 4 PDF-urile cu datele userului
- Convertește prima pagină la imagine (PNG) folosind `pdfjs-dist` sau `pdf-lib`
- Afișează imaginile în cards

**Opțiunea B (mai simplă) — HTML mockup similar PDF-ului**:
- Construiește o versiune simplificată HTML/CSS a fiecărui template
- Folosește datele reale din state
- Render rapid, fără PDF generation
- Riscă inconsistențe minore cu PDF-ul final

**Recomandare**: începe cu opțiunea B în Faza 4, upgrade la A în polish.

### Card design

```tsx
<div className={`tpl-card ${selected ? 'selected' : ''}`} onClick={onClick}>
  <div className="tpl-preview">
    <CVMiniPreview template={tpl.id} data={cvData} />
  </div>
  <h3>{tpl.name}</h3>
  <p>{tpl.description}</p>
  <div className="tpl-tags">
    {tpl.bestFor.map(tag => <span className="tag">{tag}</span>)}
  </div>
</div>
```

CSS pentru card selected: `border: 2px solid #1e3a8a; padding: 13px;` (compensează border-ul cu 1px mai gros).

---

## 6. Modificări în Database

Adaugă coloana `template_id` în tabela `sessions`:

```sql
alter table sessions add column template_id text default 'classic';
alter table sessions add constraint valid_template check (
  template_id in ('classic', 'modern', 'elegant', 'compact')
);
```

Default = 'classic' pentru cazul în care userul nu alege explicit (skip pasul).

---

## 7. Modificări în PRD existent

În PRD.md secțiunea 5, înlocuiește pasul 15 (Paywall) cu:

### Pas 15 — Selecție template (NOU)
**Scop**: Userul alege design-ul CV-ului între 4 variante.
**UI**: Grid 2x2 cu cards conținând preview live + nume + descriere + tags target. Card selectat are border 2px. Buton sub: "Continuă cu [Nume Template]".
**Logică**: La selecție, salvează `template_id` în session. Preview-ul se regenerează instant la schimbarea selecției. Default: Clasic.
**Skip**: nu permis — userul trebuie să confirme alegerea (sau să accepte default-ul).

### Pas 16 — Paywall & Descărcare (era 15)
**Modificări**: Preview-ul CV-ului în paywall folosește template-ul ales la pasul 15. Watermark "DRAFT" diagonal.

---

## 8. Modificări în TASKS.md

Adaugă în Faza 4 (PDF generation + Paywall):

### Tasks noi:
- [ ] **`lib/pdf-templates/fonts.ts`** — registry Google Fonts pentru React-PDF
- [ ] **`lib/pdf-templates/classic.tsx`** — Template 1 complet
- [ ] **`lib/pdf-templates/modern.tsx`** — Template 2 complet (2 col)
- [ ] **`lib/pdf-templates/elegant.tsx`** — Template 3 complet (serif editorial)
- [ ] **`lib/pdf-templates/compact.tsx`** — Template 4 complet (dens)
- [ ] **`lib/pdf-templates/index.ts`** — registry + getTemplate
- [ ] **`lib/pdf-templates/render.ts`** — renderCVPDF function
- [ ] **`components/wizard/steps/step-15-template.tsx`** — UI selecție template
- [ ] **`components/preview/cv-mini-preview.tsx`** — HTML preview pentru cards (opțiunea B)
- [ ] **Migration DB**: adaugă `template_id` în tabela sessions
- [ ] **API route** `app/api/pdf/[sessionId]/route.ts` — actualizat să citească `template_id` din session și să folosească template corect
- [ ] **Test cu date reale**: rulează toate 4 template-uri cu același CVData, verifică ATS parsing cu un tool online

### Criterii acceptare suplimentare Faza 4:
- ✅ Toate 4 template-urile generează PDF valid A4
- ✅ Diacriticele românești apar corect în toate fonturile
- ✅ Userul poate comuta între template-uri și PDF-ul se regenerează corect
- ✅ Preview-ul în wizard reflectă fidel PDF-ul final
- ✅ Test ATS pe fiecare template cu Resume Worded sau similar

---

## 9. Considerații de business

### Pricing strategy

**MVP**: toate 4 template-urile au același preț (35 RON). Decizia e simplă pentru user, conversia rapidă.

**V1.1+** (după validare): introduce premium tier:
- Template Clasic + Modern: 35 RON (basic)
- Template Elegant + Compact: 45 RON (premium)
- Bundle "All Templates Access": 55 RON (descarcă în orice template ulterior)

Această stratificare permite testarea price elasticity fără să afecteze MVP-ul.

### A/B testing

După launch, testează:
- Care template e cel mai des ales? (analytics event `template_selected`)
- Există corelație între template ales și rata de conversie la plată?
- Există template-uri care declanșează mai des "regenerează"?

Aceste date informează ce template-uri merită investiție viitoare (variațiuni, premium tier).

---

## 10. Acceptance criteria final

✅ 4 template-uri React-PDF complet implementate
✅ Toate folosesc același `CVData` ca prop, fără modificări
✅ Diacriticele românești perfecte în toate (test cu nume "Ștefănescu", "Țugui", "Câmpeanu")
✅ Toate generează PDF A4 valid
✅ Toate sunt ATS-testate cu un tool extern (Resume Worded, Jobscan)
✅ Wizard step de selecție implementat cu preview live al datelor userului
✅ Template ales se persistă în DB și e folosit la generarea finală
✅ Userul poate schimba template-ul oricând înainte de plată
✅ Toate textele din interfață în română (inclusiv numele template-urilor)
✅ Mobile responsive pentru selecția template (cards stack vertical pe mobile)
