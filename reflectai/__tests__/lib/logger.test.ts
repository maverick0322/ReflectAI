import { afterEach, describe, expect, it, vi } from 'vitest';

import { logServerError } from '@/lib/monitoring/logger';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('logServerError', () => {
  it('does not log in test environment', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.stubEnv('NODE_ENV', 'test');
    logServerError('scope', 'boom');

    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('logs in production and preserves error objects when available', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('boom');

    vi.stubEnv('NODE_ENV', 'production');
    logServerError('scope:error', error);

    expect(consoleErrorSpy).toHaveBeenCalledWith('scope:error', error);
  });

  it('logs normalized messages in development-like environments', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubEnv('NODE_ENV', 'development');
    const error = new Error('boom');

    logServerError('scope:error', error);
    logServerError('scope:string', 'plain message');
    logServerError('scope:unknown', { code: 123 });

    expect(consoleErrorSpy).toHaveBeenNthCalledWith(1, 'scope:error', error);
    expect(consoleErrorSpy).toHaveBeenNthCalledWith(
      2,
      'scope:string',
      'plain message',
    );
    expect(consoleErrorSpy).toHaveBeenNthCalledWith(
      3,
      'scope:unknown',
      'Unknown error',
    );
  });
});
