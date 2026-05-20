import { NextResponse } from 'next/server';

import { RouteError, requireAuthenticatedUser } from '@/lib/api/route';
import { logServerError } from '@/lib/monitoring/logger';

export async function GET() {
  try {
    await requireAuthenticatedUser();

    return NextResponse.json({
      authenticated: true,
    });
  } catch (error: unknown) {
    if (error instanceof RouteError && error.status === 401) {
      return NextResponse.json(
        {
          authenticated: false,
        },
        { status: 401 },
      );
    }

    logServerError('auth session status failed', error);
    return NextResponse.json(
      {
        authenticated: false,
      },
      { status: 500 },
    );
  }
}
