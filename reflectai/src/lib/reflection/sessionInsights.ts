import type { ReflectionSessionListItem } from '@/features/reflection/services/reflectionService';
import { getPrimaryEmotionLabel } from '@/features/reflection/types/reflection';
import type {
  QuestionId,
  ReflectionSessionPayload,
  SessionResponse,
} from '@/features/reflection/types/reflection';

type AnalysisRecord = Record<string, unknown>;

const EMOTION_LABEL_MAP: Record<string, string> = {
  anxiety: 'Ansiedad',
  calm: 'Calma',
  stress: 'Estrés',
  stressed: 'Estrés',
  frustration: 'Frustración',
  frustrated: 'Frustración',
  guilt: 'Culpa',
  guilty: 'Culpa',
};

function normalizeEmotionKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function getEmotionDisplayLabel(value: string) {
  const primaryEmotionLabel = getPrimaryEmotionLabel(value);

  if (primaryEmotionLabel !== value) {
    return primaryEmotionLabel;
  }

  return EMOTION_LABEL_MAP[normalizeEmotionKey(value)] ?? value;
}

function isRecord(value: unknown): value is AnalysisRecord {
  return typeof value === 'object' && value !== null;
}

export function getSessionAnalysis(
  session: Pick<ReflectionSessionListItem, 'ai_analysis'>,
): AnalysisRecord {
  return isRecord(session.ai_analysis) ? session.ai_analysis : {};
}

export function findPayloadResponse(
  payload: ReflectionSessionPayload | undefined,
  id: QuestionId,
): SessionResponse | null {
  return payload?.responses.find((response) => response.id === id) ?? null;
}

export function getResponseText(
  payload: ReflectionSessionPayload | undefined,
  id: QuestionId,
): string | null {
  const text = findPayloadResponse(payload, id)?.text?.trim();
  return text ? text : null;
}

export function getResponseValue(
  payload: ReflectionSessionPayload | undefined,
  id: QuestionId,
): number | null {
  const value = findPayloadResponse(payload, id)?.value;
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function getAnalysisText(
  analysis: AnalysisRecord,
  key: string,
): string | null {
  const value = analysis[key];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function getAnalysisNumber(
  analysis: AnalysisRecord,
  key: string,
): number | null {
  const value = analysis[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function getAnalysisTextArray(
  analysis: AnalysisRecord,
  key: string,
): string[] {
  const value = analysis[key];
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getPrimaryEmotion(session: ReflectionSessionListItem) {
  const analysis = getSessionAnalysis(session);
  const primaryEmotion =
    getAnalysisTextArray(analysis, 'primary_emotions')[0] ??
    getResponseText(session.payload, 'Q3_EMO') ??
    'Sin emoción';

  return getEmotionDisplayLabel(primaryEmotion);
}

export function getAverageIntensityScore(session: ReflectionSessionListItem) {
  const analysis = getSessionAnalysis(session);
  return (
    getAnalysisNumber(analysis, 'average_intensity') ??
    getResponseValue(session.payload, 'Q4_INT')
  );
}

export function getSessionTitle(session: ReflectionSessionListItem) {
  const analysis = getSessionAnalysis(session);
  const fallback =
    getAnalysisText(analysis, 'session_title') ??
    getResponseText(session.payload, 'Q1_SIT') ??
    'Sesión de reflexión';
  const title = session.title?.trim() || fallback;

  return title.length > 72 ? `${title.slice(0, 69).trim()}...` : title;
}

export function getSessionDateIso(session: ReflectionSessionListItem) {
  return session.completed_at ?? session.started_at;
}

export function getCompletedSessions(sessions: ReflectionSessionListItem[]) {
  return sessions.filter((session) => session.status === 'completed');
}
