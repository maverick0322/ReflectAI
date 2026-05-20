import {
  buildSuccessResponse,
  enforceTrustedMutationOrigin,
  parseJsonBody,
  requireAuthenticatedUser,
  toRouteErrorResponse,
} from '@/lib/api/route';
import { apiMessages } from '@/lib/copy/api';
import { completeReflectionSessionRecord } from '@/lib/reflection/sessionService';
import { completeReflectionSessionSchema } from '@/lib/validations/reflection';

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

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
    const data = await completeReflectionSessionRecord(supabase, user, {
      sessionId: id,
      title: completionRequest.title,
      metadataPatch: completionRequest.metadataPatch,
    });

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
