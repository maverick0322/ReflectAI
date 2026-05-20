import { NextResponse } from 'next/server';

import { apiMessages } from '@/lib/copy/api';

export function rateLimitResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    {
      error: {
        message: apiMessages.common.tooManyRequests,
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
