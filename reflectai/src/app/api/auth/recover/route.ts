import { NextResponse } from 'next/server';

import {
  assertTrustedMutationOrigin,
  getTrustedSiteOrigin,
} from '@/lib/security/origin';
import { checkRateLimit } from '@/lib/security/rateLimit';
import { rateLimitResponse } from '@/lib/security/responses';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { recoverPasswordSchema } from '@/lib/validations/auth';

function buildRedirectUrl(requestUrl: string) {
  const baseUrl = getTrustedSiteOrigin(requestUrl);
  const callbackUrl = new URL('/auth/callback', baseUrl);
  callbackUrl.searchParams.set('next', '/cambiar-contrasena?mode=recovery');
  return callbackUrl.toString();
}

export async function POST(request: Request) {
  try {
    assertTrustedMutationOrigin(request);

    const rateLimit = checkRateLimit(request, {
      key: 'auth:recover',
      maxRequests: 5,
      windowMs: 15 * 60 * 1000,
    });

    if (rateLimit.limited) {
      return rateLimitResponse(rateLimit.retryAfterSeconds);
    }

    const body = await request.json().catch(() => null);
    const validation = recoverPasswordSchema.safeParse(body ?? {});

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
      key: 'auth:recover:account',
      identifier: validation.data.email,
      maxRequests: 3,
      windowMs: 15 * 60 * 1000,
    });

    if (accountRateLimit.limited) {
      return rateLimitResponse(accountRateLimit.retryAfterSeconds);
    }

    const supabase = await createServerSupabaseClient();
    const redirectTo = buildRedirectUrl(request.url);
    const { error } = await supabase.auth.resetPasswordForEmail(validation.data.email, {
      redirectTo,
    });

    if (error) {
      console.error('Supabase password recovery failed', error.message);
      const normalizedMessage = error.message.toLowerCase();
      const isRateLimited =
        normalizedMessage.includes('rate limit') ||
        normalizedMessage.includes('security purposes');
      const isEmailDeliveryError = normalizedMessage.includes('error sending');

      return NextResponse.json(
        {
          error: {
            message: isRateLimited
              ? 'Se hicieron demasiados intentos. Espera unos minutos antes de pedir otro enlace.'
              : isEmailDeliveryError
                ? 'Supabase no pudo enviar el correo de recuperacion. Revisa la configuracion SMTP o intenta con otro correo.'
                : 'No se pudo enviar el enlace de recuperacion',
          },
        },
        { status: isRateLimited ? 429 : 500 },
      );
    }

    return NextResponse.json({
      message: 'Enlace de recuperacion enviado',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Untrusted origin') {
      return NextResponse.json({ error: { message: 'Origen no permitido' } }, { status: 403 });
    }

    return NextResponse.json(
      { error: { message: 'Error inesperado al recuperar contrasena' } },
      { status: 500 },
    );
  }
}
