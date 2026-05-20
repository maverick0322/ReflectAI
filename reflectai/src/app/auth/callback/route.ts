import { NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

function getSafeNextPath(value: string | null) {
  if (!value || !value.startsWith('/')) {
    return '/dashboard';
  }

  if (value.startsWith('//')) {
    return '/dashboard';
  }

  return value;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = getSafeNextPath(requestUrl.searchParams.get('next'));
  const redirectUrl = new URL(next, requestUrl.origin);

  if (!code) {
    redirectUrl.pathname = '/login';
    redirectUrl.search = '?auth_error=missing_code';
    return NextResponse.redirect(redirectUrl);
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    redirectUrl.pathname = '/login';
    redirectUrl.search = '?auth_error=invalid_code';
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.redirect(redirectUrl);
}
