import { z } from "zod";
import { PrimaryEmotion } from "@/types/reflection";

export const createReflectionSessionSchema = z.object({
  title: z
    .string()
    .trim()
    .max(120, "El titulo no puede tener mas de 120 caracteres")
    .optional(),
});

export const addReflectionResponseSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, "La pregunta es obligatoria")
    .max(500, "La pregunta no puede tener mas de 500 caracteres"),
  userResponse: z
    .string()
    .trim()
    .min(1, "La respuesta es obligatoria")
    .max(3000, "La respuesta no puede tener mas de 3000 caracteres"),
  detectedEmotion: z
    .string()
    .trim()
    .max(80, "La emocion no puede tener mas de 80 caracteres")
    .optional(),
  intensity: z
    .number()
    .int("La intensidad debe ser un numero entero")
    .min(1, "La intensidad minima es 1")
    .max(10, "La intensidad maxima es 10")
    .optional(),
});

export const completeReflectionSessionSchema = z.object({
  title: z
    .string()
    .trim()
    .max(120, "El titulo no puede tener mas de 120 caracteres")
    .optional(),
});

export type CreateReflectionSessionInput = z.infer<typeof createReflectionSessionSchema>;
export type AddReflectionResponseInput = z.infer<typeof addReflectionResponseSchema>;
export type CompleteReflectionSessionInput = z.infer<typeof completeReflectionSessionSchema>;


export const wizardFormSchema = z.object({
  situacion: z
    .string()
    .trim()
    .min(5, "Por favor, describe brevemente la situación.")
    .max(3000, "Límite de 3000 caracteres"),
  pensamiento: z
    .string()
    .trim()
    .min(3, "Identificar el pensamiento es el paso más difícil")
    .max(3000, "Límite de 3000 caracteres"),
  emocion: z
    .string()
    .min(1, "Por favor, selecciona una emoción principal.")
    .refine(
      (value) => Object.values(PrimaryEmotion).includes(value as PrimaryEmotion),
      "Por favor, selecciona una emoción principal."
    ),
  intensidad: z
    .number()
    .min(1, "La intensidad mínima es 1")
    .max(10, "La intensidad máxima es 10"),
  proposito: z
    .string()
    .trim()
    .min(3, "Por favor, describe el propósito.")
    .max(3000, "Límite de 3000 caracteres"),
  controlMio: z
    .string()
    .trim()
    .min(3, "Identifica lo que estaba bajo tu control.")
    .max(3000, "Límite de 3000 caracteres"),
  controlOtros: z
    .string()
    .trim()
    .min(3, "Identifica lo que dependía de otros.")
    .max(3000, "Límite de 3000 caracteres"),
  alternativa: z
    .string()
    .trim()
    .min(5, "Plantea una perspectiva alternativa.")
    .max(3000, "Límite de 3000 caracteres"),
});

export type WizardFormValues = z.infer<typeof wizardFormSchema>;