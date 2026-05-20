export type ServerErrorLogEntry = {
  level: 'error';
  scope: string;
  message: string;
  timestamp: string;
  errorName?: string;
  stack?: string;
};

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

  console.error(buildServerErrorLogEntry(scope, error));
}
