import {
  buildSuccessResponse,
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
import { applyMetadataPatch, normalizePayload } from '@/lib/reflection/payload';
import { completeReflectionSessionSchema } from '@/lib/validations/reflection';

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

async function resolveCompletionAnalysis(
  payload: ReturnType<typeof normalizePayload>,
) {
  try {
    return (await analyzeReflectionSession(payload)) ?? buildFallbackAnalysis(payload);
  } catch (error: unknown) {
    void error;
    return buildFallbackAnalysis(payload);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    enforceTrustedMutationOrigin(request);
    const { id } = await params;
    const { supabase, user } = await requireAuthenticatedUser();
    const completionRequest = await parseJsonBody({
      request,
      schema: completeReflectionSessionSchema,
      fallback: {},
    });

    const { data: session, error: sessionError } = await supabase
      .from('reflection_sessions')
      .select('id, status, payload, started_at')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      throwRouteError(404, apiMessages.reflection.detailFailed);
    }

    if (session.status === 'completed') {
      throwRouteError(409, apiMessages.reflection.completeAlreadyCompleted);
    }

    const payload = normalizePayload(
      session.payload,
      session.started_at ?? new Date().toISOString(),
    );

    if (payload.responses.length === 0) {
      throwRouteError(409, apiMessages.reflection.completeMissingResponses);
    }

    const completedAt = new Date().toISOString();
    const payloadWithCompletion = applyMetadataPatch(payload, {
      ...completionRequest.metadataPatch,
      completed_at: completedAt,
    });
    const analysis = await resolveCompletionAnalysis(payloadWithCompletion);
    const serializedAnalysis: Record<string, unknown> = { ...analysis };
    const suggestedTitle = analysis.session_title;

    const updateData: {
      status: 'completed';
      completed_at: string;
      title?: string;
      payload: typeof payload;
      ai_analysis: Record<string, unknown>;
    } = {
      status: 'completed',
      completed_at: completedAt,
      payload: payloadWithCompletion,
      ai_analysis: serializedAnalysis,
    };

    if (completionRequest.title) {
      updateData.title = completionRequest.title;
    } else if (suggestedTitle) {
      updateData.title = suggestedTitle;
    }

    const { data, error } = await supabase
      .from('reflection_sessions')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id, title, status, started_at, completed_at, payload, ai_analysis')
      .single();

    if (error) {
      throwRouteError(500, apiMessages.reflection.completeFailed);
    }

    return buildSuccessResponse({
      data,
      message: apiMessages.reflection.completeSucceeded,
    });
  } catch (error: unknown) {
    return toRouteErrorResponse(
      error,
      apiMessages.reflection.completeUnexpected,
      'reflection session complete failed',
    );
  }
}
