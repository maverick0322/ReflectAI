import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createGroqChatCompletion } from '@/lib/ai/groqClient';

const OLD_ENV = process.env;

describe('groqClient', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'respuesta' } }],
        }),
      })),
    );
    process.env = { ...OLD_ENV, GROQ_API_KEY: 'key-test', GROQ_MODEL: 'modelo-test' };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env = OLD_ENV;
  });

  it('rechaza cuando falta GROQ_API_KEY', async () => {
    delete process.env.GROQ_API_KEY;

    await expect(
      createGroqChatCompletion({ messages: [{ role: 'user', content: 'hola' }] }),
    ).rejects.toThrow('Missing GROQ_API_KEY');
  });

  it('envia la solicitud y devuelve el contenido de la primera opcion', async () => {
    const result = await createGroqChatCompletion({
      messages: [{ role: 'user', content: 'hola' }],
      temperature: 0.4,
      maxTokens: 50,
    });

    expect(result).toBe('respuesta');
    expect(fetch).toHaveBeenCalledWith(
      'https://api.groq.com/openai/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer key-test',
        }),
        body: JSON.stringify({
          model: 'modelo-test',
          messages: [{ role: 'user', content: 'hola' }],
          temperature: 0.4,
          max_tokens: 50,
        }),
      }),
    );
  });

  it('propaga errores de la API', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { message: 'rate limited' } }),
    } as Response);

    await expect(
      createGroqChatCompletion({ messages: [{ role: 'user', content: 'hola' }] }),
    ).rejects.toThrow('rate limited');
  });

  it('rechaza respuestas sin contenido util', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: {} }] }),
    } as Response);

    await expect(
      createGroqChatCompletion({ messages: [{ role: 'user', content: 'hola' }] }),
    ).rejects.toThrow('Groq response content missing');
  });
});
