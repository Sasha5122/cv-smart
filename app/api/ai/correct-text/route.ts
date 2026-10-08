import { NextResponse } from "next/server";
import { recordApiError } from "@/lib/telemetry";
import { callStructured, StructuredCallError } from "@/lib/openai";
import { checkRateLimit, clientIp } from "@/lib/cv-pipeline/rate-limit";
import { readJsonLimited, BODY_LIMITS } from "@/lib/http-guards";
import { toLocale, type Locale } from "@/lib/i18n/locale";

export const maxDuration = 30;

/**
 * Corectare ieftină de text (gpt-5.4-nano, ~0.01 bani/apel):
 * gramatică + diacritice + majuscule, FĂRĂ schimbare de sens.
 * Folosit la: titlul jobului, localitate, hobby-uri.
 */
const CORRECT_MODEL = "gpt-5.4-nano";

type Kind = "job-title" | "city" | "hobby" | "qualification" | "cv-bullet";

/** Reformularea nominală e mai grea decât o corectură — merită un model mai bun. */
const MODEL_BY_KIND: Partial<Record<Kind, string>> = {
  "cv-bullet": "gpt-5.4-mini",
};

const SYSTEM_PROMPTS: Record<Kind, string> = {
  "cv-bullet": `Transformi o responsabilitate de job scrisă colocvial sau telegrafic de un utilizator român într-un bullet point profesionist de CV, în FORMĂ NOMINALĂ.

REGULA DE AUR — forma nominală e OBLIGATORIE:
- bulletul începe cu substantivul verbal al acțiunii („Coordonarea", „Gestionarea", „Întocmirea", „Verificarea", „Reducerea", „Operarea"...), NICIODATĂ cu participiu („Coordonat", „Gestionat", „Implementat") și niciodată la persoana I („am coordonat")
- complementul se acordă corect gramatical: „Coordonarea unei echipe de 3 colegi", „Gestionarea facturilor lunare" — NU „Coordonarea echipa"
- o singură idee per bullet, concis (max ~22 cuvinte), fără pronume personale, fără „eu"
- corectează gramatica, diacriticele și normalizează cifrele („38 de mii" → „38.000")
- NU inventa cifre, denumiri sau responsabilități noi; păstrează EXACT faptele și cifrele scrise de user
- dacă textul e deja în formă nominală corectă, returnează-l neschimbat

EXEMPLE (învață tiparul):
- "Coordonat echipa de 3 colegi" → "Coordonarea unei echipe de 3 colegi"
- "Gestionat facturile lunare" → "Gestionarea facturilor lunare"
- "am implementat un sistem nou de inventar" → "Implementarea unui sistem nou de gestiune a inventarului"
- "raspundeam de receptia marfii" → "Recepția și verificarea mărfii"
- "faceam pontaje si salarii" → "Întocmirea pontajelor și a statelor de salarii"

Diacriticele românești sunt obligatorii.`,
  qualification: `Corectezi denumiri de calificări/autorizații profesionale scrise de utilizatori români. Reguli stricte:
- corectează tastarea, gramatica și diacriticele (ex: "oparater stivuiter" → "Operator stivuitor")
- folosește denumirea standard a calificării, cu majusculele corecte (ex: "electrician anre" → "Electrician ANRE", "sudor iscir" → "Sudor autorizat ISCIR")
- formă scurtă, nominală — NU propoziții
- NU schimba sensul, NU adăuga calificări noi, NU inventa grade/niveluri pe care userul nu le-a scris
- dacă textul e deja corect, returnează-l neschimbat`,
  "job-title": `Corectezi titluri de job scrise de utilizatori români. Reguli stricte:
- corectează greșelile de tastare și gramatică (ex: "conttabil" → "Contabil")
- adaugă diacriticele românești corecte (ex: "sofer" → "Șofer")
- prima literă mare, restul conform normelor
- NU schimba sensul, NU adăuga cuvinte, NU traduce, NU reformula
- dacă textul e deja corect, returnează-l neschimbat`,
  city: `Corectezi denumiri de localități din România scrise de utilizatori. Reguli stricte:
- corectează tastarea și adaugă diacriticele corecte (ex: "cluj-napoca" → "Cluj-Napoca", "iasi" → "Iași")
- majuscule conform normelor pentru nume proprii
- NU schimba localitatea cu alta, NU adăuga cuvinte
- dacă textul e deja corect, returnează-l neschimbat`,
  hobby: `Transformi hobby-uri scrise colocvial de utilizatori români în forma scurtă, nominală, standard pentru lista de hobby-uri dintr-un CV.

REGULA DE AUR — forma de CV e OBLIGATORIE, nu opțională:
- rezultatul e un substantiv sau o sintagmă nominală scurtă (1-4 cuvinte), NICIODATĂ o propoziție
- INTERZISE: persoana I („mă uit", „joc", „îmi place"), verbe conjugate, detalii de context (cu cine, când, unde)
- sensul rămâne strict al utilizatorului — nu adăuga activități noi

EXEMPLE (învață tiparul):
- "ma uit la meciuri si joc fotbal duminica cu baietii" → "Fotbal, urmărirea meciurilor"
- "imi place sa citesc carti de istorie" → "Lectură (cărți de istorie)"
- "gatesc pentru familie in weekend" → "Gătit"
- "ma plimb cu bicicleta" → "Ciclism"
- "jocuri pe calculator" → "Jocuri pe calculator" (deja corect — rămâne)

Diacriticele românești sunt obligatorii.`,
};

