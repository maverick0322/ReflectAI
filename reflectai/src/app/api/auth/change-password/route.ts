import { NextResponse } from 'next/server';

import { getAuthenticatedUser } from '@/lib/auth/getAuthenticatedUser';
import { changePasswordSchema } from '@/lib/validations/auth';

export async function POST(request: Request) {
  try {
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

    if (validation.data.currentPassword) {
      if (!user.email) {
        return NextResponse.json(
          { error: { message: 'No se pudo validar la contraseña actual' } },
          { status: 400 },
        );
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: validation.data.currentPassword,
      });

      if (signInError) {
        return NextResponse.json(
          { error: { message: 'La contraseña actual es incorrecta' } },
          { status: 400 },
        );
      }
    }

    const { error } = await supabase.auth.updateUser({
      password: validation.data.newPassword,
    });

    if (error) {
      return NextResponse.json(
        { error: { message: 'No se pudo actualizar la contraseña' } },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: 'Contraseña actualizada correctamente',
    });
  } catch {
    return NextResponse.json(
      { error: { message: 'Error inesperado al actualizar contraseña' } },
      { status: 500 },
    );
  }
}
