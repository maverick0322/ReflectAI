import { describe, expect, it, vi } from 'vitest';

import {
  AVATAR_BUCKET,
  resolveAvatarUrl,
  validateAvatarFile,
  uploadProfileAvatar,
} from '@/lib/profile/avatar';

function createSupabaseClient(response: {
  data: { signedUrl: string } | null;
  error: unknown;
}) {
  const createSignedUrl = vi.fn(async () => response);
  const from = vi.fn(() => ({ createSignedUrl }));

  return {
    client: {
      storage: { from },
    },
    from,
    createSignedUrl,
  };
}

describe('profile avatar helpers', () => {
  it('returns null when there is no avatar reference', async () => {
    const { client, from, createSignedUrl } = createSupabaseClient({
      data: { signedUrl: 'https://cdn.test/avatar.png' },
      error: null,
    });

    await expect(resolveAvatarUrl(client, null)).resolves.toBeNull();
    expect(from).not.toHaveBeenCalled();
    expect(createSignedUrl).not.toHaveBeenCalled();
  });

  it('returns external http urls without calling storage', async () => {
    const { client, from, createSignedUrl } = createSupabaseClient({
      data: { signedUrl: 'https://cdn.test/avatar.png' },
      error: null,
    });

    await expect(
      resolveAvatarUrl(client, 'https://example.com/avatar.png'),
    ).resolves.toBe('https://example.com/avatar.png');
    expect(from).not.toHaveBeenCalled();
    expect(createSignedUrl).not.toHaveBeenCalled();
  });

  it('creates signed urls for private paths and returns null on storage failures', async () => {
    const signedUrlClient = createSupabaseClient({
      data: { signedUrl: 'https://cdn.test/avatar.png?token=abc' },
      error: null,
    });

    await expect(
      resolveAvatarUrl(signedUrlClient.client, 'user-1/avatar.png'),
    ).resolves.toBe('https://cdn.test/avatar.png?token=abc');
    expect(signedUrlClient.from).toHaveBeenCalledWith(AVATAR_BUCKET);
    expect(signedUrlClient.createSignedUrl).toHaveBeenCalledWith(
      'user-1/avatar.png',
      60 * 60,
    );

    const failedClient = createSupabaseClient({
      data: null,
      error: { message: 'storage' },
    });
    await expect(
      resolveAvatarUrl(failedClient.client, 'user-1/avatar.png'),
    ).resolves.toBeNull();

    const missingUrlClient = createSupabaseClient({
      data: null,
      error: null,
    });
    await expect(
      resolveAvatarUrl(missingUrlClient.client, 'user-1/avatar.png'),
    ).resolves.toBeNull();
  });

  it('reports update failures separately when persistence is unavailable', async () => {
    const file = new File(
      [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
      'avatar.png',
      { type: 'image/png' },
    );
    const supabase = {
      storage: {
        from: () => ({
          upload: vi.fn(async () => ({ error: null })),
          createSignedUrl: vi.fn(),
        }),
      },
    };

    await expect(
      uploadProfileAvatar(supabase, 'user-1', file, 'png'),
    ).resolves.toEqual({
      error: 'update_failed',
    });
  });

  it('validates required avatar inputs, allowed types, and size limits', () => {
    expect(validateAvatarFile(null)).toEqual({ error: 'required' });
    expect(
      validateAvatarFile(new File(['bad'], 'avatar.gif', { type: 'image/gif' })),
    ).toEqual({ error: 'invalid_type' });
    expect(
      validateAvatarFile(
        new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'avatar.png', {
          type: 'image/png',
        }),
      ),
    ).toEqual({ error: 'too_large' });
    expect(
      validateAvatarFile(
        new File(
          [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
          'avatar.png',
          { type: 'image/png' },
        ),
      ),
    ).toMatchObject({ extension: 'png' });
  });

  it('returns upload and signature failures separately and persists valid avatars', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(1700000000000);
    const invalidSignatureFile = new File(
      [new Uint8Array([0x00, 0x01, 0x02])],
      'avatar.png',
      { type: 'image/png' },
    );
    const validFile = new File(
      [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
      'avatar.png',
      { type: 'image/png' },
    );

    const upload = vi.fn(async () => ({ error: { message: 'storage' } }));
    const uploadSupabase = {
      storage: {
        from: () => ({
          upload,
          createSignedUrl: vi.fn(),
        }),
      },
      from: () => ({
        update: () => ({
          eq: () => ({
            select: () => ({
              single: vi.fn(),
            }),
          }),
        }),
      }),
    };

    await expect(
      uploadProfileAvatar(uploadSupabase as never, 'user-1', invalidSignatureFile, 'png'),
    ).resolves.toEqual({ error: 'invalid_signature' });

    await expect(
      uploadProfileAvatar(uploadSupabase as never, 'user-1', validFile, 'png'),
    ).resolves.toEqual({ error: 'upload_failed' });

    const persistedProfile = {
      id: 'user-1',
      first_name: 'Ana',
      last_name: 'Lopez',
      full_name: 'Ana Lopez',
      birth_date: '2000-01-01',
      avatar_url: 'user-1/avatar-1700000000000.png',
    };
    const successSupabase = {
      storage: {
        from: () => ({
          upload: vi.fn(async () => ({ error: null })),
          createSignedUrl: vi.fn(),
        }),
      },
      from: () => ({
        update: () => ({
          eq: () => ({
            select: () => ({
              single: async () => ({ data: persistedProfile, error: null }),
            }),
          }),
        }),
      }),
    };

    await expect(
      uploadProfileAvatar(successSupabase as never, 'user-1', validFile, 'png'),
    ).resolves.toEqual({ data: persistedProfile });
  });
});
