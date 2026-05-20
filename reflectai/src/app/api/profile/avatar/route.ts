import {
  buildSuccessResponse,
  enforceTrustedMutationOrigin,
  requireAuthenticatedUser,
  throwRouteError,
  toRouteErrorResponse,
} from '@/lib/api/route';
import { apiMessages } from '@/lib/copy/api';
import { AVATAR_BUCKET, resolveAvatarUrl } from '@/lib/profile/avatar';
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const IMAGE_SIGNATURE_CHECKERS = {
  'image/jpeg': (header: Uint8Array) =>
    header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff,
  'image/png': (header: Uint8Array) =>
    header[0] === 0x89 &&
    header[1] === 0x50 &&
    header[2] === 0x4e &&
    header[3] === 0x47 &&
    header[4] === 0x0d &&
    header[5] === 0x0a &&
    header[6] === 0x1a &&
    header[7] === 0x0a,
  'image/webp': (header: Uint8Array) =>
    header[0] === 0x52 &&
    header[1] === 0x49 &&
    header[2] === 0x46 &&
    header[3] === 0x46 &&
    header[8] === 0x57 &&
    header[9] === 0x45 &&
    header[10] === 0x42 &&
    header[11] === 0x50,
} as const;

type SupportedAvatarType = keyof typeof IMAGE_SIGNATURE_CHECKERS;

async function hasAllowedImageSignature(file: File) {
  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const checker = IMAGE_SIGNATURE_CHECKERS[file.type as SupportedAvatarType];
  return checker ? checker(header) : false;
}

function validateAvatarFile(
  avatarEntry: FormDataEntryValue | null,
): { avatar: File; extension: string } {
  if (!(avatarEntry instanceof File)) {
    throwRouteError(400, apiMessages.profile.avatarRequired);
  }

  const avatar = avatarEntry;
  const extension = ALLOWED_AVATAR_TYPES[avatar.type];

  if (!extension) {
    throwRouteError(400, apiMessages.profile.avatarInvalidType);
  }

  if (avatar.size > MAX_AVATAR_SIZE) {
    throwRouteError(400, apiMessages.profile.avatarTooLarge);
  }

  return {
    avatar,
    extension,
  };
}

export async function POST(request: Request) {
  try {
    enforceTrustedMutationOrigin(request);
    const { supabase, user } = await requireAuthenticatedUser();
    const formData = await request.formData();
    const avatarInput = validateAvatarFile(formData.get('avatar'));

    if (!(await hasAllowedImageSignature(avatarInput.avatar))) {
      throwRouteError(400, apiMessages.profile.avatarInvalidSignature);
    }

    const avatarPath = `${user.id}/avatar-${Date.now()}.${avatarInput.extension}`;
    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(avatarPath, avatarInput.avatar, {
        cacheControl: '3600',
        contentType: avatarInput.avatar.type,
        upsert: true,
      });

    if (uploadError) {
      throwRouteError(500, apiMessages.profile.avatarUploadFailed);
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarPath })
      .eq('id', user.id)
      .select('id, first_name, last_name, full_name, birth_date, avatar_url')
      .single();

    if (error || !data) {
      throwRouteError(500, apiMessages.profile.avatarUpdateFailed);
    }

    return buildSuccessResponse({
      data: {
        ...data,
        avatar_url: await resolveAvatarUrl(supabase, data.avatar_url),
        email: user.email,
      },
      message: apiMessages.profile.avatarUpdateSucceeded,
    });
  } catch (error: unknown) {
    return toRouteErrorResponse(
      error,
      apiMessages.profile.avatarUnexpected,
      'profile avatar upload failed',
    );
  }
}
