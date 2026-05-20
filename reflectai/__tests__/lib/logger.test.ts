import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  buildServerErrorLogEntry,
  logServerError,
} from '@/lib/monitoring/logger';

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

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'error',
        scope: 'scope:error',
        message: 'boom',
        errorName: 'Error',
      }),
    );
  });

  it('logs normalized messages in development-like environments', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubEnv('NODE_ENV', 'development');
    const error = new Error('boom');

    logServerError('scope:error', error);
    logServerError('scope:string', 'plain message');
    logServerError('scope:unknown', { code: 123 });

    expect(consoleErrorSpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        level: 'error',
        scope: 'scope:error',
        message: 'boom',
      }),
    );
    expect(consoleErrorSpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        level: 'error',
        scope: 'scope:string',
        message: 'plain message',
      }),
    );
    expect(consoleErrorSpy).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        level: 'error',
        scope: 'scope:unknown',
        message: 'Unknown error',
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
