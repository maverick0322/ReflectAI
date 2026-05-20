import { NextResponse } from 'next/server';

import { confirmRecoverySchema } from '@/features/auth/schemas/auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const validation = confirmRecoverySchema.safeParse(body ?? {});

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
    const { data, error } = await supabase.auth.exchangeCodeForSession(
      validation.data.code,
    );

    if (error || !data.session) {
      return NextResponse.json(
        { error: { message: 'No se pudo confirmar la recuperacion' } },
        { status: 400 },
      );
    }

    return NextResponse.json({
      message: 'Recuperacion confirmada',
    });
  } catch {
    return NextResponse.json(
      { error: { message: 'Error inesperado al confirmar recuperacion' } },
      { status: 500 },
    );
  }
}
