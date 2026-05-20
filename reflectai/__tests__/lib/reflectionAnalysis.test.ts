import { describe, expect, it, vi } from 'vitest';

import type { ReflectionSessionPayload } from '@/types/reflection';
import { buildInitialPayload } from '@/lib/reflection/payload';
import {
  analyzeReflectionSession,
  buildFallbackAnalysis,
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

  it('returns null instead of throwing for malformed JSON', () => {
    expect(parseAnalysisResult('respuesta { "summary": } con llaves')).toBeNull();
  });

  it('accepts embedded JSON and normalizes unsupported field types', () => {
    const content = [
      'Texto previo',
      JSON.stringify({
        primary_emotions: ['calma', 4],
        average_intensity: 'high',
        key_themes: ['trabajo', null],
        cognitive_distortion_detected: 9,
        session_title: 'Resumen',
        summary: 'Resumen breve',
        recommendation: 'Recomendacion breve',
        encouraging_message: 'Mensaje breve',
        professional_support_reminder: 'Consulta soporte profesional si el malestar persiste.',
      }),
      'Texto posterior',
    ].join(' ');

    const result = parseAnalysisResult(content);

    expect(result).toEqual({
      primary_emotions: ['calma'],
      average_intensity: null,
      key_themes: ['trabajo'],
      cognitive_distortion_detected: null,
      session_title: 'Resumen',
      summary: 'Resumen breve',
      recommendation: 'Recomendacion breve',
      encouraging_message: 'Mensaje breve',
      professional_support_reminder:
        'Consulta soporte profesional si el malestar persiste.',
    });
  });

  it('builds fallback analysis from captured responses', () => {
    const filledPayload: ReflectionSessionPayload = {
      ...payload,
      responses: [
        { id: 'Q1_SIT', text: 'Una situacion importante que necesito resumir.' },
        { id: 'Q3_EMO', text: 'ansiedad' },
        { id: 'Q4_INT', value: 8 },
        { id: 'Q7_ALT', text: 'Puedo responder con mas calma.' },
      ],
    };

    const fallback = buildFallbackAnalysis(filledPayload);

    expect(fallback.primary_emotions).toEqual(['ansiedad']);
    expect(fallback.average_intensity).toBe(8);
    expect(fallback.session_title).toBe('Puedo responder con mas calma.');
    expect(fallback.summary).toBeNull();
    expect(fallback.recommendation).toBeNull();
    expect(fallback.encouraging_message).toBeNull();
    expect(fallback.professional_support_reminder).toBeNull();
  });

  it('truncates long fallback titles and tolerates empty payload values', () => {
    const longAlternative =
      'Una alternativa extensa que supera ampliamente los sesenta y cuatro caracteres disponibles';
    const fallback = buildFallbackAnalysis({
      ...payload,
      responses: [
        { id: 'Q1_SIT', text: '' },
        { id: 'Q4_INT' },
        { id: 'Q7_ALT', text: longAlternative },
      ],
    });

    expect(fallback.primary_emotions).toEqual([]);
    expect(fallback.average_intensity).toBeNull();
    expect(fallback.session_title).toBe(
      `${longAlternative.slice(0, 61).trim()}...`,
    );
  });

  it('runs analysis using Groq client', async () => {
    const result = await analyzeReflectionSession(payload);

    expect(result?.primary_emotions).toEqual(['calma']);
    expect(result?.key_themes).toEqual(['familia']);
  });
});
