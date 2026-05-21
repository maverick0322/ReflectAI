import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import {
  changePassword,
  confirmRecovery,
  deleteAccount,
  loginUser,
  logoutUser,
  recoverPassword,
  registerUser,
} from '@/features/auth/services/authService';
import { fetchDailyQuote } from '@/features/dashboard/services/aiService';
import { fetchProfile, updateProfile, uploadProfileAvatar } from '@/features/profile/services/profileService';
import {
  addReflectionResponse,
  completeReflectionSession,
  createReflectionSession,
  getReflectionSession,
  listReflectionSessions,
  requestNextQuestion,
} from '@/features/reflection/services/reflectionService';

const createFetchMock = () =>
  vi.fn(async () => ({
    ok: true,
    json: async () => ({ data: {}, message: 'ok' }),
  }));

describe('api clients', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', createFetchMock());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls login endpoint', async () => {
    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;

    await loginUser('test@reflectai.com', 'Password123');

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'test@reflectai.com', password: 'Password123' }),
      }),
    );
  });

  it('calls register endpoint', async () => {
    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;

    await registerUser({
      firstName: 'Ana',
      lastName: 'Lopez',
      email: 'ana@reflectai.com',
      password: 'Password123',
      birthDate: '2000-01-01',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/register',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('calls password recovery endpoints', async () => {
    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;

    await recoverPassword('test@reflectai.com');
    await confirmRecovery('code-123');

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/recover',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/confirm-recovery',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('calls change password endpoint', async () => {
    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;

    await changePassword({
      currentPassword: 'Password123',
      newPassword: 'PasswordNueva123',
      confirmNewPassword: 'PasswordNueva123',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/change-password',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('calls delete account endpoint', async () => {
    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;

    await deleteAccount('Password123');

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/delete-account',
      expect.objectContaining({
        method: 'DELETE',
        body: JSON.stringify({ currentPassword: 'Password123' }),
      }),
    );
  });

  it('calls logout endpoint', async () => {
    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;

    await logoutUser();

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/logout',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('calls profile endpoints', async () => {
    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;

    await fetchProfile();
    await updateProfile({ firstName: 'Ana', lastName: 'Lopez', birthDate: '2000-01-01' });
    await uploadProfileAvatar(new File(['avatar'], 'avatar.png', { type: 'image/png' }));

    expect(fetchMock).toHaveBeenCalledWith('/api/profile', undefined);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/profile',
      expect.objectContaining({ method: 'PATCH' }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/profile/avatar',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('calls reflection session endpoints', async () => {
    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;

    await createReflectionSession('SesiÓn');
    await listReflectionSessions();
    await getReflectionSession('session-1');
    await addReflectionResponse('session-1', { id: 'Q1_SIT', text: 'Texto' });
    await requestNextQuestion('session-1', ['Q2_THO']);
    await completeReflectionSession('session-1', {});

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/reflection-sessions',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(fetchMock).toHaveBeenCalledWith('/api/reflection-sessions', undefined);
    expect(fetchMock).toHaveBeenCalledWith('/api/reflection-sessions/session-1', undefined);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/reflection-sessions/session-1/responses',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/ai/next-question',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/reflection-sessions/session-1/complete',
      expect.objectContaining({ method: 'PATCH' }),
    );
  });

  it('calls daily quote endpoint', async () => {
    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;

    await fetchDailyQuote();

    expect(fetchMock).toHaveBeenCalledWith('/api/ai/daily-quote', undefined);
  });
});
