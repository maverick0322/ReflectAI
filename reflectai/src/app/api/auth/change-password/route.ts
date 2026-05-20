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
import { logServerError } from '@/lib/monitoring/logger';
import { changePasswordSchema } from '@/lib/validations/auth';

async function verifyCurrentPassword(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedUser>>['supabase'],
  user: Awaited<ReturnType<typeof requireAuthenticatedUser>>['user'],
  currentPassword: string,
) {
  if (!user.email) {
    throwRouteError(400, apiMessages.auth.passwordCurrentValidationFailed);
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (signInError) {
    throwRouteError(400, apiMessages.auth.passwordCurrentIncorrect);
  }
}

function getPasswordUpdateFailure(message: string) {
  const normalizedMessage = message.toLowerCase();
  const missingSession =
    normalizedMessage.includes('session') ||
    normalizedMessage.includes('not authenticated') ||
    normalizedMessage.includes('invalid claim') ||
    normalizedMessage.includes('missing sub');
  const samePassword =
    normalizedMessage.includes('same password') ||
    normalizedMessage.includes('should be different');

  if (missingSession) {
    return {
      status: 400,
      message: apiMessages.auth.passwordRecoverySessionInvalid,
    };
  }

  if (samePassword) {
    return {
      status: 400,
      message: apiMessages.auth.passwordMustDiffer,
    };
  }

  return {
    status: 500,
    message: apiMessages.auth.passwordUpdateFailed,
  };
}

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

    if (passwordChange.currentPassword) {
      await verifyCurrentPassword(supabase, user, passwordChange.currentPassword);
    }

    const { error } = await supabase.auth.updateUser({
      password: passwordChange.newPassword,
    });

    if (error) {
      logServerError('Supabase change password failed', error);
      const failure = getPasswordUpdateFailure(error.message);
      throwRouteError(failure.status, failure.message);
    }

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
