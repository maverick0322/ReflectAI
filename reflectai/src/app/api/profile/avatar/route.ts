import { NextResponse } from 'next/server';

import { getAuthenticatedUser } from '@/lib/auth/getAuthenticatedUser';

const AVATAR_BUCKET = 'profile-avatars';
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export async function POST(request: Request) {
  try {
    const { supabase, user, error: authError } = await getAuthenticatedUser();

    if (authError || !user) {
      return NextResponse.json({ error: { message: 'No autorizado' } }, { status: 401 });
    }

    const formData = await request.formData();
    const avatar = formData.get('avatar');

    if (!(avatar instanceof File)) {
      return NextResponse.json(
        { error: { message: 'La foto de perfil es obligatoria' } },
        { status: 400 },
      );
    }

    const extension = ALLOWED_AVATAR_TYPES[avatar.type];
    if (!extension) {
      return NextResponse.json(
        { error: { message: 'Solo se permiten formatos JPG, PNG o WEBP' } },
        { status: 400 },
      );
    }

    if (avatar.size > MAX_AVATAR_SIZE) {
      return NextResponse.json(
        { error: { message: 'La imagen debe pesar menos de 2MB' } },
        { status: 400 },
      );
    }

    const avatarPath = `${user.id}/avatar-${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(avatarPath, avatar, {
        cacheControl: '3600',
        contentType: avatar.type,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        {
          error: {
            message:
              'No se pudo subir la foto. Verifica que exista el bucket profile-avatars en Supabase Storage.',
          },
        },
        { status: 500 },
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from(AVATAR_BUCKET)
      .getPublicUrl(avatarPath);

    const { data, error } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrlData.publicUrl })
      .eq('id', user.id)
      .select('id, first_name, last_name, full_name, birth_date, avatar_url')
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: { message: 'No se pudo actualizar la foto de perfil' } },
        { status: 500 },
      );
    }

    return NextResponse.json({
      data: {
        ...data,
        email: user.email,
      },
      message: 'Foto de perfil actualizada correctamente',
    });
  } catch {
    return NextResponse.json(
      { error: { message: 'Error inesperado al subir la foto de perfil' } },
      { status: 500 },
    );
  }
}
