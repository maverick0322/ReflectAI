import { requestJson } from '@/core/api/http';

export interface ProfileData {
  id: string;
  first_name: string;
  last_name: string | null;
  full_name: string;
  birth_date: string | null;
  avatar_url: string | null;
  email: string | null;
}

export interface ProfileResponse {
  data: ProfileData;
  message: string;
}

export async function fetchProfile() {
  return requestJson<ProfileResponse>('/api/profile');
}

export async function updateProfile(payload: {
  firstName: string;
  lastName?: string;
  birthDate: string;
}) {
  return requestJson<ProfileResponse>('/api/profile', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export async function uploadProfileAvatar(file: File) {
  const formData = new FormData();
  formData.append('avatar', file);

  return requestJson<ProfileResponse>('/api/profile/avatar', {
    method: 'POST',
    body: formData,
  });
}
