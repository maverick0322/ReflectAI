import type { getAuthenticatedUser } from '@/lib/auth/getAuthenticatedUser';

import { throwRouteError } from '@/lib/api/route';
import { apiMessages } from '@/lib/copy/api';
import { logServerError } from '@/lib/monitoring/logger';
import { getTrustedSiteOrigin } from '@/lib/security/origin';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

type AuthenticatedContext = Awaited<ReturnType<typeof getAuthenticatedUser>>;
type AuthenticatedSupabaseClient = AuthenticatedContext['supabase'];
type AuthenticatedUser = NonNullable<AuthenticatedContext['user']>;

type PasswordUpdateInput = {
  currentPassword?: string;
  newPassword: string;
};

type PasswordUpdateFailure = {
  status: 400 | 500;
  message: string;
};

function getSafeNextPath(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/dashboard';
  }

  return value;
}

function buildRecoveryRedirectUrl(requestUrl: string) {
  const baseUrl = getTrustedSiteOrigin(requestUrl);
  const callbackUrl = new URL('/auth/callback', baseUrl);
  callbackUrl.searchParams.set('next', '/cambiar-contrasena?mode=recovery');
  return callbackUrl.toString();
}

function getRecoverFailure(message: string) {
  const normalizedMessage = message.toLowerCase();
  const isRateLimited =
    normalizedMessage.includes('rate limit') ||
    normalizedMessage.includes('security purposes');
  const isEmailDeliveryError = normalizedMessage.includes('error sending');

  return {
    status: isRateLimited ? 429 : 500,
    message: isRateLimited
      ? apiMessages.auth.recoverRateLimited
      : isEmailDeliveryError
        ? apiMessages.auth.recoverEmailDeliveryFailed
        : apiMessages.auth.recoverFailed,
  };
}

function getPasswordUpdateFailure(message: string): PasswordUpdateFailure {
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

export async function authenticateUser(email: string, password: string) {
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

export async function sendPasswordRecoveryEmail(email: string, requestUrl: string) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: buildRecoveryRedirectUrl(requestUrl),
  });

  if (error) {
    logServerError('Supabase password recovery failed', error);
    const failure = getRecoverFailure(error.message);
    throwRouteError(failure.status, failure.message);
  }
}

export async function confirmPasswordRecovery(code: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    throwRouteError(400, apiMessages.auth.confirmRecoveryFailed);
  }
}

export async function verifyAuthenticatedPassword(
  supabase: AuthenticatedSupabaseClient,
  user: AuthenticatedUser,
  currentPassword: string,
) {
  if (!user.email) {
    throwRouteError(400, apiMessages.auth.passwordCurrentValidationFailed);
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (error) {
    throwRouteError(400, apiMessages.auth.passwordCurrentIncorrect);
  }
}

export async function updateAuthenticatedPassword(
  supabase: AuthenticatedSupabaseClient,
  user: AuthenticatedUser,
  passwordChange: PasswordUpdateInput,
) {
  if (passwordChange.currentPassword) {
    await verifyAuthenticatedPassword(
      supabase,
      user,
      passwordChange.currentPassword,
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: passwordChange.newPassword,
  });

  if (error) {
    logServerError('Supabase change password failed', error);
    const failure = getPasswordUpdateFailure(error.message);
    throwRouteError(failure.status, failure.message);
  }
}

export async function deleteAuthenticatedAccount(
  supabase: AuthenticatedSupabaseClient,
  user: AuthenticatedUser,
  currentPassword: string,
) {
  await verifyAuthenticatedPassword(supabase, user, currentPassword);

  const adminClient = createAdminSupabaseClient();
  const { error } = await adminClient.auth.admin.deleteUser(user.id);

  if (error) {
    throwRouteError(500, apiMessages.auth.deleteAccountFailed);
  }

  await supabase.auth.signOut();
}

export async function signOutCurrentSession() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
}

export async function resolveAuthCallbackRedirect(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const authErrorCode = requestUrl.searchParams.get('error_code');
  const next = getSafeNextPath(requestUrl.searchParams.get('next'));
  const redirectUrl = new URL(next, requestUrl.origin);

  if (authErrorCode) {
    redirectUrl.pathname = '/recuperar';
    redirectUrl.search = `?recovery_error=${encodeURIComponent(authErrorCode)}`;
    return redirectUrl;
  }

  if (!code) {
    redirectUrl.pathname = '/login';
    redirectUrl.search = '?auth_error=missing_code';
    return redirectUrl;
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    logServerError('Supabase auth callback failed', error);
    const isRecoveryRedirect = next.startsWith('/cambiar-contrasena');
    redirectUrl.pathname = isRecoveryRedirect ? '/recuperar' : '/login';
    redirectUrl.search = isRecoveryRedirect
      ? '?recovery_error=invalid_code'
      : '?auth_error=invalid_code';
  }

  return redirectUrl;
}
