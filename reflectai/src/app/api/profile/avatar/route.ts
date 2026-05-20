import {
  buildSuccessResponse,
  enforceTrustedMutationOrigin,
  requireAuthenticatedUser,
  throwRouteError,
  toRouteErrorResponse,
} from '@/lib/api/route';
import { apiMessages } from '@/lib/copy/api';
import {
  uploadProfileAvatar,
  validateAvatarFile,
} from '@/lib/profile/avatar';
import { buildProfileResponse } from '@/lib/profile/service';

export async function POST(request: Request) {
  try {
    enforceTrustedMutationOrigin(request);
    const { supabase, user } = await requireAuthenticatedUser();
    const formData = await request.formData();
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

    return buildSuccessResponse({
      data: await buildProfileResponse(supabase, uploadResult.data, user.email),
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
