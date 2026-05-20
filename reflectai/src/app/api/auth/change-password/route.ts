import {
  buildSuccessResponse,
  enforceRateLimit,
  enforceTrustedMutationOrigin,
  parseJsonBody,
  requireAuthenticatedUser,
  toRouteErrorResponse,
} from '@/lib/api/route';
import { updateAuthenticatedPassword } from '@/lib/auth/session';
import { apiMessages } from '@/lib/copy/api';
import { changePasswordSchema } from '@/lib/validations/auth';

export async function POST(request: Request) {
  try {
    enforceTrustedMutationOrigin(request);
    enforceRateLimit(request, {
      key: 'auth:change-password',
      maxRequests: 6,
      windowMs: 15 * 60 * 1000,
    });

    const passwordChange = await parseJsonBody({
      request,
      schema: changePasswordSchema,
    });

    const { supabase, user } = await requireAuthenticatedUser();
    enforceRateLimit(request, {
      key: 'auth:change-password:user',
      identifier: user.id,
      maxRequests: 4,
      windowMs: 15 * 60 * 1000,
    });

    await updateAuthenticatedPassword(supabase, user, passwordChange);

    return buildSuccessResponse({
      message: apiMessages.auth.passwordUpdated,
    });
  } catch (error: unknown) {
    return toRouteErrorResponse(
      error,
      apiMessages.auth.passwordUpdateUnexpected,
      'auth change password failed',
    );
  }
}
