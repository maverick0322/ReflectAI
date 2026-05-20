import { buildOwnedNextQuestionsResult } from '@/lib/ai/session';
import {
  buildSuccessResponse,
  enforceRateLimit,
  enforceTrustedMutationOrigin,
  parseJsonBody,
  requireAuthenticatedUser,
  toRouteErrorResponse,
} from '@/lib/api/route';
import { apiMessages } from '@/lib/copy/api';
import { nextQuestionSchema } from '@/lib/validations/ai';

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
    const data = await buildOwnedNextQuestionsResult(
      supabase,
      user,
      nextQuestionRequest.sessionId,
      nextQuestionRequest.questionIds,
    );

    return buildSuccessResponse({
      data,
      ...(data.done ? { message: apiMessages.ai.nextQuestionDone } : {}),
    });
  } catch (error: unknown) {
    return toRouteErrorResponse(
      error,
      apiMessages.ai.nextQuestionUnexpected,
      'ai next question failed',
    );
  }
}
