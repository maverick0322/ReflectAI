import {
  buildSuccessResponse,
  enforceTrustedMutationOrigin,
  parseJsonBody,
  requireAuthenticatedUser,
  throwRouteError,
  toRouteErrorResponse,
} from '@/lib/api/route';
import { apiMessages } from '@/lib/copy/api';
import { resolveAvatarUrl } from '@/lib/profile/avatar';
import { profileSchema } from '@/lib/validations/profile';

function buildFullName(firstName: string, lastName?: string | null) {
  return [firstName, lastName].filter(Boolean).join(' ');
}

type ProfileRecord = {
  id: string;
  first_name: string;
  last_name: string | null;
  full_name: string;
  birth_date: string | null;
  avatar_url: string | null;
};

async function buildProfileResponse(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedUser>>['supabase'],
  profile: ProfileRecord,
  email: string | null | undefined,
) {
  return {
    ...profile,
    avatar_url: await resolveAvatarUrl(supabase, profile.avatar_url),
    email: email ?? null,
  };
}

function buildProfileSeed(
  user: Awaited<ReturnType<typeof requireAuthenticatedUser>>['user'],
) {
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

  return {
    first_name: firstName,
    last_name: lastName,
    full_name: buildFullName(firstName, lastName),
    birth_date: birthDate,
  };
}

async function createProfileFromMetadata(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedUser>>['supabase'],
  user: Awaited<ReturnType<typeof requireAuthenticatedUser>>['user'],
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

async function loadProfile(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedUser>>['supabase'],
  user: Awaited<ReturnType<typeof requireAuthenticatedUser>>['user'],
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

export async function GET() {
  try {
    const { supabase, user } = await requireAuthenticatedUser();
    const profile = await loadProfile(supabase, user);

    return buildSuccessResponse({
      data: await buildProfileResponse(supabase, profile, user.email),
      message: apiMessages.profile.fetchSucceeded,
    });
  } catch (error: unknown) {
    return toRouteErrorResponse(
      error,
      apiMessages.profile.fetchUnexpected,
      'profile get failed',
    );
  }
}

export async function PATCH(request: Request) {
  try {
    enforceTrustedMutationOrigin(request);
    const { supabase, user } = await requireAuthenticatedUser();
    const profileUpdate = await parseJsonBody({
      request,
      schema: profileSchema,
    });
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

    return buildSuccessResponse({
      data: await buildProfileResponse(supabase, data, user.email),
      message: apiMessages.profile.updateSucceeded,
    });
  } catch (error: unknown) {
    return toRouteErrorResponse(
      error,
      apiMessages.profile.updateUnexpected,
      'profile patch failed',
    );
  }
}
