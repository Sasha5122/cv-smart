import { NextResponse } from "next/server";
import { runRecruiterQuestions } from "@/lib/cv-pipeline/stages";
import { checkRateLimit, clientIp } from "@/lib/cv-pipeline/rate-limit";
import {
  createPipelineSession,
  updatePipelineSession,
} from "@/lib/cv-pipeline/store";
import { PIPELINE_PROD_CONFIG, StructuredCallError } from "@/lib/openai";

export const maxDuration = 60;

/**
 * Etapa 1 — Extraction & Gap Analysis.
 * Creează o sesiune de pipeline, rulează extracția și returnează întrebările.
 */
export async function POST(req: Request) {
  try {
    // max 10 sesiuni de pipeline / oră / IP
    const limit = checkRateLimit(clientIp(req), "cv-analyze", 10, 60 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: `Ai atins limita de analize pe oră. Încearcă din nou în ${Math.ceil(limit.retryAfterSeconds / 60)} minute.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const jobTitle = String(body.jobTitle ?? "").trim();
    const company = body.company ? String(body.company).trim() : undefined;
    const period = body.period ? String(body.period).trim() : undefined;
    const industry = body.industry ? String(body.industry).trim() : undefined;
    const yearsExperience =
      body.yearsExperience != null ? Number(body.yearsExperience) : undefined;
    const rawText = String(body.rawText ?? "").trim();
    const jobDescription = body.jobDescription
      ? String(body.jobDescription).trim()
      : undefined;
    const wizardSessionId = body.wizardSessionId
      ? String(body.wizardSessionId)
      : null;

    if (!jobTitle) {
      return NextResponse.json(
        { error: "Titlul jobului este obligatoriu." },
        { status: 400 }
      );
    }
    // singura validare cerută: userul să fi scris măcar ceva
    if (rawText.length === 0) {
      return NextResponse.json(
        { error: "Scrie măcar câteva cuvinte despre ce faci la job." },
        { status: 400 }
      );
    }
    // plasă de siguranță tehnică (nu limită de produs): paste-bomb protection
    if (rawText.length > 20000) {
      return NextResponse.json(
        { error: "Descrierea e neobișnuit de lungă — păstrează esențialul." },
        { status: 400 }
      );
    }

    // 1) Creăm sesiunea întâi — dacă persistența pică, eșuăm fără cost AI.
    const sessionId = await createPipelineSession({
      wizard_session_id: wizardSessionId,
      job_title: jobTitle,
      company: company ?? null,
      period: period ?? null,
      industry: industry ?? null,
      years_experience: yearsExperience ?? null,
      raw_text: rawText,
      job_description: jobDescription ?? null,
    });

    // 2) Apel #1 — întrebările recrutorului; salvăm rezultatul.
    const questions = await runRecruiterQuestions(
      { jobTitle, company, period, industry, yearsExperience, rawText, jobDescription },
      { config: PIPELINE_PROD_CONFIG.call1 }
    );

    await updatePipelineSession(sessionId, {
      extraction_result: { questions },
    });

    return NextResponse.json({ sessionId, questions });
  } catch (e) {
    if (e instanceof StructuredCallError) {
      return NextResponse.json(
        { error: "Analiza AI a eșuat momentan. Încearcă din nou." },
        { status: 502 }
      );
    }
    console.error("[cv/analyze]", e);
    return NextResponse.json(
      { error: "Eroare neașteptată. Încearcă din nou." },
      { status: 500 }
    );
  }
}
