import { z } from 'zod';

const questionIdSchema = z.enum([
  'Q1_SIT',
  'Q2_THO',
  'Q3_EMO',
  'Q4_INT',
  'Q5_TEL',
  'Q6_CON_MINE',
  'Q6_CON_OTHERS',
  'Q7_ALT',
]);

export const nextQuestionSchema = z.object({
  sessionId: z.string().uuid('El id de sesion es obligatorio'),
  questionIds: z.array(questionIdSchema).min(1).max(4).optional(),
});

export const analyzeSessionSchema = z.object({
  sessionId: z.string().uuid('El id de sesion es obligatorio'),
});

export type NextQuestionInput = z.infer<typeof nextQuestionSchema>;
export type AnalyzeSessionInput = z.infer<typeof analyzeSessionSchema>;