/** English (demo level) prompts — same kinds, same JSON shape. */
const SYSTEM_PROMPTS_EN: Record<Kind, string> = {
  "cv-bullet": `You turn a job responsibility written colloquially or telegraphically by a user into a professional CV bullet point in GERUND (noun) FORM, in English.

GOLDEN RULE — the gerund form is MANDATORY:
- the bullet opens with the -ing form of the action verb ("Coordinating", "Managing", "Preparing", "Verifying", "Reducing", "Operating"...), NEVER with a past participle ("Coordinated", "Managed", "Implemented") and never in the first person ("I coordinated")
- the object follows naturally and grammatically: "Coordinating a team of 3 colleagues", "Managing monthly invoices"
- one idea per bullet, concise (max ~22 words), no personal pronouns, no "I"
- correct the grammar, spelling and capitalisation, and normalise figures ("38 thousand" → "38,000")
- do NOT invent figures, names or new responsibilities; keep EXACTLY the facts and figures the user wrote
- if the text is already in correct gerund form, return it unchanged

EXAMPLES (learn the pattern):
- "Coordinated a team of 3 colleagues" → "Coordinating a team of 3 colleagues"
- "managed monthly invoices" → "Managing monthly invoices"
- "I implemented a new inventory system" → "Implementing a new inventory management system"
- "was in charge of receiving goods" → "Receiving and checking incoming goods"
- "did timesheets and payroll" → "Preparing timesheets and payroll"

The result is always in English.`,
  qualification: `You correct the names of professional qualifications/licences written by users. Strict rules:
- fix typos, grammar and capitalisation (e.g. "forklit operater" → "Forklift operator")
- use the standard name of the qualification, with acronyms capitalised correctly (e.g. "cisco ccna" → "Cisco CCNA", "first aid cert" → "First Aid Certificate")
- short, nominal form — NOT sentences
- do NOT change the meaning, do NOT add qualifications, do NOT invent grades/levels the user did not write
- if the text is already correct, return it unchanged`,
  "job-title": `You correct job titles written by users. Strict rules:
- fix typos and grammar (e.g. "acountant" → "Accountant")
- capitalise the first letter, the rest according to standard usage
- do NOT change the meaning, do NOT add words, do NOT translate, do NOT rephrase
- if the text is already correct, return it unchanged`,
  city: `You correct names of cities and towns written by users. Strict rules:
- fix typos and use the standard spelling, including diacritics where the name has them (e.g. "cluj napoca" → "Cluj-Napoca", "new york" → "New York")
- capitalise as for proper nouns
- do NOT replace the place with another one, do NOT add words
- if the text is already correct, return it unchanged`,
  hobby: `You turn hobbies written colloquially by users into the short, nominal, standard form for the hobbies list of a CV, in English.

GOLDEN RULE — the CV form is MANDATORY, not optional:
- the result is a noun or a short noun phrase (1-4 words), NEVER a sentence
- FORBIDDEN: first person ("I watch", "I play", "I like"), conjugated verbs, context details (with whom, when, where)
- the meaning stays strictly the user's — do not add new activities

EXAMPLES (learn the pattern):
- "i watch matches and play football on sundays with the guys" → "Football, watching matches"
- "i like reading history books" → "Reading (history books)"
- "cooking for the family at weekends" → "Cooking"
- "riding my bike" → "Cycling"
- "video games" → "Video games" (already correct — stays)`,
};

