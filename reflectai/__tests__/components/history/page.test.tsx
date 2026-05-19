import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import HistorialPage from '@/app/(main)/historial/page';

vi.mock('@/components/icons/SearchIcon', () => ({
  SearchIcon: () => <svg data-testid="search-icon" />,
}));

const listSessionsMock = vi.fn();

vi.mock('@/lib/api/reflection', () => ({
  listReflectionSessions: () => listSessionsMock(),
}));

const baseSessions = [
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
        { id: 'Q4_INT', value: 8 },
      ],
    },
    ai_analysis: {
      primary_emotions: ['Ansiedad'],
      average_intensity: 8,
    },
  },
  {
    id: 'completed-2',
    title: 'Conversacion familiar',
    status: 'completed',
    started_at: '2026-04-12T20:10:00.000Z',
    completed_at: '2026-04-12T20:30:00.000Z',
    payload: {
      metadata: { version: '1.1', started_at: '2026-04-12T20:10:00.000Z' },
      responses: [
        { id: 'Q1_SIT', text: 'Conversacion dificil con mi familia.' },
        { id: 'Q3_EMO', text: 'Frustracion' },
      ],
    },
    ai_analysis: {},
  },
  {
    id: 'draft-1',
    title: 'Borrador',
    status: 'draft',
    started_at: '2026-04-10T20:10:00.000Z',
    completed_at: null,
    payload: {
      metadata: { version: '1.1', started_at: '2026-04-10T20:10:00.000Z' },
      responses: [{ id: 'Q1_SIT', text: 'Pendiente' }],
    },
    ai_analysis: {},
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

describe('History Page', () => {
  it('renders the mobile-first history shell with real completed count', async () => {
    const { container } = render(<HistorialPage />);

    expect(screen.getByRole('heading', { name: /Mi Historial/i })).toBeInTheDocument();
    expect(
      await screen.findByText(/Has completado 2 sesiones de reflexion/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
    expect(container.querySelector('main')).toHaveClass('max-w-lg');
  });

  it('shows the search input and grouped timeline cards from API sessions', async () => {
    render(<HistorialPage />);

    expect(screen.getByLabelText(/Buscar en historial/i)).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: /Abril de 2026/i })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Entrega de proyecto/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/^Ansiedad$/i)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Borrador/i })).not.toBeInTheDocument();
  });

  it('filters history entries by search query', async () => {
    const user = userEvent.setup();
    render(<HistorialPage />);

    await screen.findByRole('heading', { name: /Entrega de proyecto/i });
    await user.type(screen.getByLabelText(/Buscar en historial/i), 'familia');

    expect(screen.getByRole('heading', { name: /Conversacion familiar/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Entrega de proyecto/i })).not.toBeInTheDocument();
  });
});
