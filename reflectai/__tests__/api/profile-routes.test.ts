import { beforeEach, describe, expect, it, vi } from 'vitest';

import { POST as avatarPost } from '@/app/api/profile/avatar/route';
import { GET as profileGet, PATCH as profilePatch } from '@/app/api/profile/route';
import { getAuthenticatedUser } from '@/lib/auth/getAuthenticatedUser';

vi.mock('@/lib/auth/getAuthenticatedUser', () => ({
  getAuthenticatedUser: vi.fn(),
}));

type MockFn = ReturnType<typeof vi.fn>;

type QueryBuilder = {
  select: MockFn;
  insert: MockFn;
  update: MockFn;
  eq: MockFn;
  single: MockFn;
  maybeSingle: MockFn;
};

type QueryResult<T> = {
  data: T;
  error: null | { message: string };
};

function createBuilder<T>({
  singleResult,
  maybeSingleResult,
}: {
  singleResult?: QueryResult<T>;
  maybeSingleResult?: QueryResult<T>;
} = {}): QueryBuilder {
  const builder = {
    select: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    update: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    single: vi.fn(async () => singleResult ?? { data: null, error: null }),
    maybeSingle: vi.fn(async () => maybeSingleResult ?? { data: null, error: null }),
  } as QueryBuilder;

  return builder;
}

async function readJson(response: Response) {
  return response.json() as Promise<{
    data?: Record<string, unknown>;
    error?: { message?: string };
    message?: string;
  }>;
}

function mockAuthenticatedUser({
  supabase,
  user = {
    id: 'user-1',
    email: 'ana@reflectai.com',
    user_metadata: {
      first_name: 'Ana',
      last_name: 'Lopez',
      birth_date: '2000-01-01',
    },
  },
  error = null,
}: {
  supabase?: Record<string, unknown>;
  user?: Record<string, unknown> | null;
  error?: unknown;
} = {}) {
  vi.mocked(getAuthenticatedUser).mockResolvedValue({
    supabase: supabase ?? { from: vi.fn() },
    user,
    error,
  } as never);
}

function jsonRequest(body: unknown) {
  return new Request('http://localhost/api/profile', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('rutas API de perfil', () => {
  it('devuelve el perfil existente del usuario autenticado', async () => {
    const profile = {
      id: 'user-1',
      first_name: 'Ana',
      last_name: 'Lopez',
      full_name: 'Ana Lopez',
      birth_date: '2000-01-01',
      avatar_url: null,
    };
    const profileBuilder = createBuilder({
      maybeSingleResult: { data: profile, error: null },
    });
    const from = vi.fn(() => profileBuilder);
    mockAuthenticatedUser({ supabase: { from } });

    const response = await profileGet();
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.data).toEqual({
      ...profile,
      email: 'ana@reflectai.com',
    });
    expect(profileBuilder.eq).toHaveBeenCalledWith('id', 'user-1');
  });

  it('crea un perfil faltante usando metadatos del usuario', async () => {
    const readBuilder = createBuilder({
      maybeSingleResult: { data: null, error: null },
    });
    const createdProfile = {
      id: 'user-1',
      first_name: 'Ana',
      last_name: 'Lopez',
      full_name: 'Ana Lopez',
      birth_date: '2000-01-01',
      avatar_url: null,
    };
    const createBuilderMock = createBuilder({
      singleResult: { data: createdProfile, error: null },
    });
    const from = vi.fn().mockReturnValueOnce(readBuilder).mockReturnValueOnce(createBuilderMock);
    mockAuthenticatedUser({ supabase: { from } });

    const response = await profileGet();
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.data).toMatchObject({
      first_name: 'Ana',
      last_name: 'Lopez',
      full_name: 'Ana Lopez',
      email: 'ana@reflectai.com',
    });
    expect(createBuilderMock.insert).toHaveBeenCalledWith({
      id: 'user-1',
      first_name: 'Ana',
      last_name: 'Lopez',
      full_name: 'Ana Lopez',
      birth_date: '2000-01-01',
    });
  });

  it('reporta no autorizado y errores de lectura de perfil', async () => {
    mockAuthenticatedUser({ user: null, error: { message: 'missing' } });

    const unauthorizedResponse = await profileGet();
    expect(unauthorizedResponse.status).toBe(401);
    expect((await readJson(unauthorizedResponse)).error?.message).toBe('No autorizado');

    const readBuilder = createBuilder({
      maybeSingleResult: { data: null, error: { message: 'db' } },
    });
    mockAuthenticatedUser({ supabase: { from: vi.fn(() => readBuilder) } });

    const errorResponse = await profileGet();
    expect(errorResponse.status).toBe(500);
    expect((await readJson(errorResponse)).error?.message).toBe(
      'No se pudo obtener el perfil',
    );
  });

  it('actualiza perfil y normaliza nombre completo', async () => {
    const updatedProfile = {
      id: 'user-1',
      first_name: 'Ana',
      last_name: 'Lopez',
      full_name: 'Ana Lopez',
      birth_date: '2000-01-01',
      avatar_url: 'https://cdn.test/avatar.png',
    };
    const updateBuilder = createBuilder({
      singleResult: { data: updatedProfile, error: null },
    });
    mockAuthenticatedUser({ supabase: { from: vi.fn(() => updateBuilder) } });

    const response = await profilePatch(
      jsonRequest({
        firstName: 'Ana',
        lastName: 'Lopez',
        birthDate: '2000-01-01',
      }),
    );
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.message).toBe('Perfil actualizado correctamente');
    expect(updateBuilder.update).toHaveBeenCalledWith({
      first_name: 'Ana',
      last_name: 'Lopez',
      full_name: 'Ana Lopez',
      birth_date: '2000-01-01',
    });
  });

  it('rechaza actualizacion de perfil invalida o con fallo de base de datos', async () => {
    mockAuthenticatedUser();

    const invalidResponse = await profilePatch(
      jsonRequest({
        firstName: '',
        lastName: 'Lopez',
        birthDate: 'fecha',
      }),
    );

    expect(invalidResponse.status).toBe(400);
    expect((await readJson(invalidResponse)).error?.message).toBe('Datos invalidos');

    const updateBuilder = createBuilder({
      singleResult: { data: null, error: { message: 'db' } },
    });
    mockAuthenticatedUser({ supabase: { from: vi.fn(() => updateBuilder) } });

    const dbResponse = await profilePatch(
      jsonRequest({
        firstName: 'Ana',
        lastName: 'Lopez',
        birthDate: '2000-01-01',
      }),
    );

    expect(dbResponse.status).toBe(500);
    expect((await readJson(dbResponse)).error?.message).toBe(
      'No se pudo actualizar el perfil',
    );
  });
});