const SCHEMA = {
  type: "object",
  properties: { corrected: { type: "string" } },
  required: ["corrected"],
  additionalProperties: false,
};

const BATCH_SCHEMA = {
  type: "object",
  properties: { corrected: { type: "array", items: { type: "string" } } },
  required: ["corrected"],
  additionalProperties: false,
};

const BATCH_SYSTEM = `${"Transformi responsabilități de job scrise colocvial sau telegrafic de un utilizator român în bullet points profesioniste de CV, în FORMĂ NOMINALĂ."}

Primești un array JSON de linii. Returnezi un array cu EXACT același număr de linii, în aceeași ordine, fiecare rescrisă.

REGULA DE AUR — forma nominală e OBLIGATORIE la fiecare linie:
- începe cu substantivul verbal al acțiunii („Coordonarea", „Gestionarea", „Întocmirea", „Verificarea"...), NICIODATĂ cu participiu („Coordonat") și niciodată la persoana I
- complementul se acordă corect gramatical: „Coordonarea unei echipe de 3 colegi", NU „Coordonarea echipa"
- o idee per linie, concis (max ~22 cuvinte), fără pronume personale
- corectează gramatica, diacriticele, normalizează cifrele („38 de mii" → „38.000")
- NU inventa cifre, denumiri sau responsabilități noi; păstrează EXACT faptele
- o linie deja corectă rămâne neschimbată

EXEMPLE:
- "Coordonat echipa de 3 colegi" → "Coordonarea unei echipe de 3 colegi"
- "am implementat un sistem nou de inventar" → "Implementarea unui sistem nou de inventar"
- "raspundeam de receptia marfii" → "Recepția și verificarea mărfii"`;

const BATCH_SYSTEM_EN = `You turn job responsibilities written colloquially or telegraphically by a user into professional CV bullet points in GERUND (noun) FORM, in English.

You receive a JSON array of lines. You return an array with EXACTLY the same number of lines, in the same order, each one rewritten.

GOLDEN RULE — the gerund form is MANDATORY for every line:
- opens with the -ing form of the action verb ("Coordinating", "Managing", "Preparing", "Verifying"...), NEVER with a past participle ("Coordinated") and never in the first person
- the object follows naturally and grammatically: "Coordinating a team of 3 colleagues"
- one idea per line, concise (max ~22 words), no personal pronouns
- correct the grammar and spelling, normalise figures ("38 thousand" → "38,000")
- do NOT invent figures, names or new responsibilities; keep EXACTLY the facts
- a line that is already correct stays unchanged

EXAMPLES:
- "Coordinated a team of 3 colleagues" → "Coordinating a team of 3 colleagues"
- "I implemented a new inventory system" → "Implementing a new inventory system"
- "was in charge of receiving goods" → "Receiving and checking incoming goods"`;

