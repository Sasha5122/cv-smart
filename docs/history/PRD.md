> **Historical document (Nov 2025 → Jul 2026).** This is the original product requirements document for the project, then called “CV Smart”. The shipped product (CVexpres) diverged in several places: the AI pipeline uses 2 calls instead of 3, payments went from free download → Paddle → Creem, and there are 19 PDF templates. Kept for context; see the README for the current architecture.

# PRD — CV Smart

**Product Requirements Document**
**Versiune**: 1.0
**Data**: Noiembrie 2026
**Status**: Ready for development

---

## 1. Sumar executiv

**CV Smart** este o aplicație web AI-powered care generează CV-uri profesionale optimizate pentru piața de muncă din România. Diferențiatorul-cheie față de competiție (cvapp.ro, livecareer.ro, creare-cv.com) este pipeline-ul AI hibrid: înainte de a întreba userul orice, sistemul cercetează jobul țintă online și construiește un profil ideal pentru acel rol — apoi conduce un interviu țintit care extrage exact informația care contează pentru recrutori.

**Obiective de testare** (faza MVP):
- Wizard complet funcțional end-to-end
- Pipeline AI validat cu utilizatori reali
- CV generat descărcabil direct (fără plată)

---

## 2. Piață țintă

### Segmentare utilizatori

| Segment | % piață | Caracteristici |
|---------|---------|----------------|
| **Job seekers retail/HoReCa** | 35% | Liceu/profesională, caută vânzător, ospătar, recepționer |
| **Muncitori calificați** | 25% | Stivuitorist, sudor, electrician, șofer |
| **Angajați entry/middle office** | 20% | Studii superioare, contabili, asistenți, marketing |
| **IT/tech** | 10% | Engleză + diaspora |
| **Manageri & seniori** | 10% | 10+ ani experiență |

### Date piață România (sursă: eJobs 2025, INS)
- 11 milioane aplicări/an pe eJobs
- 305.000 conturi noi de candidați/an
- 500.000+ șomeri activi
- 260.000 joburi noi postate anual

### Cuvinte cheie target (Google Ads)
- **Volum mare, CPC mediu**: "creare cv" (~12K căutări/lună), "model cv" (~30K), "cv online gratuit" (~8K)
- **Volum mic, CPC scăzut** (focus inițial): "cv cu AI română", "generator cv inteligență artificială", "cv personalizat AI"
- **Long-tail**: "cv ATS-friendly", "cv pentru [companie românească]", "model cv 2026"

---

## 3. Personajele utilizatorilor

### Andreea, 24 ani — Asistent vânzări
- Liceu absolvit, primul job
- Vrea să aplice la Lidl, Mega Image, Carrefour
- Nu știe cum să scrie un CV profesional
- Caută rapid o soluție, nu vrea să petreacă ore întregi
- Plătește max 30-40 RON pentru un rezultat bun
- **Nevoia ei**: ghidare pas-cu-pas, exemple clare, rezultat care arată profesional

### Marian, 38 ani — Șofer profesionist
- Permis B+C+CE, 15 ani experiență
- Vrea să se mute la o companie de transport mai bună
- Nu folosește bine calculatorul, dar are smartphone
- Are CV vechi din 2019 pe Word
- **Nevoia lui**: să-i extragă datele din CV vechi, să nu rescrie totul, optimizare pe categorii permis

### Cristian, 31 ani — Project Manager IT
- Studii superioare, vrea promovare la senior level
- Are LinkedIn, dar CV-ul e vechi
- Vrea CV ATS-friendly pentru companii corporate
- **Nevoia lui**: optimizare pentru ATS, keyword matching cu job-ul țintă, output premium

---

## 4. User journey

```
Landing page
    ↓
"Începe gratuit" CTA
    ↓
WIZARD (14 pași, 10-15 minute)
    ↓
Draft CV generat
    ↓
Descarcă PDF direct (fără plată)
```

---

## 5. Specificația wizardului — 15 pași

### Faza 1: Setup & Context (pași 0-2)

