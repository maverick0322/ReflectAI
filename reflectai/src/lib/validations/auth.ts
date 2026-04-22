import { z } from "zod";
import { emailField, passwordField, firstNameField, lastNameField, birthDateField } from "./common";

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export const registerSchema = z.object({
  firstName: firstNameField,
  lastName: lastNameField,
  email: emailField,
  confirmEmail: z.string(),
  password: passwordField,
  confirmPassword: z.string(),
  birthDate: birthDateField,
}).refine((data) => data.email === data.confirmEmail, {
  message: "Los correos electrónicos no coinciden",
  path: ["confirmEmail"],
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export const recoverPasswordSchema = z.object({
  email: emailField,
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type RecoverPasswordFormValues = z.infer<typeof recoverPasswordSchema>;