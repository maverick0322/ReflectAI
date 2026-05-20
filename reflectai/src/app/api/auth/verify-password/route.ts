import { step1Schema } from '@/features/auth/components/changePasswordSchemas';
import {
  buildSuccessResponse,
  enforceRateLimit,
  enforceTrustedMutationOrigin,
  parseJsonBody,
  requireAuthenticatedUser,
  toRouteErrorResponse,
} from '@/lib/api/route';
import { verifyAuthenticatedPassword } from '@/lib/auth/session';
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

    await verifyAuthenticatedPassword(
      supabase,
      user,
      verificationRequest.currentPassword,
    );

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
