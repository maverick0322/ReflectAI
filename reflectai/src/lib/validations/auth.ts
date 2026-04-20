import { z } from "zod";

const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
const optionalNameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/; 

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,}$/;

export const registerSchema = z.object({
  firstName: z.string().min(1, "El nombre es obligatorio").regex(nameRegex, "El nombre solo puede contener letras"),
  lastName: z.string().regex(optionalNameRegex, "El apellido solo puede contener letras").optional(),
  
  email: z.string().min(1, "El correo es obligatorio").email("Ingresa un correo válido"),
  confirmEmail: z.string().min(1, "Confirma tu correo").email("Ingresa un correo válido"),
  
  password: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(passwordRegex, "Debe contener al menos una mayúscula, una minúscula y un número"),
  confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  
  birthDate: z.string().min(1, "La fecha de nacimiento es obligatoria"),
})
.refine((data) => data.email === data.confirmEmail, {
  message: "Los correos electrónicos no coinciden",
  path: ["confirmEmail"], 
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().min(1, "El correo es obligatorio").email("Ingresa un correo válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;