describe('ruta API de avatar', () => {
  function createAvatarSupabase({
    uploadError = null,
    updateResult = {
      data: {
        id: 'user-1',
        first_name: 'Ana',
        last_name: 'Lopez',
        full_name: 'Ana Lopez',
        birth_date: '2000-01-01',
        avatar_url: 'https://cdn.test/avatar.png',
      },
      error: null,
    },
  }: {
    uploadError?: unknown;
    updateResult?: QueryResult<Record<string, unknown> | null>;
  } = {}) {
    const upload = vi.fn(async () => ({ error: uploadError }));
    const getPublicUrl = vi.fn(() => ({
      data: { publicUrl: 'https://cdn.test/avatar.png' },
    }));
    const bucket = { upload, getPublicUrl };
    const updateBuilder = createBuilder({ singleResult: updateResult });

    return {
      supabase: {
        storage: {
          from: vi.fn(() => bucket),
        },
        from: vi.fn(() => updateBuilder),
      },
      upload,
      getPublicUrl,
      updateBuilder,
    };
  }

  function avatarRequest(file?: File) {
    const formData = new FormData();
    if (file) {
      formData.set('avatar', file);
    }

    return {
      formData: vi.fn(async () => formData),
    } as unknown as Request;
  }

  it('sube avatar valido y guarda la URL publica en perfil', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(1700000000000);
    const { supabase, upload, updateBuilder } = createAvatarSupabase();
    mockAuthenticatedUser({ supabase });

    const response = await avatarPost(
      avatarRequest(new File(['avatar'], 'avatar.png', { type: 'image/png' })),
    );
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.data?.avatar_url).toBe('https://cdn.test/avatar.png');
    expect(upload).toHaveBeenCalledWith(
      'user-1/avatar-1700000000000.png',
      expect.any(File),
      {
        cacheControl: '3600',
        contentType: 'image/png',
        upsert: true,
      },
    );
    expect(updateBuilder.update).toHaveBeenCalledWith({
      avatar_url: 'https://cdn.test/avatar.png',
    });
  });

  it('valida presencia, formato y peso del avatar', async () => {
    mockAuthenticatedUser();

    const missingResponse = await avatarPost(avatarRequest());
    expect(missingResponse.status).toBe(400);
    expect((await readJson(missingResponse)).error?.message).toBe(
      'La foto de perfil es obligatoria',
    );

    const invalidTypeResponse = await avatarPost(
      avatarRequest(new File(['avatar'], 'avatar.gif', { type: 'image/gif' })),
    );
    expect(invalidTypeResponse.status).toBe(400);
    expect((await readJson(invalidTypeResponse)).error?.message).toBe(
      'Solo se permiten formatos JPG, PNG o WEBP',
    );

    const oversizedResponse = await avatarPost(
      avatarRequest(
        new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'avatar.png', {
          type: 'image/png',
        }),
      ),
    );
    expect(oversizedResponse.status).toBe(400);
    expect((await readJson(oversizedResponse)).error?.message).toBe(
      'La imagen debe pesar menos de 2MB',
    );
  });

  it('reporta errores al subir o persistir avatar', async () => {
    const uploadFailure = createAvatarSupabase({ uploadError: { message: 'bucket' } });
    mockAuthenticatedUser({ supabase: uploadFailure.supabase });

    const uploadResponse = await avatarPost(
      avatarRequest(new File(['avatar'], 'avatar.webp', { type: 'image/webp' })),
    );

    expect(uploadResponse.status).toBe(500);
    expect((await readJson(uploadResponse)).error?.message).toContain(
      'No se pudo subir la foto',
    );

    const updateFailure = createAvatarSupabase({
      updateResult: { data: null, error: { message: 'db' } },
    });
    mockAuthenticatedUser({ supabase: updateFailure.supabase });

    const updateResponse = await avatarPost(
      avatarRequest(new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' })),
    );

    expect(updateResponse.status).toBe(500);
    expect((await readJson(updateResponse)).error?.message).toBe(
      'No se pudo actualizar la foto de perfil',
    );
  });
});
