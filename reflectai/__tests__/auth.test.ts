import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema, recoverPasswordSchema } from '@/lib/validations/auth';

const usuarioValido = {
  firstName: 'Arturo',
  lastName: 'Cuevas',
  email: 'test@reflectai.com',
  confirmEmail: 'test@reflectai.com',
  password: 'PasswordFuerte123',
  confirmPassword: 'PasswordFuerte123',
  birthDate: '2000-01-01',
};

describe('Suite Exhaustiva: Validaciones de Registro (Zod)', () => {

  it('1. Debe pasar la validación si todos los datos son correctos', () => {
    const resultado = registerSchema.safeParse(usuarioValido);
    expect(resultado.success).toBe(true);
  });

  it('2. Debe fallar si el nombre está vacío', () => {
    const resultado = registerSchema.safeParse({ ...usuarioValido, firstName: '' });
    expect(resultado.success).toBe(false);
    if (!resultado.success) expect(resultado.error.issues[0].message).toBe('El nombre es obligatorio');
  });

  it('3. Debe fallar si el nombre contiene números o símbolos', () => {
    const resultado = registerSchema.safeParse({ ...usuarioValido, firstName: 'Artur0!' });
    expect(resultado.success).toBe(false);
    if (!resultado.success) expect(resultado.error.issues[0].message).toBe('El nombre solo puede contener letras');
  });

  it('4. Debe PASAR si el apellido está vacío (porque es opcional)', () => {
    const resultado = registerSchema.safeParse({ ...usuarioValido, lastName: '' });
    expect(resultado.success).toBe(true);
  });

  it('5. Debe fallar si el apellido tiene números', () => {
    const resultado = registerSchema.safeParse({ ...usuarioValido, lastName: 'Cuevas 2' });
    expect(resultado.success).toBe(false);
    if (!resultado.success) expect(resultado.error.issues[0].message).toBe('El apellido solo puede contener letras');
  });

  it('6. Debe fallar si el correo no tiene formato válido (sin @)', () => {
    const resultado = registerSchema.safeParse({ ...usuarioValido, email: 'correoinvalido.com' });
    expect(resultado.success).toBe(false);
    if (!resultado.success) expect(resultado.error.issues[0].message).toBe('Ingresa un correo válido');
  });

  it('7. Debe fallar si los correos no coinciden', () => {
    const resultado = registerSchema.safeParse({ ...usuarioValido, confirmEmail: 'otro@correo.com' });
    expect(resultado.success).toBe(false);
    if (!resultado.success) expect(resultado.error.issues[0].message).toBe('Los correos electrónicos no coinciden');
  });

  it('8. Debe fallar si la contraseña tiene menos de 8 caracteres', () => {
    const resultado = registerSchema.safeParse({ 
      ...usuarioValido, 
      password: 'Aa1', 
      confirmPassword: 'Aa1' 
    });
    expect(resultado.success).toBe(false);
    if (!resultado.success) expect(resultado.error.issues[0].message).toBe('La contraseña debe tener al menos 8 caracteres');
  });

  it('9. Debe fallar si la contraseña no tiene números', () => {
    const resultado = registerSchema.safeParse({ 
      ...usuarioValido, 
      password: 'PasswordSinNumeros', 
      confirmPassword: 'PasswordSinNumeros' 
    });
    expect(resultado.success).toBe(false);
    if (!resultado.success) expect(resultado.error.issues[0].message).toBe('Debe contener al menos una mayúscula, una minúscula y un número');
  });

  it('10. Debe fallar si las contraseñas no coinciden', () => {
    const resultado = registerSchema.safeParse({ ...usuarioValido, confirmPassword: 'PasswordFuerte321' });
    expect(resultado.success).toBe(false);
    if (!resultado.success) expect(resultado.error.issues[0].message).toBe('Las contraseñas no coinciden');
  });

  it('11. Debe fallar si la fecha de nacimiento está vacía', () => {
    const resultado = registerSchema.safeParse({ ...usuarioValido, birthDate: '' });
    expect(resultado.success).toBe(false);
    if (!resultado.success) expect(resultado.error.issues[0].message).toBe('La fecha de nacimiento es obligatoria');
  });
});

describe('Suite Exhaustiva: Validaciones de Login (Zod)', () => {
  it('12. Debe pasar con correo y contraseña válidos', () => {
    const resultado = loginSchema.safeParse({ email: 'test@reflectai.com', password: 'MiPassword123' });
    expect(resultado.success).toBe(true);
  });

  it('13. Debe fallar si el correo del login es inválido', () => {
    const resultado = loginSchema.safeParse({ email: 'usuario-sin-arroba', password: 'MiPassword123' });
    expect(resultado.success).toBe(false);
    if (!resultado.success) expect(resultado.error.issues[0].message).toBe('Ingresa un correo válido');
  });

  it('14. Debe fallar si la contraseña del login está vacía', () => {
    const resultado = loginSchema.safeParse({ email: 'test@reflectai.com', password: '' });
    expect(resultado.success).toBe(false);
    if (!resultado.success) expect(resultado.error.issues[0].message).toBe('La contraseña es obligatoria');
  });
});

describe('Suite Exhaustiva: Validaciones de Recuperar Contraseña (Zod)', () => {
  it('15. Debe pasar con un correo válido', () => {
    const resultado = recoverPasswordSchema.safeParse({ email: 'test@reflectai.com' });
    expect(resultado.success).toBe(true);
  });

  it('16. Debe fallar si el correo es inválido', () => {
    const resultado = recoverPasswordSchema.safeParse({ email: 'usuario-sin-dominio' });
    expect(resultado.success).toBe(false);
    if (!resultado.success) expect(resultado.error.issues[0].message).toBe('Ingresa un correo válido');
  });

  it('17. Debe fallar si el correo está vacío', () => {
    const resultado = recoverPasswordSchema.safeParse({ email: '' });
    expect(resultado.success).toBe(false);
  });

  it('18. Debe fallar si el nombre excede los 120 caracteres', () => {
    const nombreLargo = "a".repeat(121); 
    const resultado = registerSchema.safeParse({ ...usuarioValido, firstName: nombreLargo });
    expect(resultado.success).toBe(false);
    if (!resultado.success) expect(resultado.error.issues[0].message).toBe('El nombre es demasiado largo');
  });

  it('19. Debe fallar si el correo excede el estándar de internet (más de 254 caracteres)', () => {
    const correoLargo = "a".repeat(245) + "@gmail.com"; 
    const resultado = registerSchema.safeParse({ ...usuarioValido, email: correoLargo, confirmEmail: correoLargo });
    expect(resultado.success).toBe(false);
    if (!resultado.success) expect(resultado.error.issues[0].message).toBe('El correo no puede exceder los 254 caracteres');
  });

  it('20. Debe fallar si la contraseña excede el límite de seguridad (más de 64 caracteres)', () => {
    const passwordLarga = "A1" + "a".repeat(63); 
    const resultado = registerSchema.safeParse({ ...usuarioValido, password: passwordLarga, confirmPassword: passwordLarga });
    expect(resultado.success).toBe(false);
    if (!resultado.success) expect(resultado.error.issues[0].message).toBe('La contraseña no puede exceder los 64 caracteres');
  });
});

