import {
  buildSuccessResponse,
  enforceRateLimit,
  enforceTrustedMutationOrigin,
  parseJsonBody,
  throwRouteError,
  toRouteErrorResponse,
} from '@/lib/api/route';
import { apiMessages } from '@/lib/copy/api';
import { logServerError } from '@/lib/monitoring/logger';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { registerSchema } from '@/lib/validations/auth';

function getRegisterErrorMessage(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes('already registered') ||
    normalizedMessage.includes('already exists') ||
    normalizedMessage.includes('already been registered')
  ) {
    return apiMessages.auth.registerDuplicateEmail;
  }

  if (normalizedMessage.includes('rate limit')) {
    return apiMessages.auth.registerRateLimited;
  }

  return apiMessages.auth.registerFailed;
}

function getRegisterErrorField(message: string) {
  return getRegisterErrorMessage(message) === apiMessages.auth.registerDuplicateEmail
    ? 'email'
    : undefined;
}

async function createAuthUser(input: {
  firstName: string;
  lastName?: string | null;
  email: string;
  password: string;
  birthDate: string;
}) {
  const fullName = [input.firstName, input.lastName].filter(Boolean).join(' ');
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm:
      process.env.NODE_ENV !== 'production' &&
      process.env.SUPABASE_AUTO_CONFIRM_EMAIL !== 'false',
    user_metadata: {
      first_name: input.firstName,
      last_name: input.lastName ?? '',
      full_name: fullName,
      birth_date: input.birthDate,
    },
  });

  if (error) {
    logServerError('Supabase register failed', error);
    const normalizedMessage = error.message.toLowerCase();
    const isRateLimited = normalizedMessage.includes('rate limit');
    const isDuplicateEmail =
      normalizedMessage.includes('already registered') ||
      normalizedMessage.includes('already exists') ||
      normalizedMessage.includes('already been registered');

    throwRouteError(
      isRateLimited ? 429 : 400,
      isRateLimited || isDuplicateEmail
        ? getRegisterErrorMessage(error.message)
        : apiMessages.auth.registerFailed,
      {
        field:
          isRateLimited || isDuplicateEmail
            ? getRegisterErrorField(error.message)
            : undefined,
      },
    );
  }

  return {
    fullName,
    user: data.user,
  };
}

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

    const result = await createAuthUser(registration);

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
