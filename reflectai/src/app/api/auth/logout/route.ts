import { NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();

    return NextResponse.json({
      message: 'Sesion cerrada correctamente',
    });
  } catch {
    return NextResponse.json(
      { error: { message: 'Error inesperado al cerrar sesion' } },
      { status: 500 },
    );
  }
}
