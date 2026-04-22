import { z } from "zod";

export const emailField = z
  .string()
  .min(1, "El correo es obligatorio")
  .email("Ingresa un correo válido")
  .max(254, "Se alcanzó el límite"); 

export const passwordField = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(64, "Se alcanzó el límite") 
  .regex(/[A-Z]/, "Debe contener al menos una mayúscula, una minúscula y un número")
  .regex(/[a-z]/, "Debe contener al menos una mayúscula, una minúscula y un número")
  .regex(/[0-9]/, "Debe contener al menos una mayúscula, una minúscula y un número");

export const firstNameField = z
  .string()
  .min(1, "El nombre es obligatorio")
  .max(120, "Se alcanzó el límite") 
  .regex(/^[a-zA-Z\s]+$/, "El nombre solo puede contener letras");

export const lastNameField = z
  .string()
  .max(120, "Se alcanzó el límite")
  .regex(/^[a-zA-Z\s]*$/, "El apellido solo puede contener letras")
  .optional();

export const birthDateField = z
  .string()
  .min(1, "La fecha de nacimiento es obligatoria");