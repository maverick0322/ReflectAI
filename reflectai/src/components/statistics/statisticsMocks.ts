import type { StatisticsDashboardData } from '@/types/statistics';

// Para Miguel(backend): Replace this mock payload with the real statistics response contract.
export const statisticsDashboardMock: StatisticsDashboardData = {
  evolution: [
    { id: 'mon', label: 'Lun', intensity: 30 },
    { id: 'tue', label: 'Mar', intensity: 50 },
    { id: 'wed', label: 'Mie', intensity: 80 },
    { id: 'thu', label: 'Jue', intensity: 40 },
    { id: 'fri', label: 'Vie', intensity: 60 },
    { id: 'sat', label: 'Sab', intensity: 90 },
    { id: 'sun', label: 'Dom', intensity: 50 },
  ],
  emotions: [
    { id: 'anxiety', label: 'Ansiedad', percentage: 45, colorHex: '#A78BFA' },
    { id: 'calm', label: 'Calma', percentage: 30, colorHex: '#93C5FD' },
    { id: 'sadness', label: 'Tristeza', percentage: 25, colorHex: '#C7D2FE' },
  ],
  topics: [
    { id: 'work', label: 'Trabajo', sessionCount: 12 },
    { id: 'family', label: 'Familia', sessionCount: 8 },
    { id: 'health', label: 'Salud', sessionCount: 5 },
    { id: 'money', label: 'Dinero', sessionCount: 3 },
  ],
  pattern: {
    title: 'Lectura de pensamiento',
    description: 'Suele aparecer cuando interpretas la reaccion de otras personas sin confirmarla.',
  },
  sessionOptions: [
    { id: 'latest', label: 'Ultima sesion (Ayer)' },
    { id: 'work-conflict', label: 'Sesion: Conflicto laboral' },
    { id: 'family-discussion', label: 'Sesion: Discusion familiar' },
  ],
  defaultSelection: {
    sessionA: 'latest',
    sessionB: 'work-conflict',
  },
  comparisonResult: {
    sessionAIntensity: 80,
    sessionBIntensity: 45,
    sessionALabel: 'Ultima sesion (Ayer)',
    sessionBLabel: 'Sesion: Conflicto laboral',
    insight:
      'Tu ultima sesion refleja una intensidad emocional mayor. Backend podra sustituir este texto con un analisis dinamico.',
  },
};
