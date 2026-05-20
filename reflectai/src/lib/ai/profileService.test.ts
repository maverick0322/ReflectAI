import { describe, expect, it, vi } from 'vitest';

import { RouteError } from '@/lib/api/route';
import {
  buildProfileResponse,
  loadUserProfile,
  updateUserProfile,
  uploadUserAvatarResponse,
} from '@/lib/profile/service';

type MockQueryResult<T> = {
  data: T;
  error: null | { message: string };
};

function createProfileBuilder<T>({
  maybeSingleResult,
  singleResult,
}: {
  maybeSingleResult: MockQueryResult<T>;
  singleResult: MockQueryResult<T>;
}) {
  const builder = {
    select: () => builder,
    eq: () => builder,
    maybeSingle: async () => maybeSingleResult,
    insert: () => builder,
    single: async () => singleResult,
  };

  return builder;
}

describe('profile service', () => {
  it('trims seeded metadata fields before creating a profile', async () => {
    const insertedProfile = {
      id: 'user-1',
      first_name: 'Ana',
      last_name: 'Lopez',
      full_name: 'Ana Lopez',
      birth_date: '2000-01-01',
      avatar_url: null,
    };
    const readBuilder = createProfileBuilder({
      maybeSingleResult: { data: null, error: null },
      singleResult: { data: null, error: null },
    });
    let insertedPayload: Record<string, unknown> | undefined;
    const createBuilder = {
      insert: (payload: Record<string, unknown>) => {
        insertedPayload = payload;
        return createBuilder;
      },
      select: () => createBuilder,
      single: async () => ({ data: insertedProfile, error: null }),
    };
    const from = vi
      .fn()
      .mockReturnValueOnce(readBuilder)
      .mockReturnValueOnce(createBuilder);
    const supabase = { from };

    const profile = await loadUserProfile(supabase as never, {
      id: 'user-1',
      user_metadata: {
        first_name: '  Ana  ',
        last_name: ' Lopez ',
        birth_date: ' 2000-01-01 ',
      },
    } as never);

    expect(profile).toEqual(insertedProfile);
    expect(insertedPayload).toEqual({
      id: 'user-1',
      first_name: 'Ana',
      last_name: 'Lopez',
      full_name: 'Ana Lopez',
      birth_date: '2000-01-01',
    });
    expect(from).toHaveBeenCalledTimes(2);
  });

  it('uses metadata fallbacks, resolves private avatars, and reports read failures', async () => {
    const readBuilder = createProfileBuilder({
      maybeSingleResult: { data: null, error: { message: 'db' } },
      singleResult: { data: null, error: null },
    });
    const supabase = { from: vi.fn(() => readBuilder) };

    await expect(loadUserProfile(supabase as never, {
      id: 'user-1',
      user_metadata: null,
    } as never)).rejects.toBeInstanceOf(RouteError);

    const createBuilder = {
      insert: () => createBuilder,
      select: () => createBuilder,
      single: async () => ({
        data: {
          id: 'user-1',
          first_name: 'Usuario',
          last_name: null,
          full_name: 'Usuario',
          birth_date: null,
          avatar_url: 'user-1/avatar.png',
        },
        error: null,
      }),
    };
    const storage = {
      from: vi.fn(() => ({
        createSignedUrl: vi.fn(async () => ({
          data: { signedUrl: 'https://cdn.test/avatar.png?token=abc' },
          error: null,
        })),
      })),
    };
    const fallbackSupabase = {
      from: vi.fn().mockReturnValueOnce(createProfileBuilder({
        maybeSingleResult: { data: null, error: null },
        singleResult: { data: null, error: null },
      })).mockReturnValueOnce(createBuilder),
      storage,
    };

    const profile = await loadUserProfile(fallbackSupabase as never, {
      id: 'user-1',
      email: null,
      user_metadata: {},
    } as never);
    const response = await buildProfileResponse(
      fallbackSupabase as never,
      profile as never,
      null,
    );

    expect(response).toMatchObject({
      first_name: 'Usuario',
      avatar_url: 'https://cdn.test/avatar.png?token=abc',
      email: null,
    });
  });

  it('updates profiles and maps avatar upload errors to route errors', async () => {
    const updatedProfile = {
      id: 'user-1',
      first_name: 'Ana',
      last_name: 'Lopez',
      full_name: 'Ana Lopez',
      birth_date: '2000-01-01',
      avatar_url: null,
    };
    const updateBuilder = {
      update: () => ({
        eq: () => ({
          select: () => ({
            single: async () => ({ data: updatedProfile, error: null }),
          }),
        }),
      }),
    };
    const supabase = { from: vi.fn(() => updateBuilder), storage: { from: vi.fn() } };

    await expect(
      updateUserProfile(supabase as never, { id: 'user-1' } as never, {
        firstName: 'Ana',
        lastName: 'Lopez',
        birthDate: '2000-01-01',
      }),
    ).resolves.toEqual(updatedProfile);

    const failingSupabase = {
      from: vi.fn(() => ({
        update: () => ({
          eq: () => ({
            select: () => ({
              single: async () => ({ data: null, error: { message: 'db' } }),
            }),
          }),
        }),
      })),
      storage: { from: vi.fn() },
    };
    await expect(
      updateUserProfile(failingSupabase as never, { id: 'user-1' } as never, {
        firstName: 'Ana',
        lastName: 'Lopez',
        birthDate: '2000-01-01',
      }),
    ).rejects.toBeInstanceOf(RouteError);

    const requiredFormData = new FormData();
    await expect(
      uploadUserAvatarResponse(supabase as never, { id: 'user-1', email: null } as never, requiredFormData),
    ).rejects.toBeInstanceOf(RouteError);
  });
});
