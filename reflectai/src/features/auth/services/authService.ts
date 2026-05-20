import { requestJson } from '@/core/api/http';

export interface LoginResponse {
  data: {
    id: string;
    email: string | null;
    userMetadata: Record<string, unknown>;
  };
  message: string;
}

export interface SimpleMessageResponse {
  message: string;
}

export async function loginUser(email: string, password: string) {
  return requestJson<LoginResponse>('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
}

export async function registerUser(payload: {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  birthDate: string;
}) {
  return requestJson('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export async function recoverPassword(email: string) {
  return requestJson<SimpleMessageResponse>('/api/auth/recover', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
}

export async function confirmRecovery(code: string) {
  return requestJson<SimpleMessageResponse>('/api/auth/confirm-recovery', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });
}

export async function changePassword(payload: {
  currentPassword?: string;
  newPassword: string;
  confirmNewPassword: string;
}) {
  return requestJson<SimpleMessageResponse>('/api/auth/change-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export async function deleteAccount(currentPassword: string) {
  return requestJson<SimpleMessageResponse>('/api/auth/delete-account', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ currentPassword }),
  });
}

export async function logoutUser() {
  return requestJson<SimpleMessageResponse>('/api/auth/logout', {
    method: 'POST',
  });
}
