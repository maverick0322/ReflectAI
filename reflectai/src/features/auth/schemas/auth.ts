import { z } from 'zod';

import {
  birthDateField,
  emailField,
  firstNameField,
  lastNameField,
  passwordField,
} from '@/shared/schemas/common';

export const loginSchema = z.object({
  email: emailField,
  password: z
    .string()
    .min(1, 'Password is required')
    .max(64, 'Password cannot exceed 64 characters'),
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
    message: 'Email addresses do not match',
    path: ['confirmEmail'],
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const recoverPasswordSchema = z.object({
  email: emailField,
});

export const confirmRecoverySchema = z.object({
  code: z.string().min(1, 'Recovery code is required'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required').optional(),
    newPassword: passwordField,
    confirmNewPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

export const deleteAccountSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type RecoverPasswordFormValues = z.infer<typeof recoverPasswordSchema>;
export type ConfirmRecoveryValues = z.infer<typeof confirmRecoverySchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
export type DeleteAccountValues = z.infer<typeof deleteAccountSchema>;
