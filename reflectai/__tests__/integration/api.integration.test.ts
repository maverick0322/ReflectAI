import { beforeEach, describe, expect, it, vi } from 'vitest';

import { POST as analyzeSessionPost } from '@/app/api/ai/analyze-session/route';
import { GET as dailyQuoteGet } from '@/app/api/ai/daily-quote/route';
import { POST as nextQuestionPost } from '@/app/api/ai/next-question/route';
import { DELETE as deleteAccountDelete } from '@/app/api/auth/delete-account/route';
import { POST as changePasswordPost } from '@/app/api/auth/change-password/route';
import { POST as confirmRecoveryPost } from '@/app/api/auth/confirm-recovery/route';
import { POST as loginPost } from '@/app/api/auth/login/route';
import { POST as logoutPost } from '@/app/api/auth/logout/route';
import { POST as recoverPost } from '@/app/api/auth/recover/route';
import { POST as registerPost } from '@/app/api/auth/register/route';
import { POST as avatarPost } from '@/app/api/profile/avatar/route';
import { GET as profileGet, PATCH as profilePatch } from '@/app/api/profile/route';
import {
  GET as listReflectionSessions,
  POST as createReflectionSession,
} from '@/app/api/reflection-sessions/route';
import { GET as getReflectionSessionById } from '@/app/api/reflection-sessions/[id]/route';
import { PATCH as completeReflectionSession } from '@/app/api/reflection-sessions/[id]/complete/route';
import { POST as addReflectionResponse } from '@/app/api/reflection-sessions/[id]/responses/route';
import { generateDailyQuote, getFallbackQuote } from '@/lib/ai/dailyQuote';
import { generateNextQuestion } from '@/lib/ai/nextQuestion';
import {
  analyzeReflectionSession,
  buildFallbackAnalysis,
} from '@/lib/ai/reflectionAnalysis';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

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

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabaseClient: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(),
}));

type QueryResult<T> = {
  data: T;
  error: null | { message: string };
};

type ChainResult = {
  singleResult?: QueryResult<unknown>;
  maybeSingleResult?: QueryResult<unknown>;
  orderResult?: QueryResult<unknown>;
};

type MockFn = ReturnType<typeof vi.fn>;

interface ChainMock {
  select: MockFn;
  insert: MockFn;
  update: MockFn;
  delete: MockFn;
  eq: MockFn;
  order: MockFn;
  single: MockFn;
  maybeSingle: MockFn;
}

type ApiBody<TData = Record<string, unknown>> = {
  message?: string;
  data?: TData;
  error?: {
    message?: string;
    details?: unknown;
    field?: string;
  };
};

const SESSION_ID = '11111111-1111-4111-8111-111111111111';
const STARTED_AT = '2026-05-12T10:00:00.000Z';

const aiAnalysis = {
  primary_emotions: ['ansiedad'],
  average_intensity: 8,
  key_themes: ['trabajo', 'limites'],
  cognitive_distortion_detected: null,
  session_title: 'Pausa ante una conversacion dificil',
  summary: 'Resumen generado por IA',
  recommendation: 'Elige una accion pequena bajo tu control.',
  encouraging_message: 'Hiciste espacio para responder con mas claridad.',
  professional_support_reminder:
    'Si el malestar persiste, consulta a un profesional.',
};

const fallbackAnalysis = {
  primary_emotions: [],
  average_intensity: null,
  key_themes: [],
  cognitive_distortion_detected: null,
  session_title: 'Sesion de reflexion',
  summary: 'Resumen local',
  recommendation: 'Recomendacion local',
  encouraging_message: 'Mensaje local',
  professional_support_reminder:
    'Si el malestar persiste, consulta a un profesional.',
};

function createChain(result: ChainResult = {}): ChainMock {
  const chain = {
    select: vi.fn(() => chain),
    insert: vi.fn(() => chain),
    update: vi.fn(() => chain),
    delete: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    order: vi.fn(async () => result.orderResult ?? { data: null, error: null }),
    single: vi.fn(async () => result.singleResult ?? { data: null, error: null }),
    maybeSingle: vi.fn(async () => result.maybeSingleResult ?? { data: null, error: null }),
  } as unknown as ChainMock;

  return chain;
}

