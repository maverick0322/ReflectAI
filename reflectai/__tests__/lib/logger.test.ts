import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  buildServerErrorLogEntry,
  logServerError,
  resetServerErrorLogFallbackTransport,
  setServerErrorLogFallbackTransport,
} from '@/lib/monitoring/logger';

afterEach(() => {
  resetServerErrorLogFallbackTransport();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('logServerError', () => {
  it('does not log in test environment', () => {
    const fallbackTransport = vi.fn();

    setServerErrorLogFallbackTransport(fallbackTransport);

    vi.stubEnv('NODE_ENV', 'test');
    logServerError('scope', 'boom');

    expect(fallbackTransport).not.toHaveBeenCalled();
  });

  it('logs in production and preserves error objects when available', () => {
    const fallbackTransport = vi.fn();
    const error = new Error('boom');

    setServerErrorLogFallbackTransport(fallbackTransport);
    vi.stubEnv('NODE_ENV', 'production');
    logServerError('scope:error', error);

    expect(fallbackTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'error',
        scope: 'scope:error',
        message: 'boom',
        errorName: 'Error',
      }),
    );
  });

  it('logs normalized messages in development-like environments', () => {
    const fallbackTransport = vi.fn();

    setServerErrorLogFallbackTransport(fallbackTransport);
    vi.stubEnv('NODE_ENV', 'development');
    const error = new Error('boom');

    logServerError('scope:error', error);
    logServerError('scope:string', 'plain message');
    logServerError('scope:unknown', { code: 123 });

    expect(fallbackTransport).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        level: 'error',
        scope: 'scope:error',
        message: 'boom',
      }),
    );
    expect(fallbackTransport).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        level: 'error',
        scope: 'scope:string',
        message: 'plain message',
      }),
    );
    expect(fallbackTransport).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        level: 'error',
        scope: 'scope:unknown',
        message: 'Unknown error',
      }),
    );
  });

  it('allows overriding the fallback transport for structured forwarding', () => {
    const fallbackTransport = vi.fn();

    setServerErrorLogFallbackTransport(fallbackTransport);
    vi.stubEnv('NODE_ENV', 'production');

    logServerError('scope:fallback', new Error('boom'));

    expect(fallbackTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'error',
        scope: 'scope:fallback',
        message: 'boom',
      }),
    );
  });

  it('builds structured entries that are easy to forward to a provider', () => {
    const entry = buildServerErrorLogEntry('scope:test', new Error('boom'));

    expect(entry).toEqual(
      expect.objectContaining({
        level: 'error',
        scope: 'scope:test',
        message: 'boom',
        errorName: 'Error',
      }),
    );
    expect(typeof entry.timestamp).toBe('string');
  });
});
