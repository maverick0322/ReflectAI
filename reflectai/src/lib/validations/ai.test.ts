import { describe, expect, it } from 'vitest';

import { analyzeSessionSchema, nextQuestionSchema } from '@/lib/validations/ai';

const SESSION_ID = '11111111-1111-4111-8111-111111111111';

describe('validaciones de endpoints de IA', () => {
  it('acepta solicitudes validas para siguiente pregunta', () => {
    const result = nextQuestionSchema.safeParse({
      sessionId: SESSION_ID,
      questionIds: ['Q1_SIT', 'Q2_THO'],
    });

    expect(result.success).toBe(true);
  });

  it('rechaza sessionId invalido y demasiadas preguntas', () => {
    const result = nextQuestionSchema.safeParse({
      sessionId: 'no-es-uuid',
      questionIds: ['Q1_SIT', 'Q2_THO', 'Q3_EMO', 'Q4_INT', 'Q5_TEL'],
    });

    expect(result.success).toBe(false);
  });

  it('acepta solicitudes validas para analizar sesion', () => {
    expect(analyzeSessionSchema.safeParse({ sessionId: SESSION_ID }).success).toBe(true);
  });
});
