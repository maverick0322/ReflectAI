export interface HistoryEmotionChip {
  label: string;
  toneClassName: string;
}

export interface HistoryEntry {
  id: string;
  title: string;
  shortDate: string;
  sessionDateTime: string;
  triggerPreview: string;
  emotion: HistoryEmotionChip;
}

export interface HistoryMonthGroup {
  id: string;
  label: string;
  entries: HistoryEntry[];
}

export interface HistorySummary {
  completedSessions: number;
  searchPlaceholder: string;
  searchQuery: string;
  monthGroups: HistoryMonthGroup[];
}