function createSupabaseMock(options: {
  user?: Record<string, unknown> | null;
  authError?: unknown;
  builders?: ChainMock[];
  auth?: Record<string, MockFn>;
  storage?: Record<string, unknown>;
} = {}) {
  const from = vi.fn();

  for (const builder of options.builders ?? []) {
    from.mockReturnValueOnce(builder as never);
  }

  const defaultUser = { id: 'user-a', email: 'ana@reflectai.com' };
  const resolvedUser = options.user === undefined ? defaultUser : options.user;

  return {
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: resolvedUser },
        error: options.authError ?? null,
      })),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      updateUser: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      exchangeCodeForSession: vi.fn(),
      ...options.auth,
    },
    from,
    storage: options.storage,
  };
}

function createStorageBucket(publicUrl = 'https://cdn.test/user-a/avatar.png') {
  const bucket = {
    upload: vi.fn(async () => ({ error: null })),
    createSignedUrl: vi.fn(async () => ({
      data: { signedUrl: `${publicUrl}?token=abc` },
      error: null,
    })),
  };

  return {
    storage: {
      from: vi.fn(() => bucket),
    },
    bucket,
  };
}

function mockServerSupabaseClient(supabaseMock: ReturnType<typeof createSupabaseMock>) {
  vi.mocked(createServerSupabaseClient).mockResolvedValue(supabaseMock as never);
}

