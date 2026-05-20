import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from '@/app/api/auth/session-status/route';
import { getAuthenticatedUser } from '@/lib/auth/getAuthenticatedUser';
import { logServerError } from '@/lib/monitoring/logger';

vi.mock('@/lib/auth/getAuthenticatedUser', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/lib/monitoring/logger', () => ({
  logServerError: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/auth/session-status', () => {
  it('returns authenticated true for valid sessions', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      supabase: {},
      user: { id: 'user-1' },
      error: null,
    } as never);

    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ authenticated: true });
  });

  it('returns authenticated false for unauthorized and unexpected failures', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValueOnce({
      supabase: {},
      user: null,
      error: 'No autorizado',
    } as never);

    const unauthorizedResponse = await GET();
    expect(unauthorizedResponse.status).toBe(401);
    expect(await unauthorizedResponse.json()).toEqual({ authenticated: false });

    vi.mocked(getAuthenticatedUser).mockRejectedValueOnce(new Error('boom'));
    const failedResponse = await GET();
    expect(failedResponse.status).toBe(500);
    expect(await failedResponse.json()).toEqual({ authenticated: false });
    expect(logServerError).toHaveBeenCalledWith('auth session status failed', expect.any(Error));
  });
});
