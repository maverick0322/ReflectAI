import { z } from 'zod';

import { passwordField } from '@/lib/validations/common';

export const step1Schema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es obligatoria'),
});

export const step2Schema = z.object({
  newPassword: passwordField,
  confirmNewPassword: passwordField,
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmNewPassword'],
});

export type Step1FormValues = z.infer<typeof step1Schema>;
export type Step2FormValues = z.infer<typeof step2Schema>;
