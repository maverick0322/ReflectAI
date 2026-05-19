import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET as authCallbackGet } from '@/app/auth/callback/route';
import { POST as changePasswordPost } from '@/app/api/auth/change-password/route';
import { POST as confirmRecoveryPost } from '@/app/api/auth/confirm-recovery/route';
import { DELETE as deleteAccountDelete } from '@/app/api/auth/delete-account/route';
import { POST as loginPost } from '@/app/api/auth/login/route';
import { POST as logoutPost } from '@/app/api/auth/logout/route';
import { POST as recoverPost } from '@/app/api/auth/recover/route';
import { getAuthenticatedUser } from '@/lib/auth/getAuthenticatedUser';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

vi.mock('@/lib/auth/getAuthenticatedUser', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabaseClient: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(),
}));

type AuthenticatedUserMock = {
  id: string;
  email?: string;
};

async function readJson(response: Response) {
  return response.json() as Promise<{
    data?: Record<string, unknown>;
    error?: { message?: string };
    message?: string;
  }>;
}

function jsonRequest(path: string, body: unknown) {
  return new Request(`http://localhost${path}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

function mockAuthenticatedUser({
  supabase = {},
  user = { id: 'user-1', email: 'ana@reflectai.com' },
  error = null,
}: {
  supabase?: Record<string, unknown>;
  user?: AuthenticatedUserMock | null;
  error?: unknown;
} = {}) {
  vi.mocked(getAuthenticatedUser).mockResolvedValue({
    supabase,
    user,
    error,
  } as never);
}

function createDeleteTableMock(error: unknown = null) {
  const eq = vi.fn(async () => ({ error }));
  return {
    delete: vi.fn(() => ({ eq })),
    eq,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.NEXT_PUBLIC_SITE_URL;
});

describe('rutas API de autenticacion', () => {
  it('inicia sesion y devuelve datos seguros del usuario', async () => {
    const signInWithPassword = vi.fn(async () => ({
      data: {
        user: {
          id: 'user-1',
          email: 'ana@reflectai.com',
          user_metadata: { full_name: 'Ana Lopez' },
        },
      },
      error: null,
    }));
    vi.mocked(createServerSupabaseClient).mockResolvedValue({
      auth: { signInWithPassword },
    } as never);

    const response = await loginPost(
      jsonRequest('/api/auth/login', {
        email: 'ana@reflectai.com',
        password: 'PasswordFuerte123',
      }),
    );
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.message).toBe('Sesion iniciada correctamente');
    expect(body.data).toEqual({
      id: 'user-1',
      email: 'ana@reflectai.com',
      userMetadata: { full_name: 'Ana Lopez' },
    });
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: 'ana@reflectai.com',
      password: 'PasswordFuerte123',
    });
  });

  it('rechaza credenciales invalidas o payload invalido en login', async () => {
    const invalidResponse = await loginPost(
      jsonRequest('/api/auth/login', {
        email: 'correo-invalido',
        password: '',
      }),
    );
    const invalidBody = await readJson(invalidResponse);

    expect(invalidResponse.status).toBe(400);
    expect(invalidBody.error?.message).toBe('Datos invalidos');

    vi.mocked(createServerSupabaseClient).mockResolvedValue({
      auth: {
        signInWithPassword: vi.fn(async () => ({
          data: { user: null },
          error: { message: 'invalid' },
        })),
      },
    } as never);

    const badCredentialsResponse = await loginPost(
      jsonRequest('/api/auth/login', {
        email: 'ana@reflectai.com',
        password: 'PasswordFuerte123',
      }),
    );
    const badCredentialsBody = await readJson(badCredentialsResponse);

    expect(badCredentialsResponse.status).toBe(401);
    expect(badCredentialsBody.error?.message).toBe('Credenciales incorrectas');
  });

  it('envia recuperacion de password con callback seguro', async () => {
    const resetPasswordForEmail = vi.fn(async () => ({ error: null }));
    vi.mocked(createServerSupabaseClient).mockResolvedValue({
      auth: { resetPasswordForEmail },
    } as never);

    const response = await recoverPost(
      jsonRequest('/api/auth/recover', {
        email: 'ana@reflectai.com',
      }),
    );
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.message).toBe('Enlace de recuperacion enviado');
    expect(resetPasswordForEmail).toHaveBeenCalledWith('ana@reflectai.com', {
      redirectTo:
        'http://localhost/auth/callback?next=%2Fcambiar-contrasena%3Fmode%3Drecovery',
    });
  });

  it('devuelve 429 cuando Supabase limita los correos de recuperacion', async () => {
    vi.mocked(createServerSupabaseClient).mockResolvedValue({
      auth: {
        resetPasswordForEmail: vi.fn(async () => ({
          error: { message: 'email rate limit exceeded' },
        })),
      },
    } as never);

    const response = await recoverPost(
      jsonRequest('/api/auth/recover', {
        email: 'ana@reflectai.com',
      }),
    );
    const body = await readJson(response);

    expect(response.status).toBe(429);
    expect(body.error?.message).toBe(
      'Se hicieron demasiados intentos. Espera unos minutos antes de pedir otro enlace.',
    );
  });

  it('explica errores de entrega de email en recuperacion', async () => {
    vi.mocked(createServerSupabaseClient).mockResolvedValue({
      auth: {
        resetPasswordForEmail: vi.fn(async () => ({
          error: { message: 'Error sending recovery email' },
        })),
      },
    } as never);

    const response = await recoverPost(
      jsonRequest('/api/auth/recover', {
        email: 'ana@reflectai.com',
      }),
    );
    const body = await readJson(response);

    expect(response.status).toBe(500);
    expect(body.error?.message).toBe(
      'Supabase no pudo enviar el correo de recuperacion. Revisa la configuracion SMTP o intenta con otro correo.',
    );
  });

  it('genera enlace de recuperacion de desarrollo si falla el envio de email', async () => {
    vi.mocked(createServerSupabaseClient).mockResolvedValue({
      auth: {
        resetPasswordForEmail: vi.fn(async () => ({
          error: { message: 'Error sending recovery email' },
        })),
      },
    } as never);
    vi.mocked(createAdminSupabaseClient).mockReturnValue({
      auth: {
        admin: {
          generateLink: vi.fn(async () => ({
            data: {
              properties: {
                action_link: 'https://supabase.example/recover-link',
              },
            },
            error: null,
          })),
        },
      },
    } as never);

    const response = await recoverPost(
      jsonRequest('/api/auth/recover', {
        email: 'ana@reflectai.com',
      }),
    );
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.data?.recoveryLink).toBe('https://supabase.example/recover-link');
  });

  it('confirma recuperacion solo cuando Supabase devuelve sesion', async () => {
    const exchangeCodeForSession = vi.fn(async () => ({
      data: { session: { access_token: 'token' } },
      error: null,
    }));
    vi.mocked(createServerSupabaseClient).mockResolvedValue({
      auth: { exchangeCodeForSession },
    } as never);

    const response = await confirmRecoveryPost(
      jsonRequest('/api/auth/confirm-recovery', { code: 'code-1' }),
    );
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.message).toBe('Recuperacion confirmada');
    expect(exchangeCodeForSession).toHaveBeenCalledWith('code-1');

    exchangeCodeForSession.mockResolvedValueOnce({
      data: { session: null as never },
      error: { message: 'expired' } as never,
    });

    const failedResponse = await confirmRecoveryPost(
      jsonRequest('/api/auth/confirm-recovery', { code: 'expired' }),
    );
    const failedBody = await readJson(failedResponse);

    expect(failedResponse.status).toBe(400);
    expect(failedBody.error?.message).toBe('No se pudo confirmar la recuperacion');
  });

  it('actualiza password validando la password actual cuando se envia', async () => {
    const signInWithPassword = vi.fn(async () => ({ error: null }));
    const updateUser = vi.fn(async () => ({ error: null }));
    mockAuthenticatedUser({
      supabase: { auth: { signInWithPassword, updateUser } },
    });

    const response = await changePasswordPost(
      jsonRequest('/api/auth/change-password', {
        currentPassword: 'PasswordActual123!',
        newPassword: 'PasswordNueva123!',
        confirmNewPassword: 'PasswordNueva123!',
      }),
    );
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.message).toBe('Contraseña actualizada correctamente');
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: 'ana@reflectai.com',
      password: 'PasswordActual123!',
    });
    expect(updateUser).toHaveBeenCalledWith({ password: 'PasswordNueva123!' });
  });

  it('bloquea cambio de password sin sesion o con password actual incorrecta', async () => {
    mockAuthenticatedUser({ user: null, error: { message: 'missing' } });

    const unauthorizedResponse = await changePasswordPost(
      jsonRequest('/api/auth/change-password', {
        newPassword: 'PasswordNueva123!',
        confirmNewPassword: 'PasswordNueva123!',
      }),
    );
    const unauthorizedBody = await readJson(unauthorizedResponse);

    expect(unauthorizedResponse.status).toBe(401);
    expect(unauthorizedBody.error?.message).toBe('No autorizado');

    const signInWithPassword = vi.fn(async () => ({ error: { message: 'bad' } }));
    mockAuthenticatedUser({
      supabase: { auth: { signInWithPassword, updateUser: vi.fn() } },
    });

    const badCurrentResponse = await changePasswordPost(
      jsonRequest('/api/auth/change-password', {
        currentPassword: 'PasswordActual123!',
        newPassword: 'PasswordNueva123!',
        confirmNewPassword: 'PasswordNueva123!',
      }),
    );
    const badCurrentBody = await readJson(badCurrentResponse);

    expect(badCurrentResponse.status).toBe(400);
    expect(badCurrentBody.error?.message).toBe('La contraseña actual es incorrecta');
  });

  it('elimina cuenta limpiando sesiones, perfil y usuario auth', async () => {
    const signOut = vi.fn();
    mockAuthenticatedUser({
      supabase: { auth: { signOut } },
    });

    const deleteUser = vi.fn(async () => ({ error: null }));
    vi.mocked(createAdminSupabaseClient).mockReturnValue({
      auth: { admin: { deleteUser } },
    } as never);

    const response = await deleteAccountDelete();
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.message).toBe('Cuenta eliminada correctamente');
    expect(deleteUser).toHaveBeenCalledWith('user-1');
    expect(signOut).toHaveBeenCalled();
  });

  it('reporta errores al eliminar cuenta', async () => {
    mockAuthenticatedUser();

    vi.mocked(createAdminSupabaseClient).mockReturnValueOnce({
      auth: { admin: { deleteUser: vi.fn(async () => ({ error: { message: 'db' } })) } },
    } as never);

    const authResponse = await deleteAccountDelete();
    expect(authResponse.status).toBe(500);
    expect((await readJson(authResponse)).error?.message).toBe(
      'No se pudo eliminar la cuenta. Revisa las relaciones en cascada de profiles y reflection_sessions.',
    );
  });

  it('cierra sesion y maneja errores inesperados', async () => {
    const signOut = vi.fn();
    vi.mocked(createServerSupabaseClient).mockResolvedValueOnce({
      auth: { signOut },
    } as never);

    const response = await logoutPost();
    expect(response.status).toBe(200);
    expect((await readJson(response)).message).toBe('Sesion cerrada correctamente');
    expect(signOut).toHaveBeenCalled();

    vi.mocked(createServerSupabaseClient).mockRejectedValueOnce(new Error('boom'));

    const failedResponse = await logoutPost();
    expect(failedResponse.status).toBe(500);
    expect((await readJson(failedResponse)).error?.message).toBe(
      'Error inesperado al cerrar sesion',
    );
  });
});

describe('callback de autenticacion', () => {
  it('redirige a login si falta el codigo o si Supabase lo rechaza', async () => {
    const missingCodeResponse = await authCallbackGet(
      new Request('http://localhost/auth/callback?next=/dashboard'),
    );

    expect(missingCodeResponse.status).toBe(307);
    expect(missingCodeResponse.headers.get('location')).toBe(
      'http://localhost/login?auth_error=missing_code',
    );

    vi.mocked(createServerSupabaseClient).mockResolvedValue({
      auth: {
        exchangeCodeForSession: vi.fn(async () => ({ error: { message: 'bad' } })),
      },
    } as never);

    const invalidCodeResponse = await authCallbackGet(
      new Request('http://localhost/auth/callback?code=bad&next=//evil.test'),
    );

    expect(invalidCodeResponse.status).toBe(307);
    expect(invalidCodeResponse.headers.get('location')).toBe(
      'http://localhost/login?auth_error=invalid_code',
    );
  });

  it('redirige a recuperar cuando Supabase devuelve un enlace expirado', async () => {
    const response = await authCallbackGet(
      new Request(
        'http://localhost/auth/callback?error=access_denied&error_code=otp_expired&next=%2Fcambiar-contrasena%3Fmode%3Drecovery',
      ),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'http://localhost/recuperar?recovery_error=otp_expired',
    );
  });

  it('intercambia codigo y redirige solo a rutas internas', async () => {
    const exchangeCodeForSession = vi.fn(async () => ({ error: null }));
    vi.mocked(createServerSupabaseClient).mockResolvedValue({
      auth: { exchangeCodeForSession },
    } as never);

    const response = await authCallbackGet(
      new Request('http://localhost/auth/callback?code=ok&next=/perfil'),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost/perfil');
    expect(exchangeCodeForSession).toHaveBeenCalledWith('ok');
  });

  it('redirige a recuperar cuando falla un codigo de recuperacion', async () => {
    vi.mocked(createServerSupabaseClient).mockResolvedValue({
      auth: {
        exchangeCodeForSession: vi.fn(async () => ({ error: { message: 'invalid code' } })),
      },
    } as never);

    const response = await authCallbackGet(
      new Request(
        'http://localhost/auth/callback?code=bad&next=%2Fcambiar-contrasena%3Fmode%3Drecovery',
      ),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'http://localhost/recuperar?recovery_error=invalid_code',
    );
  });
});
