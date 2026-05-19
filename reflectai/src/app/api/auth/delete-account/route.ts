import { NextResponse } from 'next/server';

import { getAuthenticatedUser } from '@/lib/auth/getAuthenticatedUser';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export async function DELETE() {
  try {
    const { supabase, user, error: authError } = await getAuthenticatedUser();

    if (authError || !user) {
      return NextResponse.json({ error: { message: 'No autorizado' } }, { status: 401 });
    }

    const adminClient = createAdminSupabaseClient();

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);

    if (deleteError) {
      return NextResponse.json(
        { error: { message: 'No se pudo eliminar la cuenta. Revisa las relaciones en cascada de profiles y reflection_sessions.' } },
        { status: 500 },
      );
    }

    await supabase.auth.signOut();

    return NextResponse.json({
      message: 'Cuenta eliminada correctamente',
    });
  } catch {
    return NextResponse.json(
      { error: { message: 'Error inesperado al eliminar cuenta' } },
      { status: 500 },
    );
  }
}
