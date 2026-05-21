import { describe, expect, it } from 'vitest';

import { changePasswordSchema, profileSchema } from '@/features/profile/schemas/profile';

const baseProfile = {
  firstName: 'Arturo',
  lastName: 'Cuevas',
  birthDate: '2005-06-19',
};

describe('profileSchema', () => {
  it('accepts a valid profile', () => {
    expect(profileSchema.safeParse(baseProfile).success).toBe(true);
  });

  it('rejects an empty first name', () => {
    const result = profileSchema.safeParse({ ...baseProfile, firstName: '' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('El nombre es obligatorio');
    }
  });

  it('rejects a first name with numbers', () => {
    const result = profileSchema.safeParse({ ...baseProfile, firstName: 'Artur0' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('El nombre solo puede contener letras');
    }
  });

  it('allows an empty last name', () => {
    expect(profileSchema.safeParse({ ...baseProfile, lastName: '' }).success).toBe(true);
  });

  it('rejects a last name with numbers', () => {
    const result = profileSchema.safeParse({ ...baseProfile, lastName: 'Cuevas2' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Los apellidos solo pueden contener letras');
    }
  });

  it('rejects an empty birth date', () => {
    const result = profileSchema.safeParse({ ...baseProfile, birthDate: '' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('La fecha de nacimiento es obligatoria');
    }
  });
});

describe('changePasswordSchema', () => {
  it('rejects mismatched passwords', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'CurrentPassword123',
      newPassword: 'NewPassword123',
      confirmNewPassword: 'OtherPassword123',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Las contraseñas no coinciden');
    }
  });
});
