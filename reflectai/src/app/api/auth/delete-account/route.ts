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
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { deleteAccountSchema } from '@/lib/validations/auth';

export async function DELETE(request: Request) {
  try {
    enforceTrustedMutationOrigin(request);
    enforceRateLimit(request, {
      key: 'auth:delete-account',
      maxRequests: 3,
      windowMs: 15 * 60 * 1000,
    });

    const accountDeletion = await parseJsonBody({
      request,
      schema: deleteAccountSchema,
    });

    const { supabase, user } = await requireAuthenticatedUser();
    enforceRateLimit(request, {
      key: 'auth:delete-account:user',
      identifier: user.id,
      maxRequests: 2,
      windowMs: 15 * 60 * 1000,
    });

    if (!user.email) {
      throwRouteError(400, apiMessages.auth.passwordCurrentValidationFailed);
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: accountDeletion.currentPassword,
    });

    if (signInError) {
      throwRouteError(400, apiMessages.auth.passwordCurrentIncorrect);
    }

    const adminClient = createAdminSupabaseClient();
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);

    if (deleteError) {
      throwRouteError(500, apiMessages.auth.deleteAccountFailed);
    }

    await supabase.auth.signOut();

    return buildSuccessResponse({
      message: apiMessages.auth.deleteAccountSucceeded,
    });
  } catch (error: unknown) {
    return toRouteErrorResponse(
      error,
      apiMessages.auth.deleteAccountUnexpected,
      'auth delete account failed',
    );
  }
}
