export interface UserProfile {
  name: string;
  streak: number;
  avatarUrl: string | null;
}

export interface PausedSession {
  id: string;
  timeAgo: string;
}

// Weekly calendar record used by the dashboard overview.
export interface DayRecord {
  date: string;
  label: string;
  num: number;
  isToday: boolean;
  isFuture: boolean;
  hasSessions: boolean;
}
