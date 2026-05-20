import {
  buildSuccessResponse,
  enforceTrustedMutationOrigin,
  parseJsonBody,
  requireAuthenticatedUser,
  toRouteErrorResponse,
} from '@/lib/api/route';
import { apiMessages } from '@/lib/copy/api';
import { addReflectionResponseRecord } from '@/lib/reflection/sessionService';
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
    const data = await addReflectionResponseRecord(
      supabase,
      user,
      id,
      responseRequest.response,
      responseRequest.metadataPatch,
    );

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
