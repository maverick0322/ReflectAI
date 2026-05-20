import {
  buildSuccessResponse,
  enforceTrustedMutationOrigin,
  parseJsonBody,
  requireAuthenticatedUser,
  throwRouteError,
  toRouteErrorResponse,
} from '@/lib/api/route';
import { apiMessages } from '@/lib/copy/api';
import { appendResponse, applyMetadataPatch, normalizePayload } from '@/lib/reflection/payload';
import { addReflectionResponseSchema } from '@/lib/validations/reflection';

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, { params }: RouteParams) {
  try {
    enforceTrustedMutationOrigin(request);
    const { id } = await params;
    const { supabase, user } = await requireAuthenticatedUser();
    const responseRequest = await parseJsonBody({
      request,
      schema: addReflectionResponseSchema,
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
      throwRouteError(409, apiMessages.reflection.responseAlreadyCompleted);
    }

    const currentPayload = normalizePayload(
      session.payload,
      session.started_at ?? new Date().toISOString(),
    );

    const updatedPayload = applyMetadataPatch(
      appendResponse(currentPayload, responseRequest.response),
      responseRequest.metadataPatch,
    );

    const { data, error } = await supabase
      .from('reflection_sessions')
      .update({
        payload: updatedPayload,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id, title, status, started_at, completed_at, payload, ai_analysis')
      .single();

    if (error) {
      throwRouteError(500, apiMessages.reflection.responseFailed);
    }

    return buildSuccessResponse(
      {
        data,
        message: apiMessages.reflection.responseSucceeded,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    return toRouteErrorResponse(
      error,
      apiMessages.reflection.responseUnexpected,
      'reflection response create failed',
    );
  }
}