> **Notă fază de testare**: Wizardul are 14 pași (Pas 0 → Pas 13). Pas 14 = Draft + descărcare directă PDF, fără paywall.

#### Pas 0 — CV vechi (opțional)
**Scop**: extragere automată date din CV existent.
**UI**: zonă drag-and-drop + textarea pentru paste manual.
**Acceptă**: PDF, DOCX, TXT. Max 5MB.
**Logică AI**: dacă există fișier, parse cu `pdf-parse`/`mammoth`, apoi Sonnet 4.6 extrage JSON structured cu toate datele. Auto-fill toate câmpurile relevante în pașii următori.
**Skip permis**: da, buton "→ Next" dacă nu are CV.

#### Pas 1 — Job description (opțional)
**Scop**: ancora pentru Faza 2 (Research) și Faza 4 (Tailoring).
**UI**: textarea mare. Hint: "Lipește descrierea jobului de pe eJobs/BestJobs/Hipo sau URL-ul anunțului."
**Logică**: dacă există, declanșează asincron Faza 2 (Research) în background imediat. User nu așteaptă.
**Skip permis**: da, fără personalizare specifică. CV-ul iese universal.

#### Pas 2 — Poză profesională
**Scop**: upload poză + educație că poza crește șansele cu 38%.
**UI**:
- Banner galben: "📈 Candidații cu poză profesională au cu +38% mai multe șanse"
- Listă "ce e ok" (cămașă, fundal alb, zâmbet) și "ce să eviți" (selfie, vacanță, ochelari soare)
- Zone upload mare: 200×240px, dashed border, hover effect
- Preview imediat după upload
**Acceptă**: JPG, PNG, WEBP. Max 5MB. Recomandare format portret.
**Procesare**: stocare directă în Supabase storage. Compresie automată la max 800×1000.
**Skip permis**: da, dar cu mesaj clar "Doar dacă nu ai poză, apasă Next".

### Faza 2: Date personale (pași 3-7)

Toate cu input direct, validare inline, autosuggest unde aplicabil.

#### Pas 3 — Nume de familie
- Placeholder: "ex: Popescu"
- Hint: "ex: Popescu, Ionescu, Stanescu, Popa..."
- Autosuggest AI prin Haiku 4.5 (rapid, cost minim)
- Pre-fill din CV vechi dacă există

#### Pas 4 — Prenume
- Placeholder: "ex: Alexandru"
- Aceeași logică ca Pas 3

#### Pas 5 — Telefon
- Validare format românesc (07XX XXX XXX sau +40)
- Auto-format pe input
- Pre-fill din CV vechi

#### Pas 6 — Email
- Validare format email
- **Verificare AI a profesionalismului**: după blur, Haiku 4.5 verifică dacă e profesional (nu conține "batausu79", "diavolu", "cuteboy", etc.)
- Dacă neprofesional → afișează sugestii: "Recomandăm `nume.prenume@gmail.com`. Iată 2 alternative pe baza numelui tău: ..."
- Userul poate ignora sugestia

#### Pas 7 — Adresă
- Câmpuri: stradă (opțional), oraș, județ (dropdown cu toate cele 41+București), cod poștal, țară (default România)
- **Autosuggest pentru oraș** prin Haiku 4.5
- Pe CV apare doar orașul + județul, dar colectăm totul pentru opțiuni future

### Faza 3: Conținut CV (pași 8-13)

Acestea sunt pașii conversaționali. Fiecare are 2 butoane jos: "← Înapoi" și "✋ Ajunge, mergi mai departe".

**Butonul "Ajunge"**: trimite toată conversația până în acel moment la AI cu un prompt special de extracție și salvează ce s-a colectat parțial înainte de a trece la pasul următor.

#### Pas 8 — Educație (conversațional)
**Strategia**: AI conduce conversația ierarhic descrescător.
**Ordinea întrebărilor**:
1. "Care este cea mai înaltă formă de educație pe care ai terminat-o?" (doctorat → master → licență → liceu → școală profesională)
2. Pentru fiecare nivel: instituție, specializare, ani, titlul lucrării (dacă e cazul), media (opțional)
3. După ce termină un nivel: "Ai mai urmat și nivelul inferior?"
4. La final, întreabă de cursuri/certificări: "Ai urmat training-uri sau cursuri profesionale? (Coursera, autorizații, etc.)"

