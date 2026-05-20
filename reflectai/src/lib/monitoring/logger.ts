function getErrorLogPayload(error: unknown) {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Unknown error';
}

export function logServerError(scope: string, error: unknown) {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  console.error(scope, getErrorLogPayload(error));
}
