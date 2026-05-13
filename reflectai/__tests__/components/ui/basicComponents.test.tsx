import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SessionCard } from '@/components/dashboard/SessionCard';
import BottomNav from '@/components/ui/BottomNav';
import SocialButton from '@/components/ui/SocialButton';

vi.mock('@/components/icons/HomeIcon', () => ({
  HomeIcon: () => <svg data-testid="home-icon" />,
}));
vi.mock('@/components/icons/PlusIcon', () => ({
  PlusIcon: () => <svg data-testid="plus-icon" />,
}));
vi.mock('@/components/icons/ClockIcon', () => ({
  ClockIcon: () => <svg data-testid="clock-icon" />,
}));
vi.mock('@/components/icons/ChartIcon', () => ({
  ChartIcon: () => <svg data-testid="chart-icon" />,
}));
vi.mock('@/components/icons/HelpIcon', () => ({
  HelpIcon: () => <svg data-testid="help-icon" />,
}));
vi.mock('@/components/icons/CalendarIcon', () => ({
  CalendarIcon: () => <svg data-testid="calendar-icon" />,
}));

describe('componentes UI basicos', () => {
  it('BottomNav expone enlaces principales', () => {
    render(<BottomNav />);

    expect(screen.getByLabelText('Inicio')).toHaveAttribute('href', '/dashboard');
    expect(screen.getByLabelText('Historial')).toHaveAttribute('href', '/historial');
    expect(screen.getByLabelText('Nueva sesión')).toHaveAttribute('href', '/nueva-sesion');
    expect(screen.getByLabelText('Estadísticas')).toHaveAttribute('href', '/estadisticas');
    expect(screen.getByLabelText('Ayuda')).toHaveAttribute('href', '/ayuda');
  });

  it('SocialButton renderiza provider, icono y estado deshabilitado', () => {
    render(<SocialButton provider="Google" icon={<span data-testid="icono" />} disabled />);

    expect(screen.getByRole('button', { name: /Google/i })).toBeDisabled();
    expect(screen.getByTestId('icono')).toBeInTheDocument();
  });

  it('SessionCard muestra resumen de una sesion', () => {
    render(
      <SessionCard
        session={{
          id: 'session-1',
          title: 'Reflexion breve',
          date: '2026-05-07',
          mood: 'Calma',
        }}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Reflexion breve' })).toBeInTheDocument();
    expect(screen.getByText('Calma')).toBeInTheDocument();
    expect(screen.getByText('2026-05-07')).toHaveAttribute('dateTime', '2026-05-07');
  });
});
