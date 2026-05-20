import type { getAuthenticatedUser } from '@/lib/auth/getAuthenticatedUser';

import { throwRouteError } from '@/lib/api/route';
import { apiMessages } from '@/lib/copy/api';
import {
  resolveAvatarUrl,
  uploadProfileAvatar,
  validateAvatarFile,
} from '@/lib/profile/avatar';

type AuthenticatedContext = Awaited<ReturnType<typeof getAuthenticatedUser>>;
type AuthenticatedSupabaseClient = AuthenticatedContext['supabase'];
type AuthenticatedUser = NonNullable<AuthenticatedContext['user']>;

export type ProfileRecord = {
  id: string;
  first_name: string;
  last_name: string | null;
  full_name: string;
  birth_date: string | null;
  avatar_url: string | null;
};

type ProfileUpdateInput = {
  firstName: string;
  lastName?: string | null;
  birthDate: string;
};

function buildFullName(firstName: string, lastName?: string | null) {
  return [firstName, lastName].filter(Boolean).join(' ');
}

function readTrimmedMetadataValue(metadata: unknown, key: string) {
  if (typeof metadata !== 'object' || metadata === null) {
    return null;
  }

  const value = (metadata as Record<string, unknown>)[key];

  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    return trimmedValue ? trimmedValue : null;
  }

  return null;
}

function buildProfileSeed(user: AuthenticatedUser) {
  const metadata = user.user_metadata;
  const firstName = readTrimmedMetadataValue(metadata, 'first_name') ?? 'Usuario';
  const lastName = readTrimmedMetadataValue(metadata, 'last_name');
  const birthDate = readTrimmedMetadataValue(metadata, 'birth_date');

  return {
    first_name: firstName,
    last_name: lastName,
    full_name: buildFullName(firstName, lastName),
    birth_date: birthDate,
  };
}

async function createProfileFromMetadata(
  supabase: AuthenticatedSupabaseClient,
  user: AuthenticatedUser,
) {
  const profileSeed = buildProfileSeed(user);
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      ...profileSeed,
    })
    .select('id, first_name, last_name, full_name, birth_date, avatar_url')
    .single();

  if (error || !data) {
    throwRouteError(500, apiMessages.profile.createFailed);
  }

  return data;
}

export async function buildProfileResponse(
  supabase: AuthenticatedSupabaseClient,
  profile: ProfileRecord,
  email: string | null | undefined,
) {
  return {
    ...profile,
    avatar_url: await resolveAvatarUrl(supabase, profile.avatar_url),
    email: email ?? null,
  };
}

export async function loadUserProfile(
  supabase: AuthenticatedSupabaseClient,
  user: AuthenticatedUser,
) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, full_name, birth_date, avatar_url')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    throwRouteError(500, apiMessages.profile.fetchFailed);
  }

  if (data) {
    return data;
  }

  return createProfileFromMetadata(supabase, user);
}

export async function updateUserProfile(
  supabase: AuthenticatedSupabaseClient,
  user: AuthenticatedUser,
  profileUpdate: ProfileUpdateInput,
) {
  const fullName = buildFullName(profileUpdate.firstName, profileUpdate.lastName);
  const { data, error } = await supabase
    .from('profiles')
    .update({
      first_name: profileUpdate.firstName,
      last_name: profileUpdate.lastName ?? null,
      full_name: fullName,
      birth_date: profileUpdate.birthDate,
    })
    .eq('id', user.id)
    .select('id, first_name, last_name, full_name, birth_date, avatar_url')
    .single();

  if (error || !data) {
    throwRouteError(500, apiMessages.profile.updateFailed);
  }

  return data;
}

export async function getUserProfileResponse(
  supabase: AuthenticatedSupabaseClient,
  user: AuthenticatedUser,
) {
  const profile = await loadUserProfile(supabase, user);
  return buildProfileResponse(supabase, profile, user.email);
}

export async function updateUserProfileResponse(
  supabase: AuthenticatedSupabaseClient,
  user: AuthenticatedUser,
  profileUpdate: ProfileUpdateInput,
) {
  const profile = await updateUserProfile(supabase, user, profileUpdate);
  return buildProfileResponse(supabase, profile, user.email);
}

export async function uploadUserAvatarResponse(
  supabase: AuthenticatedSupabaseClient,
  user: AuthenticatedUser,
  formData: FormData,
) {
  const avatarInput = validateAvatarFile(formData.get('avatar'));

  if ('error' in avatarInput) {
    const messages = {
      required: apiMessages.profile.avatarRequired,
      invalid_type: apiMessages.profile.avatarInvalidType,
      too_large: apiMessages.profile.avatarTooLarge,
    };
    throwRouteError(400, messages[avatarInput.error]);
  }

  const uploadResult = await uploadProfileAvatar(
    supabase,
    user.id,
    avatarInput.avatar,
    avatarInput.extension,
  );

  if ('error' in uploadResult) {
    const messages = {
      invalid_signature: apiMessages.profile.avatarInvalidSignature,
      upload_failed: apiMessages.profile.avatarUploadFailed,
      update_failed: apiMessages.profile.avatarUpdateFailed,
    };
    const statuses = {
      invalid_signature: 400,
      upload_failed: 500,
      update_failed: 500,
    } as const;
    throwRouteError(statuses[uploadResult.error], messages[uploadResult.error]);
  }

  return buildProfileResponse(supabase, uploadResult.data, user.email);
}
