import type { DayRecord } from '@/features/dashboard/types/dashboard';
import type { ReflectionSessionPayload } from '@/features/reflection/types/reflection';

export interface SessionSnapshot {
  id: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  title: string | null;
  payload?: ReflectionSessionPayload;
  ai_analysis: Record<string, unknown>;
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateKey(value: string) {
  return toDateKey(new Date(value));
}

export function formatDisplayDate(date: Date) {
  return new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

export function formatTimeAgo(dateIso: string) {
  const date = new Date(dateIso);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 60) {
    return `${Math.max(diffMinutes, 1)} min`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} h`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return diffDays === 1 ? '1 día' : `${diffDays} días`;
}

export function buildWeekRecords(
  sessions: SessionSnapshot[],
  referenceDate: Date,
): DayRecord[] {
  const dayOfWeek = referenceDate.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(referenceDate);
  monday.setDate(referenceDate.getDate() + mondayOffset);

  const sessionDates = new Set(
    sessions.map((session) => parseDateKey(session.started_at)),
  );

  const records: DayRecord[] = [];

  for (let index = 0; index < 7; index += 1) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + index);
    const key = toDateKey(current);
    records.push({
      date: key,
      label: new Intl.DateTimeFormat('es-MX', { weekday: 'short' })
        .format(current)
        .slice(0, 1)
        .toUpperCase(),
      num: current.getDate(),
      isToday: key === toDateKey(referenceDate),
      isFuture: current > referenceDate,
      hasSessions: sessionDates.has(key),
    });
  }

  return records;
}

export function calculateStreak(sessions: SessionSnapshot[], referenceDate: Date) {
  const completedDates = new Set(
    sessions
      .filter((session) => session.status === 'completed')
      .map((session) => parseDateKey(session.completed_at ?? session.started_at)),
  );

  let streak = 0;
  const cursor = new Date(referenceDate);

  while (true) {
    const key = toDateKey(cursor);
    if (!completedDates.has(key)) {
      break;
    }

    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
