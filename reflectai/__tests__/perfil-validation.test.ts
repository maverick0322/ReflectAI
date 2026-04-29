import { describe, it, expect } from 'vitest';
import { profileSchema } from '@/lib/validations/profile';

const baseProfile = {
  firstName: 'Arturo',
  lastName: 'Cuevas',
  birthDate: '2005-06-19',
};

describe('Validaciones de Perfil', () => {
  it('acepta un perfil válido', () => {
    expect(profileSchema.safeParse(baseProfile).success).toBe(true);
  });

  it('rechaza el nombre vacío', () => {
    const result = profileSchema.safeParse({ ...baseProfile, firstName: '' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('El nombre es obligatorio');
    }
  });

  it('rechaza el nombre con números', () => {
    const result = profileSchema.safeParse({ ...baseProfile, firstName: 'Artur0' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('El nombre solo puede contener letras');
    }
  });

  it('permite el apellido vacío', () => {
    expect(profileSchema.safeParse({ ...baseProfile, lastName: '' }).success).toBe(true);
  });

  it('rechaza el apellido con números', () => {
    const result = profileSchema.safeParse({ ...baseProfile, lastName: 'Cuevas2' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('El apellido solo puede contener letras');
    }
  });

  it('rechaza la fecha vacía', () => {
    const result = profileSchema.safeParse({ ...baseProfile, birthDate: '' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('La fecha de nacimiento es obligatoria');
    }
  });
});
