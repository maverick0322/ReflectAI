import {
  buildSuccessResponse,
  enforceTrustedMutationOrigin,
  parseJsonBody,
  requireAuthenticatedUser,
  toRouteErrorResponse,
} from '@/lib/api/route';
import { apiMessages } from '@/lib/copy/api';
import {
  createReflectionSessionRecord,
  listReflectionSessionRecords,
} from '@/lib/reflection/sessionService';
import { createReflectionSessionSchema } from '@/lib/validations/reflection';

export async function POST(request: Request) {
  try {
    enforceTrustedMutationOrigin(request);
    const { supabase, user } = await requireAuthenticatedUser();
    const sessionRequest = await parseJsonBody({
      request,
      schema: createReflectionSessionSchema,
    });
    const data = await createReflectionSessionRecord(
      supabase,
      user,
      sessionRequest.title,
    );

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
    const data = await listReflectionSessionRecords(supabase, user);

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
