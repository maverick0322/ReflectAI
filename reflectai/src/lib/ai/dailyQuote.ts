import { createGroqChatCompletion, type GroqChatMessage } from './groqClient';
import { extractEmbeddedJsonObject, isRecord } from './json';

export interface DailyQuoteResult {
  text: string;
  author: string;
}

export interface GeneratedDailyQuoteResult extends DailyQuoteResult {
  aiGenerated: boolean;
}

const FALLBACK_QUOTES: DailyQuoteResult[] = [
  {
    text: 'Respira, observa y responde con claridad.',
    author: 'ReflectAI',
  },
  {
    text: 'Una pausa honesta puede cambiar la forma de mirar el dia.',
    author: 'ReflectAI',
  },
  {
    text: 'Nombrar lo que sientes tambien es una forma de cuidarte.',
    author: 'ReflectAI',
  },
];

function parseQuoteContent(content: string): DailyQuoteResult | null {
  const parsed = extractEmbeddedJsonObject(content);

  if (!isRecord(parsed)) {
    return null;
  }

  const text = typeof parsed.text === 'string' ? parsed.text.trim() : '';
  const author = typeof parsed.author === 'string' ? parsed.author.trim() : '';

  if (!text || !author) {
    return null;
  }

  return {
    text,
    author,
  };
}

export function getFallbackQuote(seed = Date.now()): DailyQuoteResult {
  const index = Math.abs(seed) % FALLBACK_QUOTES.length;
  return FALLBACK_QUOTES[index];
}

export function buildDailyQuoteMessages(userName?: string): GroqChatMessage[] {
  return [
    {
      role: 'system',
      content:
        'Generate a short reflective quote in Spanish for a self-reflection app. ' +
        'It must be original, calm, non-clinical, and under 22 words. ' +
        'Return JSON only with keys text and author. Use author "ReflectAI".',
    },
    {
      role: 'user',
      content: JSON.stringify({
        user_name: userName ?? null,
        avoid_topics: ['diagnosis', 'therapy replacement', 'medical advice'],
      }),
    },
  ];
}

export async function generateDailyQuote(userName?: string): Promise<GeneratedDailyQuoteResult> {
  const content = await createGroqChatCompletion({
    messages: buildDailyQuoteMessages(userName),
    temperature: 0.9,
    maxTokens: 120,
  });

  const parsed = parseQuoteContent(content);
  if (parsed) {
    return {
      ...parsed,
      aiGenerated: true,
    };
  }

  return {
    ...getFallbackQuote(),
    aiGenerated: false,
  };
}