**Output structurat**:
```json
{
  "education": [
    {
      "level": "Master",
      "institution": "Universitatea Babeș-Bolyai",
      "field": "Informatică Aplicată",
      "years": "2018-2020",
      "thesis": "Sisteme de recomandare bazate pe ML",
      "grade": "9.85"
    }
  ],
  "courses": [
    {"name": "AWS Solutions Architect", "provider": "AWS", "year": "2023"}
  ]
}
```

#### Pas 9 — Experiență profesională (conversațional, cel mai important)
**Strategia**: AI extrage detalii bogate prin întrebări iterative. Folosește profilul ideal din Faza 2 ca checklist invizibil.

**Pentru fiecare job colectează obligatoriu**:
1. Compania + locația
2. Funcția exactă (reformulată profesional dacă userul e vag)
3. Perioada (lună+an start → lună+an end sau "prezent")
4. Responsabilități concrete (minim 4, ținta 6)
5. Realizări măsurabile (cifre, procente, proiecte)
6. Coordonare echipă (câți, cum)

**Tehnica AI**:
- Dacă userul e vag ("făceam acte"): "Ce tip de documente gestionai? Mai mult financiar, HR, legal?"
- Propune reformulări: "Deci coordonai recepția mărfurilor și completai inventarul săptămânal — corect?"
- Scoate cifre: "Câți colegi aveai în subordine? Aveai un target anual?"
- Per profilul ideal: "Pentru rolul de Sales Manager se cere de obicei portofoliu de clienți. Tu cum ai gestionat acest aspect?"

**Output**:
```json
{
  "experience": [
    {
      "company": "Dedeman",
      "location": "Cluj-Napoca",
      "title": "Șef Depozit",
      "period": "Martie 2019 - Prezent",
      "responsibilities": [
        "Coordonarea unei echipe de 12 angajați în recepția și expedierea mărfurilor",
        "..."
      ],
      "achievements": [
        "Reducerea timpului de procesare comenzi cu 28% prin reorganizarea fluxurilor",
        "..."
      ]
    }
  ]
}
```

#### Pas 10 — Abilități (conversațional + tag editor)
**Strategia**: AI extrage abilități prin dialog deschis, apoi fiecare apare ca tag editabil.

**Flow**:
1. AI deschide: "Descrie-mi cu cuvintele tale ce crezi că faci cel mai bine."
2. User: descriere liberă
3. AI extrage abilități + sursa fiecăreia ("dobândit la Dedeman", "din experiența personală", etc.)
4. AI prezintă lista: "Am identificat aceste abilități — sunt corecte?"
5. AI completează cu sugestii din profilul ideal dacă lipsesc

**UI**: chat sus, tags editabile jos.
**Tag UI**:
- Card cu nume abilitate (bold) + sursa (text mic gri)
- Buton ✕ mare (30×30px, font 20px, fundal roz) pentru ștergere ușoară

**Output**:
```json
{
  "skills": [
    {"name": "Coordonare echipă", "source": "dobândit la Dedeman ca șef de depozit"},
    {"name": "Microsoft Excel avansat", "source": "dobândit prin cursuri online + experiență practică"}
  ]
}
```

#### Pas 11 — Limbi străine
**Nu e conversațional** — formular simplu cu repeat.
**UI**:
- Input limba (text liber)
- Dropdown nivel: A1 - Începător, A2 - Elementar, B1 - Intermediar, B2 - Intermediar avansat, C1 - Avansat, C2 - Mastery, Nativ
- Buton "+ Adaugă"
- Tags cu ✕ pentru fiecare limbă adăugată

#### Pas 12 — Permis & Calificări
**Nu e conversațional** — formular structurat.

**Secțiunea Permis**:
- Toggle Da/Nu pentru permis de conducere
- Dacă "Da": butoane multi-select pentru categorii (A, A1, A2, B, BE, B1, C, CE, C1, D, DE, T)

