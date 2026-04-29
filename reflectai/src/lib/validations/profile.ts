import { z } from "zod";
import { firstNameField, lastNameField, birthDateField, passwordField} from "./common";

export const profileSchema = z.object({
  firstName: firstNameField,
  lastName: lastNameField,
  birthDate: birthDateField,
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es obligatoria"), 
  newPassword: passwordField, 
  confirmNewPassword: z.string().min(1, "Confirma tu nueva contraseña"),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmNewPassword"],
});

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;