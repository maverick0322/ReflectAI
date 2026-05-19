import { NextResponse } from 'next/server';

import { getAuthenticatedUser } from '@/lib/auth/getAuthenticatedUser';
import { AVATAR_BUCKET, resolveAvatarUrl } from '@/lib/profile/avatar';
import { assertTrustedMutationOrigin } from '@/lib/security/origin';
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

async function hasAllowedImageSignature(file: File) {
  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());

  if (file.type === 'image/jpeg') {
    return header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
  }

  if (file.type === 'image/png') {
    return (
      header[0] === 0x89 &&
      header[1] === 0x50 &&
      header[2] === 0x4e &&
      header[3] === 0x47 &&
      header[4] === 0x0d &&
      header[5] === 0x0a &&
      header[6] === 0x1a &&
      header[7] === 0x0a
    );
  }

  if (file.type === 'image/webp') {
    return (
      header[0] === 0x52 &&
      header[1] === 0x49 &&
      header[2] === 0x46 &&
      header[3] === 0x46 &&
      header[8] === 0x57 &&
      header[9] === 0x45 &&
      header[10] === 0x42 &&
      header[11] === 0x50
    );
  }

  return false;
}

export async function POST(request: Request) {
  try {
    assertTrustedMutationOrigin(request);

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

    if (!(await hasAllowedImageSignature(avatar))) {
      return NextResponse.json(
        { error: { message: 'El contenido de la imagen no coincide con el formato permitido' } },
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

    const { data, error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarPath })
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
        avatar_url: await resolveAvatarUrl(supabase, data.avatar_url),
        email: user.email,
      },
      message: 'Foto de perfil actualizada correctamente',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Untrusted origin') {
      return NextResponse.json({ error: { message: 'Origen no permitido' } }, { status: 403 });
    }

    return NextResponse.json(
      { error: { message: 'Error inesperado al subir la foto de perfil' } },
      { status: 500 },
    );
  }
}
