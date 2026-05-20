import { afterEach, describe, expect, it, vi } from 'vitest';

import { assertTrustedMutationOrigin, getTrustedSiteOrigin } from '@/lib/security/origin';
import { checkRateLimit } from '@/lib/security/rateLimit';
import { rateLimitResponse } from '@/lib/security/responses';

describe('security/origin', () => {
  const resetEnv = () => {
    vi.unstubAllEnvs();
  };

  it('uses configured site origin when present', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://reflectai.example/app';
    expect(getTrustedSiteOrigin('https://ignored.example')).toBe('https://reflectai.example');
    resetEnv();
  });

  it('allows local origin in non-production', () => {
    vi.stubEnv('NODE_ENV', 'development');
    delete process.env.NEXT_PUBLIC_SITE_URL;

    expect(getTrustedSiteOrigin('http://localhost:3000/test')).toBe('http://localhost:3000');
    resetEnv();
  });

  it('throws if configured site url is not http/https', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'ftp://reflectai.example';

    expect(() => getTrustedSiteOrigin('https://ignored.example')).toThrow('Configured site URL must use http or https');
    resetEnv();
  });

  it('rejects missing trusted origin in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    delete process.env.NEXT_PUBLIC_SITE_URL;

    expect(() => getTrustedSiteOrigin('https://reflectai.example')).toThrow('Missing trusted site URL');
    resetEnv();
  });

  it('accepts trusted origin header and referer', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://reflectai.example';

    const request = new Request('https://reflectai.example/api/auth/login', {
      headers: {
        origin: 'https://reflectai.example',
      },
    });

    expect(() => assertTrustedMutationOrigin(request)).not.toThrow();

    const requestWithReferer = new Request('https://reflectai.example/api/auth/login', {
      headers: {
        referer: 'https://reflectai.example/login',
      },
    });

    expect(() => assertTrustedMutationOrigin(requestWithReferer)).not.toThrow();
    resetEnv();
  });

  it('accepts local origin in non-production even when configured', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://reflectai.example');

    const request = new Request('https://reflectai.example/api/auth/login', {
      headers: {
        origin: 'http://localhost:3000',
      },
    });

    expect(() => assertTrustedMutationOrigin(request)).not.toThrow();
    resetEnv();
  });

  it('rejects untrusted origin', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://reflectai.example';

    const request = new Request('https://reflectai.example/api/auth/login', {
      headers: {
        origin: 'https://evil.example',
      },
    });

    expect(() => assertTrustedMutationOrigin(request)).toThrow('Untrusted origin');
    resetEnv();
  });
});

describe('security/rateLimit', () => {
  const resetEnv = () => {
    vi.unstubAllEnvs();
  };

  it('skips limiting in test environment', () => {
    vi.stubEnv('NODE_ENV', 'test');

    const result = checkRateLimit(undefined, {
      key: 'test:skip',
      maxRequests: 1,
      windowMs: 1000,
    });

    expect(result).toEqual({ limited: false, retryAfterSeconds: 0 });
    resetEnv();
  });

  it('uses proxy headers when available', () => {
    vi.stubEnv('NODE_ENV', 'development');

    const request = new Request('http://localhost/api', {
      headers: {
        'cf-connecting-ip': '203.0.113.10',
      },
    });

    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);

    const result = checkRateLimit(request, {
      key: 'test:proxy',
      maxRequests: 1,
      windowMs: 1000,
    });

    expect(result.limited).toBe(false);
    resetEnv();
    vi.restoreAllMocks();
  });

  it('falls back to x-forwarded-for and enforces limit', () => {
    vi.stubEnv('NODE_ENV', 'development');

    const request = new Request('http://localhost/api', {
      headers: {
        'x-forwarded-for': '198.51.100.10, 10.0.0.1',
      },
    });

    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);

    const first = checkRateLimit(request, {
      key: 'test:limit',
      maxRequests: 1,
      windowMs: 5000,
    });
    const second = checkRateLimit(request, {
      key: 'test:limit',
      maxRequests: 1,
      windowMs: 5000,
    });

    expect(first.limited).toBe(false);
    expect(second.limited).toBe(true);
    expect(second.retryAfterSeconds).toBeGreaterThan(0);

    resetEnv();
    vi.restoreAllMocks();
  });

  it('resets bucket after window', () => {
    vi.stubEnv('NODE_ENV', 'development');

    const request = new Request('http://localhost/api');
    const now = Date.now();
    const dateSpy = vi.spyOn(Date, 'now');

    dateSpy.mockReturnValue(now);
    checkRateLimit(request, {
      key: 'test:reset',
      maxRequests: 1,
      windowMs: 10,
    });

    dateSpy.mockReturnValue(now + 20);
    const result = checkRateLimit(request, {
      key: 'test:reset',
      maxRequests: 1,
      windowMs: 10,
    });

    expect(result.limited).toBe(false);
    resetEnv();
    vi.restoreAllMocks();
  });
});

describe('security/responses', () => {
  it('returns a 429 response with retry-after header', async () => {
    const response = rateLimitResponse(120);

    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('120');
    await expect(response.json()).resolves.toEqual({
      error: { message: 'Demasiados intentos. Espera unos minutos antes de continuar.' },
    });
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
});
