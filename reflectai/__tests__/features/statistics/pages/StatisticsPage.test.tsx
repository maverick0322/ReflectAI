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

    expect(await screen.findByRole('heading', { name: /my statistics/i })).toBeInTheDocument();
    expect(
      screen.getByText(/explore your trends across 2 completed reflections/i),
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

    expect(await screen.findByRole('heading', { name: /emotional evolution/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /frequent emotions/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /frequent topics/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /compare sessions/i })).toBeInTheDocument();
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
      await screen.findByText(/select two sessions and press compare to view the result/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /show comparison/i }));

    expect(screen.getByText(/80%/i)).toBeInTheDocument();
    expect(screen.getAllByText(/40%/i)).toHaveLength(1);
    expect(screen.getByText(/shows higher emotional intensity/i)).toBeInTheDocument();
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

    await screen.findByRole('button', { name: /show comparison/i });
    await user.click(screen.getByRole('button', { name: /show comparison/i }));
    expect(screen.getByText(/shows higher emotional intensity/i)).toBeInTheDocument();

    await user.selectOptions(
      screen.getByLabelText('Session A'),
      'session-low',
    );

    expect(
      screen.getByText(/select two sessions and press compare/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/shows higher emotional intensity/i))
      .not.toBeInTheDocument();
  });

  it('shows an empty comparison state when there are not enough sessions', async () => {
    listReflectionSessionsMock.mockResolvedValueOnce({
      data: [],
      message: 'ok',
    });

    render(<StatisticsPage />);

    expect(
      await screen.findByText(/complete at least two sessions to unlock the comparison/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show comparison/i })).toBeDisabled();
  });

  it('shows an error when the statistics request fails', async () => {
    listReflectionSessionsMock.mockRejectedValueOnce(new Error('db down'));

    render(<StatisticsPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /unable to load your statistics/i,
    );
  });
});
