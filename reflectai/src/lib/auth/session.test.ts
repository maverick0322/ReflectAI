import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RouteError } from '@/lib/api/route';
import {
  authenticateUser,
  confirmPasswordRecovery,
  deleteAuthenticatedAccount,
  resolveAuthCallbackRedirect,
  sendPasswordRecoveryEmail,
  signOutCurrentSession,
  updateAuthenticatedPassword,
  verifyAuthenticatedPassword,
} from '@/lib/auth/session';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/monitoring/logger';

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabaseClient: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(),
}));

vi.mock('@/lib/monitoring/logger', () => ({
  logServerError: vi.fn(),
}));

async function expectRouteError(
  promise: Promise<unknown>,
  status: number,
  message: string,
) {
  try {
    await promise;
    throw new Error('Expected RouteError');
  } catch (error: unknown) {
    expect(error).toBeInstanceOf(RouteError);
    const routeError = error as RouteError;
    expect(routeError.status).toBe(status);
    expect(routeError.payload.error.message).toBe(message);
  }
}

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.SUPABASE_AUTO_CONFIRM_EMAIL;
});

describe('auth session helpers', () => {
  it('authenticates valid users and rejects invalid credentials', async () => {
    const signInWithPassword = vi.fn(async () => ({
      data: { user: { id: 'user-1' } },
      error: null,
    }));
    vi.mocked(createServerSupabaseClient).mockResolvedValueOnce({
      auth: { signInWithPassword },
    } as never);

    await expect(authenticateUser('ana@reflectai.com', 'Password123')).resolves.toEqual({
      id: 'user-1',
    });

    const failedSignIn = vi.fn(async () => ({
      data: { user: null },
      error: { message: 'invalid' },
    }));
    vi.mocked(createServerSupabaseClient).mockResolvedValueOnce({
      auth: { signInWithPassword: failedSignIn },
    } as never);

    await expectRouteError(
      authenticateUser('ana@reflectai.com', 'Password123'),
      401,
      'No se pudo iniciar sesion con las credenciales proporcionadas.',
    );
    expect(logServerError).toHaveBeenCalledWith('Supabase login failed', { message: 'invalid' });
  });

  it('sends recovery emails and maps provider failures', async () => {
    const resetPasswordForEmail = vi.fn(async () => ({ error: null }));
    vi.mocked(createServerSupabaseClient).mockResolvedValueOnce({
      auth: { resetPasswordForEmail },
    } as never);

    await sendPasswordRecoveryEmail('ana@reflectai.com', 'http://localhost/recover');
    expect(resetPasswordForEmail).toHaveBeenCalledWith('ana@reflectai.com', {
      redirectTo: 'http://localhost/auth/callback?next=%2Fchange-password%3Fmode%3Drecovery',
    });

    const rateLimitedReset = vi.fn(async () => ({
      error: { message: 'rate limit exceeded for security purposes' },
    }));
    vi.mocked(createServerSupabaseClient).mockResolvedValueOnce({
      auth: { resetPasswordForEmail: rateLimitedReset },
    } as never);
    await expectRouteError(
      sendPasswordRecoveryEmail('ana@reflectai.com', 'http://localhost/recover'),
      429,
      'Se hicieron demasiados intentos. Espera unos minutos antes de pedir otro enlace.',
    );

    const emailDeliveryReset = vi.fn(async () => ({
      error: { message: 'error sending recovery email' },
    }));
    vi.mocked(createServerSupabaseClient).mockResolvedValueOnce({
      auth: { resetPasswordForEmail: emailDeliveryReset },
    } as never);
    await expectRouteError(
      sendPasswordRecoveryEmail('ana@reflectai.com', 'http://localhost/recover'),
      500,
      'Supabase no pudo enviar el correo de recuperacion. Revisa la configuracion SMTP o intenta con otro correo.',
    );
  });

  it('confirms recovery codes and handles invalid sessions', async () => {
    const exchangeCodeForSession = vi.fn(async () => ({
      data: { session: { access_token: 'token' } },
      error: null,
    }));
    vi.mocked(createServerSupabaseClient).mockResolvedValueOnce({
      auth: { exchangeCodeForSession },
    } as never);

    await expect(confirmPasswordRecovery('ok-code')).resolves.toBeUndefined();

    const failedExchange = vi.fn(async () => ({
      data: { session: null },
      error: { message: 'expired' },
    }));
    vi.mocked(createServerSupabaseClient).mockResolvedValueOnce({
      auth: { exchangeCodeForSession: failedExchange },
    } as never);
    await expectRouteError(
      confirmPasswordRecovery('expired'),
      400,
      'No se pudo confirmar la recuperacion',
    );
  });

  it('verifies current passwords and rejects missing email or invalid credentials', async () => {
    const signInWithPassword = vi.fn(async () => ({ error: null }));
    const supabase = { auth: { signInWithPassword } };
    const user = { id: 'user-1', email: 'ana@reflectai.com' };

    await expect(
      verifyAuthenticatedPassword(supabase as never, user as never, 'Password123'),
    ).resolves.toBeUndefined();

    await expectRouteError(
      verifyAuthenticatedPassword(supabase as never, { id: 'user-1' } as never, 'Password123'),
      400,
      'No se pudo validar la contrasena actual',
    );

    signInWithPassword.mockResolvedValueOnce({ error: { message: 'bad' } } as never);
    await expectRouteError(
      verifyAuthenticatedPassword(supabase as never, user as never, 'Password123'),
      400,
      'La contrasena actual es incorrecta',
    );
  });

  it('updates passwords and maps recovery-session, same-password, and unexpected errors', async () => {
    const signInWithPassword = vi.fn(async () => ({ error: null }));
    const updateUser = vi.fn(async () => ({ error: null }));
    const supabase = { auth: { signInWithPassword, updateUser } };
    const user = { id: 'user-1', email: 'ana@reflectai.com' };

    await expect(
      updateAuthenticatedPassword(supabase as never, user as never, {
        currentPassword: 'Password123',
        newPassword: 'NewPassword123',
      }),
    ).resolves.toBeUndefined();
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: 'ana@reflectai.com',
      password: 'Password123',
    });

    updateUser.mockResolvedValueOnce({ error: { message: 'same password should be different' } } as never);
    await expectRouteError(
      updateAuthenticatedPassword(supabase as never, user as never, {
        newPassword: 'Password123',
      }),
      400,
      'La nueva contrasena debe ser diferente a la actual.',
    );

    updateUser.mockResolvedValueOnce({ error: { message: 'missing sub session' } } as never);
    await expectRouteError(
      updateAuthenticatedPassword(supabase as never, user as never, {
        newPassword: 'Password123',
      }),
      400,
      'La sesion de recuperacion no es valida o expiro. Solicita un nuevo enlace.',
    );

    updateUser.mockResolvedValueOnce({ error: { message: 'boom' } } as never);
    await expectRouteError(
      updateAuthenticatedPassword(supabase as never, user as never, {
        newPassword: 'Password123',
      }),
      500,
      'No se pudo actualizar la contrasena',
    );
    expect(logServerError).toHaveBeenCalledWith(
      'Supabase change password failed',
      { message: 'boom' },
    );
  });

  it('deletes authenticated accounts and signs out the current session', async () => {
    const signInWithPassword = vi.fn(async () => ({ error: null }));
    const signOut = vi.fn(async () => ({ error: null }));
    const deleteUser = vi.fn(async () => ({ error: null }));
    vi.mocked(createAdminSupabaseClient).mockReturnValue({
      auth: { admin: { deleteUser } },
    } as never);

    await expect(
      deleteAuthenticatedAccount(
        { auth: { signInWithPassword, signOut } } as never,
        { id: 'user-1', email: 'ana@reflectai.com' } as never,
        'Password123',
      ),
    ).resolves.toBeUndefined();
    expect(deleteUser).toHaveBeenCalledWith('user-1');
    expect(signOut).toHaveBeenCalled();

    const failedDeleteUser = vi.fn(async () => ({ error: { message: 'db' } }));
    vi.mocked(createAdminSupabaseClient).mockReturnValueOnce({
      auth: { admin: { deleteUser: failedDeleteUser } },
    } as never);
    await expectRouteError(
      deleteAuthenticatedAccount(
        { auth: { signInWithPassword, signOut } } as never,
        { id: 'user-1', email: 'ana@reflectai.com' } as never,
        'Password123',
      ),
      500,
      'No se pudo eliminar la cuenta. Revisa las relaciones en cascada de profiles y reflection_sessions.',
    );

    const sessionSignOut = vi.fn(async () => ({ error: null }));
    vi.mocked(createServerSupabaseClient).mockResolvedValueOnce({
      auth: { signOut: sessionSignOut },
    } as never);
    await signOutCurrentSession();
    expect(sessionSignOut).toHaveBeenCalled();
  });

  it('builds safe callback redirects for success and failure cases', async () => {
    const exchangeCodeForSession = vi.fn(async () => ({ error: null }));
    vi.mocked(createServerSupabaseClient).mockResolvedValueOnce({
      auth: { exchangeCodeForSession },
    } as never);

    const successRedirect = await resolveAuthCallbackRedirect(
      new Request('http://localhost/auth/callback?code=ok&next=//evil.test'),
    );
    expect(successRedirect.toString()).toBe('http://localhost/dashboard');

    const authErrorRedirect = await resolveAuthCallbackRedirect(
      new Request('http://localhost/auth/callback?error_code=otp_expired'),
    );
    expect(authErrorRedirect.toString()).toBe(
      'http://localhost/recover?recovery_error=otp_expired',
    );

    const missingCodeRedirect = await resolveAuthCallbackRedirect(
      new Request('http://localhost/auth/callback?next=/profile'),
    );
    expect(missingCodeRedirect.toString()).toBe(
      'http://localhost/login?auth_error=missing_code',
    );

    const invalidRecoveryExchange = vi.fn(async () => ({ error: { message: 'bad' } }));
    vi.mocked(createServerSupabaseClient).mockResolvedValueOnce({
      auth: { exchangeCodeForSession: invalidRecoveryExchange },
    } as never);
    const invalidRecoveryRedirect = await resolveAuthCallbackRedirect(
      new Request('http://localhost/auth/callback?code=bad&next=/change-password?mode=recovery'),
    );
    expect(invalidRecoveryRedirect.toString()).toBe(
      'http://localhost/recover?recovery_error=invalid_code',
    );

    const invalidLoginExchange = vi.fn(async () => ({ error: { message: 'bad' } }));
    vi.mocked(createServerSupabaseClient).mockResolvedValueOnce({
      auth: { exchangeCodeForSession: invalidLoginExchange },
    } as never);
    const invalidLoginRedirect = await resolveAuthCallbackRedirect(
      new Request('http://localhost/auth/callback?code=bad&next=/profile'),
    );
    expect(invalidLoginRedirect.toString()).toBe(
      'http://localhost/login?auth_error=invalid_code',
    );
    expect(logServerError).toHaveBeenCalledWith(
      'Supabase auth callback failed',
      { message: 'bad' },
    );
  });
});
