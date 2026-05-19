import { NextResponse } from 'next/server';

export function rateLimitResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    {
      error: {
        message: 'Demasiados intentos. Espera unos minutos antes de continuar.',
      },
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSeconds),
      },
    },
  );
}
