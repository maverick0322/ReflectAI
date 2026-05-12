import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import DashboardPage from '@/app/(main)/dashboard/page';

vi.mock('@/components/icons/ProfileIcon', () => ({
  ProfileIcon: () => <svg data-testid="profile-icon" />,
}));
vi.mock('@/components/icons/ClockIcon', () => ({
  ClockIcon: () => <svg data-testid="clock-icon" />,
}));
vi.mock('@/components/icons/LightningIcon', () => ({
  LightningIcon: () => <svg data-testid="lightning-icon" />,
}));

const listSessionsMock = vi.fn();
const fetchProfileMock = vi.fn();
const fetchDailyQuoteMock = vi.fn();

vi.mock('@/lib/api/reflection', () => ({
  listReflectionSessions: () => listSessionsMock(),
}));

vi.mock('@/lib/api/profile', () => ({
  fetchProfile: () => fetchProfileMock(),
}));

vi.mock('@/lib/api/ai', () => ({
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
      responses: [{ id: 'Q1_SIT', text: 'Situacion parcial' }],
    },
    ai_analysis: {},
  },
  {
    id: 'completed-1',
    title: 'Sesion de prueba',
    status: 'completed',
    started_at: '2026-05-07T08:00:00.000Z',
    completed_at: '2026-05-07T08:30:00.000Z',
    ai_analysis: {
      primary_emotions: ['Ansiedad'],
      average_intensity: 8,
    },
  },
  {
    id: 'completed-2',
    title: 'Sesion anterior',
    status: 'completed',
    started_at: '2026-05-06T08:00:00.000Z',
    completed_at: '2026-05-06T08:30:00.000Z',
    ai_analysis: {
      primary_emotions: ['Calma'],
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
      text: 'Observa con calma antes de responder.',
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

describe('Dashboard Page Integration (Estado con Datos)', () => {
  it('debe renderizar el saludo al usuario y la fecha actual', async () => {
    render(<DashboardPage />);
    expect(await screen.findByText(/Arturo Cuevas/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^Hoy$/i })).toBeInTheDocument();
  });

  it('debe mostrar la alerta de sesion pausada condicional', async () => {
    render(<DashboardPage />);
    expect(await screen.findByText(/Tienes una reflexión pendiente/i)).toBeInTheDocument();
  });

  it('debe mostrar la racha y su mensaje dinamico para un usuario activo', async () => {
    render(<DashboardPage />);
    expect(await screen.findByText(/Racha de \d+ d[ií]as/i)).toBeInTheDocument();
    expect(screen.getByText(/(Excelente|perfecto para empezar)/i)).toBeInTheDocument();
  });

  it('debe renderizar la tarjeta de la ultima sesion cuando el backend manda datos', async () => {
    render(<DashboardPage />);
    expect(await screen.findByText(/Sesion de prueba/i)).toBeInTheDocument();
    expect(screen.getByText(/Ansiedad/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/Aún no has registrado ninguna reflexión/i),
    ).not.toBeInTheDocument();
  });

  it('debe mostrar la cita generada por IA cuando el backend la devuelve', async () => {
    render(<DashboardPage />);
    expect(await screen.findByText(/Observa con calma antes de responder/i)).toBeInTheDocument();
    expect(screen.getByText(/ReflectAI/i)).toBeInTheDocument();
  });
});
