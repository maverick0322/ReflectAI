import { z } from 'zod';

function isValidDateValue(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

function isFutureDate(value: string) {
  const selectedDate = new Date(`${value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selectedDate > today;
}

export const emailField = z
  .string()
  .min(1, 'El correo es obligatorio')
  .email('Ingresa un correo válido')
  .max(254, 'Se alcanzó el límite');

export const passwordField = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(64, 'Se alcanzó el límite')
  .regex(/[A-Z]/, 'Debe contener al menos una mayúscula, una minúscula y un número')
  .regex(/[a-z]/, 'Debe contener al menos una mayúscula, una minúscula y un número')
  .regex(/[0-9]/, 'Debe contener al menos una mayúscula, una minúscula y un número')
  .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial');

export const firstNameField = z
  .string()
  .min(1, 'El nombre es obligatorio')
  .max(120, 'Se alcanzó el límite')
  .regex(/^[\p{L}\s]+$/u, 'El nombre solo puede contener letras');

export const lastNameField = z
  .string()
  .max(120, 'Se alcanzó el límite')
  .refine((value) => value === undefined || value === '' || /^[\p{L}\s]+$/u.test(value), {
    message: 'El apellido solo puede contener letras',
  })
  .optional();

export const birthDateField = z
  .string()
  .min(1, 'La fecha de nacimiento es obligatoria')
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ingresa una fecha de nacimiento válida')
  .refine(isValidDateValue, {
    message: 'Ingresa una fecha de nacimiento válida',
  })
  .refine((value) => !isFutureDate(value), {
    message: 'La fecha de nacimiento no puede ser mayor a la fecha actual',
  });
