import { z } from 'zod';

import {
  birthDateField,
  emailField,
  firstNameField,
  lastNameField,
  passwordField,
} from './common';

export const loginSchema = z.object({
  email: emailField,
  password: z
    .string()
    .min(1, 'La contraseña es obligatoria')
    .max(64, 'La contraseña no puede tener más de 64 caracteres'),
});

export const registerSchema = z
  .object({
    firstName: firstNameField,
    lastName: lastNameField,
    email: emailField,
    confirmEmail: emailField,
    password: passwordField,
    confirmPassword: passwordField,
    birthDate: birthDateField,
  })
  .refine((data) => data.email === data.confirmEmail, {
    message: 'Los correos electrónicos no coinciden',
    path: ['confirmEmail'],
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export const recoverPasswordSchema = z.object({
  email: emailField,
});

export const confirmRecoverySchema = z.object({
  code: z.string().min(1, 'El codigo es obligatorio'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'La contraseña actual es obligatoria').optional(),
    newPassword: passwordField,
    confirmNewPassword: z.string().min(1, 'Confirma tu nueva contraseña'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmNewPassword'],
  });

export const deleteAccountSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es obligatoria'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type RecoverPasswordFormValues = z.infer<typeof recoverPasswordSchema>;
export type ConfirmRecoveryValues = z.infer<typeof confirmRecoverySchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
export type DeleteAccountValues = z.infer<typeof deleteAccountSchema>;
