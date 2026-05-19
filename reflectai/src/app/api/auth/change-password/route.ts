import { NextResponse } from 'next/server';

import { getAuthenticatedUser } from '@/lib/auth/getAuthenticatedUser';
import { assertTrustedMutationOrigin } from '@/lib/security/origin';
import { checkRateLimit } from '@/lib/security/rateLimit';
import { rateLimitResponse } from '@/lib/security/responses';
import { changePasswordSchema } from '@/lib/validations/auth';

export async function POST(request: Request) {
  try {
    assertTrustedMutationOrigin(request);

    const rateLimit = checkRateLimit(request, {
      key: 'auth:change-password',
      maxRequests: 6,
      windowMs: 15 * 60 * 1000,
    });

    if (rateLimit.limited) {
      return rateLimitResponse(rateLimit.retryAfterSeconds);
    }

    const body = await request.json().catch(() => null);
    const validation = changePasswordSchema.safeParse(body ?? {});

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
      key: 'auth:change-password:user',
      identifier: user.id,
      maxRequests: 4,
      windowMs: 15 * 60 * 1000,
    });

    if (userRateLimit.limited) {
      return rateLimitResponse(userRateLimit.retryAfterSeconds);
    }

    if (validation.data.currentPassword) {
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
    }

    const { error } = await supabase.auth.updateUser({
      password: validation.data.newPassword,
    });

    if (error) {
      console.error('Supabase change password failed', error.message);
      const normalizedMessage = error.message.toLowerCase();
      const missingSession =
        normalizedMessage.includes('session') ||
        normalizedMessage.includes('not authenticated') ||
        normalizedMessage.includes('invalid claim') ||
        normalizedMessage.includes('missing sub');
      const samePassword =
        normalizedMessage.includes('same password') ||
        normalizedMessage.includes('should be different');

      return NextResponse.json(
        {
          error: {
            message: missingSession
              ? 'La sesion de recuperacion no es valida o expiro. Solicita un nuevo enlace.'
              : samePassword
                ? 'La nueva contrasena debe ser diferente a la actual.'
                : 'No se pudo actualizar la contrasena',
          },
        },
        { status: missingSession || samePassword ? 400 : 500 },
      );
    }

    return NextResponse.json({
      message: 'Contrasena actualizada correctamente',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Untrusted origin') {
      return NextResponse.json({ error: { message: 'Origen no permitido' } }, { status: 403 });
    }

    return NextResponse.json(
      { error: { message: 'Error inesperado al actualizar contrasena' } },
      { status: 500 },
    );
  }
}
