import type {
  QuestionId,
  ReflectionSessionPayload,
  SessionResponse,
} from '@/features/reflection/types/reflection';
import type { MetadataPatch } from '@/lib/reflection/payload';

import { requestJson } from '@/core/api/http';

export interface ReflectionSessionListItem {
  id: string;
  title: string | null;
  status: string;
  started_at: string;
  completed_at: string | null;
  payload?: ReflectionSessionPayload;
  ai_analysis: Record<string, unknown>;
}

export interface ReflectionSessionResponse {
  data: {
    id: string;
    title: string | null;
    status: string;
    started_at: string;
    completed_at: string | null;
    payload: ReflectionSessionPayload;
    ai_analysis: Record<string, unknown>;
  };
  message: string;
}

export async function createReflectionSession(title?: string) {
  return requestJson<ReflectionSessionResponse>('/api/reflection-sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });
}

export async function listReflectionSessions() {
  return requestJson<{ data: ReflectionSessionListItem[]; message: string }>(
    '/api/reflection-sessions',
  );
}

export async function getReflectionSession(sessionId: string) {
  return requestJson<ReflectionSessionResponse>(
    `/api/reflection-sessions/${sessionId}`,
  );
}

export async function addReflectionResponse(
  sessionId: string,
  response: SessionResponse,
  metadataPatch?: MetadataPatch,
) {
  return requestJson<ReflectionSessionResponse>(
    `/api/reflection-sessions/${sessionId}/responses`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ response, metadataPatch }),
    },
  );
}

export async function requestNextQuestion(
  sessionId: string,
  questionIds?: QuestionId[],
) {
  return requestJson<{
    data: {
      done: boolean;
      questionId?: QuestionId;
      questionText?: string;
      aiGenerated?: boolean;
      questions?: Array<{
        questionId: QuestionId;
        questionText: string;
        aiGenerated: boolean;
      }>;
    };
    message?: string;
  }>('/api/ai/next-question', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionId, questionIds }),
  });
}

export async function completeReflectionSession(
  sessionId: string,
  payload?: { title?: string; metadataPatch?: MetadataPatch },
) {
  return requestJson<ReflectionSessionResponse>(
    `/api/reflection-sessions/${sessionId}/complete`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload ?? {}),
    },
  );
}
