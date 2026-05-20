import { NextResponse } from 'next/server';
import type { ZodType } from 'zod';

import { getAuthenticatedUser } from '@/lib/auth/getAuthenticatedUser';
import { apiMessages } from '@/lib/copy/api';
import { logServerError } from '@/lib/monitoring/logger';
import { assertTrustedMutationOrigin } from '@/lib/security/origin';
import { checkRateLimit } from '@/lib/security/rateLimit';
import { rateLimitResponse } from '@/lib/security/responses';

type ErrorDetails = {
  details?: unknown;
  field?: string;
};

type ParseJsonBodyOptions<T> = {
  request: Request;
  schema: ZodType<T>;
  fallback?: unknown;
  mapInput?: (body: unknown) => unknown;
  invalidMessage?: string;
};

type AuthenticatedUserResult = Awaited<ReturnType<typeof getAuthenticatedUser>>;
type AuthenticatedSupabaseClient = AuthenticatedUserResult['supabase'];
type AuthenticatedUser = NonNullable<AuthenticatedUserResult['user']>;

export class RouteError extends Error {
  public readonly status: number;
  public readonly payload: {
    error: {
      message: string;
      details?: unknown;
      field?: string;
    };
  };

  public readonly headers?: HeadersInit;

  constructor(
    status: number,
    message: string,
    details?: ErrorDetails,
    headers?: HeadersInit,
    cause?: unknown,
  ) {
    super(message, cause ? { cause } : undefined);
    this.name = 'RouteError';
    this.status = status;
    this.payload = {
      error: {
        message,
        ...(details?.details === undefined ? {} : { details: details.details }),
        ...(details?.field === undefined ? {} : { field: details.field }),
      },
    };
    this.headers = headers;
  }
}

class RateLimitError extends Error {
  public readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super(apiMessages.common.tooManyRequests);
    this.name = 'RateLimitError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export function buildErrorResponse(
  status: number,
  message: string,
  details?: ErrorDetails,
) {
  return NextResponse.json(
    {
      error: {
        message,
        ...(details?.details === undefined ? {} : { details: details.details }),
        ...(details?.field === undefined ? {} : { field: details.field }),
      },
    },
    { status },
  );
}

export function buildSuccessResponse(
  payload: Record<string, unknown>,
  init?: ResponseInit,
) {
  return NextResponse.json(payload, init);
}

export function enforceTrustedMutationOrigin(request: Request) {
  try {
    assertTrustedMutationOrigin(request);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Untrusted origin') {
      throw new RouteError(403, apiMessages.common.forbiddenOrigin, undefined, undefined, error);
    }

    throw error;
  }
}

export function enforceRateLimit(
  request: Request | undefined,
  options: Parameters<typeof checkRateLimit>[1],
) {
  const result = checkRateLimit(request, options);

  if (result.limited) {
    throw new RateLimitError(result.retryAfterSeconds);
  }
}

export async function readJsonBody(
  request: Request,
  fallback: unknown = null,
): Promise<unknown> {
  try {
    return await request.json();
  } catch (error: unknown) {
    void error;
    return fallback;
  }
}

export async function parseJsonBody<T>({
  request,
  schema,
  fallback = null,
  mapInput,
  invalidMessage = apiMessages.common.invalidData,
}: ParseJsonBodyOptions<T>): Promise<T> {
  const body = await readJsonBody(request, fallback);
  const input = mapInput ? mapInput(body) : (body ?? {});
  const validation = schema.safeParse(input);

  if (!validation.success) {
    throw new RouteError(400, invalidMessage, {
      details: validation.error.flatten(),
    });
  }

  return validation.data;
}

export async function requireAuthenticatedUser(): Promise<{
  supabase: AuthenticatedSupabaseClient;
  user: AuthenticatedUser;
}> {
  const { supabase, user, error } = await getAuthenticatedUser();

  if (error || !user) {
    throw new RouteError(401, apiMessages.common.unauthorized);
  }

  return {
    supabase,
    user,
  };
}

export function throwRouteError(
  status: number,
  message: string,
  details?: ErrorDetails,
) : never {
  throw new RouteError(status, message, details);
}

export function toRouteErrorResponse(
  error: unknown,
  fallbackMessage: string,
  logLabel?: string,
) {
  if (error instanceof RateLimitError) {
    return rateLimitResponse(error.retryAfterSeconds);
  }

  if (error instanceof RouteError) {
    return NextResponse.json(error.payload, {
      status: error.status,
      headers: error.headers,
    });
  }

  if (error instanceof Error && error.message === 'Untrusted origin') {
    return buildErrorResponse(403, apiMessages.common.forbiddenOrigin);
  }

  if (logLabel) {
    logServerError(logLabel, error);
  }

  return buildErrorResponse(500, fallbackMessage);
}
