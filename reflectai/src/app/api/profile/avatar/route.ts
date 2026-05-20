import {
  buildSuccessResponse,
  enforceTrustedMutationOrigin,
  requireAuthenticatedUser,
  toRouteErrorResponse,
} from '@/lib/api/route';
import { apiMessages } from '@/lib/copy/api';
import { uploadUserAvatarResponse } from '@/lib/profile/service';

export async function POST(request: Request) {
  try {
    enforceTrustedMutationOrigin(request);
    const { supabase, user } = await requireAuthenticatedUser();
    const formData = await request.formData();

    return buildSuccessResponse({
      data: await uploadUserAvatarResponse(supabase, user, formData),
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
