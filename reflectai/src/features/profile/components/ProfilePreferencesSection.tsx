import BellIcon from '@/shared/icons/BellIcon';
import MoonIcon from '@/shared/icons/MoonIcon';
import {
  PreferenceRow,
  SectionTitle,
} from '@/features/profile/components/ProfilePagePrimitives';

import type { ProfileViewData } from '@/features/profile/utils/profilePageUtils';

interface ProfilePreferencesSectionProps {
  profile: ProfileViewData;
  onToggleNotifications: () => void;
  onToggleDarkMode: () => void;
}

export function ProfilePreferencesSection({
  profile,
  onToggleNotifications,
  onToggleDarkMode,
}: ProfilePreferencesSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <SectionTitle>Preferencias</SectionTitle>
      <div className="flex flex-col gap-4 rounded-2xl border border-white/50 bg-white/30 p-4">
        <PreferenceRow
          icon={<BellIcon className="h-5 w-5 text-slate-600" />}
          label="Notificaciones diarias"
          enabled={profile.preferences.notifications}
          onChange={onToggleNotifications}
        />
        <hr className="border-slate-200/50" />
        <PreferenceRow
          icon={<MoonIcon className="h-5 w-5 text-slate-600" />}
          label="Modo oscuro"
          enabled={profile.preferences.darkMode}
          onChange={onToggleDarkMode}
        />
      </div>
    </section>
  );
}
