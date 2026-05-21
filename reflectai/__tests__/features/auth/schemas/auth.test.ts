import { describe, expect, it } from 'vitest';

import {
  changePasswordSchema,
  confirmRecoverySchema,
  loginSchema,
  recoverPasswordSchema,
  registerSchema,
} from '@/features/auth/schemas/auth';

const validUser = {
  firstName: 'Jose Luis',
  lastName: 'Cuevas Nanez',
  email: 'test@reflectai.com',
  confirmEmail: 'test@reflectai.com',
  password: 'StrongPassword123',
  confirmPassword: 'StrongPassword123',
  birthDate: '2000-01-01',
};

describe('registerSchema', () => {
  it('passes when all fields are valid', () => {
    expect(registerSchema.safeParse(validUser).success).toBe(true);
  });

  it('fails when firstName is empty', () => {
    const result = registerSchema.safeParse({ ...validUser, firstName: '' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('El nombre es obligatorio');
    }
  });

  it('fails when firstName contains non-letter characters', () => {
    const result = registerSchema.safeParse({ ...validUser, firstName: 'Artur0!' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('El nombre solo puede contener letras');
    }
  });

  it('allows an empty lastName', () => {
    expect(registerSchema.safeParse({ ...validUser, lastName: '' }).success).toBe(true);
  });

  it('fails when lastName contains non-letter characters', () => {
    const result = registerSchema.safeParse({ ...validUser, lastName: 'Cuevas 2' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Los apellidos solo pueden contener letras');
    }
  });

  it('fails when lastName exceeds 120 characters', () => {
    const result = registerSchema.safeParse({ ...validUser, lastName: 'a'.repeat(121) });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Límite de caracteres alcanzado');
    }
  });

  it('fails when email is invalid', () => {
    const result = registerSchema.safeParse({ ...validUser, email: 'invalid-email' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Ingresa un correo válido');
    }
  });

  it('fails when confirmEmail does not match', () => {
    const result = registerSchema.safeParse({
      ...validUser,
      confirmEmail: 'other@reflectai.com',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Los correos no coinciden');
    }
  });

  it('fails when password is too short', () => {
    const result = registerSchema.safeParse({
      ...validUser,
      password: 'Aa1',
      confirmPassword: 'Aa1',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'La contraseña debe tener al menos 8 caracteres',
      );
    }
  });

  it('fails when password is missing numeric characters', () => {
    const result = registerSchema.safeParse({
      ...validUser,
      password: 'PasswordWithoutNumbers',
      confirmPassword: 'PasswordWithoutNumbers',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'La contraseña debe incluir mayúsculas, minúsculas y números',
      );
    }
  });

  it('fails when passwords do not match', () => {
    const result = registerSchema.safeParse({
      ...validUser,
      confirmPassword: 'StrongPassword321',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Las contraseñas no coinciden');
    }
  });

  it('fails when birthDate is empty', () => {
    const result = registerSchema.safeParse({ ...validUser, birthDate: '' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('La fecha de nacimiento es obligatoria');
    }
  });

  it('fails when birthDate contains only whitespace', () => {
    const result = registerSchema.safeParse({ ...validUser, birthDate: '   ' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('La fecha de nacimiento es obligatoria');
    }
  });

  it('fails when birthDate has an unsupported format', () => {
    const result = registerSchema.safeParse({ ...validUser, birthDate: '10-05-1998' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Ingresa una fecha válida en formato dd/mm/yyyy');
    }
  });

  it('fails when birthDate has impossible date parts', () => {
    const result = registerSchema.safeParse({ ...validUser, birthDate: '31/02/2000' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Ingresa una fecha válida en formato dd/mm/yyyy');
    }
  });
});

describe('loginSchema', () => {
  it('passes with a valid email and password', () => {
    expect(
      loginSchema.safeParse({
        email: 'test@reflectai.com',
        password: 'MyPassword123',
      }).success,
    ).toBe(true);
  });

  it('fails when the email is invalid', () => {
    const result = loginSchema.safeParse({
      email: 'invalid',
      password: 'MyPassword123',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Ingresa un correo válido');
    }
  });

  it('fails when the password is empty', () => {
    const result = loginSchema.safeParse({
      email: 'test@reflectai.com',
      password: '',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('La contraseña es obligatoria');
    }
  });
});

describe('recoverPasswordSchema', () => {
  it('passes with a valid email', () => {
    expect(recoverPasswordSchema.safeParse({ email: 'test@reflectai.com' }).success).toBe(true);
  });

  it('fails with an invalid email', () => {
    const result = recoverPasswordSchema.safeParse({ email: 'missing-domain' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Ingresa un correo válido');
    }
  });
});

describe('confirmRecoverySchema', () => {
  it('accepts a valid code', () => {
    expect(confirmRecoverySchema.safeParse({ code: 'code-123' }).success).toBe(true);
  });

  it('fails with an empty code', () => {
    const result = confirmRecoverySchema.safeParse({ code: '' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('El código de recuperación es obligatorio');
    }
  });
});

describe('changePasswordSchema', () => {
  it('accepts valid data', () => {
    expect(
      changePasswordSchema.safeParse({
        currentPassword: 'CurrentPassword123',
        newPassword: 'NewPassword123',
        confirmNewPassword: 'NewPassword123',
      }).success,
    ).toBe(true);
  });

  it('fails when passwords do not match', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'CurrentPassword123',
      newPassword: 'NewPassword123',
      confirmNewPassword: 'DifferentPassword123',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Las contraseñas no coinciden');
    }
  });
});
