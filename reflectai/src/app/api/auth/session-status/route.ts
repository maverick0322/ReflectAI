import { NextResponse } from 'next/server';

import { getAuthenticatedUser } from '@/lib/auth/getAuthenticatedUser';

export async function GET() {
  try {
    const { user, error } = await getAuthenticatedUser();

    if (error || !user) {
      return NextResponse.json(
        {
          authenticated: false,
        },
        { status: 401 },
      );
    }

    return NextResponse.json({
      authenticated: true,
    });
  } catch {
    return NextResponse.json(
      {
        authenticated: false,
      },
      { status: 500 },
    );
  }
}
