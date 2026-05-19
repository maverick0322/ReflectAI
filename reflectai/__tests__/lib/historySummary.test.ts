import { describe, expect, it } from 'vitest';

import { buildHistorySummary } from '@/lib/history/summary';
import type { ReflectionSessionListItem } from '@/lib/api/reflection';

const sessions: ReflectionSessionListItem[] = [
  {
    id: 'completed-1',
    title: 'Entrega de proyecto',
    status: 'completed',
    started_at: '2026-04-15T10:30:00.000Z',
    completed_at: '2026-04-15T10:45:00.000Z',
    payload: {
      metadata: { version: '1.1', started_at: '2026-04-15T10:30:00.000Z' },
      responses: [
        { id: 'Q1_SIT', text: 'Preocupacion por cumplir una fecha limite.' },
        { id: 'Q3_EMO', text: 'Ansiedad' },
      ],
    },
    ai_analysis: {},
  },
  {
    id: 'completed-2',
    title: null,
    status: 'completed',
    started_at: '2026-03-12T20:10:00.000Z',
    completed_at: '2026-03-12T20:30:00.000Z',
    payload: {
      metadata: { version: '1.1', started_at: '2026-03-12T20:10:00.000Z' },
      responses: [
        { id: 'Q1_SIT', text: 'Conversacion dificil con mi familia.' },
        { id: 'Q3_EMO', text: 'Frustracion' },
      ],
    },
    ai_analysis: { session_title: 'Conversacion familiar' },
  },
  {
    id: 'draft-1',
    title: 'Borrador',
    status: 'draft',
    started_at: '2026-03-10T20:10:00.000Z',
    completed_at: null,
    payload: {
      metadata: { version: '1.1', started_at: '2026-03-10T20:10:00.000Z' },
      responses: [{ id: 'Q1_SIT', text: 'Pendiente' }],
    },
    ai_analysis: {},
  },
];

describe('buildHistorySummary', () => {
  it('groups only completed sessions by month', () => {
    const summary = buildHistorySummary(sessions);

    expect(summary.completedSessions).toBe(2);
    expect(summary.monthGroups).toHaveLength(2);
    expect(summary.monthGroups[0].entries[0]).toMatchObject({
      id: 'completed-1',
      title: 'Entrega de proyecto',
      triggerPreview: 'Preocupacion por cumplir una fecha limite.',
    });
    expect(
      summary.monthGroups.flatMap((group) => group.entries).map((entry) => entry.id),
    ).not.toContain('draft-1');
  });

  it('filters entries by title, emotion or trigger text', () => {
    const summary = buildHistorySummary(sessions, 'familia');

    expect(summary.completedSessions).toBe(2);
    expect(summary.monthGroups).toHaveLength(1);
    expect(summary.monthGroups[0].entries[0].title).toBe('Conversacion familiar');
  });

  it('uses analysis summary and empty states when payload details are missing', () => {
    const summary = buildHistorySummary([
      {
        id: 'completed-empty',
        title: null,
        status: 'completed',
        started_at: '2026-02-01T10:00:00.000Z',
        completed_at: null,
        payload: {
          metadata: { version: '1.1', started_at: '2026-02-01T10:00:00.000Z' },
          responses: [],
        },
        ai_analysis: {
          summary: 'Resumen generado por IA',
        },
      },
    ]);

    expect(summary.monthGroups[0].entries[0]).toMatchObject({
      title: 'Sesion de reflexion',
      triggerPreview: 'Resumen generado por IA',
      emotion: expect.objectContaining({ label: 'Sin emocion' }),
    });
  });

  it('returns no groups when search does not match', () => {
    const summary = buildHistorySummary(sessions, 'no existe');

    expect(summary.completedSessions).toBe(2);
    expect(summary.monthGroups).toEqual([]);
  });
});
