import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import EstadisticasPage from '@/app/(main)/estadisticas/page';

vi.mock('@/components/icons/LightningIcon', () => ({
  LightningIcon: () => <svg data-testid="lightning-icon" />,
}));

const listSessionsMock = vi.fn();

vi.mock('@/lib/api/reflection', () => ({
  listReflectionSessions: () => listSessionsMock(),
}));

const baseSessions = [
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
];

beforeEach(() => {
  listSessionsMock.mockResolvedValue({
    data: baseSessions,
    message: 'ok',
  });
});

afterEach(() => {
  listSessionsMock.mockReset();
});

describe('Statistics Page', () => {
  it('renders the dashboard-style mobile container without dummy data notice', async () => {
    const { container } = render(<EstadisticasPage />);

    expect(screen.getByRole('heading', { name: /Mis estadisticas/i })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: /Evolucion emocional/i })).toBeInTheDocument();
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
    expect(container.querySelector('main')).toHaveClass('max-w-lg');
  });

  it('shows the main statistics sections with API-derived values', async () => {
    render(<EstadisticasPage />);

    expect(await screen.findByRole('heading', { name: /Evolucion emocional/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Emociones frecuentes/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Temas frecuentes/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Comparar sesiones/i })).toBeInTheDocument();
    expect(screen.getByText(/Trabajo \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Lectura de pensamiento/i)).toBeInTheDocument();
  });

  it('reveals the real comparison result after the compare action', async () => {
    const user = userEvent.setup();

    render(<EstadisticasPage />);

    expect(
      await screen.findByText(/Selecciona dos sesiones y presiona comparar/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Ver comparacion/i }));

    expect(screen.getByText(/80%/i)).toBeInTheDocument();
    expect(screen.getAllByText(/40%/i).length).toBeGreaterThan(0);
    expect(
      screen.getByText(/40% mas intensidad emocional/i),
    ).toBeInTheDocument();
  });
});
