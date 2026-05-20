export interface ApiErrorPayload {
  message: string;
  details?: unknown;
  field?: string;
}

export class ApiError extends Error {
  status: number;
  payload?: ApiErrorPayload;

  constructor(message: string, status: number, payload?: ApiErrorPayload) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

function extractErrorPayload(payload: unknown): ApiErrorPayload | undefined {
  if (payload && typeof payload === 'object' && 'error' in payload) {
    const error = (payload as { error?: unknown }).error;
    if (error && typeof error === 'object' && 'message' in error) {
      const message = (error as { message?: unknown }).message;
      if (typeof message === 'string') {
        return {
          message,
          details: (error as { details?: unknown }).details,
          field: (error as { field?: string }).field,
        };
      }
    }
  }

  return undefined;
}

async function readJsonPayload(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch (error: unknown) {
    void error;
    return null;
  }
}

export async function requestJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, init);
  const payload = await readJsonPayload(response);

  if (!response.ok) {
    const errorPayload = extractErrorPayload(payload) ?? {
      message: 'Request failed',
    };
    throw new ApiError(errorPayload.message, response.status, errorPayload);
  }

  return payload as T;
}
