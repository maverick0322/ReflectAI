import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  GET as listReflectionSessions,
  POST as createReflectionSession,
} from '@/app/api/reflection-sessions/route';
import { GET as getReflectionSessionById } from '@/app/api/reflection-sessions/[id]/route';
import { POST as addReflectionResponse } from '@/app/api/reflection-sessions/[id]/responses/route';
import { PATCH as completeReflectionSession } from '@/app/api/reflection-sessions/[id]/complete/route';
import {
  analyzeReflectionSession,
  buildFallbackAnalysis,
} from '@/lib/ai/reflectionAnalysis';
import { getAuthenticatedUser } from '@/lib/auth/getAuthenticatedUser';

vi.mock('@/lib/auth/getAuthenticatedUser', () => ({
  getAuthenticatedUser: vi.fn(),
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
  insert: MockFn;
  update: MockFn;
  eq: MockFn;
  order: MockFn;
  single: MockFn;
};

const routeParams = { params: Promise.resolve({ id: 'session-1' }) };
const startedAt = '2026-04-30T10:00:00.000Z';
const payloadWithResponse = {
  metadata: {
    version: '1.1',
    started_at: startedAt,
  },
  responses: [{ id: 'Q1_SIT', text: 'Tuve una discusion.' }],
};
const fallbackAnalysis = {
  primary_emotions: [],
  average_intensity: null,
  key_themes: [],
  cognitive_distortion_detected: null,
  session_title: 'Titulo fallback',
  summary: 'Resumen fallback',
  recommendation: 'Recomendacion fallback',
  encouraging_message: 'Mensaje fallback',
  professional_support_reminder: 'Consulta a un profesional si el malestar persiste.',
};

function createBuilder<T>({
  singleResult,
  orderResult,
}: {
  singleResult?: QueryResult<T>;
  orderResult?: QueryResult<T>;
} = {}): QueryBuilder {
  const builder = {
    select: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    update: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(async () => orderResult ?? { data: null, error: null }),
    single: vi.fn(async () => singleResult ?? { data: null, error: null }),
  } as QueryBuilder;

  return builder;
}

function mockAuthenticatedUser({
  supabase = { from: vi.fn() },
  user = { id: 'user-1', email: 'ana@reflectai.com' },
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

function jsonRequest(path: string, body: unknown, method = 'POST') {
  return new Request(`http://localhost${path}`, {
    method,
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
  vi.mocked(buildFallbackAnalysis).mockReturnValue(fallbackAnalysis);
});

describe('rutas API de sesiÓnes de reflexiÓn: errores y ramÁs', () => {
  it('cubre validacion, fallo de insert y catch al crear sesiÓn', async () => {
    mockAuthenticatedUser();

    const invalidResponse = await createReflectionSession(
      jsonRequest('/api/reflection-sessions', {
        title: 'x'.repeat(121),
      }),
    );
    expect(invalidResponse.status).toBe(400);
    expect((await readJson(invalidResponse)).error?.message).toBe('Datos invalidos');

    const insertBuilder = createBuilder({
      singleResult: { data: null, error: { message: 'db' } },
    });
    mockAuthenticatedUser({ supabase: { from: vi.fn(() => insertBuilder) } });

    const dbResponse = await createReflectionSession(
      jsonRequest('/api/reflection-sessions', { title: 'SesiÓn' }),
    );
    expect(dbResponse.status).toBe(500);
    expect((await readJson(dbResponse)).error?.message).toBe('No se pudo crear la sesion');

    vi.mocked(getAuthenticatedUser).mockRejectedValueOnce(new Error('boom'));
    const catchResponse = await createReflectionSession(
      jsonRequest('/api/reflection-sessions', {}),
    );
    expect(catchResponse.status).toBe(500);
    expect((await readJson(catchResponse)).error?.message).toBe(
      'Error inesperado al crear sesion',
    );
  });

  it('cubre no autorizado, fallo de consulta y catch al listar sesiÓnes', async () => {
    mockAuthenticatedUser({ user: null, error: { message: 'missing' } });

    const unauthorizedResponse = await listReflectionSessions();
    expect(unauthorizedResponse.status).toBe(401);

    const listBuilder = createBuilder({
      orderResult: { data: null, error: { message: 'db' } },
    });
    mockAuthenticatedUser({ supabase: { from: vi.fn(() => listBuilder) } });

    const dbResponse = await listReflectionSessions();
    expect(dbResponse.status).toBe(500);
    expect((await readJson(dbResponse)).error?.message).toBe('No se pudo obtener el historial');

    vi.mocked(getAuthenticatedUser).mockRejectedValueOnce(new Error('boom'));
    const catchResponse = await listReflectionSessions();
    expect(catchResponse.status).toBe(500);
    expect((await readJson(catchResponse)).error?.message).toBe(
      'Error inesperado al obtener sesiones',
    );
  });

  it('obtiene detalle de sesiÓn y cubre no autorizado/catch', async () => {
    const detailBuilder = createBuilder({
      singleResult: {
        data: {
          id: 'session-1',
          title: 'SesiÓn',
          status: 'draft',
          started_at: startedAt,
          payload: payloadWithResponse,
          ai_analysis: {},
        },
        error: null,
      },
    });
    mockAuthenticatedUser({ supabase: { from: vi.fn(() => detailBuilder) } });

    const response = await getReflectionSessionById(
      new Request('http://localhost/api/reflection-sessions/session-1'),
      routeParams,
    );
    expect(response.status).toBe(200);
    expect((await readJson(response)).message).toBe('Sesion obtenida correctamente');

    mockAuthenticatedUser({ user: null, error: { message: 'missing' } });
    const unauthorizedResponse = await getReflectionSessionById(
      new Request('http://localhost/api/reflection-sessions/session-1'),
      routeParams,
    );
    expect(unauthorizedResponse.status).toBe(401);

    vi.mocked(getAuthenticatedUser).mockRejectedValueOnce(new Error('boom'));
    const catchResponse = await getReflectionSessionById(
      new Request('http://localhost/api/reflection-sessions/session-1'),
      routeParams,
    );
    expect(catchResponse.status).toBe(500);
  });

  it('cubre validaciones y estados bloqueados al guardar respuesta', async () => {
    mockAuthenticatedUser({ user: null, error: { message: 'missing' } });
    const unauthorizedResponse = await addReflectionResponse(
      jsonRequest('/api/reflection-sessions/session-1/responses', {
        response: { id: 'Q1_SIT', text: 'SituaciÓn' },
      }),
      routeParams,
    );
    expect(unauthorizedResponse.status).toBe(401);

    mockAuthenticatedUser();
    const invalidResponse = await addReflectionResponse(
      jsonRequest('/api/reflection-sessions/session-1/responses', {
        response: { id: 'Q1_SIT' },
      }),
      routeParams,
    );
    expect(invalidResponse.status).toBe(400);

    const missingBuilder = createBuilder({
      singleResult: { data: null, error: { message: 'not found' } },
    });
    mockAuthenticatedUser({ supabase: { from: vi.fn(() => missingBuilder) } });
    const missingResponse = await addReflectionResponse(
      jsonRequest('/api/reflection-sessions/session-1/responses', {
        response: { id: 'Q1_SIT', text: 'SituaciÓn' },
      }),
      routeParams,
    );
    expect(missingResponse.status).toBe(404);

    const completedBuilder = createBuilder({
      singleResult: {
        data: {
          id: 'session-1',
          status: 'completed',
          started_at: startedAt,
          payload: payloadWithResponse,
        },
        error: null,
      },
    });
    mockAuthenticatedUser({ supabase: { from: vi.fn(() => completedBuilder) } });
    const completedResponse = await addReflectionResponse(
      jsonRequest('/api/reflection-sessions/session-1/responses', {
        response: { id: 'Q2_THO', text: 'Pensamiento' },
      }),
      routeParams,
    );
    expect(completedResponse.status).toBe(409);
  });

  it('reporta fallo de update y catch al guardar respuesta', async () => {
    const readBuilder = createBuilder({
      singleResult: {
        data: {
          id: 'session-1',
          status: 'draft',
          started_at: startedAt,
          payload: payloadWithResponse,
        },
        error: null,
      },
    });
    const updateBuilder = createBuilder({
      singleResult: { data: null, error: { message: 'db' } },
    });
    mockAuthenticatedUser({
      supabase: { from: vi.fn().mockReturnValueOnce(readBuilder).mockReturnValueOnce(updateBuilder) },
    });

    const dbResponse = await addReflectionResponse(
      jsonRequest('/api/reflection-sessions/session-1/responses', {
        response: { id: 'Q2_THO', text: 'Pensamiento' },
        metadataPatch: { flags: ['needs_followup'] },
      }),
      routeParams,
    );
    expect(dbResponse.status).toBe(500);
    expect((await readJson(dbResponse)).error?.message).toBe('No se pudo guardar la respuesta');

    vi.mocked(getAuthenticatedUser).mockRejectedValueOnce(new Error('boom'));
    const catchResponse = await addReflectionResponse(
      jsonRequest('/api/reflection-sessions/session-1/responses', {
        response: { id: 'Q2_THO', text: 'Pensamiento' },
      }),
      routeParams,
    );
    expect(catchResponse.status).toBe(500);
  });

  it('cubre validacion, no autorizado, sesiÓn faltante y sesiÓn ya completada al completar', async () => {
    mockAuthenticatedUser();
    const invalidResponse = await completeReflectionSession(
      jsonRequest('/api/reflection-sessions/session-1/complete', {
        title: 'x'.repeat(121),
      }, 'PATCH'),
      routeParams,
    );
    expect(invalidResponse.status).toBe(400);

    mockAuthenticatedUser({ user: null, error: { message: 'missing' } });
    const unauthorizedResponse = await completeReflectionSession(
      jsonRequest('/api/reflection-sessions/session-1/complete', {}, 'PATCH'),
      routeParams,
    );
    expect(unauthorizedResponse.status).toBe(401);

    const missingBuilder = createBuilder({
      singleResult: { data: null, error: { message: 'not found' } },
    });
    mockAuthenticatedUser({ supabase: { from: vi.fn(() => missingBuilder) } });
    const missingResponse = await completeReflectionSession(
      jsonRequest('/api/reflection-sessions/session-1/complete', {}, 'PATCH'),
      routeParams,
    );
    expect(missingResponse.status).toBe(404);

    const completedBuilder = createBuilder({
      singleResult: {
        data: {
          id: 'session-1',
          status: 'completed',
          started_at: startedAt,
          payload: payloadWithResponse,
        },
        error: null,
      },
    });
    mockAuthenticatedUser({ supabase: { from: vi.fn(() => completedBuilder) } });
    const completedResponse = await completeReflectionSession(
      jsonRequest('/api/reflection-sessions/session-1/complete', {}, 'PATCH'),
      routeParams,
    );
    expect(completedResponse.status).toBe(409);
  });

  it('usa analisis fallback al completar si IA no devuelve resultado y reporta fallo de update', async () => {
    vi.mocked(analyzeReflectionSession).mockResolvedValue(null);
    const readBuilder = createBuilder({
      singleResult: {
        data: {
          id: 'session-1',
          status: 'draft',
          started_at: startedAt,
          payload: payloadWithResponse,
        },
        error: null,
      },
    });
    const updateBuilder = createBuilder({
      singleResult: {
        data: {
          id: 'session-1',
          title: 'Titulo fallback',
          status: 'completed',
          payload: payloadWithResponse,
          ai_analysis: fallbackAnalysis,
        },
        error: null,
      },
    });
    mockAuthenticatedUser({
      supabase: { from: vi.fn().mockReturnValueOnce(readBuilder).mockReturnValueOnce(updateBuilder) },
    });

    const response = await completeReflectionSession(
      jsonRequest('/api/reflection-sessions/session-1/complete', {}, 'PATCH'),
      routeParams,
    );

    expect(response.status).toBe(200);
    expect(updateBuilder.update).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Titulo fallback',
        ai_analysis: fallbackAnalysis,
      }),
    );

    const failedUpdateBuilder = createBuilder({
      singleResult: { data: null, error: { message: 'db' } },
    });
    mockAuthenticatedUser({
      supabase: {
        from: vi.fn().mockReturnValueOnce(readBuilder).mockReturnValueOnce(failedUpdateBuilder),
      },
    });

    const updateFailedResponse = await completeReflectionSession(
      jsonRequest('/api/reflection-sessions/session-1/complete', {}, 'PATCH'),
      routeParams,
    );
    expect(updateFailedResponse.status).toBe(500);
    expect((await readJson(updateFailedResponse)).error?.message).toBe(
      'No se pudo completar la sesion',
    );
  });
});
