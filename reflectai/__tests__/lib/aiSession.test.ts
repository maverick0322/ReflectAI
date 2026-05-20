import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/ai/nextQuestion', () => ({
  generateNextQuestion: vi.fn(async (_payload, questionId: string) => `Pregunta ${questionId}`),
}));

vi.mock('@/lib/ai/reflectionAnalysis', () => ({
  analyzeReflectionSession: vi.fn(async () => null),
  buildFallbackAnalysis: vi.fn(() => ({
    primary_emotions: [],
    average_intensity: null,
    key_themes: [],
    cognitive_distortion_detected: null,
    session_title: null,
    summary: null,
    recommendation: null,
    encouraging_message: null,
    professional_support_reminder: null,
  })),
}));

import { buildInitialPayload } from '@/lib/reflection/payload';
import { buildNextQuestionsResult } from '@/lib/ai/session';

describe('ai session helpers', () => {
  it('falls back to the computed next question when the caller passes an empty array', async () => {
    const payload = buildInitialPayload('2026-05-20T10:00:00.000Z');

    const result = await buildNextQuestionsResult(payload, []);

    expect(result).toMatchObject({
      done: false,
      questionId: 'Q1_SIT',
      questionText: 'Pregunta Q1_SIT',
      aiGenerated: true,
    });
    expect(result.questions).toHaveLength(1);
  });
});
