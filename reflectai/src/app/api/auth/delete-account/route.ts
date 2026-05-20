import {
  buildSuccessResponse,
  enforceRateLimit,
  enforceTrustedMutationOrigin,
  parseJsonBody,
  requireAuthenticatedUser,
  toRouteErrorResponse,
} from '@/lib/api/route';
import { deleteAuthenticatedAccount } from '@/lib/auth/session';
import { apiMessages } from '@/lib/copy/api';
import { deleteAccountSchema } from '@/features/auth/schemas/auth';

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

    await deleteAuthenticatedAccount(
      supabase,
      user,
      accountDeletion.currentPassword,
    );

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
