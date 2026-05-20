import {
  buildSuccessResponse,
  enforceRateLimit,
  enforceTrustedMutationOrigin,
  parseJsonBody,
  toRouteErrorResponse,
} from '@/lib/api/route';
import { authenticateUser } from '@/lib/auth/session';
import { apiMessages } from '@/lib/copy/api';
import { loginSchema } from '@/lib/validations/auth';

export async function POST(request: Request) {
  try {
    enforceTrustedMutationOrigin(request);
    enforceRateLimit(request, {
      key: 'auth:login',
      maxRequests: 10,
      windowMs: 15 * 60 * 1000,
    });

    const credentials = await parseJsonBody({
      request,
      schema: loginSchema,
    });

    enforceRateLimit(request, {
      key: 'auth:login:account',
      identifier: credentials.email,
      maxRequests: 5,
      windowMs: 15 * 60 * 1000,
    });

    const user = await authenticateUser(credentials.email, credentials.password);

    return buildSuccessResponse({
      data: {
        id: user.id,
        email: user.email,
        userMetadata: user.user_metadata,
      },
      message: apiMessages.auth.loginSucceeded,
    });
  } catch (error: unknown) {
    return toRouteErrorResponse(error, apiMessages.auth.loginUnexpected, 'auth login failed');
  }
}
