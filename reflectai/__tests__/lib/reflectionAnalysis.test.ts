import { describe, expect, it, vi } from 'vitest';

import type { ReflectionSessionPayload } from '@/types/reflection';
import { buildInitialPayload } from '@/lib/reflection/payload';
import {
  analyzeReflectionSession,
  buildAnalysisMessages,
  parseAnalysisResult,
} from '@/lib/ai/reflectionAnalysis';

vi.mock('@/lib/ai/groqClient', () => ({
  createGroqChatCompletion: vi.fn(async () =>
    JSON.stringify({
      primary_emotions: ['calma'],
      average_intensity: 5,
      key_themes: ['familia'],
      cognitive_distortion_detected: null,
      session_title: 'Sesion resumida',
      summary: 'Resumen de la sesion',
      recommendation: 'Recomendacion concreta',
      encouraging_message: 'Mensaje alentador',
      professional_support_reminder:
        'Lo mejor es consultar a un profesional si el malestar persiste.',
    }),
  ),
}));

const payload: ReflectionSessionPayload = buildInitialPayload('2026-05-07T10:00:00.000Z');

describe('reflection analysis', () => {
  it('builds analysis messages with payload', () => {
    const messages = buildAnalysisMessages(payload);
    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe('system');
  });

  it('parses analysis JSON content', () => {
    const content = JSON.stringify({
      primary_emotions: ['calma'],
      average_intensity: 4,
      key_themes: ['trabajo'],
      cognitive_distortion_detected: 'catastrofismo',
      session_title: 'Resumen',
      summary: 'Resumen breve',
      recommendation: 'Recomendacion breve',
      encouraging_message: 'Mensaje breve',
      professional_support_reminder:
        'Lo mejor es consultar a un profesional si el malestar persiste.',
    });

    const result = parseAnalysisResult(content);

    expect(result?.primary_emotions).toEqual(['calma']);
    expect(result?.average_intensity).toBe(4);
    expect(result?.session_title).toBe('Resumen');
    expect(result?.recommendation).toBe('Recomendacion breve');
  });

  it('runs analysis using Groq client', async () => {
    const result = await analyzeReflectionSession(payload);

    expect(result?.primary_emotions).toEqual(['calma']);
    expect(result?.key_themes).toEqual(['familia']);
  });
});
