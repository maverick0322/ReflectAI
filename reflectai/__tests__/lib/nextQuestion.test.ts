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
    const result = parseNextQuestionContent('{ invalid }', 'fallback');
    expect(result).toBe('fallback');
  });

  it('returns fallback for empty or incomplete JSON payloads', () => {
    expect(parseNextQuestionContent('   ', 'fallback')).toBe('fallback');
    expect(parseNextQuestionContent('{"other":"value"}', 'fallback')).toBe('fallback');
    expect(parseNextQuestionContent('{"question_text":12}', 'fallback')).toBe('fallback');
  });

  it('builds messages with payload context', () => {
    const messages = buildNextQuestionMessages(payload, 'Q1_SIT');
    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe('system');
  });

  it('serializes completed session context and trims long answer text', () => {
    const messages = buildNextQuestionMessages(
      {
        metadata: {
          version: '1.1',
          started_at: '2026-05-19T10:00:00.000Z',
          completed_at: '2026-05-19T10:20:00.000Z',
        },
        responses: [
          {
            id: 'Q1_SIT',
            text: 'a'.repeat(140),
            value: 7,
            category: 'primary',
            status: 'saved',
            method: 'manual',
          },
          {
            id: 'SYS_GROUNDING',
          },
        ],
      },
      'Q2_THO',
    );
    const userContent = JSON.parse(messages[1].content) as {
      payload: {
        metadata: { completed_at: string | null };
        responses: Array<{
          text: string | null;
          value: number | null;
          category: string | null;
          status: string | null;
          method: string | null;
        }>;
      };
    };

    expect(userContent.payload.metadata.completed_at).toBe('2026-05-19T10:20:00.000Z');
    expect(userContent.payload.responses[0].text).toHaveLength(120);
    expect(userContent.payload.responses[0]).toMatchObject({
      value: 7,
      category: 'primary',
      status: 'saved',
      method: 'manual',
    });
    expect(userContent.payload.responses[1]).toMatchObject({
      text: null,
      value: null,
      category: null,
      status: null,
      method: null,
    });
  });

  it('generates a question using Groq client', async () => {
    const result = await generateNextQuestion(payload, 'Q1_SIT');
    expect(result).toBe('Pregunta ajustada');
  });
});
