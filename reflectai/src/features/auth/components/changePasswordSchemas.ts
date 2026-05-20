import { z } from 'zod';

import { passwordField } from '@/shared/schemas/common';

export const step1Schema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
});

export const step2Schema = z
  .object({
    newPassword: passwordField,
    confirmNewPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

export type Step1FormValues = z.infer<typeof step1Schema>;
export type Step2FormValues = z.infer<typeof step2Schema>;
