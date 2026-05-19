import { NextResponse } from 'next/server';

import { step1Schema } from '@/components/auth/changePasswordSchemas';
import { getAuthenticatedUser } from '@/lib/auth/getAuthenticatedUser';
import { assertTrustedMutationOrigin } from '@/lib/security/origin';
import { checkRateLimit } from '@/lib/security/rateLimit';
import { rateLimitResponse } from '@/lib/security/responses';

export async function POST(request: Request) {
  try {
    assertTrustedMutationOrigin(request);

    const rateLimit = checkRateLimit(request, {
      key: 'auth:verify-password',
      maxRequests: 8,
      windowMs: 15 * 60 * 1000,
    });

    if (rateLimit.limited) {
      return rateLimitResponse(rateLimit.retryAfterSeconds);
    }

    const body = await request.json().catch(() => null);
    const validation = step1Schema.safeParse(body ?? {});

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

    const { supabase, user, error: authError } = await getAuthenticatedUser();

    if (authError || !user) {
      return NextResponse.json({ error: { message: 'No autorizado' } }, { status: 401 });
    }

    const userRateLimit = checkRateLimit(request, {
      key: 'auth:verify-password:user',
      identifier: user.id,
      maxRequests: 5,
      windowMs: 15 * 60 * 1000,
    });

    if (userRateLimit.limited) {
      return rateLimitResponse(userRateLimit.retryAfterSeconds);
    }

    if (!user.email) {
      return NextResponse.json(
        { error: { message: 'No se pudo validar la contrasena actual' } },
        { status: 400 },
      );
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: validation.data.currentPassword,
    });

    if (signInError) {
      return NextResponse.json(
        { error: { message: 'La contrasena actual es incorrecta' } },
        { status: 400 },
      );
    }

    return NextResponse.json({
      message: 'Contrasena actual validada correctamente',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Untrusted origin') {
      return NextResponse.json({ error: { message: 'Origen no permitido' } }, { status: 403 });
    }

    return NextResponse.json(
      { error: { message: 'Error inesperado al validar la contrasena actual' } },
      { status: 500 },
    );
  }
}