/**
 * Rescrierea în bloc a responsabilităților manuale (kind="cv-bullets"):
 * UN singur apel de model pentru toate liniile — atomic (ori toate rescrise,
 * ori apelantul păstrează originalele), o singură unitate de rate-limit.
 */
async function handleBatch(lines: unknown, language: Locale = "ro"): Promise<NextResponse> {
  if (!Array.isArray(lines) || lines.length === 0 || lines.length > 20) {
    return NextResponse.json({ error: "Între 1 și 20 de linii." }, { status: 400 });
  }
  const clean = lines.map((l) => String(l ?? "").trim()).filter(Boolean);
  if (clean.length === 0 || clean.some((l) => l.length > 300)) {
    return NextResponse.json({ error: "Linii goale sau prea lungi (max 300)." }, { status: 400 });
  }
  const result = await callStructured<{ corrected: string[] }>({
    stage: "correct-cv-bullets-batch",
    systemPrompt: language === "en" ? BATCH_SYSTEM_EN : BATCH_SYSTEM,
    userContent: JSON.stringify(clean),
    schemaName: "bullets_correction",
    jsonSchema: BATCH_SCHEMA,
    model: "gpt-5.4-mini",
    maxCompletionTokens: 4096,
  });
  const corrected = result.corrected?.map((c) => String(c ?? "").trim());
  // plasă de siguranță: numărul de linii trebuie să se conserve exact
  if (!corrected || corrected.length !== clean.length || corrected.some((c) => !c)) {
    return NextResponse.json({ corrected: clean, rewritten: false });
  }
  return NextResponse.json({ corrected, rewritten: true });
}

export async function POST(req: Request) {
  let text = "";
  try {
    // apeluri mici și dese — limită generoasă
    const limit = await checkRateLimit(clientIp(req), "correct-text", 120, 60 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Prea multe corectări. Încearcă mai târziu." },
        { status: 429 }
      );
    }

    const body = await readJsonLimited<Record<string, unknown>>(req, BODY_LIMITS.TEXT);
    const kindRaw = String(body.kind ?? "");
    const language = toLocale(body.language);
    if (kindRaw === "cv-bullets") {
      return await handleBatch(body.lines, language);
    }
    text = String(body.text ?? "").trim();
    const kind = kindRaw as Kind;

    if (!text) {
      return NextResponse.json({ error: "Text gol." }, { status: 400 });
    }
    if (text.length > 300) {
      return NextResponse.json({ error: "Text prea lung (max 300)." }, { status: 400 });
    }
    if (!SYSTEM_PROMPTS[kind]) {
      return NextResponse.json({ error: "Kind invalid." }, { status: 400 });
    }

    const result = await callStructured<{ corrected: string }>({
      stage: `correct-${kind}`,
      sessionId: null,
      systemPrompt: language === "en" ? SYSTEM_PROMPTS_EN[kind] : SYSTEM_PROMPTS[kind],
      userContent: text,
      schemaName: "text_correction",
      jsonSchema: SCHEMA,
      model: MODEL_BY_KIND[kind] ?? CORRECT_MODEL,
      maxCompletionTokens: 2048,
    });

    const corrected = result.corrected?.trim();
    // plasă de siguranță: dacă modelul returnează gol sau ceva absurd de lung,
    // păstrăm textul original — corectarea nu are voie să strice datele userului
    if (!corrected || corrected.length > text.length * 3 + 20) {
      return NextResponse.json({ corrected: text });
    }
    return NextResponse.json({ corrected });
  } catch (e) {
    // corectarea e best-effort: la orice eroare returnăm textul original
    if (e instanceof StructuredCallError) {
      console.warn(`[correct-text] ${e.message}`);
      await recordApiError("/api/ai/correct-text", 502, e);
    }
    if (text) return NextResponse.json({ corrected: text });
    return NextResponse.json({ error: "Eroare." }, { status: 500 });
  }
}
