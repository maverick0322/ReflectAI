import { afterEach, describe, expect, it, vi } from 'vitest';

import { logServerError } from '@/lib/monitoring/logger';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('logServerError', () => {
  it('does not log in production or test environments', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.stubEnv('NODE_ENV', 'production');
    logServerError('scope', new Error('boom'));

    vi.stubEnv('NODE_ENV', 'test');
    logServerError('scope', 'boom');

    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('logs normalized messages in development-like environments', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.stubEnv('NODE_ENV', 'development');
    logServerError('scope:error', new Error('boom'));
    logServerError('scope:string', 'plain message');
    logServerError('scope:unknown', { code: 123 });

    expect(consoleErrorSpy).toHaveBeenNthCalledWith(1, 'scope:error', 'boom');
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
