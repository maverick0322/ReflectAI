import { describe, expect, it, vi } from 'vitest';

import { getAuthenticatedUser } from '@/lib/auth/getAuthenticatedUser';
import { createServerSupabaseClient } from '@/lib/supabase/server';

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(),
}));

describe('getAuthenticatedUser', () => {
  it('returns the authenticated user when Supabase resolves correctly', async () => {
    const supabase = {
      auth: {
        getUser: vi.fn(async () => ({
          data: {
            user: { id: 'user-1', email: 'ana@reflectai.com' },
          },
          error: null,
        })),
      },
    };
    vi.mocked(createServerSupabaseClient).mockResolvedValue(supabase as never);

    await expect(getAuthenticatedUser()).resolves.toEqual({
      supabase,
      user: { id: 'user-1', email: 'ana@reflectai.com' },
      error: null,
    });
  });

  it('returns a normalized unauthorized result when Supabase has no user', async () => {
    const supabase = {
      auth: {
        getUser: vi.fn(async () => ({
          data: { user: null },
          error: { message: 'missing' },
        })),
      },
    };
    vi.mocked(createServerSupabaseClient).mockResolvedValue(supabase as never);

    await expect(getAuthenticatedUser()).resolves.toEqual({
      supabase,
      user: null,
      error: 'No autorizado',
    });
  });
});
