import { describe, expect, it, vi, afterEach } from 'vitest';

import {
  buildWeekRecords,
  calculateStreak,
  formatDisplayDate,
  formatTimeAgo,
  type SessionSnapshot,
} from '@/lib/dashboard/metrics';

afterEach(() => {
  vi.useRealTimers();
});

describe('dashboard metrics', () => {
  it('buildWeekRecords marks days with sessions', () => {
    const reference = new Date('2026-05-07T12:00:00.000Z');
    const sessions: SessionSnapshot[] = [
      {
        id: 's1',
        status: 'completed',
        started_at: '2026-05-07T10:00:00.000Z',
        completed_at: '2026-05-07T10:30:00.000Z',
        title: 'Sesion',
        ai_analysis: {},
      },
    ];

    const records = buildWeekRecords(sessions, reference);
    const match = records.find((record) => record.date === '2026-05-07');

    expect(records).toHaveLength(7);
    expect(match?.hasSessions).toBe(true);
  });

  it('calculateStreak counts consecutive days', () => {
    const reference = new Date('2026-05-07T12:00:00.000Z');
    const sessions: SessionSnapshot[] = [
      {
        id: 's1',
        status: 'completed',
        started_at: '2026-05-07T10:00:00.000Z',
        completed_at: '2026-05-07T10:30:00.000Z',
        title: 'Sesion',
        ai_analysis: {},
      },
      {
        id: 's2',
        status: 'completed',
        started_at: '2026-05-06T10:00:00.000Z',
        completed_at: '2026-05-06T10:30:00.000Z',
        title: 'Sesion anterior',
        ai_analysis: {},
      },
    ];

    expect(calculateStreak(sessions, reference)).toBe(2);
  });

  it('formatTimeAgo returns minutes for recent timestamps', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-07T12:00:00.000Z'));

    expect(formatTimeAgo('2026-05-07T11:30:00.000Z')).toBe('hace 30 min');
  });

  it('formatDisplayDate formats readable date', () => {
    const formatted = formatDisplayDate(new Date('2026-05-07T12:00:00.000Z'));
    expect(formatted.length).toBeGreaterThan(3);
  });
});
