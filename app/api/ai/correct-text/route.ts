import { NextResponse } from "next/server";
import { callStructured, StructuredCallError } from "@/lib/openai";
import { checkRateLimit, clientIp } from "@/lib/cv-pipeline/rate-limit";
import { readJsonLimited, BODY_LIMITS } from "@/lib/http-guards";

export const maxDuration = 30;

/**
 * Corectare ieftină de text (gpt-5.4-nano, ~0.01 bani/apel):
 * gramatică + diacritice + majuscule, FĂRĂ schimbare de sens.
 * Folosit la: titlul jobului, localitate, hobby-uri.
 */
const CORRECT_MODEL = "gpt-5.4-nano";

type Kind = "job-title" | "city" | "hobby";

const SYSTEM_PROMPTS: Record<Kind, string> = {
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

const SCHEMA = {
  type: "object",
  properties: { corrected: { type: "string" } },
  required: ["corrected"],
  additionalProperties: false,
};

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
    text = String(body.text ?? "").trim();
    const kind = String(body.kind ?? "") as Kind;

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
      systemPrompt: SYSTEM_PROMPTS[kind],
      userContent: text,
      schemaName: "text_correction",
      jsonSchema: SCHEMA,
      model: CORRECT_MODEL,
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
    }
    if (text) return NextResponse.json({ corrected: text });
    return NextResponse.json({ error: "Eroare." }, { status: 500 });
  }
}
