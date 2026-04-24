import { z } from "zod";

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
