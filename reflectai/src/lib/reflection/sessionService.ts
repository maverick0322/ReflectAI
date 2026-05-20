import type { getAuthenticatedUser } from '@/lib/auth/getAuthenticatedUser';
import type {
  ReflectionSessionPayload,
  SessionResponse,
} from '@/features/reflection/types/reflection';
import type { ReflectionAnalysisResult } from '@/lib/ai/reflectionAnalysis';
import type { MetadataPatch } from '@/lib/reflection/payload';

import { throwRouteError } from '@/lib/api/route';
import {
  analyzeReflectionSession,
  buildFallbackAnalysis,
} from '@/lib/ai/reflectionAnalysis';
import { apiMessages } from '@/lib/copy/api';
import {
  appendResponse,
  applyMetadataPatch,
  buildInitialPayload,
  normalizePayload,
} from '@/lib/reflection/payload';

type AuthenticatedContext = Awaited<ReturnType<typeof getAuthenticatedUser>>;
type AuthenticatedSupabaseClient = AuthenticatedContext['supabase'];
type AuthenticatedUser = NonNullable<AuthenticatedContext['user']>;

const REFLECTION_SESSION_SELECT =
  'id, title, status, started_at, completed_at, payload, ai_analysis';
const REFLECTION_SESSION_CONTEXT_SELECT = 'id, status, payload, started_at';

type ReflectionSessionRecord = {
  id: string;
  title: string | null;
  status: 'draft' | 'completed';
  started_at: string | null;
  completed_at: string | null;
  payload: ReflectionSessionPayload;
  ai_analysis: Record<string, unknown>;
};

type ReflectionSessionContext = {
  id: string;
  status: 'draft' | 'completed';
  payload: unknown;
  started_at: string | null;
};

type CompleteReflectionSessionInput = {
  sessionId: string;
  title?: string;
  metadataPatch?: MetadataPatch;
};

async function loadOwnedSessionContext(
  supabase: AuthenticatedSupabaseClient,
  user: AuthenticatedUser,
  sessionId: string,
  notFoundMessage: string,
) {
  const { data, error } = await supabase
    .from('reflection_sessions')
    .select(REFLECTION_SESSION_CONTEXT_SELECT)
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single();

  if (error || !data) {
    throwRouteError(404, notFoundMessage);
  }

  return data as ReflectionSessionContext;
}

function normalizeSessionPayload(session: ReflectionSessionContext) {
  return normalizePayload(
    session.payload,
    session.started_at ?? new Date().toISOString(),
  );
}

async function resolveCompletionAnalysis(payload: ReflectionSessionPayload) {
  try {
    return (await analyzeReflectionSession(payload)) ?? buildFallbackAnalysis(payload);
  } catch (error: unknown) {
    void error;
    return buildFallbackAnalysis(payload);
  }
}

export async function createReflectionSessionRecord(
  supabase: AuthenticatedSupabaseClient,
  user: AuthenticatedUser,
  title?: string | null,
) {
  const startedAt = new Date().toISOString();
  const payload = buildInitialPayload(startedAt);
  const { data, error } = await supabase
    .from('reflection_sessions')
    .insert({
      user_id: user.id,
      title: title ?? null,
      status: 'draft',
      started_at: startedAt,
      payload,
      ai_analysis: {},
    })
    .select(REFLECTION_SESSION_SELECT)
    .single();

  if (error || !data) {
    throwRouteError(500, apiMessages.reflection.createFailed);
  }

  return data as ReflectionSessionRecord;
}

export async function listReflectionSessionRecords(
  supabase: AuthenticatedSupabaseClient,
  user: AuthenticatedUser,
) {
  const { data, error } = await supabase
    .from('reflection_sessions')
    .select(REFLECTION_SESSION_SELECT)
    .eq('user_id', user.id)
    .order('started_at', { ascending: false });

  if (error || !data) {
    throwRouteError(500, apiMessages.reflection.listFailed);
  }

  return data as ReflectionSessionRecord[];
}

