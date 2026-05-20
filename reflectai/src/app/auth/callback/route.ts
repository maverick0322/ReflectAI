import { NextResponse } from 'next/server';

import { resolveAuthCallbackRedirect } from '@/lib/auth/session';

export async function GET(request: Request) {
  return NextResponse.redirect(await resolveAuthCallbackRedirect(request));
}
