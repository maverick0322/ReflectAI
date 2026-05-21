import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RouteError } from '@/lib/api/route';
import { registerAuthUser } from '@/lib/auth/register';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { logServerError } from '@/lib/monitoring/logger';

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabaseClient: vi.fn(),
}));

vi.mock('@/lib/monitoring/logger', () => ({
  logServerError: vi.fn(),
}));

const baseInput = {
  firstName: 'Ana',
  lastName: 'Lopez',
  email: 'ana@reflectai.com',
  password: 'PasswordFuerte123',
  birthDate: '2000-01-01',
};

async function expectRouteError(
  promise: Promise<unknown>,
  status: number,
  message: string,
  field?: string,
) {
  try {
    await promise;
    throw new Error('Expected RouteError');
  } catch (error: unknown) {
    expect(error).toBeInstanceOf(RouteError);
    const routeError = error as RouteError;
    expect(routeError.status).toBe(status);
    expect(routeError.payload.error.message).toBe(message);
    expect(routeError.payload.error.field).toBe(field);
  }
}

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.SUPABASE_AUTO_CONFIRM_EMAIL;
});

describe('registerAuthUser', () => {
  it('creates the user and auto-confirms email outside production', async () => {
    const createUser = vi.fn(async () => ({
      data: { user: { id: 'user-1', email: 'ana@reflectai.com' } },
      error: null,
    }));
    vi.mocked(createAdminSupabaseClient).mockReturnValue({
      auth: { admin: { createUser } },
    } as never);

    const result = await registerAuthUser(baseInput);

    expect(result).toEqual({
      fullName: 'Ana Lopez',
      user: { id: 'user-1', email: 'ana@reflectai.com' },
    });
    expect(createUser).toHaveBeenCalledWith({
      email: 'ana@reflectai.com',
      password: 'PasswordFuerte123',
      email_confirm: true,
      user_metadata: {
        first_name: 'Ana',
        last_name: 'Lopez',
        full_name: 'Ana Lopez',
        birth_date: '2000-01-01',
      },
    });
  });

  it('supports disabling auto-confirm and handles empty last name', async () => {
    process.env.SUPABASE_AUTO_CONFIRM_EMAIL = 'false';
    const createUser = vi.fn(async () => ({
      data: { user: { id: 'user-2', email: 'ana@reflectai.com' } },
      error: null,
    }));
    vi.mocked(createAdminSupabaseClient).mockReturnValue({
      auth: { admin: { createUser } },
    } as never);

    const result = await registerAuthUser({
      ...baseInput,
      lastName: undefined,
    });

    expect(result.fullName).toBe('Ana');
    expect(createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email_confirm: false,
        user_metadata: expect.objectContaining({
          last_name: '',
          full_name: 'Ana',
        }),
      }),
    );
  });

  it('maps duplicate email and rate-limit failures to route errors', async () => {
    const duplicateCreateUser = vi.fn(async () => ({
      data: { user: null },
      error: { message: 'already been registered' },
    }));
    vi.mocked(createAdminSupabaseClient).mockReturnValueOnce({
      auth: { admin: { createUser: duplicateCreateUser } },
    } as never);

    await expectRouteError(
      registerAuthUser(baseInput),
      400,
      'Ya existe una cuenta con ese correo.',
      'email',
    );

    const rateLimitedCreateUser = vi.fn(async () => ({
      data: { user: null },
      error: { message: 'email rate limit exceeded' },
    }));
    vi.mocked(createAdminSupabaseClient).mockReturnValueOnce({
      auth: { admin: { createUser: rateLimitedCreateUser } },
    } as never);

    await expectRouteError(
      registerAuthUser(baseInput),
      429,
      'Se hicieron demasiados intentos. Espera unos minutos antes de crear otra cuenta.',
    );
    expect(logServerError).toHaveBeenCalledTimes(2);
  });

  it('maps unexpected failures and missing users to server errors', async () => {
    const unexpectedCreateUser = vi.fn(async () => ({
      data: { user: null },
      error: { message: 'unknown failure' },
    }));
    vi.mocked(createAdminSupabaseClient).mockReturnValueOnce({
      auth: { admin: { createUser: unexpectedCreateUser } },
    } as never);

    await expectRouteError(
      registerAuthUser(baseInput),
      500,
      'No se pudo completar el registro.',
    );

    const missingUserCreateUser = vi.fn(async () => ({
      data: { user: null },
      error: null,
    }));
    vi.mocked(createAdminSupabaseClient).mockReturnValueOnce({
      auth: { admin: { createUser: missingUserCreateUser } },
    } as never);

    await expectRouteError(
      registerAuthUser(baseInput),
      500,
      'No se pudo completar el registro.',
    );
  });
});
