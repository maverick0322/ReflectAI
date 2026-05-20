import type { HistorySummary } from '@/features/history/types/history';

// TODO(backend): Replace this placeholder payload with the real reflection history response.
export const historySummaryMock: HistorySummary = {
  completedSessions: 42,
  searchPlaceholder: 'Search keywords or triggers',
  searchQuery: '',
  monthGroups: [
    {
      id: '2026-04',
      label: 'April 2026',
      entries: [
        {
          id: 'session-2026-04-15',
          title: 'Anxiety before a project deadline',
          shortDate: 'Apr 15, 10:30 AM',
          sessionDateTime: '2026-04-15T10:30:00',
          triggerPreview: 'Worry about meeting a deadline and feeling little control.',
          emotion: {
            label: 'Anxiety',
            toneClassName: 'bg-sky-100 text-sky-700',
          },
        },
        {
          id: 'session-2026-04-12',
          title: 'Frustration after a family argument',
          shortDate: 'Apr 12, 08:10 PM',
          sessionDateTime: '2026-04-12T20:10:00',
          triggerPreview: 'Difficult conversation with unresolved expectations at home.',
          emotion: {
            label: 'Frustration',
            toneClassName: 'bg-amber-100 text-amber-700',
          },
        },
        {
          id: 'session-2026-04-03',
          title: 'Sadness while thinking about recent changes',
          shortDate: 'Apr 03, 07:45 AM',
          sessionDateTime: '2026-04-03T07:45:00',
          triggerPreview: 'Personal review of routine changes and emotional distance.',
          emotion: {
            label: 'Sadness',
            toneClassName: 'bg-indigo-100 text-indigo-700',
          },
        },
      ],
    },
  ],
};
