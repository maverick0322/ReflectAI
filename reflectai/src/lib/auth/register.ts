import { throwRouteError } from '@/lib/api/route';
import { apiMessages } from '@/lib/copy/api';
import { logServerError } from '@/lib/monitoring/logger';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export interface RegisterAuthUserInput {
  firstName: string;
  lastName?: string | null;
  email: string;
  password: string;
  birthDate: string;
}

type RegisterErrorKind = 'duplicate_email' | 'rate_limited' | 'unexpected';

type RegisterFailure = {
  status: 400 | 429 | 500;
  message: string;
  field?: 'email';
};

function buildFullName(input: RegisterAuthUserInput) {
  return [input.firstName, input.lastName].filter(Boolean).join(' ');
}

function shouldAutoConfirmEmail() {
  return (
    process.env.NODE_ENV !== 'production' &&
    process.env.SUPABASE_AUTO_CONFIRM_EMAIL !== 'false'
  );
}

function getRegisterErrorKind(message: string): RegisterErrorKind {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes('rate limit')) {
    return 'rate_limited';
  }

  if (
    normalizedMessage.includes('already registered') ||
    normalizedMessage.includes('already exists') ||
    normalizedMessage.includes('already been registered')
  ) {
    return 'duplicate_email';
  }

  return 'unexpected';
}

function buildRegisterFailure(kind: RegisterErrorKind): RegisterFailure {
  switch (kind) {
    case 'duplicate_email':
      return {
        status: 400,
        message: apiMessages.auth.registerDuplicateEmail,
        field: 'email',
      };
    case 'rate_limited':
      return {
        status: 429,
        message: apiMessages.auth.registerRateLimited,
      };
    default:
      return {
        status: 500,
        message: apiMessages.auth.registerFailed,
      };
  }
}

function buildUserMetadata(input: RegisterAuthUserInput, fullName: string) {
  return {
    first_name: input.firstName,
    last_name: input.lastName ?? '',
    full_name: fullName,
    birth_date: input.birthDate,
  };
}

export async function registerAuthUser(input: RegisterAuthUserInput) {
  const fullName = buildFullName(input);
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: shouldAutoConfirmEmail(),
    user_metadata: buildUserMetadata(input, fullName),
  });

  if (error) {
    logServerError('Supabase register failed', error);
    const failure = buildRegisterFailure(getRegisterErrorKind(error.message));

    throwRouteError(
      failure.status,
      failure.message,
      failure.field ? { field: failure.field } : undefined,
    );
  }

  if (!data.user) {
    throwRouteError(500, apiMessages.auth.registerFailed);
  }

  return {
    fullName,
    user: data.user,
  };
}
