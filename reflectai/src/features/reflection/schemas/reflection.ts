import { z } from 'zod';

import { PrimaryEmotion } from '@/features/reflection/types/reflection';

export const createReflectionSessionSchema = z.object({
  title: z
    .string()
    .trim()
    .max(120, 'Title cannot exceed 120 characters')
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
          'A response must include text, value, status, method, or intervention',
      },
    ),
  metadataPatch: metadataPatchSchema,
});

export const completeReflectionSessionSchema = z.object({
  title: z
    .string()
    .trim()
    .max(120, 'Title cannot exceed 120 characters')
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
    .min(5, 'Please describe the situation briefly.')
    .max(3000, '3000 character limit'),
  thought: z
    .string()
    .trim()
    .min(3, 'Naming the thought is often the hardest part')
    .max(3000, '3000 character limit'),
  emotion: z
    .string()
    .min(1, 'Please select a primary emotion.')
    .refine(
      (value) => Object.values(PrimaryEmotion).includes(value as PrimaryEmotion),
      'Please select a primary emotion.',
    ),
  intensity: z
    .number()
    .min(1, 'Minimum intensity is 1')
    .max(10, 'Maximum intensity is 10'),
  purpose: z
    .string()
    .trim()
    .min(3, 'Please describe the purpose.')
    .max(3000, '3000 character limit'),
  selfControl: z
    .string()
    .trim()
    .min(3, 'Identify what was under your control.')
    .max(3000, '3000 character limit'),
  othersControl: z
    .string()
    .trim()
    .min(3, 'Identify what depended on others.')
    .max(3000, '3000 character limit'),
  alternative: z
    .string()
    .trim()
    .min(5, 'Describe an alternative perspective.')
    .max(3000, '3000 character limit'),
});

export type WizardFormValues = z.infer<typeof wizardFormSchema>;
