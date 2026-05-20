import type { StatisticsDashboardData } from '@/features/statistics/types/statistics';

export const statisticsDashboardMock: StatisticsDashboardData = {
  evolution: [
    { id: 'mon', label: 'Mon', intensity: 30 },
    { id: 'tue', label: 'Tue', intensity: 50 },
    { id: 'wed', label: 'Wed', intensity: 80 },
    { id: 'thu', label: 'Thu', intensity: 40 },
    { id: 'fri', label: 'Fri', intensity: 60 },
    { id: 'sat', label: 'Sat', intensity: 90 },
    { id: 'sun', label: 'Sun', intensity: 50 },
  ],
  emotions: [
    { id: 'anxiety', label: 'Anxiety', percentage: 45, colorHex: '#A78BFA' },
    { id: 'calm', label: 'Calm', percentage: 30, colorHex: '#93C5FD' },
    { id: 'sadness', label: 'Sadness', percentage: 25, colorHex: '#C7D2FE' },
  ],
  topics: [
    { id: 'work', label: 'Work', sessionCount: 12 },
    { id: 'family', label: 'Family', sessionCount: 8 },
    { id: 'health', label: 'Health', sessionCount: 5 },
    { id: 'money', label: 'Money', sessionCount: 3 },
  ],
  pattern: {
    title: 'Mind reading',
    description:
      "It often appears when you interpret other people's reactions without confirming them.",
  },
  sessionOptions: [
    {
      id: 'latest',
      label: 'Latest session (Yesterday)',
      intensity: 80,
      emotion: 'Anxiety',
    },
    {
      id: 'work-conflict',
      label: 'Session: Work conflict',
      intensity: 45,
      emotion: 'Frustration',
    },
    {
      id: 'family-discussion',
      label: 'Session: Family discussion',
      intensity: 35,
      emotion: 'Sadness',
    },
  ],
  defaultSelection: {
    sessionA: 'latest',
    sessionB: 'work-conflict',
  },
  comparisonResult: {
    sessionAIntensity: 80,
    sessionBIntensity: 45,
    sessionALabel: 'Latest session (Yesterday)',
    sessionBLabel: 'Session: Work conflict',
    insight:
      'Your latest session reflects higher emotional intensity. Backend can replace this with a dynamic analysis.',
  },
};
