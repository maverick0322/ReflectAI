import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/ai/groqClient', () => ({
  createGroqChatCompletion: vi.fn(async () => '{"question_text":"Pregunta ajustada"}'),
}));

import type { ReflectionSessionPayload } from '@/types/reflection';
import { buildInitialPayload } from '@/lib/reflection/payload';
import {
  buildNextQuestionMessages,
  generateNextQuestion,
  parseNextQuestionContent,
} from '@/lib/ai/nextQuestion';

const payload: ReflectionSessionPayload = buildInitialPayload('2026-05-07T10:00:00.000Z');

describe('next question helpers', () => {
  it('parses JSON response content', () => {
    const result = parseNextQuestionContent('{"question_text":"Pregunta"}', 'fallback');
    expect(result).toBe('Pregunta');
  });

  it('returns raw text when no JSON is present', () => {
    const result = parseNextQuestionContent('Texto directo', 'fallback');
    expect(result).toBe('Texto directo');
  });

  it('returns fallback when JSON is invalid', () => {
    const result = parseNextQuestionContent('texto {', 'fallback');
    expect(result).toBe('texto {');
  });

  it('builds messages with payload context', () => {
    const messages = buildNextQuestionMessages(payload, 'Q1_SIT');
    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe('system');
  });

  it('generates a question using Groq client', async () => {
    const result = await generateNextQuestion(payload, 'Q1_SIT');
    expect(result).toBe('Pregunta ajustada');
  });
});
