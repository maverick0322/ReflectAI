import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import DashboardPage from '@/app/(main)/dashboard/page';
import NewSessionPage from '@/app/new-session/page';

const {
  addReflectionResponseMock,
  completeReflectionSessionMock,
  createReflectionSessionMock,
  fetchDailyQuoteMock,
  fetchProfileMock,
  getReflectionSessionMock,
  listReflectionSessionsMock,
  requestNextQuestionMock,
  routerMock,
  useSearchParamsMock,
} = vi.hoisted(() => ({
  addReflectionResponseMock: vi.fn(),
  completeReflectionSessionMock: vi.fn(),
  createReflectionSessionMock: vi.fn(),
  fetchDailyQuoteMock: vi.fn(),
  fetchProfileMock: vi.fn(),
  getReflectionSessionMock: vi.fn(),
  listReflectionSessionsMock: vi.fn(),
  requestNextQuestionMock: vi.fn(),
  routerMock: {
    back: vi.fn(),
    push: vi.fn(),
  },
  useSearchParamsMock: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => routerMock,
  useSearchParams: () => useSearchParamsMock(),
}));

vi.mock('@/shared/icons/ClockIcon', () => ({
  ClockIcon: () => <svg data-testid="clock-icon" />,
}));

vi.mock('@/shared/icons/LightningIcon', () => ({
  LightningIcon: () => <svg data-testid="lightning-icon" />,
}));

vi.mock('@/shared/icons/ProfileIcon', () => ({
  ProfileIcon: () => <svg data-testid="profile-icon" />,
}));

vi.mock('@/features/dashboard/services/aiService', () => ({
  fetchDailyQuote: () => fetchDailyQuoteMock(),
}));

vi.mock('@/features/profile/services/profileService', () => ({
  fetchProfile: () => fetchProfileMock(),
}));

vi.mock('@/features/reflection/services/reflectionService', () => ({
  addReflectionResponse: (...args: unknown[]) => addReflectionResponseMock(...args),
  completeReflectionSession: (...args: unknown[]) => completeReflectionSessionMock(...args),
  createReflectionSession: (...args: unknown[]) => createReflectionSessionMock(...args),
  getReflectionSession: (...args: unknown[]) => getReflectionSessionMock(...args),
  listReflectionSessions: () => listReflectionSessionsMock(),
  requestNextQuestion: (...args: unknown[]) => requestNextQuestionMock(...args),
}));

const SESSION_ID = 'session-regression-1';
const STARTED_AT = '2026-05-12T10:00:00.000Z';

function buildSessionResponse(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      id: SESSION_ID,
      title: null,
      status: 'draft',
      started_at: STARTED_AT,
      completed_at: null,
      payload: {
        metadata: {
          version: '1.1',
          started_at: STARTED_AT,
        },
        responses: [],
      },
      ai_analysis: {},
      ...overrides,
    },
    message: 'ok',
  };
}

function buildCompletedResponse() {
  return buildSessionResponse({
    title: 'Pause before a difficult conversation',
    status: 'completed',
    completed_at: '2026-05-12T10:30:00.000Z',
    ai_analysis: {
      summary: 'Regression summary',
      recommendation: 'Regression recommendation',
      encouraging_message: 'Encouraging message',
      professional_support_reminder:
        'Consult a professional if the discomfort persists.',
    },
  });
}

async function renderWizard() {
  render(<NewSessionPage />);
  return screen.findByPlaceholderText(/write here/i);
}

