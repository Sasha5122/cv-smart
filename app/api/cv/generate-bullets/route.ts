import { NextResponse } from "next/server";
import {
  InsufficientBulletsError,
  runBulletsFromContext,
} from "@/lib/cv-pipeline/stages";
import { checkRateLimit, clientIp } from "@/lib/cv-pipeline/rate-limit";
import { readJsonLimited, BODY_LIMITS } from "@/lib/http-guards";
import {
  getPipelineSession,
  updatePipelineSession,
} from "@/lib/cv-pipeline/store";
import { PIPELINE_PROD_CONFIG, StructuredCallError } from "@/lib/openai";
import type { QuestionAnswer } from "@/lib/types/cv-pipeline";

export const maxDuration = 90;

/**
 * Apel #2 — cele 7 bullet points, din contextul UNIC:
 * descrierea originală + întrebările recrutorului + răspunsurile userului
 * (+ anunțul, dacă există). Salvează răspunsurile și bullet-urile.
 *
 * Idempotent: aceleași răspunsuri + bullets existente → returnează salvat.
 * `force: true` regenerează complet.
 */
export async function POST(req: Request) {
  try {
    const limit = await checkRateLimit(clientIp(req), "cv-ai", 60, 60 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Prea multe cereri. Încearcă din nou în câteva minute." },
        { status: 429 }
      );
    }

    const body = await readJsonLimited<Record<string, unknown>>(req, BODY_LIMITS.CV_DATA);
    const sessionId = String(body.sessionId ?? "");
    const force = Boolean(body.force);
    const incomingAnswers = (body.answers ?? null) as QuestionAnswer[] | null;

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId lipsă." }, { status: 400 });
    }

    const session = await getPipelineSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Sesiunea nu a fost găsită." },
        { status: 404 }
      );
    }

    const questions = session.extraction_result?.questions;
    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { error: "Sesiunea nu are întrebările generate. Reia de la început." },
        { status: 409 }
      );
    }

    // răspunsurile: cele trimise acum sau cele salvate anterior (resume)
    const answers = incomingAnswers ?? session.user_answers ?? [];

    // Nu re-rula: aceleași răspunsuri + bullets deja generate.
    if (
      session.generated_bullets &&
      !force &&
      JSON.stringify(session.user_answers) === JSON.stringify(answers)
    ) {
      return NextResponse.json({
        bullets: session.generated_bullets,
        resumed: true,
      });
    }

    if (incomingAnswers) {
      await updatePipelineSession(sessionId, {
        user_answers: incomingAnswers,
        stage: "answered",
      });
    }

    const answerByQuestionId = new Map(
      answers.map((a) => [a.questionId, a.answer ?? ""])
    );
    const interview = questions.map((q) => ({
      question: q.question,
      answer: answerByQuestionId.get(q.id) ?? "",
    }));

    const result = await runBulletsFromContext(
      {
        jobTitle: session.job_title,
        company: session.company ?? undefined,
        period: session.period ?? undefined,
        rawText: session.raw_text,
        interview,
        jobDescription: session.job_description ?? undefined,
      },
      { config: PIPELINE_PROD_CONFIG.call2 }
    );

    await updatePipelineSession(sessionId, {
      generated_bullets: result.bullets,
      stage: "generated",
    });

    return NextResponse.json({
      bullets: result.bullets,
      regenerated: result.regenerated,
      droppedCount: result.dropped.length,
    });
  } catch (e) {
    if (e instanceof InsufficientBulletsError) {
      return NextResponse.json(
        {
          error:
            "Nu am putut genera suficiente descrieri valide. Reîncearcă generarea.",
          canRetry: true,
        },
        { status: 422 }
      );
    }
    if (e instanceof StructuredCallError) {
      return NextResponse.json(
        { error: "Generarea AI a eșuat momentan. Încearcă din nou." },
        { status: 502 }
      );
    }
    console.error("[cv/generate-bullets]", e);
    return NextResponse.json(
      { error: "Eroare neașteptată. Încearcă din nou." },
      { status: 500 }
    );
  }
}
