import { generateNextQuestion } from '@/lib/ai/nextQuestion';
import {
  buildSuccessResponse,
  enforceRateLimit,
  enforceTrustedMutationOrigin,
  parseJsonBody,
  requireAuthenticatedUser,
  throwRouteError,
  toRouteErrorResponse,
} from '@/lib/api/route';
import { apiMessages } from '@/lib/copy/api';
import { getNextQuestionId, getQuestionText } from '@/lib/reflection/questionFlow';
import { normalizePayload } from '@/lib/reflection/payload';
import { nextQuestionSchema } from '@/lib/validations/ai';

type QuestionId = Parameters<typeof getQuestionText>[0];

async function buildQuestionResult(
  payload: ReturnType<typeof normalizePayload>,
  questionId: QuestionId,
) {
  try {
    return {
      questionId,
      questionText: await generateNextQuestion(payload, questionId),
      aiGenerated: true,
    };
  } catch (error: unknown) {
    void error;
    return {
      questionId,
      questionText: getQuestionText(questionId),
      aiGenerated: false,
    };
  }
}

export async function POST(request: Request) {
  try {
    enforceTrustedMutationOrigin(request);
    enforceRateLimit(request, {
      key: 'ai:next-question',
      maxRequests: 30,
      windowMs: 60 * 60 * 1000,
    });

    const nextQuestionRequest = await parseJsonBody({
      request,
      schema: nextQuestionSchema,
      invalidMessage: apiMessages.ai.invalidNextQuestionData,
    });
    const { supabase, user } = await requireAuthenticatedUser();

    const { data: session, error } = await supabase
      .from('reflection_sessions')
      .select('id, payload, started_at')
      .eq('id', nextQuestionRequest.sessionId)
      .eq('user_id', user.id)
      .single();

    if (error || !session) {
      throwRouteError(404, apiMessages.ai.sessionNotFound);
    }

    const payload = normalizePayload(
      session.payload,
      session.started_at ?? new Date().toISOString(),
    );
    const requestedQuestionIds = nextQuestionRequest.questionIds;
    const nextQuestionId = requestedQuestionIds?.[0] ?? getNextQuestionId(payload.responses);

    if (!nextQuestionId) {
      return buildSuccessResponse({
        data: { done: true },
        message: apiMessages.ai.nextQuestionDone,
      });
    }

    const questionIds = requestedQuestionIds ?? [nextQuestionId];
    const questions = await Promise.all(
      questionIds.map((questionId) => buildQuestionResult(payload, questionId)),
    );
    const primaryQuestion = questions[0];

    return buildSuccessResponse({
      data: {
        done: false,
        questionId: primaryQuestion.questionId,
        questionText: primaryQuestion.questionText,
        aiGenerated: primaryQuestion.aiGenerated,
        questions,
      },
    });
  } catch (error: unknown) {
    return toRouteErrorResponse(
      error,
      apiMessages.ai.nextQuestionUnexpected,
      'ai next question failed',
    );
  }
}
