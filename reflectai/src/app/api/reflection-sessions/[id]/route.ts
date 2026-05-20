import {
  buildSuccessResponse,
  requireAuthenticatedUser,
  throwRouteError,
  toRouteErrorResponse,
} from '@/lib/api/route';
import { apiMessages } from '@/lib/copy/api';

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { supabase, user } = await requireAuthenticatedUser();

    const { data, error } = await supabase
      .from('reflection_sessions')
      .select('id, title, status, started_at, completed_at, payload, ai_analysis')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      throwRouteError(404, apiMessages.reflection.detailFailed);
    }

    return buildSuccessResponse({
      data,
      message: apiMessages.reflection.detailSucceeded,
    });
  } catch (error: unknown) {
    return toRouteErrorResponse(
      error,
      apiMessages.reflection.detailUnexpected,
      'reflection session detail failed',
    );
  }
}
