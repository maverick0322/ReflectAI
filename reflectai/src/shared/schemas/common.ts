import { z } from 'zod';

export const emailField = z
  .string()
  .min(1, 'Email is required')
  .email('Enter a valid email address')
  .max(254, 'Character limit reached');

export const passwordField = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters long')
  .max(64, 'Character limit reached')
  .regex(/[A-Z]/, 'Password must include uppercase, lowercase, and numeric characters')
  .regex(/[a-z]/, 'Password must include uppercase, lowercase, and numeric characters')
  .regex(/[0-9]/, 'Password must include uppercase, lowercase, and numeric characters');

export const firstNameField = z
  .string()
  .min(1, 'First name is required')
  .max(120, 'Character limit reached')
  .regex(/^[\p{L}\s]+$/u, 'First name can only contain letters');

export const lastNameField = z
  .string()
  .max(120, 'Character limit reached')
  .refine((value) => value === undefined || value === '' || /^[\p{L}\s]+$/u.test(value), {
    message: 'Last name can only contain letters',
  })
  .optional();

export const birthDateField = z
  .string()
  .min(1, 'Birth date is required');
