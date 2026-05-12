import type {
  ReflectionSessionPayload,
  SessionMetadata,
  SessionResponse,
} from '@/types/reflection';

const DEFAULT_SCHEMA_VERSION = '1.1';

export interface MetadataPatch {
  version?: string;
  started_at?: string;
  completed_at?: string;
  interruption_detected?: boolean;
  resume_step?: number;
  flags?: string[];
  grounding_duration_seconds?: number;
  ai_hints?: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isPayload(value: unknown): value is ReflectionSessionPayload {
  if (!isRecord(value)) {
    return false;
  }

  if (!('metadata' in value) || !('responses' in value)) {
    return false;
  }

  const responses = (value as Record<string, unknown>).responses;
  return Array.isArray(responses);
}

export function buildInitialPayload(startedAt: string): ReflectionSessionPayload {
  return {
    metadata: {
      version: DEFAULT_SCHEMA_VERSION,
      started_at: startedAt,
    },
    responses: [],
  };
}

export function normalizePayload(
  payload: unknown,
  fallbackStartedAt: string,
): ReflectionSessionPayload {
  if (isPayload(payload)) {
    return payload;
  }

  return buildInitialPayload(fallbackStartedAt);
}

export function appendResponse(
  payload: ReflectionSessionPayload,
  response: SessionResponse,
): ReflectionSessionPayload {
  const existingIndex = payload.responses.findIndex(
    (existing) => existing.id === response.id,
  );

  if (existingIndex >= 0) {
    const nextResponses = [...payload.responses];
    nextResponses[existingIndex] = {
      ...payload.responses[existingIndex],
      ...response,
    };

    return {
      ...payload,
      responses: nextResponses,
    };
  }

  return {
    ...payload,
    responses: [...payload.responses, response],
  };
}

export function applyMetadataPatch(
  payload: ReflectionSessionPayload,
  patch?: MetadataPatch,
): ReflectionSessionPayload {
  if (!patch) {
    return payload;
  }

  const mergedFlags = mergeUnique(payload.metadata.flags, patch.flags);
  const mergedHints = mergeUnique(payload.metadata.ai_hints, patch.ai_hints);

  const nextMetadata: SessionMetadata = {
    ...payload.metadata,
    ...patch,
    flags: mergedFlags.length > 0 ? mergedFlags : payload.metadata.flags,
    ai_hints: mergedHints.length > 0 ? mergedHints : payload.metadata.ai_hints,
  };

  return {
    ...payload,
    metadata: nextMetadata,
  };
}

function mergeUnique(source?: string[], incoming?: string[]): string[] {
  const safeSource = source ?? [];
  const safeIncoming = incoming ?? [];

  if (safeIncoming.length === 0) {
    return safeSource;
  }

  const merged = new Set([...safeSource, ...safeIncoming]);
  return Array.from(merged);
}
