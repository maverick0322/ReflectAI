import { step1Schema } from '@/components/auth/changePasswordSchemas';
import {
  buildSuccessResponse,
  enforceRateLimit,
  enforceTrustedMutationOrigin,
  parseJsonBody,
  requireAuthenticatedUser,
  throwRouteError,
  toRouteErrorResponse,
} from '@/lib/api/route';
import { apiMessages } from '@/lib/copy/api';

export async function POST(request: Request) {
  try {
    enforceTrustedMutationOrigin(request);
    enforceRateLimit(request, {
      key: 'auth:verify-password',
      maxRequests: 8,
      windowMs: 15 * 60 * 1000,
    });

    const verificationRequest = await parseJsonBody({
      request,
      schema: step1Schema,
    });

    const { supabase, user } = await requireAuthenticatedUser();
    enforceRateLimit(request, {
      key: 'auth:verify-password:user',
      identifier: user.id,
      maxRequests: 5,
      windowMs: 15 * 60 * 1000,
    });

    if (!user.email) {
      throwRouteError(400, apiMessages.auth.passwordCurrentValidationFailed);
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: verificationRequest.currentPassword,
    });

    if (signInError) {
      throwRouteError(400, apiMessages.auth.passwordCurrentIncorrect);
    }

    return buildSuccessResponse({
      message: apiMessages.auth.passwordVerified,
    });
  } catch (error: unknown) {
    return toRouteErrorResponse(
      error,
      apiMessages.auth.passwordVerifyUnexpected,
      'auth verify password failed',
    );
  }
}
