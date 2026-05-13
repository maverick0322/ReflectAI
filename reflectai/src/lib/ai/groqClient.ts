export type GroqChatRole = 'system' | 'user' | 'assistant';

export interface GroqChatMessage {
  role: GroqChatRole;
  content: string;
}

export interface GroqChatCompletionOptions {
  messages: GroqChatMessage[];
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getContentFromResponse(payload: unknown): string | null {
  if (!isRecord(payload)) {
    return null;
  }

  const choices = payload.choices;
  if (!Array.isArray(choices) || choices.length === 0) {
    return null;
  }

  const firstChoice = choices[0];
  if (!isRecord(firstChoice)) {
    return null;
  }

  const message = firstChoice.message;
  if (!isRecord(message)) {
    return null;
  }

  const content = message.content;
  return typeof content === 'string' ? content : null;
}

export async function createGroqChatCompletion({
  messages,
  temperature = 0.2,
  maxTokens = 512,
  model,
}: GroqChatCompletionOptions): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  const resolvedModel = model ?? process.env.GROQ_MODEL ?? DEFAULT_GROQ_MODEL;

  if (!apiKey) {
    throw new Error('Missing GROQ_API_KEY');
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: resolvedModel,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  const payload: unknown = await response.json();

  if (!response.ok) {
    const errorMessage = isRecord(payload) && typeof payload.error === 'object'
      ? JSON.stringify(payload.error)
      : 'Groq request failed';
    throw new Error(errorMessage);
  }

  const content = getContentFromResponse(payload);
  if (!content) {
    throw new Error('Groq response content missing');
  }

  return content;
}
