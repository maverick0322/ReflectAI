import {
  buildSuccessResponse,
  enforceRateLimit,
  enforceTrustedMutationOrigin,
  parseJsonBody,
  throwRouteError,
  toRouteErrorResponse,
} from '@/lib/api/route';
import { apiMessages } from '@/lib/copy/api';
import { logServerError } from '@/lib/monitoring/logger';
import { getTrustedSiteOrigin } from '@/lib/security/origin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { recoverPasswordSchema } from '@/lib/validations/auth';

function buildRedirectUrl(requestUrl: string) {
  const baseUrl = getTrustedSiteOrigin(requestUrl);
  const callbackUrl = new URL('/auth/callback', baseUrl);
  callbackUrl.searchParams.set('next', '/cambiar-contrasena?mode=recovery');
  return callbackUrl.toString();
}

export async function POST(request: Request) {
  try {
    enforceTrustedMutationOrigin(request);
    enforceRateLimit(request, {
      key: 'auth:recover',
      maxRequests: 5,
      windowMs: 15 * 60 * 1000,
    });

    const recoveryRequest = await parseJsonBody({
      request,
      schema: recoverPasswordSchema,
    });

    enforceRateLimit(request, {
      key: 'auth:recover:account',
      identifier: recoveryRequest.email,
      maxRequests: 3,
      windowMs: 15 * 60 * 1000,
    });

    const supabase = await createServerSupabaseClient();
    const redirectTo = buildRedirectUrl(request.url);
    const { error } = await supabase.auth.resetPasswordForEmail(recoveryRequest.email, {
      redirectTo,
    });

    if (error) {
      logServerError('Supabase password recovery failed', error);
      const normalizedMessage = error.message.toLowerCase();
      const isRateLimited =
        normalizedMessage.includes('rate limit') ||
        normalizedMessage.includes('security purposes');
      const isEmailDeliveryError = normalizedMessage.includes('error sending');

      throwRouteError(
        isRateLimited ? 429 : 500,
        isRateLimited
          ? apiMessages.auth.recoverRateLimited
          : isEmailDeliveryError
            ? apiMessages.auth.recoverEmailDeliveryFailed
            : apiMessages.auth.recoverFailed,
      );
    }

    return buildSuccessResponse({
      message: apiMessages.auth.recoverLinkSent,
    });
  } catch (error: unknown) {
    return toRouteErrorResponse(
      error,
      apiMessages.auth.recoverUnexpected,
      'auth recover failed',
    );
  }
}
