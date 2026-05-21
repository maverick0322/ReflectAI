import { describe, expect, it, vi, afterEach } from 'vitest';

import { ApiError, requestJson } from '@/core/api/http';

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

  it('returns null payload when the response body is not valid json', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => {
        throw new Error('invalid json');
      },
    })) as unknown as typeof fetch;

    vi.stubGlobal('fetch', fetchMock);

    const result = await requestJson<null>('/api/test');
    expect(result).toBeNull();
  });

  it('falls back to a generic message when the error payload has no nested error object', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: false,
      status: 500,
      json: async () => ({ message: 'unexpected shape' }),
    })) as unknown as typeof fetch;

    vi.stubGlobal('fetch', fetchMock);

    await expect(requestJson('/api/test')).rejects.toMatchObject({
      message: 'Request failed',
      status: 500,
    });
  });
});