beforeEach(() => {
  vi.clearAllMocks();
  useSearchParamsMock.mockReturnValue(new URLSearchParams());
  createReflectionSessionMock.mockResolvedValue(buildSessionResponse());
  getReflectionSessionMock.mockResolvedValue(buildSessionResponse());
  addReflectionResponseMock.mockResolvedValue(buildSessionResponse());
  completeReflectionSessionMock.mockResolvedValue(buildCompletedResponse());
  requestNextQuestionMock.mockResolvedValue({ data: { done: true }, message: 'ok' });
  fetchProfileMock.mockResolvedValue({
    data: {
      full_name: 'Ana Lopez',
      avatar_url: null,
    },
    message: 'ok',
  });
  fetchDailyQuoteMock.mockResolvedValue({
    data: {
      text: 'Breathe before responding.',
      author: 'ReflectAI',
      aiGenerated: true,
    },
    message: 'ok',
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('New feature regression - version 2026-05-12', () => {
  it('RG-01 preserves the grounding flow for high intensity and completes the session', async () => {
    const user = userEvent.setup();
    await renderWizard();

    await user.type(
      screen.getByPlaceholderText(/write here/i),
      'I had a difficult conversation at work.',
    );
    await user.click(screen.getByRole('button', { name: /^next$/i }));

    await user.type(
      screen.getByPlaceholderText(/i told myself that/i),
      'My effort is not being taken seriously.',
    );
    await user.click(screen.getByRole('button', { name: 'Anger' }));
    fireEvent.change(screen.getByRole('slider'), { target: { value: '9' } });
    await user.click(screen.getByRole('button', { name: /^next$/i }));

    expect(await screen.findByText(/emotion feels very intense right now/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /i am ready to continue/i }));

    await user.type(
      screen.getByPlaceholderText(/i think this emotion was trying to/i),
      'Protect my boundaries.',
    );
    await user.type(
      screen.getByPlaceholderText(/my actions, my words, my boundaries/i),
      'My tone and my pause.',
    );
    await user.type(
      screen.getByPlaceholderText(/their reactions, their choices, the context/i),
      'The other person response.',
    );
    await user.click(screen.getByRole('button', { name: /^next$/i }));

    await user.type(
      screen.getByPlaceholderText(/an alternative perspective could be/i),
      'I can respond calmly and ask for clarity.',
    );
    await user.click(screen.getByRole('button', { name: /finish reflection/i }));

    expect(await screen.findByText(/reflection saved/i)).toBeInTheDocument();
    expect(createReflectionSessionMock).toHaveBeenCalledTimes(1);
    expect(addReflectionResponseMock).toHaveBeenCalledWith(
      SESSION_ID,
      expect.objectContaining({ id: 'SYS_GROUNDING', method: 'box_breathing' }),
      expect.objectContaining({
        flags: ['high_intensity_triggered', 'grounding_completed'],
        grounding_duration_seconds: expect.any(Number),
      }),
    );
    expect(completeReflectionSessionMock).toHaveBeenCalledWith(
      SESSION_ID,
      expect.objectContaining({
        metadataPatch: expect.objectContaining({
          flags: ['high_intensity_triggered', 'grounding_completed'],
          grounding_duration_seconds: expect.any(Number),
        }),
      }),
    );
  }, 10000);

  it('RG-02 does not reopen completed sessions when resume is requested from the URL', async () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams(`sessionId=${SESSION_ID}`));
    getReflectionSessionMock.mockResolvedValueOnce(
      buildSessionResponse({
        status: 'completed',
        completed_at: '2026-05-12T11:00:00.000Z',
      }),
    );

    render(<NewSessionPage />);

    await waitFor(() => {
      expect(routerMock.push).toHaveBeenCalledWith('/dashboard');
    });
    expect(createReflectionSessionMock).not.toHaveBeenCalled();
  });

  it('RG-03 shows the recoverable draft alert and preserves the sessionId', async () => {
    listReflectionSessionsMock.mockResolvedValue({
      data: [
        {
          id: 'draft-new',
          title: null,
          status: 'draft',
          started_at: '2026-05-12T12:00:00.000Z',
          completed_at: null,
          payload: {
            metadata: { version: '1.1', started_at: '2026-05-12T12:00:00.000Z' },
            responses: [{ id: 'Q1_SIT', text: 'Draft with progress' }],
          },
          ai_analysis: {},
        },
        {
          id: 'completed-old',
          title: 'Closed session',
          status: 'completed',
          started_at: '2026-05-11T09:00:00.000Z',
          completed_at: '2026-05-11T09:20:00.000Z',
          ai_analysis: {
            primary_emotions: ['Calm'],
            average_intensity: 4,
          },
        },
      ],
      message: 'ok',
    });

    render(<DashboardPage />);

    expect(await screen.findByText(/you have a paused reflection/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue session/i })).toHaveAttribute(
      'href',
      '/new-session?sessionId=draft-new',
    );
  });

  it('RG-04 hides empty drafts or drafts older than the latest completed session', async () => {
    listReflectionSessionsMock.mockResolvedValue({
      data: [
        {
          id: 'completed-new',
          title: 'Recent completed session',
          status: 'completed',
          started_at: '2026-05-12T14:00:00.000Z',
          completed_at: '2026-05-12T14:20:00.000Z',
          ai_analysis: {
            primary_emotions: ['Calm'],
            average_intensity: 5,
          },
        },
        {
          id: 'draft-empty',
          title: null,
          status: 'draft',
          started_at: '2026-05-12T15:00:00.000Z',
          completed_at: null,
          payload: {
            metadata: { version: '1.1', started_at: '2026-05-12T15:00:00.000Z' },
            responses: [],
          },
          ai_analysis: {},
        },
        {
          id: 'draft-old',
          title: null,
          status: 'draft',
          started_at: '2026-05-11T08:00:00.000Z',
          completed_at: null,
          payload: {
            metadata: { version: '1.1', started_at: '2026-05-11T08:00:00.000Z' },
            responses: [{ id: 'Q1_SIT', text: 'Old draft' }],
          },
          ai_analysis: {},
        },
      ],
      message: 'ok',
    });

    render(<DashboardPage />);

    expect(await screen.findByText(/recent completed session/i)).toBeInTheDocument();
    expect(screen.queryByText(/you have a paused reflection/i)).not.toBeInTheDocument();
  });
});
