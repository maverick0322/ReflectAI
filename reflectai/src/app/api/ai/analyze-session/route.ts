import {
  buildSuccessResponse,
  enforceRateLimit,
  enforceTrustedMutationOrigin,
  parseJsonBody,
  requireAuthenticatedUser,
  throwRouteError,
  toRouteErrorResponse,
} from '@/lib/api/route';
import {
  analyzeReflectionSession,
  buildFallbackAnalysis,
} from '@/lib/ai/reflectionAnalysis';
import { apiMessages } from '@/lib/copy/api';
import { normalizePayload } from '@/lib/reflection/payload';
import { analyzeSessionSchema } from '@/lib/validations/ai';

async function generateSessionAnalysis(payload: ReturnType<typeof normalizePayload>) {
  try {
    return (await analyzeReflectionSession(payload)) ?? buildFallbackAnalysis(payload);
  } catch (error: unknown) {
    void error;
    return buildFallbackAnalysis(payload);
  }
}

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

    const { data: session, error } = await supabase
      .from('reflection_sessions')
      .select('id, payload, started_at')
      .eq('id', analyzeRequest.sessionId)
      .eq('user_id', user.id)
      .single();

    if (error || !session) {
      throwRouteError(404, apiMessages.ai.sessionNotFound);
    }

    const payload = normalizePayload(
      session.payload,
      session.started_at ?? new Date().toISOString(),
    );
    const analysis = await generateSessionAnalysis(payload);

    const { data, error: updateError } = await supabase
      .from('reflection_sessions')
      .update({
        ai_analysis: analysis,
      })
      .eq('id', analyzeRequest.sessionId)
      .eq('user_id', user.id)
      .select('id, ai_analysis')
      .single();

    if (updateError || !data) {
      throwRouteError(500, apiMessages.ai.analyzeFailed);
    }

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
