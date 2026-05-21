import { z } from 'zod';

import { isSupportedBirthDate } from '@/shared/utils/date';

export const emailField = z
  .string()
  .min(1, 'El correo es obligatorio')
  .email('Ingresa un correo valido')
  .max(254, 'Limite de caracteres alcanzado');

export const passwordField = z
  .string()
  .min(1, 'La contraseña es obligatoria')
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(64, 'Limite de caracteres alcanzado')
  .regex(/[A-Z]/, 'La contraseña debe incluir mayúsculas, minúsculas y números')
  .regex(/[a-z]/, 'La contraseña debe incluir mayúsculas, minúsculas y números')
  .regex(/[0-9]/, 'La contraseña debe incluir mayúsculas, minúsculas y números');

export const firstNameField = z
  .string()
  .min(1, 'El nombre es obligatorio')
  .max(120, 'Límite de caracteres alcanzado')
  .regex(/^[\p{L}\s]+$/u, 'El nombre solo puede contener letras');

export const lastNameField = z
  .string()
  .max(120, 'Límite de caracteres alcanzado')
  .refine((value) => value === undefined || value === '' || /^[\p{L}\s]+$/u.test(value), {
    message: 'Los apellidos solo pueden contener letras',
  })
  .optional();

export const birthDateField = z
  .string()
  .min(1, 'La fecha de nacimiento es obligatoria')
  .refine(
    (value) => value.trim().length === 0 || isSupportedBirthDate(value),
    'Ingresa una fecha válida en formato dd/mm/yyyy',
  );
