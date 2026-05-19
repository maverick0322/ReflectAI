import { NextResponse } from 'next/server';

import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { recoverPasswordSchema } from '@/lib/validations/auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';

function buildRedirectUrl(requestUrl: string) {
  const baseUrl = new URL(requestUrl).origin;
  const callbackUrl = new URL('/auth/callback', baseUrl);
  callbackUrl.searchParams.set('next', '/cambiar-contrasena?mode=recovery');
  return callbackUrl.toString();
}

async function buildDevelopmentRecoveryLink(email: string, redirectTo: string) {
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  try {
    const supabaseAdmin = createAdminSupabaseClient();
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo,
      },
    });

    if (error) {
      console.error('Supabase recovery link generation failed', error.message);
      return null;
    }

    return data.properties.action_link;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
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

    const supabase = await createServerSupabaseClient();
    const redirectTo = buildRedirectUrl(request.url);
    const { error } = await supabase.auth.resetPasswordForEmail(
      validation.data.email,
      {
        redirectTo,
      },
    );

    if (error) {
      console.error('Supabase password recovery failed', error.message);
      const normalizedMessage = error.message.toLowerCase();
      const isRateLimited =
        normalizedMessage.includes('rate limit') ||
        normalizedMessage.includes('security purposes');
      const isEmailDeliveryError = normalizedMessage.includes('error sending');

      if (isRateLimited || isEmailDeliveryError) {
        const recoveryLink = await buildDevelopmentRecoveryLink(
          validation.data.email,
          redirectTo,
        );

        if (recoveryLink) {
          return NextResponse.json({
            data: {
              recoveryLink,
            },
            message:
              'Supabase no pudo enviar el correo, pero se genero un enlace de recuperacion para desarrollo.',
          });
        }
      }

      return NextResponse.json(
        {
          error: {
            message: isRateLimited
              ? 'Se hicieron demasiados intentos. Espera unos minutos antes de pedir otro enlace.'
              : isEmailDeliveryError
                ? 'Supabase no pudo enviar el correo de recuperacion. Revisa la configuracion SMTP o intenta con otro correo.'
              : 'No se pudo enviar el enlace de recuperacion',
            details: error.message,
          },
        },
        { status: isRateLimited ? 429 : 500 },
      );
    }

    return NextResponse.json({
      message: 'Enlace de recuperacion enviado',
    });
  } catch {
    return NextResponse.json(
      { error: { message: 'Error inesperado al recuperar contraseña' } },
      { status: 500 },
    );
  }
}
