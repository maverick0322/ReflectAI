import { beforeEach, describe, expect, it, vi } from 'vitest';

import { POST } from '@/app/api/auth/verify-password/route';
import { getAuthenticatedUser } from '@/lib/auth/getAuthenticatedUser';
import { verifyAuthenticatedPassword } from '@/lib/auth/session';

vi.mock('@/lib/auth/getAuthenticatedUser', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/lib/auth/session', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth/session')>('@/lib/auth/session');
  return {
    ...actual,
    verifyAuthenticatedPassword: vi.fn(),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/auth/verify-password', () => {
  it('verifies the current password for authenticated users', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      supabase: { auth: {} },
      user: { id: 'user-1', email: 'ana@reflectai.com' },
      error: null,
    } as never);
    vi.mocked(verifyAuthenticatedPassword).mockResolvedValue(undefined);

    const response = await POST(
      new Request('http://localhost/api/auth/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'http://localhost',
        },
        body: JSON.stringify({ currentPassword: 'Password123' }),
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      message: 'Contrasena actual validada correctamente',
    });
    expect(verifyAuthenticatedPassword).toHaveBeenCalledWith(
      { auth: {} },
      { id: 'user-1', email: 'ana@reflectai.com' },
      'Password123',
    );
  });

  it('rejects invalid payloads and untrusted origins', async () => {
    const invalidResponse = await POST(
      new Request('http://localhost/api/auth/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'http://localhost',
        },
        body: JSON.stringify({ currentPassword: '' }),
      }),
    );
    expect(invalidResponse.status).toBe(400);

    const forbiddenResponse = await POST(
      new Request('http://localhost/api/auth/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'https://evil.test',
        },
        body: JSON.stringify({ currentPassword: 'Password123' }),
      }),
    );
    expect(forbiddenResponse.status).toBe(403);
  });

  it('returns route errors from auth validation', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      supabase: {},
      user: null,
      error: 'No autorizado',
    } as never);

    const response = await POST(
      new Request('http://localhost/api/auth/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'http://localhost',
        },
        body: JSON.stringify({ currentPassword: 'Password123' }),
      }),
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: {
        message: 'No autorizado',
      },
    });
  });
});
