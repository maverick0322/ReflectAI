import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET as authCallbackGet } from '@/app/auth/callback/route';
import { POST as changePasswordPost } from '@/app/api/auth/change-password/route';
import { POST as confirmRecoveryPost } from '@/app/api/auth/confirm-recovery/route';
import { DELETE as deleteAccountDelete } from '@/app/api/auth/delete-account/route';
import { POST as loginPost } from '@/app/api/auth/login/route';
import { POST as logoutPost } from '@/app/api/auth/logout/route';
import { POST as recoverPost } from '@/app/api/auth/recover/route';
import { GET as sessionStatusGet } from '@/app/api/auth/session-status/route';
import { POST as verifyPasswordPost } from '@/app/api/auth/verify-password/route';
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
    authenticated?: boolean;
    data?: Record<string, unknown>;
    error?: { message?: string };
    message?: string;
  }>;
}

function mutationRequest(path: string, body: unknown, method = 'POST') {
  return new Request(`http://localhost${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Origin: 'http://localhost',
    },
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
      mutationRequest('/api/auth/login', {
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
  });

  it('rechaza origen no confiable y credenciales invalidas en login', async () => {
    const untrustedResponse = await loginPost(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'https://evil.test',
        },
        body: JSON.stringify({
          email: 'ana@reflectai.com',
          password: 'PasswordFuerte123',
        }),
      }),
    );

    expect(untrustedResponse.status).toBe(403);

    vi.mocked(createServerSupabaseClient).mockResolvedValue({
      auth: {
        signInWithPassword: vi.fn(async () => ({
          data: { user: null },
          error: { message: 'invalid' },
        })),
      },
    } as never);

    const badCredentialsResponse = await loginPost(
      mutationRequest('/api/auth/login', {
        email: 'ana@reflectai.com',
        password: 'PasswordFuerte123',
      }),
    );
    const badCredentialsBody = await readJson(badCredentialsResponse);

    expect(badCredentialsResponse.status).toBe(401);
    expect(badCredentialsBody.error?.message).toBe(
      'No se pudo iniciar sesion con las credenciales proporcionadas.',
    );
  });

  it('envia recuperacion de password con callback seguro', async () => {
    const resetPasswordForEmail = vi.fn(async () => ({ error: null }));
    vi.mocked(createServerSupabaseClient).mockResolvedValue({
      auth: { resetPasswordForEmail },
    } as never);

    const response = await recoverPost(
      mutationRequest('/api/auth/recover', {
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

  it('confirma recuperacion solo cuando Supabase devuelve sesion', async () => {
    const exchangeCodeForSession = vi.fn(async () => ({
      data: { session: { access_token: 'token' } },
      error: null,
    }));
    vi.mocked(createServerSupabaseClient).mockResolvedValue({
      auth: { exchangeCodeForSession },
    } as never);

    const response = await confirmRecoveryPost(
      mutationRequest('/api/auth/confirm-recovery', { code: 'code-1' }),
    );

    expect(response.status).toBe(200);
    expect((await readJson(response)).message).toBe('Recuperacion confirmada');
  });

  it('actualiza y verifica password con usuario autenticado', async () => {
    const signInWithPassword = vi.fn(async () => ({ error: null }));
    const updateUser = vi.fn(async () => ({ error: null }));
    mockAuthenticatedUser({
      supabase: { auth: { signInWithPassword, updateUser } },
    });

    const changeResponse = await changePasswordPost(
      mutationRequest('/api/auth/change-password', {
        currentPassword: 'PasswordActual123!',
        newPassword: 'PasswordNueva123!',
        confirmNewPassword: 'PasswordNueva123!',
      }),
    );
    expect(changeResponse.status).toBe(200);
    expect((await readJson(changeResponse)).message).toBe(
      'Contrasena actualizada correctamente',
    );

    const verifyResponse = await verifyPasswordPost(
      mutationRequest('/api/auth/verify-password', {
        currentPassword: 'PasswordActual123!',
      }),
    );
    expect(verifyResponse.status).toBe(200);
    expect((await readJson(verifyResponse)).message).toBe(
      'Contrasena actual validada correctamente',
    );
  });

  it('bloquea cambio de password sin sesion o con password actual incorrecta', async () => {
    mockAuthenticatedUser({ user: null, error: { message: 'missing' } });

    const unauthorizedResponse = await changePasswordPost(
      mutationRequest('/api/auth/change-password', {
        newPassword: 'PasswordNueva123!',
        confirmNewPassword: 'PasswordNueva123!',
      }),
    );
    expect(unauthorizedResponse.status).toBe(401);

    const signInWithPassword = vi.fn(async () => ({ error: { message: 'bad' } }));
    mockAuthenticatedUser({
      supabase: { auth: { signInWithPassword, updateUser: vi.fn() } },
    });

    const badCurrentResponse = await changePasswordPost(
      mutationRequest('/api/auth/change-password', {
        currentPassword: 'PasswordActual123!',
        newPassword: 'PasswordNueva123!',
        confirmNewPassword: 'PasswordNueva123!',
      }),
    );
    expect(badCurrentResponse.status).toBe(400);
    expect((await readJson(badCurrentResponse)).error?.message).toBe(
      'La contrasena actual es incorrecta',
    );
  });

  it('devuelve error claro si la sesion de recuperacion expiro', async () => {
    const updateUser = vi.fn(async () => ({
      error: { message: 'Auth session missing' },
    }));
    mockAuthenticatedUser({
      supabase: { auth: { updateUser } },
    });

    const response = await changePasswordPost(
      mutationRequest('/api/auth/change-password', {
        newPassword: 'PasswordNueva123!',
        confirmNewPassword: 'PasswordNueva123!',
      }),
    );

    expect(response.status).toBe(400);
    expect((await readJson(response)).error?.message).toBe(
      'La sesion de recuperacion no es valida o expiro. Solicita un nuevo enlace.',
    );
  });

  it('elimina cuenta solo tras reautenticacion', async () => {
    const signInWithPassword = vi.fn(async () => ({ error: null }));
    const signOut = vi.fn();
    mockAuthenticatedUser({
      supabase: { auth: { signInWithPassword, signOut } },
    });

    const deleteUser = vi.fn(async () => ({ error: null }));
    vi.mocked(createAdminSupabaseClient).mockReturnValue({
      auth: { admin: { deleteUser } },
    } as never);

    const response = await deleteAccountDelete(
      mutationRequest(
        '/api/auth/delete-account',
        { currentPassword: 'PasswordActual123!' },
        'DELETE',
      ),
    );

    expect(response.status).toBe(200);
    expect((await readJson(response)).message).toBe('Cuenta eliminada correctamente');
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: 'ana@reflectai.com',
      password: 'PasswordActual123!',
    });
    expect(deleteUser).toHaveBeenCalledWith('user-1');
    expect(signOut).toHaveBeenCalled();
  });

  it('rechaza eliminacion sin password o con origen no confiable', async () => {
    mockAuthenticatedUser();

    const invalidResponse = await deleteAccountDelete(
      mutationRequest('/api/auth/delete-account', { currentPassword: '' }, 'DELETE'),
    );
    expect(invalidResponse.status).toBe(400);

    const untrustedResponse = await deleteAccountDelete(
      new Request('http://localhost/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'https://evil.test',
        },
        body: JSON.stringify({ currentPassword: 'PasswordActual123!' }),
      }),
    );
    expect(untrustedResponse.status).toBe(403);
  });

  it('cierra sesion y maneja errores inesperados', async () => {
    const signOut = vi.fn();
    vi.mocked(createServerSupabaseClient).mockResolvedValueOnce({
      auth: { signOut },
    } as never);

    const response = await logoutPost(mutationRequest('/api/auth/logout', {}));
    expect(response.status).toBe(200);
    expect((await readJson(response)).message).toBe('Sesion cerrada correctamente');

    vi.mocked(createServerSupabaseClient).mockRejectedValueOnce(new Error('boom'));
    const failedResponse = await logoutPost(mutationRequest('/api/auth/logout', {}));
    expect(failedResponse.status).toBe(500);
  });

  it('expone el estado de sesion para el flujo de recuperacion', async () => {
    mockAuthenticatedUser();

    const okResponse = await sessionStatusGet();
    expect(okResponse.status).toBe(200);
    expect((await readJson(okResponse)).authenticated).toBe(true);

    mockAuthenticatedUser({ user: null, error: { message: 'missing' } });

    const unauthorizedResponse = await sessionStatusGet();
    expect(unauthorizedResponse.status).toBe(401);
    expect((await readJson(unauthorizedResponse)).authenticated).toBe(false);
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
});
