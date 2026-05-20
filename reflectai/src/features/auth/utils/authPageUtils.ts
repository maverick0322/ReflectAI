import { ApiError } from '@/core/api/http';

export function getAuthFormErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof ApiError && error.payload?.message) {
    return error.payload.message;
  }

  return fallbackMessage;
}

export function isRecoveryMode(
  mode: string | null,
  recoveryCode: string | null,
) {
  return mode === 'recovery' || Boolean(recoveryCode);
}
