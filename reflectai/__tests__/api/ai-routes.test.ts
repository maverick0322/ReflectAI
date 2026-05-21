import { beforeEach, describe, expect, it, vi } from 'vitest';

import { POST as analyzeSessionPost } from '@/app/api/ai/analyze-session/route';
import { GET as dailyQuoteGet } from '@/app/api/ai/daily-quote/route';
import { POST as nextQuestionPost } from '@/app/api/ai/next-question/route';
import { generateDailyQuote, getFallbackQuote } from '@/lib/ai/dailyQuote';
import {
  analyzeReflectionSession,
  buildFallbackAnalysis,
} from '@/lib/ai/reflectionAnalysis';
import { generateNextQuestion } from '@/lib/ai/nextQuestion';
import { getAuthenticatedUser } from '@/lib/auth/getAuthenticatedUser';

vi.mock('@/lib/auth/getAuthenticatedUser', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/lib/ai/dailyQuote', () => ({
  generateDailyQuote: vi.fn(),
  getFallbackQuote: vi.fn(),
}));

vi.mock('@/lib/ai/nextQuestion', () => ({
  generateNextQuestion: vi.fn(),
}));

vi.mock('@/lib/ai/reflectionAnalysis', () => ({
  analyzeReflectionSession: vi.fn(),
  buildFallbackAnalysis: vi.fn(),
}));

type MockFn = ReturnType<typeof vi.fn>;

type QueryResult<T> = {
  data: T;
  error: null | { message: string };
};

type QueryBuilder = {
  select: MockFn;
  update: MockFn;
  eq: MockFn;
  single: MockFn;
};

const SESSION_ID = '11111111-1111-4111-8111-111111111111';
const STARTED_AT = '2026-04-30T10:00:00.000Z';

const basePayload = {
  metadata: {
    version: '1.1',
    started_at: STARTED_AT,
  },
  responses: [
    { id: 'Q1_SIT', text: 'Tuve una discusion.' },
    { id: 'Q2_THO', text: 'No me escuchan.' },
  ],
};

const completedPayload = {
  metadata: {
    version: '1.1',
    started_at: STARTED_AT,
  },
  responses: [
    { id: 'Q1_SIT', text: 'SituaciÓn' },
    { id: 'Q2_THO', text: 'Pensamiento' },
    { id: 'Q3_EMO', text: 'Ansiedad' },
    { id: 'Q4_INT', value: 7 },
    { id: 'Q5_TEL', text: 'Cuidarme' },
    { id: 'Q6_CON_MINE', text: 'Mi respuesta' },
    { id: 'Q6_CON_OTHERS', text: 'La reaccion externa' },
    { id: 'Q7_ALT', text: 'Puedo pausar' },
  ],
};

const fallbackAnalysis = {
  primary_emotions: [],
  average_intensity: null,
  key_themes: [],
  cognitive_distortion_detected: null,
  session_title: 'SesiÓn de reflexiÓn',
  summary: 'Resumen local',
  recommendation: 'Recomendacion local',
  encouraging_message: 'Mensaje local',
  professional_support_reminder: 'Consulta a un profesional si el malestar persiste.',
};

function createBuilder<T>(singleResult: QueryResult<T>): QueryBuilder {
  const builder = {
    select: vi.fn(() => builder),
    update: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    single: vi.fn(async () => singleResult),
  } as QueryBuilder;

  return builder;
}

function mockAuthenticatedUser({
  supabase = { from: vi.fn() },
  user = {
    id: 'user-1',
    email: 'ana@reflectai.com',
    user_metadata: { full_name: 'Ana Lopez' },
  },
  error = null,
}: {
  supabase?: Record<string, unknown>;
  user?: Record<string, unknown> | null;
  error?: unknown;
} = {}) {
  vi.mocked(getAuthenticatedUser).mockResolvedValue({
    supabase,
    user,
    error,
  } as never);
}