export async function getReflectionSessionRecord(
  supabase: AuthenticatedSupabaseClient,
  user: AuthenticatedUser,
  sessionId: string,
) {
  const { data, error } = await supabase
    .from('reflection_sessions')
    .select(REFLECTION_SESSION_SELECT)
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single();

  if (error || !data) {
    throwRouteError(404, apiMessages.reflection.detailFailed);
  }

  return data as ReflectionSessionRecord;
}

export async function addReflectionResponseRecord(
  supabase: AuthenticatedSupabaseClient,
  user: AuthenticatedUser,
  sessionId: string,
  response: SessionResponse,
  metadataPatch?: MetadataPatch,
) {
  const session = await loadOwnedSessionContext(
    supabase,
    user,
    sessionId,
    apiMessages.reflection.detailFailed,
  );

  if (session.status === 'completed') {
    throwRouteError(409, apiMessages.reflection.responseAlreadyCompleted);
  }

  const currentPayload = normalizeSessionPayload(session);
  const updatedPayload = applyMetadataPatch(
    appendResponse(currentPayload, response),
    metadataPatch,
  );

  const { data, error } = await supabase
    .from('reflection_sessions')
    .update({
      payload: updatedPayload,
    })
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .select(REFLECTION_SESSION_SELECT)
    .single();

  if (error || !data) {
    throwRouteError(500, apiMessages.reflection.responseFailed);
  }

  return data as ReflectionSessionRecord;
}

export async function loadReflectionSessionPayload(
  supabase: AuthenticatedSupabaseClient,
  user: AuthenticatedUser,
  sessionId: string,
) {
  const session = await loadOwnedSessionContext(
    supabase,
    user,
    sessionId,
    apiMessages.ai.sessionNotFound,
  );

  return {
    payload: normalizeSessionPayload(session),
    session,
  };
}

export async function saveReflectionSessionAnalysis(
  supabase: AuthenticatedSupabaseClient,
  user: AuthenticatedUser,
  sessionId: string,
  analysis: ReflectionAnalysisResult,
) {
  const { data, error } = await supabase
    .from('reflection_sessions')
    .update({
      ai_analysis: analysis,
    })
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .select('id, ai_analysis')
    .single();

  if (error || !data) {
    throwRouteError(500, apiMessages.ai.analyzeFailed);
  }

  return data as { id: string; ai_analysis: ReflectionAnalysisResult };
}

export async function completeReflectionSessionRecord(
  supabase: AuthenticatedSupabaseClient,
  user: AuthenticatedUser,
  input: CompleteReflectionSessionInput,
) {
  const session = await loadOwnedSessionContext(
    supabase,
    user,
    input.sessionId,
    apiMessages.reflection.detailFailed,
  );

  if (session.status === 'completed') {
    throwRouteError(409, apiMessages.reflection.completeAlreadyCompleted);
  }

  const payload = normalizeSessionPayload(session);

  if (payload.responses.length === 0) {
    throwRouteError(409, apiMessages.reflection.completeMissingResponses);
  }

  const completedAt = new Date().toISOString();
  const payloadWithCompletion = applyMetadataPatch(payload, {
    ...input.metadataPatch,
    completed_at: completedAt,
  });
  const analysis = await resolveCompletionAnalysis(payloadWithCompletion);
  const updateData: {
    status: 'completed';
    completed_at: string;
    title?: string;
    payload: ReflectionSessionPayload;
    ai_analysis: Record<string, unknown>;
  } = {
    status: 'completed',
    completed_at: completedAt,
    payload: payloadWithCompletion,
    ai_analysis: { ...analysis },
  };

  if (input.title) {
    updateData.title = input.title;
  } else if (analysis.session_title) {
    updateData.title = analysis.session_title;
  }

  const { data, error } = await supabase
    .from('reflection_sessions')
    .update(updateData)
    .eq('id', input.sessionId)
    .eq('user_id', user.id)
    .select(REFLECTION_SESSION_SELECT)
    .single();

  if (error || !data) {
    throwRouteError(500, apiMessages.reflection.completeFailed);
  }

  return data as ReflectionSessionRecord;
}
