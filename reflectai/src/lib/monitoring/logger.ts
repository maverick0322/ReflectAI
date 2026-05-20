import { channel } from 'node:diagnostics_channel';

export const SERVER_ERROR_LOG_CHANNEL = 'reflectai.server.error';

export type ServerErrorLogEntry = {
  level: 'error';
  scope: string;
  message: string;
  timestamp: string;
  errorName?: string;
  stack?: string;
};

export type ServerErrorLogTransport = (entry: ServerErrorLogEntry) => void;

const serverErrorLogChannel = channel(SERVER_ERROR_LOG_CHANNEL);

function writeServerErrorLogToStderr(entry: ServerErrorLogEntry) {
  process.stderr.write(`${JSON.stringify(entry)}\n`);
}

let fallbackTransport: ServerErrorLogTransport = writeServerErrorLogToStderr;

export function setServerErrorLogFallbackTransport(
  transport: ServerErrorLogTransport,
) {
  fallbackTransport = transport;
}

export function resetServerErrorLogFallbackTransport() {
  fallbackTransport = writeServerErrorLogToStderr;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Unknown error';
}

export function buildServerErrorLogEntry(
  scope: string,
  error: unknown,
): ServerErrorLogEntry {
  return {
    level: 'error',
    scope,
    message: getErrorMessage(error),
    timestamp: new Date().toISOString(),
    ...(error instanceof Error && error.name ? { errorName: error.name } : {}),
    ...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
  };
}

export function logServerError(scope: string, error: unknown) {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  const entry = buildServerErrorLogEntry(scope, error);
  const hasSubscribers = serverErrorLogChannel.hasSubscribers;

  serverErrorLogChannel.publish(entry);

  if (!hasSubscribers) {
    fallbackTransport(entry);
  }
}
