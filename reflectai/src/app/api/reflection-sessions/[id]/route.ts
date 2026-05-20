import {
  buildSuccessResponse,
  requireAuthenticatedUser,
  toRouteErrorResponse,
} from '@/lib/api/route';
import { apiMessages } from '@/lib/copy/api';
import { getReflectionSessionRecord } from '@/lib/reflection/sessionService';

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { supabase, user } = await requireAuthenticatedUser();
    const data = await getReflectionSessionRecord(supabase, user, id);

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
