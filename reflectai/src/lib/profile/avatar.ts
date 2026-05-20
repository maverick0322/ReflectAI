export const AVATAR_BUCKET = 'profile-avatars';
const SIGNED_URL_TTL_SECONDS = 60 * 60;
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

type StorageBucketClient = {
  upload?: (
    path: string,
    file: File,
    options: {
      cacheControl: string;
      contentType: string;
      upsert: boolean;
    },
  ) => PromiseLike<{ error: unknown }>;
  createSignedUrl: (
    path: string,
    expiresIn: number,
  ) => PromiseLike<{ data: { signedUrl: string } | null; error: unknown }>;
};

type StorageClient = {
  from: (bucket: string) => StorageBucketClient;
};

type ProfileRecord = {
  id: string;
  first_name: string;
  last_name: string | null;
  full_name: string;
  birth_date: string | null;
  avatar_url: string | null;
};

type AvatarStorageSupabaseClient = {
  storage: StorageClient;
};

type AvatarMutationSupabaseClient = AvatarStorageSupabaseClient & {
  from?: (table: string) => {
    update: (input: Record<string, unknown>) => {
      eq: (column: string, value: string) => {
        select: (columns: string) => {
          single: () => PromiseLike<{
            data: ProfileRecord | null;
            error: unknown;
          }>;
        };
      };
    };
  };
};

type SupportedAvatarType = keyof typeof IMAGE_SIGNATURE_CHECKERS;

function isSupportedAvatarType(type: string): type is SupportedAvatarType {
  return type in IMAGE_SIGNATURE_CHECKERS;
}

function isHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (error: unknown) {
    void error;
    return false;
  }
}

export async function resolveAvatarUrl(
  supabase: AvatarStorageSupabaseClient,
  avatarReference: string | null,
) {
  if (!avatarReference) {
    return null;
  }

  if (isHttpUrl(avatarReference)) {
    return avatarReference;
  }

  const { data, error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .createSignedUrl(avatarReference, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    return null;
  }

  return data.signedUrl;
}

async function hasAllowedImageSignature(file: File) {
  if (!isSupportedAvatarType(file.type)) {
    return false;
  }

  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  return IMAGE_SIGNATURE_CHECKERS[file.type](header);
}

export function validateAvatarFile(
  avatarEntry: FormDataEntryValue | null,
):
  | {
      error: 'required' | 'invalid_type' | 'too_large';
    }
  | {
      avatar: File;
      extension: string;
    } {
  if (!(avatarEntry instanceof File)) {
    return {
      error: 'required' as const,
    };
  }

  const extension = ALLOWED_AVATAR_TYPES[avatarEntry.type];

  if (!extension) {
    return {
      error: 'invalid_type' as const,
    };
  }

  if (avatarEntry.size > MAX_AVATAR_SIZE) {
    return {
      error: 'too_large' as const,
    };
  }

  return {
    avatar: avatarEntry,
    extension,
  };
}

export async function uploadProfileAvatar(
  supabase: AvatarMutationSupabaseClient,
  userId: string,
  avatar: File,
  extension: string,
):
  Promise<
    | {
        error: 'invalid_signature' | 'upload_failed' | 'update_failed';
      }
    | {
        data: ProfileRecord;
      }
  > {
  if (!(await hasAllowedImageSignature(avatar))) {
    return {
      error: 'invalid_signature' as const,
    };
  }

  const avatarPath = `${userId}/avatar-${Date.now()}.${extension}`;
  const bucket = supabase.storage.from(AVATAR_BUCKET);

  if (!bucket.upload || !supabase.from) {
    return {
      error: 'upload_failed' as const,
    };
  }

  const { error: uploadError } = await bucket.upload(avatarPath, avatar, {
    cacheControl: '3600',
    contentType: avatar.type,
    upsert: true,
  });

  if (uploadError) {
    return {
      error: 'upload_failed' as const,
    };
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarPath })
    .eq('id', userId)
    .select('id, first_name, last_name, full_name, birth_date, avatar_url')
    .single();

  if (error || !data) {
    return {
      error: 'update_failed' as const,
    };
  }

  return {
    data,
  };
}
