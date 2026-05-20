import type { getAuthenticatedUser } from '@/lib/auth/getAuthenticatedUser';

import { throwRouteError } from '@/lib/api/route';
import { apiMessages } from '@/lib/copy/api';
import { resolveAvatarUrl } from '@/lib/profile/avatar';

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
    return value.trim() ? value : null;
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
