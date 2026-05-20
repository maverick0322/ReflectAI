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
import { profileSchema } from '@/lib/validations/profile';

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

    return buildSuccessResponse({
      data: await updateUserProfileResponse(supabase, user, profileUpdate),
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
