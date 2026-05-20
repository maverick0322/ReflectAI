import { NextResponse } from 'next/server';

import { logServerError } from '@/lib/monitoring/logger';
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
  const authErrorCode = requestUrl.searchParams.get('error_code');
  const next = getSafeNextPath(requestUrl.searchParams.get('next'));
  const redirectUrl = new URL(next, requestUrl.origin);

  if (authErrorCode) {
    redirectUrl.pathname = '/recuperar';
    redirectUrl.search = `?recovery_error=${encodeURIComponent(authErrorCode)}`;
    return NextResponse.redirect(redirectUrl);
  }

  if (!code) {
    redirectUrl.pathname = '/login';
    redirectUrl.search = '?auth_error=missing_code';
    return NextResponse.redirect(redirectUrl);
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    logServerError('Supabase auth callback failed', error);
    const isRecoveryRedirect = next.startsWith('/cambiar-contrasena');
    redirectUrl.pathname = isRecoveryRedirect ? '/recuperar' : '/login';
    redirectUrl.search = isRecoveryRedirect
      ? '?recovery_error=invalid_code'
      : '?auth_error=invalid_code';
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.redirect(redirectUrl);
}
