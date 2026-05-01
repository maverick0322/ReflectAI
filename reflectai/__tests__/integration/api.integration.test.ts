import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@supabase/supabase-js";

import { POST as registerPost } from "@/app/api/auth/register/route";
import { GET as getReflectionSession, POST as createReflectionSession } from "@/app/api/reflection-sessions/route";
import { GET as getReflectionSessionById } from "@/app/api/reflection-sessions/[id]/route";
import { POST as addReflectionResponse } from "@/app/api/reflection-sessions/[id]/responses/route";
import { PATCH as completeReflectionSession } from "@/app/api/reflection-sessions/[id]/complete/route";
import { createServerSupabaseClient } from "@/lib/supabase/server";

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(),
}));

type QueryResult<T> = {
  data: T;
  error: null | { message: string };
};

type ChainResult = {
  singleResult?: QueryResult<any>;
  orderResult?: QueryResult<any>;
};

type MockFn = ReturnType<typeof vi.fn>;

interface ChainMock {
  select: MockFn;
  insert: MockFn;
  update: MockFn;
  eq: MockFn;
  order: MockFn;
  single: MockFn;
}

function createChain(result: ChainResult = {}): ChainMock {
  const chain = {
    select: vi.fn(() => chain),
    insert: vi.fn(() => chain),
    update: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    order: vi.fn(async () => result.orderResult ?? { data: null, error: null }),
    single: vi.fn(async () => result.singleResult ?? { data: null, error: null }),
  } as unknown as ChainMock;

  return chain;
}

function createSupabaseMock(options: {
  user: { id: string; email?: string } | null;
  error?: unknown;
  builders?: ChainMock[];
}) {
  const from = vi.fn();

  for (const builder of options.builders ?? []) {
    from.mockReturnValueOnce(builder as never);
  }

  return {
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: options.user },
        error: options.error ?? null,
      })),
    },
    from,
  };
}

function mockServerSupabaseClient(supabaseMock: ReturnType<typeof createSupabaseMock>) {
  vi.mocked(createServerSupabaseClient).mockResolvedValue(supabaseMock as never);
}

function mockRegisterClient(supabaseMock: { auth: { signUp: ReturnType<typeof vi.fn> } }) {
  vi.mocked(createClient).mockReturnValue(supabaseMock as never);
}

