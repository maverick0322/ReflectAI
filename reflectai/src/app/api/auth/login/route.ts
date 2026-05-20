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
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { loginSchema } from '@/lib/validations/auth';

async function authenticateUser(email: string, password: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  const authenticatedUser = data.user;

  if (error || !authenticatedUser) {
    if (error) {
      logServerError('Supabase login failed', error);
    }

    throwRouteError(401, apiMessages.auth.loginFailed);
  }

  return authenticatedUser;
}

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
