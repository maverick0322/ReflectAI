import { ApiError } from '@/core/api/http';
import {
  buildWeekRecords,
  calculateStreak,
  type SessionSnapshot,
} from '@/features/dashboard/utils/metrics';

export const DEFAULT_DAILY_QUOTE = {
  text: 'Reflection is the path toward self-mastery.',
  author: 'Marcus Aurelius',
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

  return 'Unable to load the dashboard';
}

export function getStreakMessage(streak: number) {
  return streak === 0
    ? 'Today is the perfect day to start your habit.'
    : 'Excellent. You are building a strong habit.';
}

export function getIntensityLabel(value: unknown) {
  if (typeof value !== 'number') {
    return 'Moderate';
  }

  if (value >= 8) {
    return 'High';
  }

  if (value <= 3) {
    return 'Low';
  }

  return 'Moderate';
}

export function getPrimaryEmotion(analysis: Record<string, unknown>) {
  const emotions = analysis.primary_emotions;
  if (Array.isArray(emotions) && typeof emotions[0] === 'string') {
    return emotions[0];
  }

  return 'No data';
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
