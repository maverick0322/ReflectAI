import BellIcon from '@/components/icons/BellIcon';
import MoonIcon from '@/components/icons/MoonIcon';
import {
  PreferenceRow,
  SectionTitle,
} from '@/components/perfil/ProfilePagePrimitives';

import type { ProfileViewData } from './profilePageUtils';

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
          label="Modo Oscuro"
          enabled={profile.preferences.darkMode}
          onChange={onToggleDarkMode}
        />
      </div>
    </section>
  );
}
