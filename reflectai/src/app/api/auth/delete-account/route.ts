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

    const { error: sessionsError } = await adminClient
      .from('reflection_sessions')
      .delete()
      .eq('user_id', user.id);

    if (sessionsError) {
      return NextResponse.json(
        { error: { message: 'No se pudo eliminar el historial' } },
        { status: 500 },
      );
    }

    const { error: profileError } = await adminClient
      .from('profiles')
      .delete()
      .eq('id', user.id);

    if (profileError) {
      return NextResponse.json(
        { error: { message: 'No se pudo eliminar el perfil' } },
        { status: 500 },
      );
    }

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);

    if (deleteError) {
      return NextResponse.json(
        { error: { message: 'No se pudo eliminar la cuenta' } },
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
