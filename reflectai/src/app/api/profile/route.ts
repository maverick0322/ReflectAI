import { NextResponse } from 'next/server';

import { getAuthenticatedUser } from '@/lib/auth/getAuthenticatedUser';
import { resolveAvatarUrl } from '@/lib/profile/avatar';
import { assertTrustedMutationOrigin } from '@/lib/security/origin';
import { profileSchema } from '@/lib/validations/profile';

function buildFullName(firstName: string, lastName?: string | null) {
  return [firstName, lastName].filter(Boolean).join(' ');
}

async function buildProfileResponse(
  supabase: Awaited<ReturnType<typeof getAuthenticatedUser>>['supabase'],
  profile: {
    id: string;
    first_name: string;
    last_name: string | null;
    full_name: string;
    birth_date: string | null;
    avatar_url: string | null;
  },
  email: string | null | undefined,
) {
  return {
    ...profile,
    avatar_url: await resolveAvatarUrl(supabase, profile.avatar_url),
    email: email ?? null,
  };
}

export async function GET() {
  try {
    const { supabase, user, error: authError } = await getAuthenticatedUser();

    if (authError || !user) {
      return NextResponse.json({ error: { message: 'No autorizado' } }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, full_name, birth_date, avatar_url')
      .eq('id', user.id)
      .maybeSingle();

    if (!data && !error) {
      const metadata = user.user_metadata ?? {};
      const firstName =
        typeof metadata.first_name === 'string' && metadata.first_name.trim()
          ? metadata.first_name
          : 'Usuario';
      const lastName =
        typeof metadata.last_name === 'string' && metadata.last_name.trim()
          ? metadata.last_name
          : null;
      const birthDate =
        typeof metadata.birth_date === 'string' && metadata.birth_date.trim()
          ? metadata.birth_date
          : null;
      const fullName = buildFullName(firstName, lastName);

      const { data: created, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          first_name: firstName,
          last_name: lastName,
          full_name: fullName,
          birth_date: birthDate,
        })
        .select('id, first_name, last_name, full_name, birth_date, avatar_url')
        .single();

      if (createError || !created) {
        return NextResponse.json(
          { error: { message: 'No se pudo crear el perfil' } },
          { status: 500 },
        );
      }

      return NextResponse.json({
        data: await buildProfileResponse(supabase, created, user.email),
        message: 'Perfil obtenido correctamente',
      });
    }

    if (error) {
      return NextResponse.json(
        { error: { message: 'No se pudo obtener el perfil' } },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: { message: 'No se pudo obtener el perfil' } },
        { status: 500 },
      );
    }

    return NextResponse.json({
      data: await buildProfileResponse(supabase, data, user.email),
      message: 'Perfil obtenido correctamente',
    });
  } catch {
    return NextResponse.json(
      { error: { message: 'Error inesperado al obtener perfil' } },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    assertTrustedMutationOrigin(request);

    const { supabase, user, error: authError } = await getAuthenticatedUser();

    if (authError || !user) {
      return NextResponse.json({ error: { message: 'No autorizado' } }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const validation = profileSchema.safeParse(body ?? {});

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

    const fullName = buildFullName(validation.data.firstName, validation.data.lastName);

    const { data, error } = await supabase
      .from('profiles')
      .update({
        first_name: validation.data.firstName,
        last_name: validation.data.lastName ?? null,
        full_name: fullName,
        birth_date: validation.data.birthDate,
      })
      .eq('id', user.id)
      .select('id, first_name, last_name, full_name, birth_date, avatar_url')
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: { message: 'No se pudo actualizar el perfil' } },
        { status: 500 },
      );
    }

    return NextResponse.json({
      data: await buildProfileResponse(supabase, data, user.email),
      message: 'Perfil actualizado correctamente',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Untrusted origin') {
      return NextResponse.json({ error: { message: 'Origen no permitido' } }, { status: 403 });
    }

    return NextResponse.json(
      { error: { message: 'Error inesperado al actualizar perfil' } },
      { status: 500 },
    );
  }
}
