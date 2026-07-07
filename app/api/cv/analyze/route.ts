import { NextResponse } from "next/server";
import { runRecruiterQuestions } from "@/lib/cv-pipeline/stages";
import { checkRateLimit, clientIp } from "@/lib/cv-pipeline/rate-limit";
import {
  createPipelineSession,
  updatePipelineSession,
} from "@/lib/cv-pipeline/store";
import { StructuredCallError } from "@/lib/openai";

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
    if (rawText.length < 200) {
      return NextResponse.json(
        {
          error: `Descrierea e prea scurtă (${rawText.length}/200 caractere minim). Povestește mai mult despre ce faci la job.`,
        },
        { status: 400 }
      );
    }
    if (rawText.length > 5000) {
      return NextResponse.json(
        { error: "Descrierea e prea lungă (max 5000 caractere)." },
        { status: 400 }
      );
    }

    // 1) Creăm sesiunea întâi — dacă persistența pică, eșuăm fără cost AI.
    const sessionId = await createPipelineSession({
      wizard_session_id: wizardSessionId,
      job_title: jobTitle,
      industry: industry ?? null,
      years_experience: yearsExperience ?? null,
      raw_text: rawText,
      job_description: jobDescription ?? null,
    });

    // 2) Apel #1 — întrebările recrutorului; salvăm rezultatul.
    const questions = await runRecruiterQuestions({
      jobTitle,
      industry,
      yearsExperience,
      rawText,
      jobDescription,
    });

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
