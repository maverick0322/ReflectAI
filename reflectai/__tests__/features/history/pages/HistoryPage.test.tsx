import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import HistoryPage from '@/app/(main)/history/page';

const listReflectionSessionsMock = vi.fn();

vi.mock('@/features/reflection/services/reflectionService', () => ({
  listReflectionSessions: () => listReflectionSessionsMock(),
}));

vi.mock('@/shared/icons/SearchIcon', () => ({
  SearchIcon: () => <svg data-testid="search-icon" />,
}));

describe('HistoryPage', () => {
  it('renders the grouped history from reflection sessions', async () => {
    listReflectionSessionsMock.mockResolvedValueOnce({
      data: [
        {
          id: 'session-1',
          title: 'Anxiety before a project deadline',
          status: 'completed',
          started_at: '2026-04-15T10:00:00.000Z',
          completed_at: '2026-04-15T10:30:00.000Z',
          payload: {
            metadata: { version: '1.1', started_at: '2026-04-15T10:00:00.000Z' },
            responses: [
              { id: 'Q1_SIT', text: 'Worry about meeting a deadline.' },
              { id: 'Q3_EMO', text: 'Anxiety' },
            ],
          },
          ai_analysis: {},
        },
      ],
      message: 'ok',
    });

    const { container } = render(<HistoryPage />);

    expect(await screen.findByRole('heading', { name: /mi historial/i })).toBeInTheDocument();
    expect(screen.getByText(/has completado 1 sesiones de reflexión/i)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /anxiety before a project deadline/i }),
    ).toBeInTheDocument();
    expect(container.querySelector('main')).toHaveClass('max-w-lg');
  });

  it('filters the grouped cards with the search input', async () => {
    const user = userEvent.setup();
    listReflectionSessionsMock.mockResolvedValueOnce({
      data: [
        {
          id: 'session-1',
          title: 'Anxiety before a project deadline',
          status: 'completed',
          started_at: '2026-04-15T10:00:00.000Z',
          completed_at: '2026-04-15T10:30:00.000Z',
          payload: {
            metadata: { version: '1.1', started_at: '2026-04-15T10:00:00.000Z' },
            responses: [
              { id: 'Q1_SIT', text: 'Worry about meeting a deadline.' },
              { id: 'Q3_EMO', text: 'Anxiety' },
            ],
          },
          ai_analysis: {},
        },
        {
          id: 'session-2',
          title: 'Family discussion',
          status: 'completed',
          started_at: '2026-04-12T20:00:00.000Z',
          completed_at: '2026-04-12T20:10:00.000Z',
          payload: {
            metadata: { version: '1.1', started_at: '2026-04-12T20:00:00.000Z' },
            responses: [
              { id: 'Q1_SIT', text: 'Conversation with my family.' },
              { id: 'Q3_EMO', text: 'Frustration' },
            ],
          },
          ai_analysis: {},
        },
      ],
      message: 'ok',
    });

    render(<HistoryPage />);

    expect(await screen.findByLabelText(/buscar en el historial/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /abril de 2026/i })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /anxiety before a project deadline/i }),
    ).toBeInTheDocument();

    await user.type(screen.getByRole('searchbox', { name: /buscar en el historial/i }), 'family');

    expect(
      screen.queryByRole('heading', {
        name: /anxiety before a project deadline/i,
      }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /family discussion/i })).toBeInTheDocument();
  });

  it('shows an empty message when no sessions match the search', async () => {
    const user = userEvent.setup();
    listReflectionSessionsMock.mockResolvedValueOnce({
      data: [
        {
          id: 'session-1',
          title: 'Anxiety before a project deadline',
          status: 'completed',
          started_at: '2026-04-15T10:00:00.000Z',
          completed_at: '2026-04-15T10:30:00.000Z',
          payload: {
            metadata: { version: '1.1', started_at: '2026-04-15T10:00:00.000Z' },
            responses: [{ id: 'Q1_SIT', text: 'Worry about meeting a deadline.' }],
          },
          ai_analysis: {},
        },
      ],
      message: 'ok',
    });

    render(<HistoryPage />);

    await screen.findByRole('heading', { name: /anxiety before a project deadline/i });
    await user.type(screen.getByRole('searchbox', { name: /buscar en el historial/i }), 'health');

    expect(
      screen.getByText(/ninguna reflexión completada coincide con tu búsqueda/i),
    ).toBeInTheDocument();
  });

  it('shows an error when the history request fails', async () => {
    listReflectionSessionsMock.mockRejectedValueOnce(new Error('db down'));

    render(<HistoryPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/no se pudo cargar tu historial/i);
  });
});
