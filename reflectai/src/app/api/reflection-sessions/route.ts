import {
  buildSuccessResponse,
  enforceTrustedMutationOrigin,
  parseJsonBody,
  requireAuthenticatedUser,
  throwRouteError,
  toRouteErrorResponse,
} from '@/lib/api/route';
import { apiMessages } from '@/lib/copy/api';
import { buildInitialPayload } from '@/lib/reflection/payload';
import { createReflectionSessionSchema } from '@/lib/validations/reflection';

export async function POST(request: Request) {
  try {
    enforceTrustedMutationOrigin(request);
    const { supabase, user } = await requireAuthenticatedUser();
    const sessionRequest = await parseJsonBody({
      request,
      schema: createReflectionSessionSchema,
    });
    const startedAt = new Date().toISOString();
    const payload = buildInitialPayload(startedAt);

    const { data, error } = await supabase
      .from('reflection_sessions')
      .insert({
        user_id: user.id,
        title: sessionRequest.title ?? null,
        status: 'draft',
        started_at: startedAt,
        payload,
        ai_analysis: {},
      })
      .select('id, title, status, started_at, completed_at, payload, ai_analysis')
      .single();

    if (error) {
      throwRouteError(500, apiMessages.reflection.createFailed);
    }

    return buildSuccessResponse(
      {
        data,
        message: apiMessages.reflection.createSucceeded,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    return toRouteErrorResponse(
      error,
      apiMessages.reflection.createUnexpected,
      'reflection session create failed',
    );
  }
}

export async function GET() {
  try {
    const { supabase, user } = await requireAuthenticatedUser();

    const { data, error } = await supabase
      .from('reflection_sessions')
      .select('id, title, status, started_at, completed_at, payload, ai_analysis')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false });

    if (error) {
      throwRouteError(500, apiMessages.reflection.listFailed);
    }

    return buildSuccessResponse({
      data,
      message: apiMessages.reflection.listSucceeded,
    });
  } catch (error: unknown) {
    return toRouteErrorResponse(
      error,
      apiMessages.reflection.listUnexpected,
      'reflection session list failed',
    );
  }
}
