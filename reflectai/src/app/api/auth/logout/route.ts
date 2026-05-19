import { NextResponse } from 'next/server';

import { assertTrustedMutationOrigin } from '@/lib/security/origin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    assertTrustedMutationOrigin(request);

    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();

    return NextResponse.json({
      message: 'Sesion cerrada correctamente',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Untrusted origin') {
      return NextResponse.json({ error: { message: 'Origen no permitido' } }, { status: 403 });
    }

    return NextResponse.json(
      { error: { message: 'Error inesperado al cerrar sesion' } },
      { status: 500 },
    );
  }
}
