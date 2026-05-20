import { NextResponse } from 'next/server';

import { loginSchema } from '@/features/auth/schemas/auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
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

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validation.data.email,
      password: validation.data.password,
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: { message: 'Credenciales incorrectas' } },
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
  } catch {
    return NextResponse.json(
      { error: { message: 'Error inesperado al iniciar sesion' } },
      { status: 500 },
    );
  }
}
