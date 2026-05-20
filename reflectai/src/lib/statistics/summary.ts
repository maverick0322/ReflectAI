import type { ReflectionSessionListItem } from '@/features/reflection/services/reflectionService';
import {
  getAnalysisText,
  getAnalysisTextArray,
  getAverageIntensityScore,
  getCompletedSessions,
  getPrimaryEmotion,
  getResponseText,
  getSessionAnalysis,
  getSessionDateIso,
  getSessionTitle,
} from '@/lib/reflection/sessionInsights';
import type {
  StatisticsDashboardData,
  StatisticsEmotionItem,
  StatisticsEvolutionPoint,
  StatisticsPattern,
  StatisticsSessionOption,
  StatisticsTopicItem,
} from '@/features/statistics/types/statistics';

const EMOTION_COLORS = [
  '#8B5CF6',
  '#0EA5E9',
  '#10B981',
  '#F59E0B',
  '#F43F5E',
  '#6366F1',
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function toIntensityPercentage(score: number | null) {
  if (score === null) {
    return 0;
  }

  const normalizedScore = score > 10 ? score : score * 10;
  return Math.round(clamp(normalizedScore, 0, 100));
}

function formatEvolutionLabel(dateIso: string) {
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(dateIso));
}

function formatSessionOptionLabel(session: ReflectionSessionListItem) {
  const dateLabel = new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(getSessionDateIso(session)));

  return `${getSessionTitle(session)} (${dateLabel})`;
}

function incrementCounter(counter: Map<string, number>, key: string) {
  counter.set(key, (counter.get(key) ?? 0) + 1);
}

function buildEvolution(sessions: ReflectionSessionListItem[]): StatisticsEvolutionPoint[] {
  return sessions
    .slice(0, 7)
    .reverse()
    .map((session) => ({
      id: session.id,
      label: formatEvolutionLabel(getSessionDateIso(session)),
      intensity: toIntensityPercentage(getAverageIntensityScore(session)),
    }));
}

function buildEmotionDistribution(
  sessions: ReflectionSessionListItem[],
): StatisticsEmotionItem[] {
  const counter = new Map<string, number>();

  sessions.forEach((session) => {
    incrementCounter(counter, getPrimaryEmotion(session));
  });

  const total = sessions.length || 1;
  return Array.from(counter.entries())
    .sort((first, second) => second[1] - first[1])
    .slice(0, 5)
    .map(([label, count], index) => ({
      id: label.toLowerCase().replace(/\s+/g, '-'),
      label,
      percentage: Math.round((count / total) * 100),
      colorHex: EMOTION_COLORS[index % EMOTION_COLORS.length],
    }));
}

function getSessionTopics(session: ReflectionSessionListItem) {
  const analysis = getSessionAnalysis(session);
  const themes = getAnalysisTextArray(analysis, 'key_themes');
  if (themes.length > 0) {
    return themes;
  }

  const situation = getResponseText(session.payload, 'Q1_SIT');
  if (!situation) {
    return [];
  }

  return situation
    .split(/[,.]/)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length >= 4)
    .slice(0, 1);
}

function buildTopics(sessions: ReflectionSessionListItem[]): StatisticsTopicItem[] {
  const counter = new Map<string, number>();

  sessions.flatMap(getSessionTopics).forEach((topic) => {
    incrementCounter(counter, topic);
  });

  return Array.from(counter.entries())
    .sort((first, second) => second[1] - first[1])
    .slice(0, 6)
    .map(([label, sessionCount]) => ({
      id: label.toLowerCase().replace(/\s+/g, '-'),
      label,
      sessionCount,
    }));
}

function buildPattern(sessions: ReflectionSessionListItem[]): StatisticsPattern {
  const counter = new Map<string, number>();

  sessions.forEach((session) => {
    const pattern = getAnalysisText(
      getSessionAnalysis(session),
      'cognitive_distortion_detected',
    );

    if (pattern) {
      incrementCounter(counter, pattern);
    }
  });

  const [dominantPattern, count] =
    Array.from(counter.entries()).sort((first, second) => second[1] - first[1])[0] ?? [];

  if (!dominantPattern) {
    return {
      title: 'Sin patron dominante',
      description:
        'Completa mas sesiones para detectar patrones de pensamiento con mayor claridad.',
    };
  }

  return {
    title: dominantPattern,
    description:
      count === 1
        ? 'Aparecio en una sesion completada recientemente.'
        : `Aparecio en ${count} sesiones completadas recientemente.`,
  };
}

function buildSessionOptions(
  sessions: ReflectionSessionListItem[],
): StatisticsSessionOption[] {
  return sessions.slice(0, 8).map((session) => ({
    id: session.id,
    label: formatSessionOptionLabel(session),
    intensity: toIntensityPercentage(getAverageIntensityScore(session)),
    emotion: getPrimaryEmotion(session),
  }));
}

export function buildStatisticsDashboardData(
  sessions: ReflectionSessionListItem[],
): StatisticsDashboardData {
  const completedSessions = getCompletedSessions(sessions);
  const sessionOptions = buildSessionOptions(completedSessions);
  const firstSelection = sessionOptions[0]?.id ?? '';
  const secondSelection = sessionOptions[1]?.id ?? firstSelection;

  return {
    evolution: buildEvolution(completedSessions),
    emotions: buildEmotionDistribution(completedSessions),
    topics: buildTopics(completedSessions),
    pattern: buildPattern(completedSessions),
    sessionOptions,
    defaultSelection: {
      sessionA: firstSelection,
      sessionB: secondSelection,
    },
    comparisonResult: {
      sessionAIntensity: sessionOptions[0]?.intensity ?? 0,
      sessionBIntensity: sessionOptions[1]?.intensity ?? 0,
      sessionALabel: sessionOptions[0]?.label ?? 'No session selected',
      sessionBLabel: sessionOptions[1]?.label ?? 'No session selected',
      insight:
        sessionOptions.length >= 2
          ? 'Comparison data is ready for backend-driven analysis.'
          : 'Complete at least two sessions to compare emotional intensity.',
    },
  };
}

