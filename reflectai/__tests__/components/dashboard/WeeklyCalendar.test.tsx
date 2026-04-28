import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { WeeklyCalendar } from '@/components/dashboard/WeeklyCalendar';
import type { DayRecord } from '@/types/dashboard';

const mockWeekDays: DayRecord[] = [
  { date: "2026-04-13", label: "L", num: 13, isToday: false, isFuture: false, hasSessions: false },
  { date: "2026-04-14", label: "M", num: 14, isToday: false, isFuture: false, hasSessions: true }, // Día con sesión (violeta)
  { date: "2026-04-15", label: "M", num: 15, isToday: true, isFuture: false, hasSessions: false }, // Hoy sin sesión (Borde)
];

describe('WeeklyCalendar (Camino A - Visual)', () => {
  it('debe renderizar las etiquetas de los días', () => {
    render(<WeeklyCalendar weekDays={mockWeekDays} />);
    expect(screen.getByText('L')).toBeInTheDocument();
    expect(screen.getByText('13')).toBeInTheDocument();
  });

  it('debe colorear de violeta los días que tienen sesiones (hasSessions: true)', () => {
    render(<WeeklyCalendar weekDays={mockWeekDays} />);
    
    const sessionDay = screen.getByText('14').closest('div');
    expect(sessionDay).toHaveClass('bg-violet-500');
    expect(sessionDay).toHaveClass('text-white');
  });

  it('debe colocar un borde al día actual si no tiene sesiones', () => {
    render(<WeeklyCalendar weekDays={mockWeekDays} />);
    
    const today = screen.getByText('15').closest('div');
    expect(today).toHaveClass('border-2');
    expect(today).toHaveClass('border-violet-500');
  });
});