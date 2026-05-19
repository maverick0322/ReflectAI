import { NextResponse } from 'next/server';

import { assertTrustedMutationOrigin } from '@/lib/security/origin';
import { checkRateLimit } from '@/lib/security/rateLimit';
import { rateLimitResponse } from '@/lib/security/responses';
import { loginSchema } from '@/lib/validations/auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    assertTrustedMutationOrigin(request);

    const rateLimit = checkRateLimit(request, {
      key: 'auth:login',
      maxRequests: 10,
      windowMs: 15 * 60 * 1000,
    });

    if (rateLimit.limited) {
      return rateLimitResponse(rateLimit.retryAfterSeconds);
    }

    const body = await request.json().catch(() => null);
    const validation = loginSchema.safeParse(body ?? {});

    if (!validation.success) {
      return NextResponse.json(
        {
          error: {
            message: 'Datos invalidos',
            details: validation.error.flatten(),
          },
        },
        { status: 400 },
      );
    }

    const accountRateLimit = checkRateLimit(request, {
      key: 'auth:login:account',
      identifier: validation.data.email,
      maxRequests: 5,
      windowMs: 15 * 60 * 1000,
    });

    if (accountRateLimit.limited) {
      return rateLimitResponse(accountRateLimit.retryAfterSeconds);
    }

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validation.data.email,
      password: validation.data.password,
    });

    if (error || !data.user) {
      if (error) {
        console.error('Supabase login failed', error.message);
      }

      const isUnconfirmedEmail = error?.message.toLowerCase().includes('email not confirmed');

      return NextResponse.json(
        {
          error: {
            message: isUnconfirmedEmail
              ? 'No se pudo iniciar sesion con las credenciales proporcionadas.'
              : 'No se pudo iniciar sesion con las credenciales proporcionadas.',
          },
        },
        { status: 401 },
      );
    }

    return NextResponse.json({
      data: {
        id: data.user.id,
        email: data.user.email,
        userMetadata: data.user.user_metadata,
      },
      message: 'Sesion iniciada correctamente',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Untrusted origin') {
      return NextResponse.json({ error: { message: 'Origen no permitido' } }, { status: 403 });
    }

    return NextResponse.json(
      { error: { message: 'Error inesperado al iniciar sesion' } },
      { status: 500 },
    );
  }
}
