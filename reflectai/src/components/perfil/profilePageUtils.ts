import { ApiError } from '@/lib/api/http';
import type { ProfileData as ProfileResponseData } from '@/lib/api/profile';

export interface ProfilePreferences {
  notifications: boolean;
  darkMode: boolean;
}

export interface ProfileViewData {
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  avatarUrl: string | null;
  preferences: ProfilePreferences;
}

export const DEFAULT_PREFERENCES: ProfilePreferences = {
  notifications: true,
  darkMode: false,
};

export function mapProfileResponseToViewData(
  profile: ProfileResponseData,
): ProfileViewData {
  return {
    firstName: profile.first_name,
    lastName: profile.last_name ?? '',
    email: profile.email ?? '',
    birthDate: profile.birth_date ?? '',
    avatarUrl: profile.avatar_url ?? null,
    preferences: DEFAULT_PREFERENCES,
  };
}

export function formatFullName(firstName: string, lastName: string) {
  return [firstName, lastName].filter(Boolean).join(' ') || 'Tu perfil';
}

export function formatDisplayBirthDate(isoDate: string) {
  if (!isoDate) {
    return 'No especificada';
  }

  return new Date(`${isoDate}T12:00:00`).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getProfileErrorMessage(
  error: unknown,
  fallbackMessage: string,
) {
  if (error instanceof ApiError && error.payload?.message) {
    return error.payload.message;
  }

  return fallbackMessage;
}

export function toggleProfilePreference(
  profile: ProfileViewData | null,
  preference: keyof ProfilePreferences,
) {
  if (!profile) {
    return profile;
  }

  return {
    ...profile,
    preferences: {
      ...profile.preferences,
      [preference]: !profile.preferences[preference],
    },
  };
}
