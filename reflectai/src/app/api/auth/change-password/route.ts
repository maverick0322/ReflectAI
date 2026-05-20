import { NextResponse } from 'next/server';

import { changePasswordSchema } from '@/features/auth/schemas/auth';
import { getAuthenticatedUser } from '@/lib/auth/getAuthenticatedUser';

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
          { error: { message: 'Unable to validate the current password' } },
          { status: 400 },
        );
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: validation.data.currentPassword,
      });

      if (signInError) {
        return NextResponse.json(
          { error: { message: 'The current password is incorrect' } },
          { status: 400 },
        );
      }
    }

    const { error } = await supabase.auth.updateUser({
      password: validation.data.newPassword,
    });

    if (error) {
      return NextResponse.json(
        { error: { message: 'Unable to update the password' } },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: 'Password updated successfully',
    });
  } catch {
    return NextResponse.json(
      { error: { message: 'Unexpected error while updating the password' } },
      { status: 500 },
    );
  }
}
