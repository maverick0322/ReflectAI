import {
  buildSuccessResponse,
  enforceRateLimit,
  enforceTrustedMutationOrigin,
  parseJsonBody,
  throwRouteError,
  toRouteErrorResponse,
} from '@/lib/api/route';
import { apiMessages } from '@/lib/copy/api';
import { createServerSupabaseClient } from '@/lib/supabase/server';
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

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(
      recoveryConfirmation.code,
    );

    if (error || !data.session) {
      throwRouteError(400, apiMessages.auth.confirmRecoveryFailed);
    }

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
