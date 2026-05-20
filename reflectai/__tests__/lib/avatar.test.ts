import { describe, expect, it, vi } from 'vitest';

import {
  AVATAR_BUCKET,
  resolveAvatarUrl,
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
});