**Secțiunea Calificări**:
- Textarea liberă: "ex: Operator stivuitor autorizat, Electrician ANRE, Sudor autorizat..."
- AI verifică în background dacă sunt formulate corect (Haiku 4.5)

**De ce nu conversațional**: aceste date sunt prea structurate pentru dialog. Formularul e mai rapid.

#### Pas 13 — Hobby-uri (conversațional, scurt)
**Strategia**: AI extrage 3-5 hobby-uri prin dialog scurt.
**UI**: chat sus + pills cu ✕ jos.
**Logică AI**: dacă userul zice doar "fotbal", întreabă: "Joci săptămânal? La nivel amator sau competițional?". Vrea detalii care diferențiază.

### Faza 4: Draft & Plată (pași 14-15)

#### Pas 14 — Draft CV + Descărcare
**Flow complet**:
1. Show summary cu toate datele colectate
2. Buton "Generează Draft" → loading state cu mesaje progresive
3. Sonnet 4.6 generează CV-ul complet ca text (folosește profilul ideal + job description pentru tailoring)
4. Afișează draft-ul într-un container readable (monospace, line-height 1.85)
5. **Mini-chat sub draft** pentru revizuire:
   - AI: "Acesta este draft-ul. Spune-mi ce să modific."
   - User: "Schimbă titlul la Dedeman..."
   - AI: "Am notat. Mai e ceva?"
   - ... până userul scrie "gata"
6. Userul scrie "gata" → AI regenerează cu toate modificările aplicate
7. **Buton "Descarcă PDF"** — descărcare directă, fără plată

**Acceptance criteria**:
- Draft generat în < 30 secunde
- Revizuirea suportă minim 5 modificări
- Final CV diferă vizibil de draft (modificările sunt aplicate)
- PDF descărcabil direct după finalizare

---

## 6. Pipeline AI detaliat

### Faza 1 — Discovery (synchronous, < 5s)

```typescript
const intent = await ai.discovery({
  userInput: jobDescription || cvText || "",
  history: previousMessages
});
// → { role: "Sales Manager", industry: "Retail", seniority: "mid", location: "RO" }
```

**System prompt**: în `lib/prompts/discovery.ts`. Output strict JSON.

### Faza 2 — Research (asynchronous, în background)

```typescript
// Rulează în paralel cu pașii 3-7 (personal info)
const profile = await ai.research({
  role: intent.role,
  industry: intent.industry,
  useWebSearch: true,
  cacheKey: `profile:${normalize(intent.role)}`
});
// → { responsibilities: [], hardSkills: [], softSkills: [], atsKeywords: [], typicalKPIs: [] }
```

**Cache**: lookup în Supabase `cached_profiles` table înainte de web search. Dacă există și e mai recent de 30 zile, folosește-l. Altfel, regenerează.

**Web search tool** (Anthropic native):
```typescript
{
  type: "web_search_20250305",
  name: "web_search"
}
```

### Faza 3 — Targeted Interview

Folosește profilul din Faza 2 ca **checklist invizibil**. AI prioritizează întrebările pentru a acoperi toate punctele din checklist. Marchează ce e covered și ce nu.

```typescript
const interviewState = {
  checklist: profile.responsibilities,
  covered: Set<string>,
  missing: Set<string>,
  userResponses: []
};
```

La sfârșit, dacă există items în `missing`, AI întreabă specific despre ele înainte de a închide secțiunea.

### Faza 4 — Tailoring

```typescript
const finalCV = await ai.tailor({
  userProfile: collectedData,
  idealProfile: profile,           // din Faza 2
  realJobDescription: jobDesc,     // input original al userului
  template: "ats-modern"
});
```

**Reguli**:
- Folosește keyword-uri din `realJobDescription` (nu din profilul ideal)
- Păstrează adevărul (nu inventa experiență)
- Reformulează responsabilități cu vocabularul din JD
- Ordonează skills în ordinea importanței pentru JD

---

## 7. Schema database (Supabase)

