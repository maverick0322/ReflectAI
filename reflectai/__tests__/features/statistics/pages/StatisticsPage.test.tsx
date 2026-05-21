import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import StatisticsPage from '@/app/(main)/statistics/page';

const listReflectionSessionsMock = vi.fn();

vi.mock('@/features/reflection/services/reflectionService', () => ({
  listReflectionSessions: () => listReflectionSessionsMock(),
}));

vi.mock('@/shared/icons/LightningIcon', () => ({
  LightningIcon: () => <svg data-testid="lightning-icon" />,
}));

describe('StatisticsPage', () => {
  it('renders the statistics shell with real aggregated data', async () => {
    listReflectionSessionsMock.mockResolvedValueOnce({
      data: [
        {
          id: 'session-high',
          title: 'Work conflict',
          status: 'completed',
          started_at: '2026-05-10T10:00:00.000Z',
          completed_at: '2026-05-10T10:20:00.000Z',
          payload: {
            metadata: { version: '1.1', started_at: '2026-05-10T10:00:00.000Z' },
            responses: [
              { id: 'Q1_SIT', text: 'Tension at work.' },
              { id: 'Q3_EMO', text: 'Anxiety' },
              { id: 'Q4_INT', value: 8 },
            ],
          },
          ai_analysis: {
            primary_emotions: ['Anxiety'],
            average_intensity: 8,
            key_themes: ['Work'],
            cognitive_distortion_detected: 'Mind reading',
          },
        },
        {
          id: 'session-low',
          title: 'Family discussion',
          status: 'completed',
          started_at: '2026-05-09T10:00:00.000Z',
          completed_at: '2026-05-09T10:20:00.000Z',
          payload: {
            metadata: { version: '1.1', started_at: '2026-05-09T10:00:00.000Z' },
            responses: [
              { id: 'Q1_SIT', text: 'Conversation at home.' },
              { id: 'Q3_EMO', text: 'Calm' },
              { id: 'Q4_INT', value: 4 },
            ],
          },
          ai_analysis: {
            primary_emotions: ['Calm'],
            average_intensity: 4,
            key_themes: ['Family'],
          },
        },
      ],
      message: 'ok',
    });

    const { container } = render(<StatisticsPage />);

    expect(
      await screen.findByRole('heading', { name: /mis estad(?:i|\u00ed)sticas/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/explora tus tendencias en 2 reflexiones completadas/i),
    ).toBeInTheDocument();
    expect(container.querySelector('main')).toHaveClass('max-w-lg');
  });

  it('shows the main statistics sections and aggregated values', async () => {
    listReflectionSessionsMock.mockResolvedValueOnce({
      data: [
        {
          id: 'session-high',
          title: 'Work conflict',
          status: 'completed',
          started_at: '2026-05-10T10:00:00.000Z',
          completed_at: '2026-05-10T10:20:00.000Z',
          payload: {
            metadata: { version: '1.1', started_at: '2026-05-10T10:00:00.000Z' },
            responses: [
              { id: 'Q1_SIT', text: 'Tension at work.' },
              { id: 'Q3_EMO', text: 'Anxiety' },
              { id: 'Q4_INT', value: 8 },
            ],
          },
          ai_analysis: {
            primary_emotions: ['Anxiety'],
            average_intensity: 8,
            key_themes: ['Work'],
            cognitive_distortion_detected: 'Mind reading',
          },
        },
        {
          id: 'session-low',
          title: 'Family discussion',
          status: 'completed',
          started_at: '2026-05-09T10:00:00.000Z',
          completed_at: '2026-05-09T10:20:00.000Z',
          payload: {
            metadata: { version: '1.1', started_at: '2026-05-09T10:00:00.000Z' },
            responses: [
              { id: 'Q1_SIT', text: 'Conversation at home.' },
              { id: 'Q3_EMO', text: 'Calm' },
              { id: 'Q4_INT', value: 4 },
            ],
          },
          ai_analysis: {
            primary_emotions: ['Calm'],
            average_intensity: 4,
            key_themes: ['Family'],
          },
        },
      ],
      message: 'ok',
    });

    render(<StatisticsPage />);

    expect(
      await screen.findByRole('heading', { name: /evoluci(?:o|\u00f3)n emocional/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /emociones frecuentes/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /temas frecuentes/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /comparar sesiones/i })).toBeInTheDocument();
    expect(screen.getByText(/work \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/mind reading/i)).toBeInTheDocument();
  });

  it('reveals the comparison result after the compare action', async () => {
    const user = userEvent.setup();
    listReflectionSessionsMock.mockResolvedValueOnce({
      data: [
        {
          id: 'session-high',
          title: 'Work conflict',
          status: 'completed',
          started_at: '2026-05-10T10:00:00.000Z',
          completed_at: '2026-05-10T10:20:00.000Z',
          payload: {
            metadata: { version: '1.1', started_at: '2026-05-10T10:00:00.000Z' },
            responses: [
              { id: 'Q1_SIT', text: 'Tension at work.' },
              { id: 'Q3_EMO', text: 'Anxiety' },
              { id: 'Q4_INT', value: 8 },
            ],
          },
          ai_analysis: {
            primary_emotions: ['Anxiety'],
            average_intensity: 8,
            key_themes: ['Work'],
          },
        },
        {
          id: 'session-low',
          title: 'Family discussion',
          status: 'completed',
          started_at: '2026-05-09T10:00:00.000Z',
          completed_at: '2026-05-09T10:20:00.000Z',
          payload: {
            metadata: { version: '1.1', started_at: '2026-05-09T10:00:00.000Z' },
            responses: [
              { id: 'Q1_SIT', text: 'Conversation at home.' },
              { id: 'Q3_EMO', text: 'Calm' },
              { id: 'Q4_INT', value: 4 },
            ],
          },
          ai_analysis: {
            primary_emotions: ['Calm'],
            average_intensity: 4,
            key_themes: ['Family'],
          },
        },
      ],
      message: 'ok',
    });
    render(<StatisticsPage />);

    expect(
      await screen.findByText(/selecciona dos sesiones y presiona comparar para ver el resultado/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /mostrar comparaci(?:o|\u00f3)n/i }));

    expect(screen.getByText(/80%/i)).toBeInTheDocument();
    expect(screen.getAllByText(/40%/i)).toHaveLength(1);
    expect(screen.getByText(/muestra una intensidad emocional mayor que/i)).toBeInTheDocument();
  });

  it('resets the comparison result when a selected session changes', async () => {
    const user = userEvent.setup();
    listReflectionSessionsMock.mockResolvedValueOnce({
      data: [
        {
          id: 'session-high',
          title: 'Work conflict',
          status: 'completed',
          started_at: '2026-05-10T10:00:00.000Z',
          completed_at: '2026-05-10T10:20:00.000Z',
          payload: {
            metadata: { version: '1.1', started_at: '2026-05-10T10:00:00.000Z' },
            responses: [
              { id: 'Q1_SIT', text: 'Tension at work.' },
              { id: 'Q3_EMO', text: 'Anxiety' },
              { id: 'Q4_INT', value: 8 },
            ],
          },
          ai_analysis: {
            primary_emotions: ['Anxiety'],
            average_intensity: 8,
            key_themes: ['Work'],
          },
        },
        {
          id: 'session-low',
          title: 'Family discussion',
          status: 'completed',
          started_at: '2026-05-09T10:00:00.000Z',
          completed_at: '2026-05-09T10:20:00.000Z',
          payload: {
            metadata: { version: '1.1', started_at: '2026-05-09T10:00:00.000Z' },
            responses: [
              { id: 'Q1_SIT', text: 'Conversation at home.' },
              { id: 'Q3_EMO', text: 'Calm' },
              { id: 'Q4_INT', value: 4 },
            ],
          },
          ai_analysis: {
            primary_emotions: ['Calm'],
            average_intensity: 4,
            key_themes: ['Family'],
          },
        },
      ],
      message: 'ok',
    });
    render(<StatisticsPage />);

    await screen.findByRole('button', { name: /mostrar comparaci(?:o|\u00f3)n/i });
    await user.click(screen.getByRole('button', { name: /mostrar comparaci(?:o|\u00f3)n/i }));
    expect(screen.getByText(/muestra una intensidad emocional mayor que/i)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/sesi(?:o|\u00f3)n a/i), 'session-low');

    expect(screen.getByText(/selecciona dos sesiones y presiona comparar/i)).toBeInTheDocument();
    expect(screen.queryByText(/muestra una intensidad emocional mayor que/i)).not.toBeInTheDocument();
  });

  it('shows an empty comparison state when there are not enough sessions', async () => {
    listReflectionSessionsMock.mockResolvedValueOnce({
      data: [],
      message: 'ok',
    });

    render(<StatisticsPage />);

    expect(
      await screen.findByText(
        /completa al menos dos sesiones para desbloquear la comparaci(?:o|\u00f3)n/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /mostrar comparaci(?:o|\u00f3)n/i }),
    ).toBeDisabled();
  });

  it('shows an error when the statistics request fails', async () => {
    listReflectionSessionsMock.mockRejectedValueOnce(new Error('db down'));

    render(<StatisticsPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /no se pudieron cargar tus estad(?:i|\u00ed)sticas/i,
    );
  });
});
