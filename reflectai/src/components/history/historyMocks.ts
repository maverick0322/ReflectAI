import type { HistorySummary } from '@/types/history';

// Para Miguel(backend): Replace this placeholder payload with the real reflection history response.
export const historySummaryMock: HistorySummary = {
  completedSessions: 42,
  searchPlaceholder: 'Buscar palabras clave o detonantes',
  searchQuery: '',
  monthGroups: [
    {
      id: '2026-04',
      label: 'Abril 2026',
      entries: [
        {
          id: 'session-2026-04-15',
          title: 'Ansiedad por entrega de proyecto',
          shortDate: '15 Abr, 10:30 AM',
          sessionDateTime: '2026-04-15T10:30:00',
          triggerPreview: 'Preocupacion por cumplir una fecha limite y sentir poco control.',
          emotion: {
            label: 'Ansiedad',
            toneClassName: 'bg-sky-100 text-sky-700',
          },
        },
        {
          id: 'session-2026-04-12',
          title: 'Frustracion despues de una discusion familiar',
          shortDate: '12 Abr, 08:10 PM',
          sessionDateTime: '2026-04-12T20:10:00',
          triggerPreview: 'Conversacion dificil con expectativas no resueltas en casa.',
          emotion: {
            label: 'Frustracion',
            toneClassName: 'bg-amber-100 text-amber-700',
          },
        },
        {
          id: 'session-2026-04-03',
          title: 'Tristeza al pensar en cambios recientes',
          shortDate: '03 Abr, 07:45 AM',
          sessionDateTime: '2026-04-03T07:45:00',
          triggerPreview: 'Revision personal sobre cambios de rutina y distancia emocional.',
          emotion: {
            label: 'Tristeza',
            toneClassName: 'bg-indigo-100 text-indigo-700',
          },
        },
      ],
    },
  ],
};
