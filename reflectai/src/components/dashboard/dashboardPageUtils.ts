import { ApiError } from '@/lib/api/http';
import {
  buildWeekRecords,
  calculateStreak,
  type SessionSnapshot,
} from '@/lib/dashboard/metrics';

export const DEFAULT_DAILY_QUOTE = {
  text: 'La reflexión es el camino hacia la maestría de uno mismo.',
  author: 'Marco Aurelio',
};

export function isRecoverableDraft(session: SessionSnapshot) {
  if (session.status !== 'draft' || !session.payload) {
    return false;
  }

  const answeredIds = new Set(session.payload.responses.map((response) => response.id));
  return answeredIds.size > 0;
}

export function getSessionTime(session: SessionSnapshot) {
  return new Date(session.completed_at ?? session.started_at).getTime();
}

export function getDashboardErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.payload?.message) {
    return error.payload.message;
  }

  return 'No se pudo cargar el dashboard';
}

export function getStreakMessage(streak: number) {
  return streak === 0
    ? '¡Hoy es el día perfecto para empezar tu hábito!'
    : '¡Excelente! Estás construyendo un hábito sólido.';
}

export function getIntensityLabel(value: unknown) {
  if (typeof value !== 'number') {
    return 'Media';
  }

  if (value >= 8) {
    return 'Alta';
  }

  if (value <= 3) {
    return 'Baja';
  }

  return 'Media';
}

export function getPrimaryEmotion(analysis: Record<string, unknown>) {
  const emotions = analysis.primary_emotions;
  if (Array.isArray(emotions) && typeof emotions[0] === 'string') {
    return emotions[0];
  }

  return 'Sin datos';
}

export function getAverageIntensity(analysis: Record<string, unknown>) {
  return getIntensityLabel(analysis.average_intensity);
}

export function getLastCompletedSession(sessions: SessionSnapshot[]) {
  return sessions.find((session) => session.status === 'completed') ?? null;
}

export function getPausedSession(
  sessions: SessionSnapshot[],
  lastCompletedSession: SessionSnapshot | null,
) {
  const lastCompletedTime = lastCompletedSession ? getSessionTime(lastCompletedSession) : 0;

  return (
    sessions.find(
      (session) => isRecoverableDraft(session) && getSessionTime(session) > lastCompletedTime,
    ) ?? null
  );
}

export function buildDashboardViewModel(
  sessions: SessionSnapshot[],
  today: Date,
) {
  const weekDays = buildWeekRecords(sessions, today);
  const streak = calculateStreak(sessions, today);
  const lastCompletedSession = getLastCompletedSession(sessions);

  return {
    weekDays,
    streak,
    streakMessage: getStreakMessage(streak),
    lastCompletedSession,
    pausedSession: getPausedSession(sessions, lastCompletedSession),
  };
}
