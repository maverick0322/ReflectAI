import { describe, expect, it } from 'vitest';

import { buildDailyQuoteMessages, getFallbackQuote } from '@/lib/ai/dailyQuote';

describe('dailyQuote', () => {
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
});
