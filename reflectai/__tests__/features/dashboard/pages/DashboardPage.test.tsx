import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import DashboardPage from '@/app/(main)/dashboard/page';

vi.mock('@/shared/icons/ProfileIcon', () => ({
  ProfileIcon: () => <svg data-testid="profile-icon" />,
}));
vi.mock('@/shared/icons/ClockIcon', () => ({
  ClockIcon: () => <svg data-testid="clock-icon" />,
}));
vi.mock('@/shared/icons/LightningIcon', () => ({
  LightningIcon: () => <svg data-testid="lightning-icon" />,
}));

const listSessionsMock = vi.fn();
const fetchProfileMock = vi.fn();
const fetchDailyQuoteMock = vi.fn();

vi.mock('@/features/reflection/services/reflectionService', () => ({
  listReflectionSessions: () => listSessionsMock(),
}));

vi.mock('@/features/profile/services/profileService', () => ({
  fetchProfile: () => fetchProfileMock(),
}));

vi.mock('@/features/dashboard/services/aiService', () => ({
  fetchDailyQuote: () => fetchDailyQuoteMock(),
}));

const baseSessions = [
  {
    id: 'draft-1',
    title: null,
    status: 'draft',
    started_at: '2026-05-07T10:00:00.000Z',
    completed_at: null,
    payload: {
      metadata: {
        version: '1.1',
        started_at: '2026-05-07T10:00:00.000Z',
      },
      responses: [{ id: 'Q1_SIT', text: 'Partial situation' }],
    },
    ai_analysis: {},
  },
  {
    id: 'completed-1',
    title: 'Test session',
    status: 'completed',
    started_at: '2026-05-07T08:00:00.000Z',
    completed_at: '2026-05-07T08:30:00.000Z',
    ai_analysis: {
      primary_emotions: ['Anxiety'],
      average_intensity: 8,
    },
  },
  {
    id: 'completed-2',
    title: 'Previous session',
    status: 'completed',
    started_at: '2026-05-06T08:00:00.000Z',
    completed_at: '2026-05-06T08:30:00.000Z',
    ai_analysis: {
      primary_emotions: ['Calm'],
      average_intensity: 4,
    },
  },
];

beforeEach(() => {
  listSessionsMock.mockResolvedValue({ data: baseSessions, message: 'ok' });
  fetchProfileMock.mockResolvedValue({
    data: {
      full_name: 'Arturo Cuevas',
      avatar_url: null,
    },
    message: 'ok',
  });
  fetchDailyQuoteMock.mockResolvedValue({
    data: {
      text: 'Observe calmly before responding.',
      author: 'ReflectAI',
      aiGenerated: true,
    },
    message: 'ok',
  });
});

afterEach(() => {
  listSessionsMock.mockReset();
  fetchProfileMock.mockReset();
  fetchDailyQuoteMock.mockReset();
});

describe('DashboardPage', () => {
  it('renders the greeting and current date header', async () => {
    render(<DashboardPage />);

    expect(await screen.findByText(/arturo cuevas/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^hoy$/i })).toBeInTheDocument();
  });

  it('shows the paused reflection alert when a recoverable draft exists', async () => {
    render(<DashboardPage />);

    expect(
      await screen.findByText(/tienes una reflexi(?:o|\u00f3)n en pausa/i),
    ).toBeInTheDocument();
  });

  it('shows the streak and its dynamic message', async () => {
    render(<DashboardPage />);

    expect(await screen.findByText(/racha de \d+ d(?:i|\u00ed)as/i)).toBeInTheDocument();
    expect(screen.getByText(/excelente|gran d(?:i|\u00ed)a para comenzar/i)).toBeInTheDocument();
  });

  it('renders the latest session card when data exists', async () => {
    render(<DashboardPage />);

    expect(await screen.findByText(/test session/i)).toBeInTheDocument();
    expect(screen.getByText(/ansiedad/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/a(?:u|\u00fa)n no has registrado ninguna reflexi(?:o|\u00f3)n/i),
    ).not.toBeInTheDocument();
  });

  it('shows the AI daily quote when available', async () => {
    render(<DashboardPage />);

    expect(await screen.findByText(/observe calmly before responding/i)).toBeInTheDocument();
    expect(screen.getByText(/reflectai/i)).toBeInTheDocument();
  });

  it('keeps the default quote when the AI request fails', async () => {
    fetchDailyQuoteMock.mockRejectedValueOnce(new Error('quote unavailable'));
    render(<DashboardPage />);

    expect(
      await screen.findByText(/reflexionar es el camino hacia el dominio propio/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/marco aurelio/i)).toBeInTheDocument();
  });

  it('shows an error when the dashboard load fails', async () => {
    listSessionsMock.mockRejectedValueOnce(new Error('db down'));
    render(<DashboardPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /no se pudo cargar el panel principal/i,
    );
  });
});
