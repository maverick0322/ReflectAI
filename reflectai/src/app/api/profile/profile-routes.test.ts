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

function patchRequest(body: unknown) {
  return new Request('http://localhost/api/profile', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'http://localhost',
    },
    body: JSON.stringify(body),
  });
}

function imageFile(type: 'image/jpeg' | 'image/png' | 'image/webp', name: string) {
  const bytesByType = {
    'image/jpeg': [0xff, 0xd8, 0xff, 0xe0],
    'image/png': [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
    'image/webp': [0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50],
  };

  return new File([new Uint8Array(bytesByType[type])], name, { type });
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
    mockAuthenticatedUser({ supabase: { from, storage: { from: vi.fn() } } });

    const response = await profileGet();
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.data).toEqual({
      ...profile,
      email: 'ana@reflectai.com',
    });
  });

  it('actualiza perfil solo con origen confiable', async () => {
    const updatedProfile = {
      id: 'user-1',
      first_name: 'Ana',
      last_name: 'Lopez',
      full_name: 'Ana Lopez',
      birth_date: '2000-01-01',
      avatar_url: 'avatars/user-1.png',
    };
    const updateBuilder = createBuilder({
      singleResult: { data: updatedProfile, error: null },
    });
    const storageBucket = {
      createSignedUrl: vi.fn(async () => ({
        data: { signedUrl: 'https://cdn.test/avatar.png?token=abc' },
        error: null,
      })),
    };
    mockAuthenticatedUser({
      supabase: {
        from: vi.fn(() => updateBuilder),
        storage: { from: vi.fn(() => storageBucket) },
      },
    });

    const response = await profilePatch(
      patchRequest({
        firstName: 'Ana',
        lastName: 'Lopez',
        birthDate: '2000-01-01',
      }),
    );

    expect(response.status).toBe(200);
    expect((await readJson(response)).data?.avatar_url).toBe(
      'https://cdn.test/avatar.png?token=abc',
    );

    const untrustedResponse = await profilePatch(
      new Request('http://localhost/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'https://evil.test',
        },
        body: JSON.stringify({
          firstName: 'Ana',
          lastName: 'Lopez',
          birthDate: '2000-01-01',
        }),
      }),
    );

    expect(untrustedResponse.status).toBe(403);
  });

  it('crea perfil si no existe y maneja errores al leer o crear', async () => {
    const readBuilder = createBuilder({
      maybeSingleResult: { data: null, error: null },
    });
    const createBuilderMock = createBuilder({
      singleResult: { data: null, error: { message: 'db' } },
    });
    const from = vi
      .fn()
      .mockReturnValueOnce(readBuilder)
      .mockReturnValueOnce(createBuilderMock);
    mockAuthenticatedUser({ supabase: { from } });

    const response = await profileGet();
    expect(response.status).toBe(500);
    expect((await readJson(response)).error?.message).toBe(
      'No se pudo crear el perfil',
    );

    const errorBuilder = createBuilder({
      maybeSingleResult: { data: null, error: { message: 'db' } },
    });
    mockAuthenticatedUser({ supabase: { from: vi.fn(() => errorBuilder) } });

    const errorResponse = await profileGet();
    expect(errorResponse.status).toBe(500);
    expect((await readJson(errorResponse)).error?.message).toBe(
      'No se pudo obtener el perfil',
    );
  });

  it('rechaza payload invalido y errores al actualizar perfil', async () => {
    mockAuthenticatedUser();

    const invalidResponse = await profilePatch(
      patchRequest({ firstName: '' }),
    );
    expect(invalidResponse.status).toBe(400);

    const updateBuilder = createBuilder({
      singleResult: { data: null, error: { message: 'db' } },
    });
    mockAuthenticatedUser({ supabase: { from: vi.fn(() => updateBuilder) } });

    const updateResponse = await profilePatch(
      patchRequest({
        firstName: 'Ana',
        lastName: 'Lopez',
        birthDate: '2000-01-01',
      }),
    );

    expect(updateResponse.status).toBe(500);
    expect((await readJson(updateResponse)).error?.message).toBe(
      'No se pudo actualizar el perfil',
    );
  });
});

