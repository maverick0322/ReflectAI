export const AVATAR_BUCKET = 'profile-avatars';
const SIGNED_URL_TTL_SECONDS = 60 * 60;

type StorageBucketClient = {
  createSignedUrl: (
    path: string,
    expiresIn: number,
  ) => Promise<{ data: { signedUrl: string } | null; error: unknown }>;
};

type StorageClient = {
  from: (bucket: string) => StorageBucketClient;
};

type SupabaseLikeClient = {
  storage: StorageClient;
};

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
  supabase: SupabaseLikeClient,
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
