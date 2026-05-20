import ProfileAvatar from '@/features/profile/components/ProfileAvatar';

import type { ProfileViewData } from '@/features/profile/utils/profilePageUtils';

interface ProfileHeaderProps {
  profile: ProfileViewData;
  isUploadingAvatar: boolean;
  onPhotoSelected: (file: File) => void | Promise<void>;
}

export function ProfileHeader({
  profile,
  isUploadingAvatar,
  onPhotoSelected,
}: ProfileHeaderProps) {
  return (
    <header className="flex flex-col items-center gap-4">
      <ProfileAvatar
        firstName={profile.firstName}
        lastName={profile.lastName}
        avatarUrl={profile.avatarUrl}
        onPhotoSelected={onPhotoSelected}
      />
      {isUploadingAvatar && (
        <p className="text-xs font-semibold text-slate-500">Subiendo foto...</p>
      )}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800">
          {profile.firstName} {profile.lastName}
        </h2>
        <p className="text-sm font-medium text-slate-500">Miembro de ReflectAI</p>
      </div>
    </header>
  );
}