function jsonRequest(path: string, body: unknown) {
  return new Request(`http://localhost${path}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

async function readJson(response: Response) {
  return response.json() as Promise<{
    data?: Record<string, unknown>;
    error?: { message?: string };
    message?: string;
  }>;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getFallbackQuote).mockReturnValue({
    quote: 'Respira y vuelve al presente.',
    author: 'ReflectAI',
  } as never);
  vi.mocked(buildFallbackAnalysis).mockReturnValue(fallbackAnalysis);
});

describe('ruta API de cita diaria', () => {
  it('genera cita personalizada para usuario autenticado', async () => {
    mockAuthenticatedUser();
    vi.mocked(generateDailyQuote).mockResolvedValue({
      quote: 'Haz una pausa.',
      author: 'ReflectAI',
      aiGenerated: true,
    } as never);

    const response = await dailyQuoteGet();
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.message).toBe('Cita generada correctamente');
    expect(body.data).toEqual({
      quote: 'Haz una pausa.',
      author: 'ReflectAI',
      aiGenerated: true,
    });
    expect(generateDailyQuote).toHaveBeenCalledWith('Ana Lopez');
  });

  it('usa fallback local si la IA falla y bloquea usuarios anonimos', async () => {
    mockAuthenticatedUser();
    vi.mocked(generateDailyQuote).mockRejectedValue(new Error('groq'));

    const fallbackResponse = await dailyQuoteGet();
    const fallbackBody = await readJson(fallbackResponse);

    expect(fallbackResponse.status).toBe(200);
    expect(fallbackBody.message).toBe('Cita local generada correctamente');
    expect(fallbackBody.data).toEqual({
      quote: 'Respira y vuelve al presente.',
      author: 'ReflectAI',
      aiGenerated: false,
    });

    mockAuthenticatedUser({ user: null, error: { message: 'missing' } });

    const unauthorizedResponse = await dailyQuoteGet();
    expect(unauthorizedResponse.status).toBe(401);
    expect((await readJson(unauthorizedResponse)).error?.message).toBe('No autorizado');
  });
});

describe('ruta API de siguiente pregunta', () => {
  it('genera preguntas solicitadas y usa fallback por pregunta si IA falla', async () => {
    const readBuilder = createBuilder({
      data: {
        id: SESSION_ID,
        payload: basePayload,
        started_at: STARTED_AT,
      },
      error: null,
    });
    mockAuthenticatedUser({ supabase: { from: vi.fn(() => readBuilder) } });
    vi.mocked(generateNextQuestion)
      .mockResolvedValueOnce('Pregunta generada para emociÓn')
      .mockRejectedValueOnce(new Error('groq'));

    const response = await nextQuestionPost(
      jsonRequest('/api/ai/next-question', {
        sessionId: SESSION_ID,
        questionIds: ['Q3_EMO', 'Q4_INT'],
      }),
    );
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.data).toMatchObject({
      done: false,
      questionId: 'Q3_EMO',
      questionText: 'Pregunta generada para emociÓn',
      aiGenerated: true,
    });
    expect(body.data?.questions).toEqual([
      {
        questionId: 'Q3_EMO',
        questionText: 'Pregunta generada para emociÓn',
        aiGenerated: true,
      },
      {
        questionId: 'Q4_INT',
        questionText: expect.any(String),
        aiGenerated: false,
      },
    ]);
  });

  it('responde done cuando ya no hay preguntas pendientes', async () => {
    const readBuilder = createBuilder({
      data: {
        id: SESSION_ID,
        payload: completedPayload,
        started_at: STARTED_AT,
      },
      error: null,
    });
    mockAuthenticatedUser({ supabase: { from: vi.fn(() => readBuilder) } });

    const response = await nextQuestionPost(
      jsonRequest('/api/ai/next-question', {
        sessionId: SESSION_ID,
      }),
    );
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.data).toEqual({ done: true });
    expect(generateNextQuestion).not.toHaveBeenCalled();
  });

  it('rechaza payload inválido, usuario anónimo y sesión inexistente', async () => {
    const invalidResponse = await nextQuestionPost(
      jsonRequest('/api/ai/next-question', {
        sessionId: 'no-es-uuid',
      }),
    );
    expect(invalidResponse.status).toBe(400);
    expect((await readJson(invalidResponse)).error?.message).toBe('Datos invalidos');

    mockAuthenticatedUser({ user: null, error: { message: 'missing' } });

    const unauthorizedResponse = await nextQuestionPost(
      jsonRequest('/api/ai/next-question', {
        sessionId: SESSION_ID,
      }),
    );
    expect(unauthorizedResponse.status).toBe(401);

    const readBuilder = createBuilder({
      data: null,
      error: { message: 'not found' },
    });
    mockAuthenticatedUser({ supabase: { from: vi.fn(() => readBuilder) } });

    const notFoundResponse = await nextQuestionPost(
      jsonRequest('/api/ai/next-question', {
        sessionId: SESSION_ID,
      }),
    );
    expect(notFoundResponse.status).toBe(404);
    expect((await readJson(notFoundResponse)).error?.message).toBe('Sesion no encontrada');
  });
});

describe('ruta API de análisis de sesión', () => {
  it('analiza sesión y persiste resultado de IA', async () => {
    const aiAnalysis = {
      ...fallbackAnalysis,
      primary_emotions: ['ansiedad'],
      summary: 'Resumen IA',
    };
    vi.mocked(analyzeReflectionSession).mockResolvedValue(aiAnalysis);
    const readBuilder = createBuilder({
      data: {
        id: SESSION_ID,
        payload: basePayload,
        started_at: STARTED_AT,
      },
      error: null,
    });
    const updateBuilder = createBuilder({
      data: {
        id: SESSION_ID,
        ai_analysis: aiAnalysis,
      },
      error: null,
    });
    const from = vi.fn().mockReturnValueOnce(readBuilder).mockReturnValueOnce(updateBuilder);
    mockAuthenticatedUser({ supabase: { from } });

    const response = await analyzeSessionPost(
      jsonRequest('/api/ai/analyze-session', {
        sessionId: SESSION_ID,
      }),
    );
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.message).toBe('Analisis generado correctamente');
    expect(body.data).toEqual({
      id: SESSION_ID,
      ai_analysis: aiAnalysis,
    });
    expect(updateBuilder.update).toHaveBeenCalledWith({ ai_analysis: aiAnalysis });
  });

  it('persiste fallback si la IA falla', async () => {
    vi.mocked(analyzeReflectionSession).mockRejectedValue(new Error('groq'));
    const readBuilder = createBuilder({
      data: {
        id: SESSION_ID,
        payload: basePayload,
        started_at: STARTED_AT,
      },
      error: null,
    });
    const updateBuilder = createBuilder({
      data: {
        id: SESSION_ID,
        ai_analysis: fallbackAnalysis,
      },
      error: null,
    });
    const from = vi.fn().mockReturnValueOnce(readBuilder).mockReturnValueOnce(updateBuilder);
    mockAuthenticatedUser({ supabase: { from } });

    const response = await analyzeSessionPost(
      jsonRequest('/api/ai/analyze-session', {
        sessionId: SESSION_ID,
      }),
    );

    expect(response.status).toBe(200);
    expect(updateBuilder.update).toHaveBeenCalledWith({ ai_analysis: fallbackAnalysis });
  });

  it('rechaza payload inválido, usuario anónimo, sesión inexistente y fallo al guardar', async () => {
    const invalidResponse = await analyzeSessionPost(
      jsonRequest('/api/ai/analyze-session', {
        sessionId: 'bad',
      }),
    );
    expect(invalidResponse.status).toBe(400);

    mockAuthenticatedUser({ user: null, error: { message: 'missing' } });
    const unauthorizedResponse = await analyzeSessionPost(
      jsonRequest('/api/ai/analyze-session', {
        sessionId: SESSION_ID,
      }),
    );
    expect(unauthorizedResponse.status).toBe(401);

    const missingBuilder = createBuilder({
      data: null,
      error: { message: 'not found' },
    });
    mockAuthenticatedUser({ supabase: { from: vi.fn(() => missingBuilder) } });
    const notFoundResponse = await analyzeSessionPost(
      jsonRequest('/api/ai/analyze-session', {
        sessionId: SESSION_ID,
      }),
    );
    expect(notFoundResponse.status).toBe(404);

    const readBuilder = createBuilder({
      data: {
        id: SESSION_ID,
        payload: basePayload,
        started_at: STARTED_AT,
      },
      error: null,
    });
    const updateBuilder = createBuilder({
      data: null,
      error: { message: 'db' },
    });
    const from = vi.fn().mockReturnValueOnce(readBuilder).mockReturnValueOnce(updateBuilder);
    mockAuthenticatedUser({ supabase: { from } });
    vi.mocked(analyzeReflectionSession).mockResolvedValue(fallbackAnalysis);

    const updateFailureResponse = await analyzeSessionPost(
      jsonRequest('/api/ai/analyze-session', {
        sessionId: SESSION_ID,
      }),
    );
    expect(updateFailureResponse.status).toBe(500);
    expect((await readJson(updateFailureResponse)).error?.message).toBe(
      'No se pudo guardar el analisis',
    );
  });
});
