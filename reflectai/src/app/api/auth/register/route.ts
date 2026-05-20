import { registerSchema } from '@/features/auth/schemas/auth';
import {
  buildSuccessResponse,
  parseJsonBody,
  toRouteErrorResponse,
} from '@/lib/api/route';
import { registerAuthUser } from '@/lib/auth/register';
import { apiMessages } from '@/lib/copy/api';

export async function POST(request: Request) {
  try {
    const registerInput = await parseJsonBody({
      request,
      schema: registerSchema,
      mapInput: (body) => ({
        ...(typeof body === 'object' && body !== null ? body : {}),
        confirmEmail:
          typeof body === 'object' && body !== null
            ? (body as Record<string, unknown>).email
            : undefined,
        confirmPassword:
          typeof body === 'object' && body !== null
            ? (body as Record<string, unknown>).password
            : undefined,
      }),
      invalidMessage: apiMessages.auth.invalidRegisterData,
    });
    const { fullName, user } = await registerAuthUser(registerInput);

    return buildSuccessResponse(
      {
        data: {
          id: user.id,
          email: user.email,
          fullName,
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
