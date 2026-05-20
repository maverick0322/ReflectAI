import {
  buildSuccessResponse,
  enforceRateLimit,
  enforceTrustedMutationOrigin,
  parseJsonBody,
  toRouteErrorResponse,
} from '@/lib/api/route';
import { registerAuthUser } from '@/lib/auth/register';
import { apiMessages } from '@/lib/copy/api';
import { registerSchema } from '@/lib/validations/auth';

export async function POST(request: Request) {
  try {
    enforceTrustedMutationOrigin(request);
    enforceRateLimit(request, {
      key: 'auth:register',
      maxRequests: 5,
      windowMs: 60 * 60 * 1000,
    });

    const registration = await parseJsonBody({
      request,
      schema: registerSchema,
      invalidMessage: apiMessages.auth.invalidRegisterData,
      mapInput: (body) => ({
        ...(typeof body === 'object' && body !== null ? body : {}),
        confirmEmail:
          typeof body === 'object' && body !== null
            ? (body as { email?: unknown }).email
            : undefined,
        confirmPassword:
          typeof body === 'object' && body !== null
            ? (body as { password?: unknown }).password
            : undefined,
      }),
    });

    enforceRateLimit(request, {
      key: 'auth:register:account',
      identifier: registration.email,
      maxRequests: 3,
      windowMs: 60 * 60 * 1000,
    });

    const result = await registerAuthUser(registration);

    return buildSuccessResponse(
      {
        data: {
          id: result.user?.id,
          email: result.user?.email,
          fullName: result.fullName,
        },
        message: apiMessages.auth.registerSucceeded,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    return toRouteErrorResponse(
      error,
      apiMessages.auth.registerUnexpected,
      'auth register failed',
    );
  }
}
