import { NextResponse } from 'next/server';

import { getAuthenticatedUser } from '@/lib/auth/getAuthenticatedUser';
import { assertTrustedMutationOrigin } from '@/lib/security/origin';
import { checkRateLimit } from '@/lib/security/rateLimit';
import { rateLimitResponse } from '@/lib/security/responses';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { deleteAccountSchema } from '@/lib/validations/auth';

export async function DELETE(request: Request) {
  try {
    assertTrustedMutationOrigin(request);

    const rateLimit = checkRateLimit(request, {
      key: 'auth:delete-account',
      maxRequests: 3,
      windowMs: 15 * 60 * 1000,
    });

    if (rateLimit.limited) {
      return rateLimitResponse(rateLimit.retryAfterSeconds);
    }

    const body = await request.json().catch(() => null);
    const validation = deleteAccountSchema.safeParse(body ?? {});

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
      key: 'auth:delete-account:user',
      identifier: user.id,
      maxRequests: 2,
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

    const signInResult = await supabase.auth.signInWithPassword({
      email: user.email,
      password: validation.data.currentPassword,
    });
    const signInError = signInResult?.error ?? null;

    if (signInError) {
      return NextResponse.json(
        { error: { message: 'La contrasena actual es incorrecta' } },
        { status: 400 },
      );
    }

    const adminClient = createAdminSupabaseClient();
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);

    if (deleteError) {
      return NextResponse.json(
        {
          error: {
            message:
              'No se pudo eliminar la cuenta. Revisa las relaciones en cascada de profiles y reflection_sessions.',
          },
        },
        { status: 500 },
      );
    }

    await supabase.auth.signOut();

    return NextResponse.json({
      message: 'Cuenta eliminada correctamente',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Untrusted origin') {
      return NextResponse.json({ error: { message: 'Origen no permitido' } }, { status: 403 });
    }

    return NextResponse.json(
      { error: { message: 'Error inesperado al eliminar cuenta' } },
      { status: 500 },
    );
  }
}
