import { describe, expect, it } from 'vitest';

import type { ReflectionSessionListItem } from '@/features/reflection/services/reflectionService';
import {
  buildStatisticsDashboardData,
  toIntensityPercentage,
} from '@/lib/statistics/summary';

const sessions: ReflectionSessionListItem[] = [
  {
    id: 'session-high',
    title: 'Sesion intensa',
    status: 'completed',
    started_at: '2026-05-10T10:00:00.000Z',
    completed_at: '2026-05-10T10:20:00.000Z',
    payload: {
      metadata: { version: '1.1', started_at: '2026-05-10T10:00:00.000Z' },
      responses: [
        { id: 'Q1_SIT', text: 'Tension en el trabajo.' },
        { id: 'Q3_EMO', text: 'Ansiedad' },
        { id: 'Q4_INT', value: 8 },
      ],
    },
    ai_analysis: {
      primary_emotions: ['Ansiedad'],
      average_intensity: 8,
      key_themes: ['Trabajo'],
      cognitive_distortion_detected: 'Lectura de pensamiento',
    },
  },
  {
    id: 'session-low',
    title: 'Sesion tranquila',
    status: 'completed',
    started_at: '2026-05-09T10:00:00.000Z',
    completed_at: '2026-05-09T10:20:00.000Z',
    payload: {
      metadata: { version: '1.1', started_at: '2026-05-09T10:00:00.000Z' },
      responses: [
        { id: 'Q1_SIT', text: 'Revision de avances laborales.' },
        { id: 'Q3_EMO', text: 'Calma' },
        { id: 'Q4_INT', value: 4 },
      ],
    },
    ai_analysis: {
      primary_emotions: ['Calma'],
      average_intensity: 4,
      key_themes: ['Trabajo'],
    },
  },
  {
    id: 'draft-1',
    title: 'Borrador',
    status: 'draft',
    started_at: '2026-05-08T10:00:00.000Z',
    completed_at: null,
    payload: {
      metadata: { version: '1.1', started_at: '2026-05-08T10:00:00.000Z' },
      responses: [{ id: 'Q1_SIT', text: 'Pendiente' }],
    },
    ai_analysis: {},
  },
];

describe('statistics summary', () => {
  it('normalizes intensity scores to percentages', () => {
    expect(toIntensityPercentage(8)).toBe(80);
    expect(toIntensityPercentage(85)).toBe(85);
    expect(toIntensityPercentage(-2)).toBe(0);
    expect(toIntensityPercentage(150)).toBe(100);
    expect(toIntensityPercentage(null)).toBe(0);
  });

  it('builds statistics from completed sessions only', () => {
    const data = buildStatisticsDashboardData(sessions);

    expect(data.evolution).toHaveLength(2);
    expect(data.emotions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Ansiedad', percentage: 50 }),
        expect.objectContaining({ label: 'Calma', percentage: 50 }),
      ]),
    );
    expect(data.topics[0]).toMatchObject({ label: 'Trabajo', sessionCount: 2 });
    expect(data.pattern).toMatchObject({
      title: 'Lectura de pensamiento',
      description: 'Aparecio en una sesion completada recientemente.',
    });
    expect(data.sessionOptions.map((option) => option.id)).toEqual([
      'session-high',
      'session-low',
    ]);
  });

  it('builds empty statistics when there are no completed sessions', () => {
    const data = buildStatisticsDashboardData([
      {
        id: 'draft-1',
        title: 'Borrador',
        status: 'draft',
        started_at: '2026-05-08T10:00:00.000Z',
        completed_at: null,
        payload: {
          metadata: { version: '1.1', started_at: '2026-05-08T10:00:00.000Z' },
          responses: [],
        },
        ai_analysis: {},
      },
    ]);

    expect(data.evolution).toEqual([]);
    expect(data.emotions).toEqual([]);
    expect(data.topics).toEqual([]);
    expect(data.sessionOptions).toEqual([]);
    expect(data.pattern.title).toBe('Sin patron dominante');
    expect(data.defaultSelection).toEqual({ sessionA: '', sessionB: '' });
  });

  it('falls back to situation text for topics and pluralizes repeated patterns', () => {
    const data = buildStatisticsDashboardData([
      {
        id: 'session-a',
        title: null,
        status: 'completed',
        started_at: '2026-05-08T10:00:00.000Z',
        completed_at: '2026-05-08T10:10:00.000Z',
        payload: {
          metadata: { version: '1.1', started_at: '2026-05-08T10:00:00.000Z' },
          responses: [
            { id: 'Q1_SIT', text: 'Trabajo intenso, otro detalle.' },
            { id: 'Q3_EMO', text: 'Enojo' },
            { id: 'Q4_INT', value: 7 },
          ],
        },
        ai_analysis: { cognitive_distortion_detected: 'Catastrofizacion' },
      },
      {
        id: 'session-b',
        title: null,
        status: 'completed',
        started_at: '2026-05-07T10:00:00.000Z',
        completed_at: '2026-05-07T10:10:00.000Z',
        payload: {
          metadata: { version: '1.1', started_at: '2026-05-07T10:00:00.000Z' },
          responses: [],
        },
        ai_analysis: { cognitive_distortion_detected: 'Catastrofizacion' },
      },
    ]);

    expect(data.topics[0]).toMatchObject({ label: 'Trabajo intenso', sessionCount: 1 });
    expect(data.pattern).toMatchObject({
      title: 'Catastrofizacion',
      description: 'Aparecio en 2 sesiones completadas recientemente.',
    });
  });
});
