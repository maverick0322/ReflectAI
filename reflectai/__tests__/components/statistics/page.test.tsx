import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import EstadisticasPage from '@/app/(main)/estadisticas/page';

vi.mock('@/components/icons/LightningIcon', () => ({
  LightningIcon: () => <svg data-testid="lightning-icon" />,
}));

describe('Statistics Page', () => {
  it('renders the dashboard-style mobile container with dummy data notice', () => {
    const { container } = render(<EstadisticasPage />);

    expect(screen.getByRole('heading', { name: /Mis estadisticas/i })).toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent(/datos dummy/i);
    expect(container.querySelector('main')).toHaveClass('max-w-lg');
  });

  it('shows the main statistics sections and mock values prepared for backend wiring', () => {
    render(<EstadisticasPage />);

    expect(screen.getByRole('heading', { name: /Evolucion emocional/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Emociones frecuentes/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Temas frecuentes/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Comparar sesiones/i })).toBeInTheDocument();
    expect(screen.getByText(/Trabajo \(12\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Lectura de pensamiento/i)).toBeInTheDocument();
  });

  it('reveals the comparison placeholder result after the compare action', async () => {
    const user = userEvent.setup();

    render(<EstadisticasPage />);

    expect(
      screen.getByText(/Selecciona dos sesiones y presiona comparar/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Ver comparacion/i }));

    expect(screen.getByText(/80%/i)).toBeInTheDocument();
    expect(screen.getAllByText(/45%/i)).toHaveLength(2);
    expect(
      screen.getByText(/intensidad emocional mayor/i),
    ).toBeInTheDocument();
  });
});
