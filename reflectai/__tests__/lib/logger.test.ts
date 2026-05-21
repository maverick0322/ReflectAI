import { afterEach, describe, expect, it, vi } from 'vitest';
import { channel } from 'node:diagnostics_channel';

import {
  buildServerErrorLogEntry,
  logServerError,
  SERVER_ERROR_LOG_CHANNEL,
  type ServerErrorLogEntry,
} from '@/lib/monitoring/logger';

afterEach(() => {
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
