import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api/http';
import {
  DEFAULT_PREFERENCES,
  formatDisplayBirthDate,
  formatFullName,
  getProfileErrorMessage,
  mapProfileResponseToViewData,
  toggleProfilePreference,
} from '@/components/perfil/profilePageUtils';

describe('profilePageUtils', () => {
  it('maps nullable profile fields to view defaults', () => {
    expect(
      mapProfileResponseToViewData({
        id: 'user-1',
        first_name: 'Ana',
        last_name: null,
        full_name: 'Ana',
        birth_date: null,
        avatar_url: null,
        email: null,
      }),
    ).toEqual({
      firstName: 'Ana',
      lastName: '',
      email: '',
      birthDate: '',
      avatarUrl: null,
      preferences: DEFAULT_PREFERENCES,
    });
  });

  it('formats names and birth dates with fallbacks', () => {
    expect(formatFullName('Ana', 'Lopez')).toBe('Ana Lopez');
    expect(formatFullName('', '')).toBe('Tu perfil');
    expect(formatDisplayBirthDate('')).toBe('No especificada');
    expect(formatDisplayBirthDate('2000-01-02')).toMatch(/2000/);
  });

  it('extracts API error messages or returns fallback text', () => {
    expect(
      getProfileErrorMessage(
        new ApiError('bad', 400, { message: 'Mensaje backend' }),
        'Fallback',
      ),
    ).toBe('Mensaje backend');
    expect(getProfileErrorMessage(new Error('bad'), 'Fallback')).toBe('Fallback');
  });

  it('toggles profile preferences and preserves null profile', () => {
    expect(toggleProfilePreference(null, 'darkMode')).toBeNull();

    const profile = {
      firstName: 'Ana',
      lastName: '',
      email: 'ana@example.com',
      birthDate: '',
      avatarUrl: null,
      preferences: {
        notifications: true,
        darkMode: false,
      },
    };

    expect(toggleProfilePreference(profile, 'notifications')?.preferences).toEqual({
      notifications: false,
      darkMode: false,
    });
  });
});