async function readJson(response: Response) {
  return response.json() as Promise<any>;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Integracion API critica", () => {
  it("TC-01-01 registra usuario y propaga datos de perfil a Supabase Auth", async () => {
    const signUp = vi.fn(async () => ({
      data: { user: { id: "user-1", email: "ana@reflectai.com" } },
      error: null,
    }));

    mockRegisterClient({ auth: { signUp } });

    const response = await registerPost(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          firstName: "Ana",
          lastName: "Lopez",
          email: "ana@reflectai.com",
          password: "PasswordFuerte123",
          birthDate: "2000-01-01",
        }),
      }),
    );

    const body = await readJson(response);

    expect(response.status).toBe(201);
    expect(body.message).toBe("Usuario registrado correctamente");
    expect(body.data).toEqual({
      id: "user-1",
      email: "ana@reflectai.com",
      fullName: "Ana Lopez",
    });
    expect(signUp).toHaveBeenCalledWith({
      email: "ana@reflectai.com",
      password: "PasswordFuerte123",
      options: {
        data: {
          first_name: "Ana",
          last_name: "Lopez",
          full_name: "Ana Lopez",
          birth_date: "2000-01-01",
        },
      },
    });
  });

  it("TC-01-03 rechaza un registro con datos invalidos", async () => {
    mockRegisterClient({ auth: { signUp: vi.fn() } });

    const response = await registerPost(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          firstName: "Ana",
          email: "correo-invalido",
          password: "123",
        }),
      }),
    );

    const body = await readJson(response);

    expect(response.status).toBe(400);
    expect(body.error.message).toBe("Datos de registro invalidos");
  });

  it("TC-02-01 crea una sesion draft y devuelve el payload minimo valido", async () => {
    const insertBuilder = createChain({
      singleResult: {
        data: {
          id: "session-1",
          title: null,
          status: "draft",
          started_at: "2026-04-30T10:00:00.000Z",
          completed_at: null,
          payload: [],
          ai_analysis: {},
        },
        error: null,
      },
    });

    const supabaseMock = createSupabaseMock({
      user: { id: "user-a", email: "user-a@reflectai.com" },
      builders: [insertBuilder],
    });

    mockServerSupabaseClient(supabaseMock);

    const response = await createReflectionSession(
      new Request("http://localhost/api/reflection-sessions", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    );

    const body = await readJson(response);

    expect(response.status).toBe(201);
    expect(body.message).toBe("Sesion creada correctamente");
    expect(body.data).toMatchObject({
      id: "session-1",
      status: "draft",
      payload: [],
      ai_analysis: {},
    });
    expect(supabaseMock.from).toHaveBeenCalledWith("reflection_sessions");
    expect(insertBuilder.insert).toHaveBeenCalledWith({
      user_id: "user-a",
      title: null,
      status: "draft",
      payload: [],
      ai_analysis: {},
    });
  });

  it("TC-02-05 bloquea la creacion cuando no hay usuario autenticado", async () => {
    const supabaseMock = createSupabaseMock({ user: null });
    mockServerSupabaseClient(supabaseMock);

    const response = await createReflectionSession(
      new Request("http://localhost/api/reflection-sessions", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    );

    const body = await readJson(response);

    expect(response.status).toBe(401);
    expect(body.error.message).toBe("No autorizado");
    expect(supabaseMock.from).not.toHaveBeenCalled();
  });

  it("TC-03-01 devuelve solo sesiones propias en orden cronologico descendente", async () => {
    const listBuilder = createChain({
      orderResult: {
        data: [
          {
            id: "session-2",
            title: "Sesion reciente",
            status: "completed",
            started_at: "2026-04-30T09:00:00.000Z",
            completed_at: "2026-04-30T09:20:00.000Z",
            ai_analysis: {},
          },
          {
            id: "session-1",
            title: "Sesion anterior",
            status: "draft",
            started_at: "2026-04-29T09:00:00.000Z",
            completed_at: null,
            ai_analysis: {},
          },
        ],
        error: null,
      },
    });

    const supabaseMock = createSupabaseMock({
      user: { id: "user-a" },
      builders: [listBuilder],
    });

    mockServerSupabaseClient(supabaseMock);

    const response = await getReflectionSession();
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(2);
    expect(body.data[0].id).toBe("session-2");
    expect(listBuilder.eq).toHaveBeenCalledWith("user_id", "user-a");
    expect(listBuilder.order).toHaveBeenCalledWith("started_at", { ascending: false });
  });

  it("TC-03-04 oculta una sesion ajena con respuesta 404", async () => {
    const detailBuilder = createChain({
      singleResult: {
        data: null,
        error: { message: "No row" },
      },
    });

    const supabaseMock = createSupabaseMock({
      user: { id: "user-b" },
      builders: [detailBuilder],
    });

    mockServerSupabaseClient(supabaseMock);

    const response = await getReflectionSessionById(
      new Request("http://localhost/api/reflection-sessions/session-1"),
      { params: Promise.resolve({ id: "session-1" }) },
    );

    const body = await readJson(response);

    expect(response.status).toBe(404);
    expect(body.error.message).toBe("Sesion no encontrada");
    expect(detailBuilder.eq).toHaveBeenCalledWith("id", "session-1");
    expect(detailBuilder.eq).toHaveBeenCalledWith("user_id", "user-b");
  });

  it("TC-02-03 guarda una respuesta y extiende el payload existente", async () => {
    const readBuilder = createChain({
      singleResult: {
        data: {
          id: "session-1",
          status: "draft",
          payload: [
            {
              step_order: 1,
              question: "Que ocurrio?",
              user_response: "Tuve una discusion.",
              detected_emotion: "frustracion",
              intensity: 8,
              created_at: "2026-04-30T10:00:00.000Z",
            },
          ],
        },
        error: null,
      },
    });

    const updateBuilder = createChain({
      singleResult: {
        data: {
          id: "session-1",
          title: null,
          status: "draft",
          started_at: "2026-04-30T10:00:00.000Z",
          completed_at: null,
          payload: [
            {
              step_order: 1,
              question: "Que ocurrio?",
              user_response: "Tuve una discusion.",
              detected_emotion: "frustracion",
              intensity: 8,
              created_at: "2026-04-30T10:00:00.000Z",
            },
            {
              step_order: 2,
              question: "Que pensaste?",
              user_response: "No quise responder.",
              detected_emotion: "frustracion",
              intensity: 5,
              created_at: "2026-04-30T10:05:00.000Z",
            },
          ],
          ai_analysis: {},
        },
        error: null,
      },
    });

    const supabaseMock = createSupabaseMock({
      user: { id: "user-a" },
      builders: [readBuilder, updateBuilder],
    });

    mockServerSupabaseClient(supabaseMock);

    const response = await addReflectionResponse(
      new Request("http://localhost/api/reflection-sessions/session-1/responses", {
        method: "POST",
        body: JSON.stringify({
          question: "Que pensaste?",
          userResponse: "No quise responder.",
          detectedEmotion: "frustracion",
          intensity: 5,
        }),
      }),
      { params: Promise.resolve({ id: "session-1" }) },
    );

    const body = await readJson(response);

    expect(response.status).toBe(201);
    expect(body.data.payload).toHaveLength(2);
    expect(body.data.payload[1]).toMatchObject({
      step_order: 2,
      question: "Que pensaste?",
      user_response: "No quise responder.",
      detected_emotion: "frustracion",
      intensity: 5,
    });
    expect(updateBuilder.update).toHaveBeenCalledWith({
      payload: expect.any(Array),
    });
  });

  it("TC-02-04 impide completar una sesion sin respuestas previas", async () => {
    const readBuilder = createChain({
      singleResult: {
        data: {
          id: "session-1",
          status: "draft",
          payload: [],
        },
        error: null,
      },
    });

    const supabaseMock = createSupabaseMock({
      user: { id: "user-a" },
      builders: [readBuilder],
    });

    mockServerSupabaseClient(supabaseMock);

    const response = await completeReflectionSession(
      new Request("http://localhost/api/reflection-sessions/session-1/complete", {
        method: "PATCH",
        body: JSON.stringify({ title: "Sesion completada" }),
      }),
      { params: Promise.resolve({ id: "session-1" }) },
    );

    const body = await readJson(response);

    expect(response.status).toBe(409);
    expect(body.error.message).toBe("No se puede completar una sesion sin respuestas");
  });

  it("TC-02-04 completa una sesion y marca completed_at", async () => {
    const readBuilder = createChain({
      singleResult: {
        data: {
          id: "session-1",
          status: "draft",
          payload: [
            {
              step_order: 1,
              question: "Que ocurrio?",
              user_response: "Tuve una discusion.",
              detected_emotion: "frustracion",
              intensity: 8,
              created_at: "2026-04-30T10:00:00.000Z",
            },
          ],
        },
        error: null,
      },
    });

    const updateBuilder = createChain({
      singleResult: {
        data: {
          id: "session-1",
          title: "Sesion completada",
          status: "completed",
          started_at: "2026-04-30T10:00:00.000Z",
          completed_at: "2026-04-30T10:10:00.000Z",
          payload: [
            {
              step_order: 1,
              question: "Que ocurrio?",
              user_response: "Tuve una discusion.",
              detected_emotion: "frustracion",
              intensity: 8,
              created_at: "2026-04-30T10:00:00.000Z",
            },
          ],
          ai_analysis: {},
        },
        error: null,
      },
    });

    const supabaseMock = createSupabaseMock({
      user: { id: "user-a" },
      builders: [readBuilder, updateBuilder],
    });

    mockServerSupabaseClient(supabaseMock);

    const response = await completeReflectionSession(
      new Request("http://localhost/api/reflection-sessions/session-1/complete", {
        method: "PATCH",
        body: JSON.stringify({ title: "Sesion completada" }),
      }),
      { params: Promise.resolve({ id: "session-1" }) },
    );

    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.message).toBe("Sesion completada correctamente");
    expect(body.data.status).toBe("completed");
    expect(body.data.completed_at).toBe("2026-04-30T10:10:00.000Z");
    expect(updateBuilder.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "completed",
        title: "Sesion completada",
      }),
    );
  });
});