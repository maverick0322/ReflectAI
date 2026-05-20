import { profileSchema } from '@/features/profile/schemas/profile';
import {
  buildSuccessResponse,
  enforceTrustedMutationOrigin,
  parseJsonBody,
  requireAuthenticatedUser,
  toRouteErrorResponse,
} from '@/lib/api/route';
import { apiMessages } from '@/lib/copy/api';
import {
  getUserProfileResponse,
  updateUserProfileResponse,
} from '@/lib/profile/service';

export async function GET() {
  try {
    const { supabase, user } = await requireAuthenticatedUser();

    return buildSuccessResponse({
      data: await getUserProfileResponse(supabase, user),
      message: apiMessages.profile.fetchSucceeded,
    });
  } catch (error: unknown) {
    return toRouteErrorResponse(
      error,
      apiMessages.profile.fetchUnexpected,
      'profile fetch failed',
    );
  }
}

export async function PATCH(request: Request) {
  try {
    enforceTrustedMutationOrigin(request);
    const profileUpdate = await parseJsonBody({
      request,
      schema: profileSchema,
    });
    const { supabase, user } = await requireAuthenticatedUser();

    return buildSuccessResponse({
      data: await updateUserProfileResponse(supabase, user, profileUpdate),
      message: apiMessages.profile.updateSucceeded,
    });
  } catch (error: unknown) {
    return toRouteErrorResponse(
      error,
      apiMessages.profile.updateUnexpected,
      'profile update failed',
    );
  }
}