function jsonRequest(path: string, body: unknown, method = 'POST') {
  return new Request(`http://localhost${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Origin: 'http://localhost',
    },
    body: JSON.stringify(body),
  });
}

function imageFile(type: 'image/png', name: string) {
  return new File(
    [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
    name,
    { type },
  );
}

function routeParams(id = SESSION_ID) {
  return { params: Promise.resolve({ id }) };
}

async function readJson<TData = Record<string, unknown>>(response: Response) {
  return response.json() as Promise<ApiBody<TData>>;
}

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.NEXT_PUBLIC_SITE_URL;

  vi.mocked(analyzeReflectionSession).mockResolvedValue(aiAnalysis);
  vi.mocked(buildFallbackAnalysis).mockReturnValue(fallbackAnalysis);
  vi.mocked(generateDailyQuote).mockResolvedValue({
    text: 'Haz una pausa antes de responder.',
    author: 'ReflectAI',
    aiGenerated: true,
  });
  vi.mocked(getFallbackQuote).mockReturnValue({
    text: 'Respira y vuelve al presente.',
    author: 'ReflectAI',
  });
  vi.mocked(generateNextQuestion).mockResolvedValue('Pregunta generada por IA');
});

describe('Critical API integration - version 2026-05-12', () => {
  it('TC-01-01 registers a user and propagates profile data to Supabase Auth', async () => {
    const createUser = vi.fn(async () => ({
      data: { user: { id: 'user-a', email: 'ana@reflectai.com' } },
      error: null,
    }));

    vi.mocked(createAdminSupabaseClient).mockReturnValue({
      auth: { admin: { createUser } },
    } as never);

    const response = await registerPost(
      jsonRequest('/api/auth/register', {
        firstName: 'Ana',
        lastName: 'Lopez',
        email: 'ana@reflectai.com',
        password: 'PasswordFuerte123!',
        birthDate: '2000-01-01',
      }),
    );

    const body = await readJson(response);

    expect(response.status).toBe(201);
    expect(body.message).toBe('Usuario registrado correctamente');
    expect(body.data).toEqual({
      id: 'user-a',
      email: 'ana@reflectai.com',
      fullName: 'Ana Lopez',
    });
    expect(createUser).toHaveBeenCalledWith({
      email: 'ana@reflectai.com',
      password: 'PasswordFuerte123!',
      email_confirm: true,
      user_metadata: {
        first_name: 'Ana',
        last_name: 'Lopez',
        full_name: 'Ana Lopez',
        birth_date: '2000-01-01',
      },
    });
  });

  it('returns a clear rate-limit response when Supabase blocks signup emails', async () => {
    const createUser = vi.fn(async () => ({
      data: { user: null },
      error: { message: 'email rate limit exceeded' },
    }));

    vi.mocked(createAdminSupabaseClient).mockReturnValue({
      auth: { admin: { createUser } },
    } as never);

    const response = await registerPost(
      jsonRequest('/api/auth/register', {
        firstName: 'Ana',
        lastName: 'Lopez',
        email: 'ana@reflectai.com',
        password: 'PasswordFuerte123!',
        birthDate: '2000-01-01',
      }),
    );
    const body = await readJson(response);

    expect(response.status).toBe(429);
    expect(body.error?.message).toBe(
      'Se hicieron demasiados intentos. Espera unos minutos antes de crear otra cuenta.',
    );
  });

  it('returns a field-friendly message when the email is already registered', async () => {
    const createUser = vi.fn(async () => ({
      data: { user: null },
      error: { message: 'A user with this email address has already been registered' },
    }));

    vi.mocked(createAdminSupabaseClient).mockReturnValue({
      auth: { admin: { createUser } },
    } as never);

    const response = await registerPost(
      jsonRequest('/api/auth/register', {
        firstName: 'Ana',
        lastName: 'Lopez',
        email: 'ana@reflectai.com',
        password: 'PasswordFuerte123!',
        birthDate: '2000-01-01',
      }),
    );
    const body = await readJson(response);

    expect(response.status).toBe(400);
    expect(body.error?.message).toBe('Ya existe una cuenta con ese correo.');
    expect(body.error?.field).toBe('email');
  });

  it('TC-01-02 signs in and signs out with safe response contracts', async () => {
    const signInWithPassword = vi.fn(async () => ({
      data: {
        user: {
          id: 'user-a',
          email: 'ana@reflectai.com',
          user_metadata: { full_name: 'Ana Lopez' },
        },
      },
      error: null,
    }));
    const signOut = vi.fn(async () => ({ error: null }));
    const supabaseMock = createSupabaseMock({
      auth: { signInWithPassword, signOut },
    });
    mockServerSupabaseClient(supabaseMock);

    const loginResponse = await loginPost(
      jsonRequest('/api/auth/login', {
        email: 'ana@reflectai.com',
        password: 'PasswordFuerte123!',
      }),
    );
    const loginBody = await readJson(loginResponse);

    expect(loginResponse.status).toBe(200);
    expect(loginBody.message).toBe('Sesion iniciada correctamente');
    expect(loginBody.data).toEqual({
      id: 'user-a',
      email: 'ana@reflectai.com',
      userMetadata: { full_name: 'Ana Lopez' },
    });

    const logoutResponse = await logoutPost(
      jsonRequest('/api/auth/logout', {}),
    );

    expect(logoutResponse.status).toBe(200);
    expect((await readJson(logoutResponse)).message).toBe(
      'Sesion cerrada correctamente',
    );
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: 'ana@reflectai.com',
      password: 'PasswordFuerte123!',
    });
    expect(signOut).toHaveBeenCalled();
  });

  it('TC-01-03 recovers access, confirms the code and changes an authenticated password', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://reflectai.example';
    const resetPasswordForEmail = vi.fn(async () => ({ error: null }));
    const exchangeCodeForSession = vi.fn(async () => ({
      data: { session: { access_token: 'token' } },
      error: null,
    }));
    const signInWithPassword = vi.fn(async () => ({ error: null }));
    const updateUser = vi.fn(async () => ({ error: null }));
    const supabaseMock = createSupabaseMock({
      user: { id: 'user-a', email: 'ana@reflectai.com' },
      auth: {
        resetPasswordForEmail,
        exchangeCodeForSession,
        signInWithPassword,
        updateUser,
      },
    });
    mockServerSupabaseClient(supabaseMock);

    const recoverResponse = await recoverPost(
      jsonRequest('/api/auth/recover', { email: 'ana@reflectai.com' }),
    );
    const confirmResponse = await confirmRecoveryPost(
      jsonRequest('/api/auth/confirm-recovery', { code: 'code-ok' }),
    );
    const changePasswordResponse = await changePasswordPost(
      jsonRequest('/api/auth/change-password', {
        currentPassword: 'PasswordActual123!',
        newPassword: 'PasswordNueva123!',
        confirmNewPassword: 'PasswordNueva123!',
      }),
    );

    expect(recoverResponse.status).toBe(200);
    expect(confirmResponse.status).toBe(200);
    expect(changePasswordResponse.status).toBe(200);
    expect(resetPasswordForEmail).toHaveBeenCalledWith('ana@reflectai.com', {
      redirectTo:
        'https://reflectai.example/auth/callback?next=%2Fcambiar-contrasena%3Fmode%3Drecovery',
    });
    expect(exchangeCodeForSession).toHaveBeenCalledWith('code-ok');
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: 'ana@reflectai.com',
      password: 'PasswordActual123!',
    });
    expect(updateUser).toHaveBeenCalledWith({ password: 'PasswordNueva123!' });
  });

  it('TC-01-04 deletes the account and cleans history, profile, Auth and local session', async () => {
    const signOut = vi.fn(async () => ({ error: null }));
    const supabaseMock = createSupabaseMock({
      user: { id: 'user-a', email: 'ana@reflectai.com' },
      auth: { signOut },
    });
    const deleteUser = vi.fn(async () => ({ error: null }));

    mockServerSupabaseClient(supabaseMock);
    vi.mocked(createAdminSupabaseClient).mockReturnValue({
      auth: { admin: { deleteUser } },
    } as never);

    const response = await deleteAccountDelete(
      jsonRequest(
        '/api/auth/delete-account',
        { currentPassword: 'PasswordActual123!' },
        'DELETE',
      ),
    );
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.message).toBe('Cuenta eliminada correctamente');
    expect(deleteUser).toHaveBeenCalledWith('user-a');
    expect(signOut).toHaveBeenCalled();
  });

  it('TC-02-01 creates a missing profile from metadata and updates personal data', async () => {
    const readProfile = createChain({
      maybeSingleResult: { data: null, error: null },
    });
    const createdProfile = {
      id: 'user-a',
      first_name: 'Ana',
      last_name: 'Lopez',
      full_name: 'Ana Lopez',
      birth_date: '2000-01-01',
      avatar_url: null,
    };
    const createProfile = createChain({
      singleResult: { data: createdProfile, error: null },
    });
    const updatedProfile = {
      ...createdProfile,
      first_name: 'Anahi',
      full_name: 'Anahi Lopez',
    };
    const updateProfile = createChain({
      singleResult: { data: updatedProfile, error: null },
    });
    const supabaseMock = createSupabaseMock({
      user: {
        id: 'user-a',
        email: 'ana@reflectai.com',
        user_metadata: {
          first_name: 'Ana',
          last_name: 'Lopez',
          birth_date: '2000-01-01',
        },
      },
      builders: [readProfile, createProfile, updateProfile],
    });
    mockServerSupabaseClient(supabaseMock);

    const profileResponse = await profileGet();
    const updateResponse = await profilePatch(
      jsonRequest('/api/profile', {
        firstName: 'Anahi',
        lastName: 'Lopez',
        birthDate: '2000-01-01',
      }, 'PATCH'),
    );

    expect(profileResponse.status).toBe(200);
    expect(updateResponse.status).toBe(200);
    expect(createProfile.insert).toHaveBeenCalledWith({
      id: 'user-a',
      first_name: 'Ana',
      last_name: 'Lopez',
      full_name: 'Ana Lopez',
      birth_date: '2000-01-01',
    });
    expect(updateProfile.update).toHaveBeenCalledWith({
      first_name: 'Anahi',
      last_name: 'Lopez',
      full_name: 'Anahi Lopez',
      birth_date: '2000-01-01',
    });
  });

  it('TC-02-02 uploads a valid avatar and persists the public bucket URL', async () => {
    const avatarProfile = {
      id: 'user-a',
      first_name: 'Ana',
      last_name: 'Lopez',
      full_name: 'Ana Lopez',
      birth_date: '2000-01-01',
      avatar_url: 'https://cdn.test/user-a/avatar.png',
    };
    const updateAvatar = createChain({
      singleResult: { data: avatarProfile, error: null },
    });
    const { storage, bucket } = createStorageBucket(avatarProfile.avatar_url);
    const supabaseMock = createSupabaseMock({
      user: { id: 'user-a', email: 'ana@reflectai.com' },
      builders: [updateAvatar],
      storage,
    });
    mockServerSupabaseClient(supabaseMock);

    const formData = new FormData();
    formData.set(
      'avatar',
      imageFile('image/png', 'avatar.png'),
    );

    const response = await avatarPost({
      formData: vi.fn(async () => formData),
    } as unknown as Request);
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.message).toBe('Foto de perfil actualizada correctamente');
    expect(body.data?.avatar_url).toBe(avatarProfile.avatar_url);
    expect(bucket.upload).toHaveBeenCalledWith(
      expect.stringMatching(/^user-a\/avatar-\d+\.png$/),
      expect.any(File),
      {
        cacheControl: '3600',
        contentType: 'image/png',
        upsert: true,
      },
    );
    expect(updateAvatar.update).toHaveBeenCalledWith({
      avatar_url: avatarProfile.avatar_url,
    });
  });

  it('TC-03-01 creates a draft session with a versioned 1.1 payload', async () => {
    const insertBuilder = createChain({
      singleResult: {
        data: {
          id: SESSION_ID,
          title: 'Registrar estres laboral',
          status: 'draft',
          started_at: STARTED_AT,
          completed_at: null,
          payload: {
            metadata: {
              version: '1.1',
              started_at: STARTED_AT,
            },
            responses: [],
          },
          ai_analysis: {},
        },
        error: null,
      },
    });
    const supabaseMock = createSupabaseMock({
      user: { id: 'user-a', email: 'ana@reflectai.com' },
      builders: [insertBuilder],
    });
    mockServerSupabaseClient(supabaseMock);

    const response = await createReflectionSession(
      jsonRequest('/api/reflection-sessions', {
        title: 'Registrar estres laboral',
      }),
    );
    const body = await readJson(response);

    expect(response.status).toBe(201);
    expect(body.message).toBe('Sesion creada correctamente');
    expect(body.data).toMatchObject({
      id: SESSION_ID,
      title: 'Registrar estres laboral',
      status: 'draft',
      payload: {
        metadata: {
          version: '1.1',
          started_at: STARTED_AT,
        },
        responses: [],
      },
      ai_analysis: {},
    });
    expect(insertBuilder.insert).toHaveBeenCalledWith({
      user_id: 'user-a',
      title: 'Registrar estres laboral',
      status: 'draft',
      started_at: expect.any(String),
      payload: {
        metadata: {
          version: '1.1',
          started_at: expect.any(String),
        },
        responses: [],
      },
      ai_analysis: {},
    });
  });

  it('TC-03-02 lists only owned sessions in descending chronological order', async () => {
    const listBuilder = createChain({
      orderResult: {
        data: [
          {
            id: 'session-2',
            title: 'Sesion reciente',
            status: 'completed',
            started_at: '2026-05-12T09:00:00.000Z',
            completed_at: '2026-05-12T09:20:00.000Z',
            ai_analysis: {},
          },
          {
            id: 'session-1',
            title: 'Sesion anterior',
            status: 'draft',
            started_at: '2026-05-11T09:00:00.000Z',
            completed_at: null,
            ai_analysis: {},
          },
        ],
        error: null,
      },
    });
    const supabaseMock = createSupabaseMock({
      user: { id: 'user-a' },
      builders: [listBuilder],
    });
    mockServerSupabaseClient(supabaseMock);

    const response = await listReflectionSessions();
    const body = await readJson<unknown[]>(response);

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(2);
    expect(body.data?.[0]).toMatchObject({ id: 'session-2' });
    expect(listBuilder.eq).toHaveBeenCalledWith('user_id', 'user-a');
    expect(listBuilder.order).toHaveBeenCalledWith('started_at', { ascending: false });
  });

  it('TC-03-03 hides a foreign session with a 404 response', async () => {
    const detailBuilder = createChain({
      singleResult: {
        data: null,
        error: { message: 'No row' },
      },
    });
    const supabaseMock = createSupabaseMock({
      user: { id: 'user-b' },
      builders: [detailBuilder],
    });
    mockServerSupabaseClient(supabaseMock);

    const response = await getReflectionSessionById(
      new Request(`http://localhost/api/reflection-sessions/${SESSION_ID}`),
      routeParams(),
    );
    const body = await readJson(response);

    expect(response.status).toBe(404);
    expect(body.error?.message).toBe('Sesion no encontrada');
    expect(detailBuilder.eq).toHaveBeenCalledWith('id', SESSION_ID);
    expect(detailBuilder.eq).toHaveBeenCalledWith('user_id', 'user-b');
  });

  it('TC-03-04 saves responses and merges grounding metadata without data loss', async () => {
    const readBuilder = createChain({
      singleResult: {
        data: {
          id: SESSION_ID,
          status: 'draft',
          started_at: STARTED_AT,
          payload: {
            metadata: {
              version: '1.1',
              started_at: STARTED_AT,
              flags: ['high_intensity_triggered'],
              ai_hints: ['focus_control'],
            },
            responses: [
              {
                id: 'SYS_GROUNDING',
                status: 'started',
                method: 'box_breathing',
              },
            ],
          },
        },
        error: null,
      },
    });
    const updateBuilder = createChain({
      singleResult: {
        data: {
          id: SESSION_ID,
          title: null,
          status: 'draft',
          started_at: STARTED_AT,
          completed_at: null,
          payload: {
            metadata: {
              version: '1.1',
              started_at: STARTED_AT,
              flags: ['high_intensity_triggered', 'grounding_completed'],
              ai_hints: ['focus_control', 'slow_down'],
              grounding_duration_seconds: 45,
            },
            responses: [
              {
                id: 'SYS_GROUNDING',
                status: 'acknowledged',
                method: 'box_breathing',
              },
            ],
          },
          ai_analysis: {},
        },
        error: null,
      },
    });
    const supabaseMock = createSupabaseMock({
      user: { id: 'user-a' },
      builders: [readBuilder, updateBuilder],
    });
    mockServerSupabaseClient(supabaseMock);

    const response = await addReflectionResponse(
      jsonRequest(`/api/reflection-sessions/${SESSION_ID}/responses`, {
        response: {
          id: 'SYS_GROUNDING',
          status: 'acknowledged',
        },
        metadataPatch: {
          flags: ['grounding_completed'],
          ai_hints: ['slow_down'],
          grounding_duration_seconds: 45,
        },
      }),
      routeParams(),
    );
    const body = await readJson(response);
    const updatedPayload = updateBuilder.update.mock.calls[0][0].payload;

    expect(response.status).toBe(201);
    expect(body.message).toBe('Respuesta guardada correctamente');
    expect(updatedPayload.metadata).toMatchObject({
      flags: ['high_intensity_triggered', 'grounding_completed'],
      ai_hints: ['focus_control', 'slow_down'],
      grounding_duration_seconds: 45,
    });
    expect(updatedPayload.responses).toEqual([
      {
        id: 'SYS_GROUNDING',
        status: 'acknowledged',
        method: 'box_breathing',
      },
    ]);
  });

  it('TC-03-05 blocks new responses on completed sessions', async () => {
    const readBuilder = createChain({
      singleResult: {
        data: {
          id: SESSION_ID,
          status: 'completed',
          started_at: STARTED_AT,
          payload: {
            metadata: { version: '1.1', started_at: STARTED_AT },
            responses: [{ id: 'Q1_SIT', text: 'Situacion' }],
          },
        },
        error: null,
      },
    });
    const supabaseMock = createSupabaseMock({
      user: { id: 'user-a' },
      builders: [readBuilder],
    });
    mockServerSupabaseClient(supabaseMock);

    const response = await addReflectionResponse(
      jsonRequest(`/api/reflection-sessions/${SESSION_ID}/responses`, {
        response: {
          id: 'Q2_THO',
          text: 'Pensamiento posterior',
        },
      }),
      routeParams(),
    );
    const body = await readJson(response);

    expect(response.status).toBe(409);
    expect(body.error?.message).toBe(
      'No se pueden agregar respuestas a una sesion completada',
    );
  });

  it('TC-03-06 completes a reflection with AI analysis and completion metadata', async () => {
    const readBuilder = createChain({
      singleResult: {
        data: {
          id: SESSION_ID,
          status: 'draft',
          started_at: STARTED_AT,
          payload: {
            metadata: {
              version: '1.1',
              started_at: STARTED_AT,
              flags: ['grounding_completed'],
            },
            responses: [
              { id: 'Q1_SIT', text: 'Una conversacion dificil' },
              { id: 'Q2_THO', text: 'No me escuchan' },
              { id: 'Q3_EMO', text: 'Ansiedad' },
              { id: 'Q4_INT', value: 8 },
              { id: 'Q5_TEL', text: 'Protegerme' },
              { id: 'Q6_CON_MINE', text: 'Mi tono' },
              { id: 'Q6_CON_OTHERS', text: 'La reaccion externa' },
              { id: 'Q7_ALT', text: 'Puedo responder con calma' },
            ],
          },
        },
        error: null,
      },
    });
    const updateBuilder = createChain({
      singleResult: {
        data: {
          id: SESSION_ID,
          title: aiAnalysis.session_title,
          status: 'completed',
          started_at: STARTED_AT,
          completed_at: '2026-05-12T10:20:00.000Z',
          payload: {
            metadata: {
              version: '1.1',
              started_at: STARTED_AT,
              completed_at: '2026-05-12T10:20:00.000Z',
              flags: ['grounding_completed', 'manual_review'],
            },
            responses: [],
          },
          ai_analysis: aiAnalysis,
        },
        error: null,
      },
    });
    const supabaseMock = createSupabaseMock({
      user: { id: 'user-a' },
      builders: [readBuilder, updateBuilder],
    });
    mockServerSupabaseClient(supabaseMock);

    const response = await completeReflectionSession(
      jsonRequest(`/api/reflection-sessions/${SESSION_ID}/complete`, {
        metadataPatch: {
          flags: ['manual_review'],
        },
      }, 'PATCH'),
      routeParams(),
    );
    const body = await readJson(response);
    const updateData = updateBuilder.update.mock.calls[0][0];

    expect(response.status).toBe(200);
    expect(body.message).toBe('Sesion completada correctamente');
    expect(updateData).toMatchObject({
      status: 'completed',
      title: aiAnalysis.session_title,
      ai_analysis: aiAnalysis,
    });
    expect(updateData.completed_at).toEqual(expect.any(String));
    expect(updateData.payload.metadata).toMatchObject({
      completed_at: updateData.completed_at,
      flags: ['grounding_completed', 'manual_review'],
    });
    expect(analyzeReflectionSession).toHaveBeenCalledWith(updateData.payload);
  });

  it('TC-04-01 generates a personalized daily quote and keeps the local fallback if AI fails', async () => {
    const supabaseMock = createSupabaseMock({
      user: {
        id: 'user-a',
        email: 'ana@reflectai.com',
        user_metadata: { full_name: 'Ana Lopez' },
      },
    });
    mockServerSupabaseClient(supabaseMock);

    const generatedResponse = await dailyQuoteGet();
    const generatedBody = await readJson(generatedResponse);

    vi.mocked(generateDailyQuote).mockRejectedValueOnce(new Error('groq'));
    const fallbackResponse = await dailyQuoteGet();
    const fallbackBody = await readJson(fallbackResponse);

    expect(generatedResponse.status).toBe(200);
    expect(generatedBody.message).toBe('Cita generada correctamente');
    expect(generatedBody.data).toEqual({
      text: 'Haz una pausa antes de responder.',
      author: 'ReflectAI',
      aiGenerated: true,
    });
    expect(generateDailyQuote).toHaveBeenCalledWith('Ana Lopez');
    expect(fallbackResponse.status).toBe(200);
    expect(fallbackBody.message).toBe('Cita local generada correctamente');
    expect(fallbackBody.data).toEqual({
      text: 'Respira y vuelve al presente.',
      author: 'ReflectAI',
      aiGenerated: false,
    });
  });

  it('TC-04-02 generates next questions with per-question fallback', async () => {
    vi.mocked(generateNextQuestion)
      .mockResolvedValueOnce('Que emocion aparece con mas fuerza?')
      .mockRejectedValueOnce(new Error('groq'));
    const readBuilder = createChain({
      singleResult: {
        data: {
          id: SESSION_ID,
          started_at: STARTED_AT,
          payload: {
            metadata: { version: '1.1', started_at: STARTED_AT },
            responses: [
              { id: 'Q1_SIT', text: 'Una conversacion dificil' },
              { id: 'Q2_THO', text: 'No me escuchan' },
            ],
          },
        },
        error: null,
      },
    });
    const supabaseMock = createSupabaseMock({
      user: { id: 'user-a' },
      builders: [readBuilder],
    });
    mockServerSupabaseClient(supabaseMock);

    const response = await nextQuestionPost(
      jsonRequest('/api/ai/next-question', {
        sessionId: SESSION_ID,
        questionIds: ['Q3_EMO', 'Q4_INT'],
      }),
    );
    const body = await readJson<{
      done: boolean;
      questionId: string;
      questionText: string;
      aiGenerated: boolean;
      questions: Array<{
        questionId: string;
        questionText: string;
        aiGenerated: boolean;
      }>;
    }>(response);

    expect(response.status).toBe(200);
    expect(body.data).toMatchObject({
      done: false,
      questionId: 'Q3_EMO',
      questionText: 'Que emocion aparece con mas fuerza?',
      aiGenerated: true,
    });
    expect(body.data?.questions).toEqual([
      {
        questionId: 'Q3_EMO',
        questionText: 'Que emocion aparece con mas fuerza?',
        aiGenerated: true,
      },
      {
        questionId: 'Q4_INT',
        questionText: expect.any(String),
        aiGenerated: false,
      },
    ]);
    expect(readBuilder.eq).toHaveBeenCalledWith('id', SESSION_ID);
    expect(readBuilder.eq).toHaveBeenCalledWith('user_id', 'user-a');
  });

  it('TC-04-03 persists fallback analysis when the AI provider does not respond', async () => {
    vi.mocked(analyzeReflectionSession).mockRejectedValueOnce(new Error('groq'));
    const readBuilder = createChain({
      singleResult: {
        data: {
          id: SESSION_ID,
          started_at: STARTED_AT,
          payload: {
            metadata: { version: '1.1', started_at: STARTED_AT },
            responses: [{ id: 'Q1_SIT', text: 'Situacion' }],
          },
        },
        error: null,
      },
    });
    const updateBuilder = createChain({
      singleResult: {
        data: {
          id: SESSION_ID,
          ai_analysis: fallbackAnalysis,
        },
        error: null,
      },
    });
    const supabaseMock = createSupabaseMock({
      user: { id: 'user-a' },
      builders: [readBuilder, updateBuilder],
    });
    mockServerSupabaseClient(supabaseMock);

    const response = await analyzeSessionPost(
      jsonRequest('/api/ai/analyze-session', {
        sessionId: SESSION_ID,
      }),
    );
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.message).toBe('Analisis generado correctamente');
    expect(updateBuilder.update).toHaveBeenCalledWith({
      ai_analysis: fallbackAnalysis,
    });
  });
});

