'use client';

import GlassCard from '@/components/ui/GlassCard';
import { ProfileAccountFooter } from '@/components/perfil/ProfileAccountFooter';
import { ProfileHeader } from '@/components/perfil/ProfileHeader';
import { ProfileMessageState } from '@/components/perfil/ProfilePageStates';
import { ProfileNavigation } from '@/components/perfil/ProfileNavigation';
import { ProfilePersonalInfoSection } from '@/components/perfil/ProfilePersonalInfoSection';
import { ProfilePreferencesSection } from '@/components/perfil/ProfilePreferencesSection';
import { useProfilePage } from '@/components/perfil/useProfilePage';

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
    return <ProfileMessageState message="Cargando perfil..." tone="default" />;
  }

  if (!profile) {
    return (
      <ProfileMessageState
        message="No se pudo cargar el perfil."
        tone="error"
      />
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-50/50 p-4 py-8 md:p-6">
      <ProfileNavigation />

      <GlassCard className="mx-auto flex w-full max-w-md flex-col gap-8 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
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
