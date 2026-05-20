import {
  buildSuccessResponse,
  enforceTrustedMutationOrigin,
  toRouteErrorResponse,
} from '@/lib/api/route';
import { signOutCurrentSession } from '@/lib/auth/session';
import { apiMessages } from '@/lib/copy/api';

export async function POST(request: Request) {
  try {
    enforceTrustedMutationOrigin(request);

    await signOutCurrentSession();

    return buildSuccessResponse({
      message: apiMessages.auth.logoutSucceeded,
    });
  } catch (error: unknown) {
    return toRouteErrorResponse(
      error,
      apiMessages.auth.logoutUnexpected,
      'auth logout failed',
    );
  }
}
