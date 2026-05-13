import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  buildDailyQuoteMessages,
  generateDailyQuote,
  getFallbackQuote,
} from '@/lib/ai/dailyQuote';

const createGroqChatCompletionMock = vi.fn();

vi.mock('@/lib/ai/groqClient', () => ({
  createGroqChatCompletion: (...args: unknown[]) => createGroqChatCompletionMock(...args),
}));

describe('dailyQuote', () => {
  beforeEach(() => {
    createGroqChatCompletionMock.mockReset();
  });

  it('construye mensajes para pedir una cita breve en JSON', () => {
    const messages = buildDailyQuoteMessages('Ana');

    expect(messages[0].role).toBe('system');
    expect(messages[0].content).toContain('Return JSON only');
    expect(messages[1].content).toContain('Ana');
  });

  it('devuelve fallbacks deterministas por seed', () => {
    expect(getFallbackQuote(0)).toEqual(getFallbackQuote(3));
    expect(getFallbackQuote(1).author).toBe('ReflectAI');
  });

  it('marca como generada por IA cuando Groq devuelve JSON valido', async () => {
    createGroqChatCompletionMock.mockResolvedValue(
      JSON.stringify({ text: 'Respira antes de responder.', author: 'ReflectAI' }),
    );

    await expect(generateDailyQuote('Ana')).resolves.toEqual({
      text: 'Respira antes de responder.',
      author: 'ReflectAI',
      aiGenerated: true,
    });
  });

  it('marca como fallback local cuando Groq devuelve contenido no parseable', async () => {
    createGroqChatCompletionMock.mockResolvedValue('sin json');

    const result = await generateDailyQuote('Ana');

    expect(result.author).toBe('ReflectAI');
    expect(result.aiGenerated).toBe(false);
  });
});
