import { describe, expect, it, vi, afterEach } from 'vitest';

import { ApiError, requestJson } from '@/lib/api/http';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('requestJson', () => {
  it('returns payload when response is ok', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: 'ok' }),
    })) as unknown as typeof fetch;

    vi.stubGlobal('fetch', fetchMock);

    const result = await requestJson<{ data: string }>('/api/test');

    expect(result.data).toBe('ok');
  });

  it('throws ApiError on error responses', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: false,
      json: async () => ({ error: { message: 'fail' } }),
    })) as unknown as typeof fetch;

    vi.stubGlobal('fetch', fetchMock);

    await expect(requestJson('/api/test')).rejects.toThrow(ApiError);
  });

  it('throws a generic ApiError when the error response body is not JSON', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('invalid json');
      },
    })) as unknown as typeof fetch;

    vi.stubGlobal('fetch', fetchMock);

    await expect(requestJson('/api/test')).rejects.toMatchObject({
      message: 'Request failed',
      status: 500,
    });
  });
});
