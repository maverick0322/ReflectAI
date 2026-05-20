import {
  buildSuccessResponse,
  enforceRateLimit,
  enforceTrustedMutationOrigin,
  parseJsonBody,
  toRouteErrorResponse,
} from '@/lib/api/route';
import { sendPasswordRecoveryEmail } from '@/lib/auth/session';
import { apiMessages } from '@/lib/copy/api';
import { recoverPasswordSchema } from '@/lib/validations/auth';

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

    await sendPasswordRecoveryEmail(recoveryRequest.email, request.url);

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
