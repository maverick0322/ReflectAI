import { z } from 'zod';

import {
  birthDateField,
  firstNameField,
  lastNameField,
  passwordField,
} from '@/shared/schemas/common';

export const profileSchema = z.object({
  firstName: firstNameField,
  lastName: lastNameField,
  birthDate: birthDateField,
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordField,
    confirmNewPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
