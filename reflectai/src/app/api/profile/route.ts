import {
  buildSuccessResponse,
  enforceTrustedMutationOrigin,
  parseJsonBody,
  requireAuthenticatedUser,
  toRouteErrorResponse,
} from '@/lib/api/route';
import { apiMessages } from '@/lib/copy/api';
import {
  buildProfileResponse,
  loadUserProfile,
  updateUserProfile,
} from '@/lib/profile/service';
import { profileSchema } from '@/lib/validations/profile';

export async function GET() {
  try {
    const { supabase, user } = await requireAuthenticatedUser();
    const profile = await loadUserProfile(supabase, user);

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
    const profile = await updateUserProfile(supabase, user, profileUpdate);

    return buildSuccessResponse({
      data: await buildProfileResponse(supabase, profile, user.email),
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
