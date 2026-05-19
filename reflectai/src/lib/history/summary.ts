import type { ReflectionSessionListItem } from '@/lib/api/reflection';
import {
  getCompletedSessions,
  getPrimaryEmotion,
  getResponseText,
  getSessionAnalysis,
  getSessionDateIso,
  getSessionTitle,
  getAnalysisText,
} from '@/lib/reflection/sessionInsights';
import type {
  HistoryEntry,
  HistoryEmotionChip,
  HistoryMonthGroup,
  HistorySummary,
} from '@/types/history';

const SEARCH_PLACEHOLDER = 'Buscar palabras clave o detonantes';

const EMOTION_TONE_CLASSES = [
  'bg-sky-100 text-sky-700',
  'bg-amber-100 text-amber-700',
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-100 text-emerald-700',
  'bg-rose-100 text-rose-700',
  'bg-violet-100 text-violet-700',
];

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function capitalize(value: string) {
  return value ? `${value[0].toUpperCase()}${value.slice(1)}` : value;
}

function formatShortDate(dateIso: string) {
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateIso));
}

function formatMonthLabel(dateIso: string) {
  return capitalize(
    new Intl.DateTimeFormat('es-MX', {
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateIso)),
  );
}

function buildMonthId(dateIso: string) {
  const date = new Date(dateIso);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function buildEmotionChip(label: string): HistoryEmotionChip {
  const hash = [...label].reduce((total, character) => (
    total + character.charCodeAt(0)
  ), 0);

  return {
    label,
    toneClassName: EMOTION_TONE_CLASSES[hash % EMOTION_TONE_CLASSES.length],
  };
}

function getTriggerPreview(session: ReflectionSessionListItem) {
  const analysis = getSessionAnalysis(session);
  const preview =
    getResponseText(session.payload, 'Q1_SIT') ??
    getAnalysisText(analysis, 'summary') ??
    getResponseText(session.payload, 'Q7_ALT') ??
    'Sin descripcion registrada.';

  return preview.length > 120 ? `${preview.slice(0, 117).trim()}...` : preview;
}

function buildHistoryEntry(session: ReflectionSessionListItem): HistoryEntry {
  const sessionDate = getSessionDateIso(session);

  return {
    id: session.id,
    title: getSessionTitle(session),
    shortDate: formatShortDate(sessionDate),
    sessionDateTime: sessionDate,
    triggerPreview: getTriggerPreview(session),
    emotion: buildEmotionChip(getPrimaryEmotion(session)),
  };
}

function entryMatchesSearch(entry: HistoryEntry, groupLabel: string, searchQuery: string) {
  if (!searchQuery.trim()) {
    return true;
  }

  const haystack = normalizeSearchText(
    [
      entry.title,
      entry.triggerPreview,
      entry.emotion.label,
      entry.shortDate,
      groupLabel,
    ].join(' '),
  );

  return haystack.includes(normalizeSearchText(searchQuery));
}

export function buildHistorySummary(
  sessions: ReflectionSessionListItem[],
  searchQuery = '',
): HistorySummary {
  const completedSessions = getCompletedSessions(sessions);
  const groups = new Map<string, HistoryMonthGroup>();

  completedSessions.forEach((session) => {
    const entry = buildHistoryEntry(session);
    const groupId = buildMonthId(entry.sessionDateTime);
    const label = formatMonthLabel(entry.sessionDateTime);

    if (!entryMatchesSearch(entry, label, searchQuery)) {
      return;
    }

    const group = groups.get(groupId) ?? {
      id: groupId,
      label,
      entries: [],
    };

    group.entries.push(entry);
    groups.set(groupId, group);
  });

  return {
    completedSessions: completedSessions.length,
    searchPlaceholder: SEARCH_PLACEHOLDER,
    searchQuery,
    monthGroups: Array.from(groups.values()),
  };
}

