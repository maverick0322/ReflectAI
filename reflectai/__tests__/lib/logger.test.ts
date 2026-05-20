import { afterEach, describe, expect, it, vi } from 'vitest';
import { channel } from 'node:diagnostics_channel';

import {
  buildServerErrorLogEntry,
  logServerError,
  resetServerErrorLogFallbackTransport,
  setServerErrorLogFallbackTransport,
  SERVER_ERROR_LOG_CHANNEL,
  type ServerErrorLogEntry,
} from '@/lib/monitoring/logger';

afterEach(() => {
  resetServerErrorLogFallbackTransport();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('logServerError', () => {
  it('does not log in test environment', () => {
    const entries: ServerErrorLogEntry[] = [];
    const subscriber = (entry: unknown) => {
      entries.push(entry as ServerErrorLogEntry);
    };
    const logChannel = channel(SERVER_ERROR_LOG_CHANNEL);

    logChannel.subscribe(subscriber);
    vi.stubEnv('NODE_ENV', 'test');
    logServerError('scope', 'boom');
    logChannel.unsubscribe(subscriber);

    expect(entries).toEqual([]);
  });

  it('publishes in production and preserves error objects when available', () => {
    const entries: ServerErrorLogEntry[] = [];
    const subscriber = (entry: unknown) => {
      entries.push(entry as ServerErrorLogEntry);
    };
    const logChannel = channel(SERVER_ERROR_LOG_CHANNEL);
    const error = new Error('boom');

    logChannel.subscribe(subscriber);
    vi.stubEnv('NODE_ENV', 'production');
    logServerError('scope:error', error);
    logChannel.unsubscribe(subscriber);

    expect(entries[0]).toEqual(
      expect.objectContaining({
        level: 'error',
        scope: 'scope:error',
        message: 'boom',
        errorName: 'Error',
      }),
    );
  });

  it('publishes normalized messages in development-like environments', () => {
    const entries: ServerErrorLogEntry[] = [];
    const subscriber = (entry: unknown) => {
      entries.push(entry as ServerErrorLogEntry);
    };
    const logChannel = channel(SERVER_ERROR_LOG_CHANNEL);

    logChannel.subscribe(subscriber);
    vi.stubEnv('NODE_ENV', 'development');
    const error = new Error('boom');

    logServerError('scope:error', error);
    logServerError('scope:string', 'plain message');
    logServerError('scope:unknown', { code: 123 });
    logChannel.unsubscribe(subscriber);

    expect(entries[0]).toEqual(
      expect.objectContaining({
        level: 'error',
        scope: 'scope:error',
        message: 'boom',
      }),
    );
    expect(entries[1]).toEqual(
      expect.objectContaining({
        level: 'error',
        scope: 'scope:string',
        message: 'plain message',
      }),
    );
    expect(entries[2]).toEqual(
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

  it('does not call fallback transport when a subscriber is attached', () => {
    const entries: ServerErrorLogEntry[] = [];
    const subscriber = (entry: unknown) => {
      entries.push(entry as ServerErrorLogEntry);
    };
    const fallbackTransport = vi.fn();
    const logChannel = channel(SERVER_ERROR_LOG_CHANNEL);

    setServerErrorLogFallbackTransport(fallbackTransport);
    logChannel.subscribe(subscriber);
    vi.stubEnv('NODE_ENV', 'production');

    logServerError('scope:subscriber', new Error('boom'));
    logChannel.unsubscribe(subscriber);

    expect(entries).toHaveLength(1);
    expect(fallbackTransport).not.toHaveBeenCalled();
  });

  it('swallows fallback transport errors', () => {
    const fallbackTransport = vi.fn(() => {
      throw new Error('transport failed');
    });

    setServerErrorLogFallbackTransport(fallbackTransport);
    vi.stubEnv('NODE_ENV', 'production');

    expect(() => logServerError('scope:fallback-error', new Error('boom'))).not.toThrow();
    expect(fallbackTransport).toHaveBeenCalledTimes(1);
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
