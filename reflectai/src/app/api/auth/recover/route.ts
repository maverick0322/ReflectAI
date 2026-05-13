import { NextResponse } from 'next/server';

import { recoverPasswordSchema } from '@/lib/validations/auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';

function buildRedirectUrl(requestUrl: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const baseUrl = siteUrl ?? new URL(requestUrl).origin;
  const callbackUrl = new URL('/auth/callback', baseUrl);
  callbackUrl.searchParams.set('next', '/cambiar-contrasena?mode=recovery');
  return callbackUrl.toString();
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
      return NextResponse.json(
        { error: { message: 'No se pudo enviar el enlace de recuperacion' } },
        { status: 500 },
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
