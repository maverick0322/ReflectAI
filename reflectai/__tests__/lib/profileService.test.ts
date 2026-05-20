import { describe, expect, it, vi } from 'vitest';

import { loadUserProfile } from '@/lib/profile/service';

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
});