```sql
-- Sesiuni wizard (guest sau autentificat)
create table sessions (
  id uuid primary key default gen_random_uuid(),
  email text,
  status text default 'in_progress', -- in_progress, draft_generated, downloaded
  cv_data jsonb,                      -- toate datele colectate
  job_description text,
  ideal_profile jsonb,                -- output Faza 2
  draft_cv text,
  final_cv text,
  photo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '30 days')
);

-- Cache profile per rol
create table cached_profiles (
  id uuid primary key default gen_random_uuid(),
  role_normalized text unique not null,  -- ex: "sales-manager"
  role_display text,                     -- ex: "Sales Manager"
  industry text,
  profile_data jsonb,                    -- responsibilities, skills, ATS keywords
  source_urls text[],                    -- URLs folosite la generare
  created_at timestamptz default now(),
  last_used_at timestamptz default now()
);

-- Analytics events
create table events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid,
  event_name text,                       -- step_completed, draft_generated, etc.
  properties jsonb,
  created_at timestamptz default now()
);
```

---

## 8. API endpoints

### `POST /api/ai/chat`
Endpoint principal pentru toate conversațiile AI (educație, experiență, abilități, hobby-uri, revizuire draft).

**Body**:
```typescript
{
  sessionId: string,
  step: "education" | "experience" | "skills" | "hobbies" | "draft-revision",
  message: string,
  history: Message[]
}
```

**Response**: streaming SSE cu chunks de text. Final chunk poate fi un JSON cu `{done: true, data: {...}}`.

### `POST /api/ai/extract-cv`
Parse fișier CV uploadat și extrage date structurate.

### `POST /api/ai/research`
Generează profilul ideal pentru un rol. Verifică cache întâi.

### `POST /api/ai/generate-draft`
Generează draft-ul CV-ului bazat pe datele colectate.

### `POST /api/ai/finalize`
Aplică modificările solicitate și produce CV-ul final.

### `GET /api/pdf/[sessionId]`
Generează și returnează PDF-ul (liber, fără verificare plată).

---

## 11. Analytics & funnel tracking

**Evenimente cheie** (PostHog):
- `landing_visited`
- `wizard_started`
- `step_completed` (cu step_id)
- `wizard_abandoned` (cu last_step)
- `draft_generated`
- `pdf_downloaded`

**Funnel benchmark țintă (faza de testare)**:
- Landing → Wizard start: 40%
- Wizard start → Draft: 60%
- Draft → PDF descărcat: 80%

---

## 12. Roadmap features (post-MVP)

**V1.1**:
- Templates multiple (modern, clasic, creativ)
- Export DOCX pe lângă PDF
- Scrisoare de intenție AI-generated

**V1.2**:
- Cont user pentru salvare multiple CV-uri
- Variante CV per job (același user, joburi diferite)
- Optimizare LinkedIn parser

**V2**:
- Versiune engleză pentru diaspora
- Marketplace recrutori (joburi recomandate)
- Cover letter generator standalone

---

## 13. Criterii de succes MVP (faza de testare)

✅ Wizard complet funcțional cu toți 14 pașii
✅ Pipeline AI cu 4 faze implementat și testat
✅ PDF generation cu calitate publicabilă
✅ PDF descărcabil direct după finalizare (fără plată)
✅ Mobile responsive (60%+ traficul vine de pe mobil)
✅ LCP < 2.5s pe landing page
✅ Toate textele în română cu diacritice corecte
✅ Zero leak de API keys în client

---

## 14. Riscuri & mitigări

| Risc | Impact | Mitigare |
|------|--------|----------|
| Cost AI mai mare decât estimat | Mediu | Prompt caching obligatoriu + cache profile + Haiku pentru task-uri simple |
| Plagiat de la competitori | Mediu | Velocitate de inovare + feature gap continuu |
| Probleme legale (date personale) | Mare | GDPR compliance strictă + Politică confidențialitate clară + ștergere automată CV-uri |

---

## 15. Aspecte legale

- **GDPR**: politică privacy în română, opt-in explicit pentru cookies, drept la ștergere
- **Ștergere automată**: toate CV-urile generate se șterg automat după 30 zile
- **Termeni & Condiții**: în română, accesibili în footer
