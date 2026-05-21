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
  return screen.findByPlaceholderText(/escribe aqu(?:i|\u00ed)/i);
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

describe('New feature regression - version 2026-05-19', () => {
  it('RG-01 preserves the grounding flow for high intensity and completes the session', async () => {
    const user = userEvent.setup();
    await renderWizard();

    await user.type(
      screen.getByPlaceholderText(/escribe aqu(?:i|\u00ed)/i),
      'Tuve una conversación difícil en el trabajo.',
    );
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    await user.type(
      screen.getByPlaceholderText(/me dije a m(?:i|\u00ed) mismo que/i),
      'Siento que no estan tomando en serio mi esfuerzo.',
    );
    await user.click(screen.getByRole('button', { name: 'Enojo' }));
    fireEvent.change(screen.getByRole('slider'), { target: { value: '9' } });
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    expect(
      await screen.findByText(/la emoci(?:o|\u00f3)n se siente muy intensa en este momento/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /estoy listo para continuar/i }));

    await user.type(
      screen.getByPlaceholderText(
        /creo que esta emoci(?:o|\u00f3)n estaba intentando/i,
      ),
      'Proteger mis limites.',
    );
    await user.type(
      screen.getByPlaceholderText(/mis acciones, mis palabras, mis l(?:i|\u00ed)mites/i),
      'Mi tono y mi pausa.',
    );
    await user.type(
      screen.getByPlaceholderText(/sus reacciones, sus decisiones, el contexto/i),
      'La respuesta de la otra persona.',
    );
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    await user.type(
      screen.getByPlaceholderText(/una perspectiva alternativa podr(?:i|\u00ed)a ser/i),
      'Puedo responder con calma y pedir claridad.',
    );
    await user.click(screen.getByRole('button', { name: /finalizar reflexi(?:o|\u00f3)n/i }));

    expect(await screen.findByText(/reflexi(?:o|\u00f3)n guardada/i)).toBeInTheDocument();
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

    expect(
      await screen.findByText(/tienes una reflexi(?:o|\u00f3)n en pausa/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continuar sesi(?:o|\u00f3)n/i })).toHaveAttribute(
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
    expect(
      screen.queryByText(/tienes una reflexi(?:o|\u00f3)n en pausa/i),
    ).not.toBeInTheDocument();
  });

  it('RG-05 resumes an in-progress draft and continues with the original sessionId', async () => {
    const user = userEvent.setup();
    useSearchParamsMock.mockReturnValue(new URLSearchParams(`sessionId=${SESSION_ID}`));
    getReflectionSessionMock.mockResolvedValueOnce(
      buildSessionResponse({
        payload: {
          metadata: {
            version: '1.1',
            started_at: STARTED_AT,
            resume_step: 4,
          },
          responses: [
            { id: 'Q1_SIT', text: 'A tense meeting' },
            { id: 'Q2_THO', text: 'They do not value my work' },
            { id: 'Q3_EMO', text: 'Anger' },
            { id: 'Q4_INT', value: 7 },
          ],
        },
      }),
    );

    render(<NewSessionPage />);

    expect(
      await screen.findByPlaceholderText(
        /creo que esta emoci(?:o|\u00f3)n estaba intentando/i,
      ),
    ).toBeInTheDocument();
    expect(createReflectionSessionMock).not.toHaveBeenCalled();
    expect(requestNextQuestionMock).toHaveBeenCalledWith(SESSION_ID, [
      'Q5_TEL',
      'Q6_CON_MINE',
      'Q6_CON_OTHERS',
    ]);

    await user.type(
      screen.getByPlaceholderText(
        /creo que esta emoci(?:o|\u00f3)n estaba intentando/i,
      ),
      'Estaba intentando proteger mis limites.',
    );
    await user.type(
      screen.getByPlaceholderText(/mis acciones, mis palabras, mis l(?:i|\u00ed)mites/i),
      'Puedo pausar antes de responder.',
    );
    await user.type(
      screen.getByPlaceholderText(/sus reacciones, sus decisiones, el contexto/i),
      'Sus reacciones no dependen de mi.',
    );
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    expect(
      await screen.findByPlaceholderText(/una perspectiva alternativa podr(?:i|\u00ed)a ser/i),
    ).toBeInTheDocument();
    expect(addReflectionResponseMock).toHaveBeenCalledWith(
      SESSION_ID,
      expect.objectContaining({
        id: 'Q5_TEL',
        text: 'Estaba intentando proteger mis limites.',
      }),
      undefined,
    );
  });
});
