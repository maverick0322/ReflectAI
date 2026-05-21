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
  StatisticsComparisonResult,
  StatisticsComparisonSelection,
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
      title: 'Sin patrón dominante',
      description:
        'Completa más sesiones para detectar patrones de pensamiento con mayor claridad.',
    };
  }

  return {
    title: dominantPattern,
    description:
      count === 1
        ? 'Apareció en una sesión completada recientemente.'
        : `Apareció en ${count} sesiones completadas recientemente.`,
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

function getComparisonFallback(): StatisticsComparisonResult {
  return {
    sessionAIntensity: 0,
    sessionBIntensity: 0,
    sessionALabel: 'Ninguna sesión seleccionada',
    sessionBLabel: 'Ninguna sesión seleccionada',
    insight: 'Completa al menos dos sesiones para comparar la intensidad emocional.',
  };
}

export function buildStatisticsComparisonResult(
  sessionOptions: StatisticsSessionOption[],
  selection: StatisticsComparisonSelection,
): StatisticsComparisonResult {
  const sessionA =
    sessionOptions.find((option) => option.id === selection.sessionA) ?? null;
  const sessionB =
    sessionOptions.find((option) => option.id === selection.sessionB) ?? null;

  if (!sessionA || !sessionB) {
    return getComparisonFallback();
  }

  const sessionAIntensity = sessionA.intensity ?? 0;
  const sessionBIntensity = sessionB.intensity ?? 0;

  if (sessionA.id === sessionB.id) {
    return {
      sessionAIntensity,
      sessionBIntensity,
      sessionALabel: sessionA.label,
      sessionBLabel: sessionB.label,
      insight: 'Elige dos sesiones diferentes para comparar tu intensidad emocional.',
    };
  }

  if (sessionAIntensity === sessionBIntensity) {
    return {
      sessionAIntensity,
      sessionBIntensity,
      sessionALabel: sessionA.label,
      sessionBLabel: sessionB.label,
      insight: 'Ambas sesiones muestran una intensidad emocional similar.',
    };
  }

  const strongerSession =
    sessionAIntensity > sessionBIntensity ? sessionA : sessionB;
  const softerSession =
    sessionAIntensity > sessionBIntensity ? sessionB : sessionA;

  return {
    sessionAIntensity,
    sessionBIntensity,
    sessionALabel: sessionA.label,
    sessionBLabel: sessionB.label,
    insight: `${strongerSession.label} muestra una intensidad emocional mayor que ${softerSession.label}.`,
  };
}

export function buildStatisticsDashboardData(
  sessions: ReflectionSessionListItem[],
): StatisticsDashboardData {
  const completedSessions = getCompletedSessions(sessions);
  const sessionOptions = buildSessionOptions(completedSessions);
  const firstSelection = sessionOptions[0]?.id ?? '';
  const secondSelection = sessionOptions[1]?.id ?? '';

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
  };
}

