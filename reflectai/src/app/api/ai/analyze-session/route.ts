import {
  buildSuccessResponse,
  enforceRateLimit,
  enforceTrustedMutationOrigin,
  parseJsonBody,
  requireAuthenticatedUser,
  toRouteErrorResponse,
} from '@/lib/api/route';
import { generateSessionAnalysis } from '@/lib/ai/session';
import { apiMessages } from '@/lib/copy/api';
import {
  loadReflectionSessionPayload,
  saveReflectionSessionAnalysis,
} from '@/lib/reflection/sessionService';
import { analyzeSessionSchema } from '@/lib/validations/ai';

export async function POST(request: Request) {
  try {
    enforceTrustedMutationOrigin(request);
    enforceRateLimit(request, {
      key: 'ai:analyze-session',
      maxRequests: 20,
      windowMs: 60 * 60 * 1000,
    });

    const analyzeRequest = await parseJsonBody({
      request,
      schema: analyzeSessionSchema,
      invalidMessage: apiMessages.ai.invalidAnalyzeSessionData,
    });
    const { supabase, user } = await requireAuthenticatedUser();
    const { payload } = await loadReflectionSessionPayload(
      supabase,
      user,
      analyzeRequest.sessionId,
    );
    const analysis = await generateSessionAnalysis(payload);
    const data = await saveReflectionSessionAnalysis(
      supabase,
      user,
      analyzeRequest.sessionId,
      analysis,
    );

    return buildSuccessResponse({
      data,
      message: apiMessages.ai.analyzeSucceeded,
    });
  } catch (error: unknown) {
    return toRouteErrorResponse(
      error,
      apiMessages.ai.analyzeUnexpected,
      'ai analyze session failed',
    );
  }
}
