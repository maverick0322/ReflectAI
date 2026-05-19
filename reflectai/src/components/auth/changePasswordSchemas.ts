import { z } from 'zod';

const changePasswordFormatMessage =
  'Debe tener al menos 8 caracteres, una mayuscula, una minuscula, un numero y un caracter especial';

function isValidChangePassword(value: string) {
  return (
    value.length >= 8 &&
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value) &&
    /[0-9]/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  );
}

const changePasswordField = z
  .string()
  .max(64, 'Se alcanzo el limite')
  .refine(isValidChangePassword, {
    message: changePasswordFormatMessage,
  });

export const step1Schema = z.object({
  currentPassword: z.string().min(1, 'La contrasena actual es obligatoria'),
});

export const step2Schema = z
  .object({
    newPassword: changePasswordField,
    confirmNewPassword: changePasswordField,
  })
  .superRefine((data, context) => {
    if (data.newPassword !== data.confirmNewPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Las contrasenas no coinciden',
        path: ['newPassword'],
      });
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Las contrasenas no coinciden',
        path: ['confirmNewPassword'],
      });
    }
  });

export type Step1FormValues = z.infer<typeof step1Schema>;
export type Step2FormValues = z.infer<typeof step2Schema>;
