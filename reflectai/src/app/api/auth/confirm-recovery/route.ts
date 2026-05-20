import {
  buildSuccessResponse,
  enforceRateLimit,
  enforceTrustedMutationOrigin,
  parseJsonBody,
  toRouteErrorResponse,
} from '@/lib/api/route';
import { confirmPasswordRecovery } from '@/lib/auth/session';
import { apiMessages } from '@/lib/copy/api';
import { confirmRecoverySchema } from '@/lib/validations/auth';

export async function POST(request: Request) {
  try {
    enforceTrustedMutationOrigin(request);
    enforceRateLimit(request, {
      key: 'auth:confirm-recovery',
      maxRequests: 10,
      windowMs: 15 * 60 * 1000,
    });

    const recoveryConfirmation = await parseJsonBody({
      request,
      schema: confirmRecoverySchema,
    });

    await confirmPasswordRecovery(recoveryConfirmation.code);

    return buildSuccessResponse({
      message: apiMessages.auth.confirmRecoverySucceeded,
    });
  } catch (error: unknown) {
    return toRouteErrorResponse(
      error,
      apiMessages.auth.confirmRecoveryUnexpected,
      'auth confirm recovery failed',
    );
  }
}
