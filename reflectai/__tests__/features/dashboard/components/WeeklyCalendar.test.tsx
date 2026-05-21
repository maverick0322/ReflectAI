import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { WeeklyCalendar } from '@/features/dashboard/components/WeeklyCalendar';
import type { DayRecord } from '@/features/dashboard/types/dashboard';

const mockWeekDays: DayRecord[] = [
  { date: '2026-04-13', label: 'M', num: 13, isToday: false, isFuture: false, hasSessions: false },
  { date: '2026-04-14', label: 'T', num: 14, isToday: false, isFuture: false, hasSessions: true },
  { date: '2026-04-15', label: 'W', num: 15, isToday: true, isFuture: false, hasSessions: false },
];

describe('WeeklyCalendar', () => {
  it('renders day labels', () => {
    render(<WeeklyCalendar weekDays={mockWeekDays} />);

    expect(screen.getByText('M')).toBeInTheDocument();
    expect(screen.getByText('13')).toBeInTheDocument();
  });

  it('colors days that have sessions', () => {
    render(<WeeklyCalendar weekDays={mockWeekDays} />);

    const sessionDay = screen.getByText('14').closest('div');
    expect(sessionDay).toHaveClass('bg-violet-500');
    expect(sessionDay).toHaveClass('text-white');
  });

  it('adds a border to the current day when it has no sessions', () => {
    render(<WeeklyCalendar weekDays={mockWeekDays} />);

    const today = screen.getByText('15').closest('div');
    expect(today).toHaveClass('border-2');
    expect(today).toHaveClass('border-violet-500');
  });
});
