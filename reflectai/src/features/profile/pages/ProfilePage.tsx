'use client';

import GlassCard from '@/shared/ui/GlassCard';
import { ProfileAccountFooter } from '@/features/profile/components/ProfileAccountFooter';
import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { ProfileMessageState } from '@/features/profile/components/ProfilePageStates';
import { ProfileNavigation } from '@/features/profile/components/ProfileNavigation';
import {
  ProfilePersonalInfoSection,
} from '@/features/profile/components/ProfilePersonalInfoSection';
import { ProfilePreferencesSection } from '@/features/profile/components/ProfilePreferencesSection';
import { useProfilePage } from '@/features/profile/hooks/useProfilePage';

const profileCardClassName = [
  'animate-in mx-auto flex w-full max-w-md flex-col gap-8 p-6',
  'fade-in slide-in-from-bottom-4 delay-100 duration-500 md:p-8',
].join(' ');

export function ProfilePage() {
  const {
    profile,
    isEditing,
    isLoading,
    isSaving,
    isUploadingAvatar,
    formError,
    editSessionKey,
    register,
    handleSubmit,
    clearErrors,
    errors,
    startEditing,
    handleCancel,
    handleProfileSubmit,
    handleAvatarSelected,
    handleLogout,
    toggleNotifications,
    toggleDarkMode,
  } = useProfilePage();

  if (isLoading) {
    return <ProfileMessageState message="Loading profile..." tone="default" />;
  }

  if (!profile) {
    return (
      <ProfileMessageState
        message="Unable to load the profile."
        tone="error"
      />
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-50/50 p-4 py-8 md:p-6">
      <ProfileNavigation />

      <GlassCard className={profileCardClassName}>
        <ProfileHeader
          profile={profile}
          isUploadingAvatar={isUploadingAvatar}
          onPhotoSelected={handleAvatarSelected}
        />

        <ProfilePersonalInfoSection
          profile={profile}
          isEditing={isEditing}
          isSaving={isSaving}
          editSessionKey={editSessionKey}
          formError={formError}
          register={register}
          handleSubmit={handleSubmit}
          clearErrors={clearErrors}
          errors={errors}
          onSubmit={handleProfileSubmit}
          onStartEditing={startEditing}
          onCancel={handleCancel}
        />

        <ProfilePreferencesSection
          profile={profile}
          onToggleNotifications={toggleNotifications}
          onToggleDarkMode={toggleDarkMode}
        />

        <ProfileAccountFooter onLogout={handleLogout} />
      </GlassCard>
    </main>
  );
}
