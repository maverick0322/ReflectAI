import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/client';
import { createServerSupabaseClient } from '@/lib/supabase/server';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ admin: true })),
}));

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({ browser: true })),
  createServerClient: vi.fn(() => ({ server: true })),
}));

const cookieStore = {
  getAll: vi.fn(() => [{ name: 'sb', value: 'token' }]),
  set: vi.fn((name: string, value: string, options: { path: string }) => ({
    name,
    value,
    options,
  })),
};

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => cookieStore),
}));

const OLD_ENV = process.env;

describe('supabase clients', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...OLD_ENV,
      NEXT_PUBLIC_SUPABASE_URL: 'https://project.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
    };
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('crea cliente admin con sesiÓn no persistente', () => {
    expect(createAdminSupabaseClient()).toEqual({ admin: true });
    expect(createSupabaseClient).toHaveBeenCalledWith(
      'https://project.supabase.co',
      'service-role-key',
      { auth: { persistSession: false } },
    );
  });

  it('rechaza cliente admin sin variables requeridas', () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(() => createAdminSupabaseClient()).toThrow(
      'Missing Supabase admin environment variables',
    );
  });

  it('crea cliente browser con variables publicas', () => {
    expect(createClient()).toEqual({ browser: true });
    expect(createBrowserClient).toHaveBeenCalledWith(
      'https://project.supabase.co',
      'anon-key',
    );
  });

  it('crea cliente server y conecta los adaptadores de cookies', async () => {
    expect(await createServerSupabaseClient()).toEqual({ server: true });
    expect(cookies).toHaveBeenCalled();

    const options = vi.mocked(createServerClient).mock.calls[0]?.[2];
    expect(options).toBeDefined();
    if (!options) {
      throw new Error('Expected Supabase server client options to be defined');
    }

    const cookieAdapter = options.cookies as {
      getAll: () => Array<{ name: string; value: string }>;
      setAll?: (
        cookiesToSet: Array<{
          name: string;
          value: string;
          options: { path: string };
        }>
      ) => void;
    };

    expect(cookieAdapter.getAll()).toEqual([{ name: 'sb', value: 'token' }]);
    expect(cookieAdapter.setAll).toBeDefined();
    if (!cookieAdapter.setAll) {
      throw new Error('Expected cookie adapter setAll to be defined');
    }

    cookieAdapter.setAll([
      {
        name: 'sb',
        value: 'next-token',
        options: { path: '/' },
      },
    ]);

    expect(cookieStore.set).toHaveBeenCalledWith('sb', 'next-token', { path: '/' });
  });
});
