import { z } from 'zod';

import {
  normalizePrimaryEmotion,
  PrimaryEmotion,
} from '@/features/reflection/types/reflection';

export const createReflectionSessionSchema = z.object({
  title: z
    .string()
    .trim()
    .max(120, 'El título no puede exceder 120 caracteres')
    .optional(),
});

const questionIdSchema = z.enum([
  'Q1_SIT',
  'Q2_THO',
  'Q3_EMO',
  'Q4_INT',
  'Q5_TEL',
  'Q6_CON_MINE',
  'Q6_CON_OTHERS',
  'Q7_ALT',
  'SYS_GROUNDING',
  'SYS_AI_ADJUSTMENT',
]);

const metadataPatchSchema = z
  .object({
    version: z.string().trim().min(1).optional(),
    started_at: z.string().trim().min(1).optional(),
    completed_at: z.string().trim().min(1).optional(),
    interruption_detected: z.boolean().optional(),
    resume_step: z.number().int().min(1).max(5).optional(),
    flags: z.array(z.string().trim().min(1)).optional(),
    grounding_duration_seconds: z.number().int().min(1).optional(),
    ai_hints: z.array(z.string().trim().min(1)).optional(),
  })
  .optional();

export const addReflectionResponseSchema = z.object({
  response: z
    .object({
      id: questionIdSchema,
      text: z.string().trim().max(3000).optional(),
      value: z.number().int().min(1).max(10).optional(),
      category: z.string().trim().max(120).optional(),
      status: z.string().trim().max(120).optional(),
      method: z.string().trim().max(120).optional(),
      intervention: z.string().trim().max(200).optional(),
    })
    .refine(
      (data) =>
        Boolean(data.text) ||
        typeof data.value === 'number' ||
        Boolean(data.status) ||
        Boolean(data.method) ||
        Boolean(data.intervention),
      {
        message:
          'Una respuesta debe incluir texto, valor, estado, método o intervención',
      },
    ),
  metadataPatch: metadataPatchSchema,
});

export const completeReflectionSessionSchema = z.object({
  title: z
    .string()
    .trim()
    .max(120, 'El título no puede exceder 120 caracteres')
    .optional(),
  metadataPatch: metadataPatchSchema,
});

export type CreateReflectionSessionInput = z.infer<
  typeof createReflectionSessionSchema
>;
export type AddReflectionResponseInput = z.infer<
  typeof addReflectionResponseSchema
>;
export type CompleteReflectionSessionInput = z.infer<
  typeof completeReflectionSessionSchema
>;

export const wizardFormSchema = z.object({
  situation: z
    .string()
    .trim()
    .min(5, 'Describe brevemente la situación.')
    .max(3000, 'Límite de 3000 caracteres'),
  thought: z
    .string()
    .trim()
    .min(3, 'Ponerle nombre al pensamiento suele ser la parte más difícil')
    .max(3000, 'Límite de 3000 caracteres'),
  emotion: z
    .string()
    .trim()
    .min(1, 'Selecciona una emoción principal')
    .refine(
      (value) =>
        Object.values(PrimaryEmotion).includes(value as PrimaryEmotion) ||
        normalizePrimaryEmotion(value) !== null,
      'Selecciona una emoción principal',
    ),
  intensity: z
    .number()
    .min(1, 'La intensidad mínima es 1')
    .max(10, 'La intensidad máxima es 10'),
  purpose: z
    .string()
    .trim()
    .min(3, 'Describe el propósito.')
    .max(3000, 'Límite de 3000 caracteres'),
  selfControl: z
    .string()
    .trim()
    .min(3, 'Identifica lo que estaba bajo tu control.')
    .max(3000, 'Límite de 3000 caracteres'),
  othersControl: z
    .string()
    .trim()
    .min(3, 'Identifica lo que dependía de otras personas.')
    .max(3000, 'Límite de 3000 caracteres'),
  alternative: z
    .string()
    .trim()
    .min(5, 'Describe una perspectiva alternativa.')
    .max(3000, 'Límite de 3000 caracteres'),
});

export type WizardFormValues = z.infer<typeof wizardFormSchema>;