describe('ruta API de avatar', () => {
  function createAvatarSupabase() {
    const upload = vi.fn(async () => ({ error: null }));
    const createSignedUrl = vi.fn(async () => ({
      data: { signedUrl: 'https://cdn.test/avatar.png?token=abc' },
      error: null,
    }));
    const bucket = { upload, createSignedUrl };
    const updateBuilder = createBuilder({
      singleResult: {
        data: {
          id: 'user-1',
          first_name: 'Ana',
          last_name: 'Lopez',
          full_name: 'Ana Lopez',
          birth_date: '2000-01-01',
          avatar_url: 'user-1/avatar-1700000000000.png',
        },
        error: null,
      },
    });

    return {
      supabase: {
        storage: {
          from: vi.fn(() => bucket),
        },
        from: vi.fn(() => updateBuilder),
      },
      upload,
      createSignedUrl,
      updateBuilder,
    };
  }

  function avatarRequest(file?: File, origin = 'http://localhost') {
    const formData = new FormData();
    if (file) {
      formData.set('avatar', file);
    }

    return {
      headers: new Headers({ Origin: origin }),
      url: 'http://localhost/api/profile/avatar',
      formData: vi.fn(async () => formData),
    } as unknown as Request;
  }

  it('sube avatar valido y guarda la referencia privada en perfil', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(1700000000000);
    const { supabase, upload, updateBuilder } = createAvatarSupabase();
    mockAuthenticatedUser({ supabase });

    const response = await avatarPost(avatarRequest(imageFile('image/png', 'avatar.png')));
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body.data?.avatar_url).toBe('https://cdn.test/avatar.png?token=abc');
    expect(upload).toHaveBeenCalled();
    expect(updateBuilder.update).toHaveBeenCalledWith({
      avatar_url: 'user-1/avatar-1700000000000.png',
    });
  });

  it('acepta firmas JPEG y WEBP validas', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(1700000000000);

    const jpegEnv = createAvatarSupabase();
    mockAuthenticatedUser({ supabase: jpegEnv.supabase });
    const jpegResponse = await avatarPost(
      avatarRequest(imageFile('image/jpeg', 'avatar.jpg')),
    );
    expect(jpegResponse.status).toBe(200);

    const webpEnv = createAvatarSupabase();
    mockAuthenticatedUser({ supabase: webpEnv.supabase });
    const webpResponse = await avatarPost(
      avatarRequest(imageFile('image/webp', 'avatar.webp')),
    );
    expect(webpResponse.status).toBe(200);
  });

  it('rechaza origen no confiable para upload de avatar', async () => {
    mockAuthenticatedUser();
    const response = await avatarPost(
      avatarRequest(imageFile('image/png', 'avatar.png'), 'https://evil.test'),
    );

    expect(response.status).toBe(403);
  });

  it('rechaza upload de avatar sin sesion autenticada', async () => {
    mockAuthenticatedUser({ user: null, error: { message: 'missing' } });

    const response = await avatarPost(
      avatarRequest(imageFile('image/png', 'avatar.png')),
    );

    expect(response.status).toBe(401);
    expect((await readJson(response)).error?.message).toBe('No autorizado');
  });

  it('rechaza avatar faltante o con tipo invalido', async () => {
    mockAuthenticatedUser();

    const missingResponse = await avatarPost(avatarRequest());
    expect(missingResponse.status).toBe(400);
    expect((await readJson(missingResponse)).error?.message).toBe(
      'La foto de perfil es obligatoria',
    );

    const invalidTypeResponse = await avatarPost(
      avatarRequest(new File([new Uint8Array([0x01])], 'avatar.gif', { type: 'image/gif' })),
    );
    expect(invalidTypeResponse.status).toBe(400);
    expect((await readJson(invalidTypeResponse)).error?.message).toBe(
      'Solo se permiten formatos JPG, PNG o WEBP',
    );
  });

  it('rechaza avatar con tamano excesivo o firma invalida', async () => {
    mockAuthenticatedUser();

    const largeFile = new File([
      new Uint8Array(2 * 1024 * 1024 + 1),
    ], 'big.png', { type: 'image/png' });
    const tooLargeResponse = await avatarPost(avatarRequest(largeFile));
    expect(tooLargeResponse.status).toBe(400);
    expect((await readJson(tooLargeResponse)).error?.message).toBe(
      'La imagen debe pesar menos de 2MB',
    );

    const badSignature = new File([
      new Uint8Array([0x00, 0x01, 0x02]),
    ], 'bad.png', { type: 'image/png' });
    const badSignatureResponse = await avatarPost(avatarRequest(badSignature));
    expect(badSignatureResponse.status).toBe(400);
    expect((await readJson(badSignatureResponse)).error?.message).toBe(
      'El contenido de la imagen no coincide con el formato permitido',
    );
  });

  it('maneja errores al subir o actualizar avatar', async () => {
    const upload = vi.fn(async () => ({ error: { message: 'storage' } }));
    const bucket = { upload, createSignedUrl: vi.fn() };
    mockAuthenticatedUser({
      supabase: {
        storage: { from: vi.fn(() => bucket) },
        from: vi.fn(),
      },
    });

    const uploadResponse = await avatarPost(
      avatarRequest(imageFile('image/png', 'avatar.png')),
    );
    expect(uploadResponse.status).toBe(500);
    expect((await readJson(uploadResponse)).error?.message).toBe(
      [
        'No se pudo subir la foto.',
        'Verifica que exista el bucket profile-avatars en Supabase Storage.',
      ].join(' '),
    );

    const updateBuilder = createBuilder({
      singleResult: { data: null, error: { message: 'db' } },
    });
    const okBucket = {
      upload: vi.fn(async () => ({ error: null })),
      createSignedUrl: vi.fn(async () => ({
        data: { signedUrl: 'https://cdn.test/avatar.png?token=abc' },
        error: null,
      })),
    };
    mockAuthenticatedUser({
      supabase: {
        storage: { from: vi.fn(() => okBucket) },
        from: vi.fn(() => updateBuilder),
      },
    });

    const updateResponse = await avatarPost(
      avatarRequest(imageFile('image/png', 'avatar.png')),
    );
    expect(updateResponse.status).toBe(500);
    expect((await readJson(updateResponse)).error?.message).toBe(
      'No se pudo actualizar la foto de perfil',
    );
  });
});
