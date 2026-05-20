import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import NewSessionPage from '@/app/new-session/page';
import type { ReflectionSessionPayload, SessionResponse } from '@/features/reflection/types/reflection';

interface ReflectionResponseShape {
  data: {
    id: string;
    title: string;
    status: string;
    started_at: string;
    completed_at: null;
    payload: ReflectionSessionPayload;
    ai_analysis: {
      summary: string;
      recommendation: string;
      encouraging_message: string;
      professional_support_reminder: string;
    };
  };
  message: string;
}

const {
  addReflectionResponseMock,
  completeReflectionSessionMock,
  createReflectionSessionMock,
  getReflectionSessionMock,
  routerMock,
  useSearchParamsMock,
} = vi.hoisted(() => {
  const baseResponse = {
    data: {
      id: 'session-1',
      title: 'Test session',
      status: 'draft',
      started_at: '2026-05-07T10:00:00.000Z',
      completed_at: null,
      payload: {
        metadata: {
          version: '1.1',
          started_at: '2026-05-07T10:00:00.000Z',
        },
        responses: [] as SessionResponse[],
      },
      ai_analysis: {
        summary: 'Generated summary',
        recommendation: 'Generated recommendation',
        encouraging_message: 'Encouraging message',
        professional_support_reminder:
          'The best next step is to consult a professional if discomfort persists.',
      },
    },
    message: 'ok',
  } satisfies ReflectionResponseShape;

  return {
    createReflectionSessionMock: vi.fn(async (...args: unknown[]) => {
      void args;
      return baseResponse;
    }),
    getReflectionSessionMock: vi.fn(async (...args: unknown[]) => {
      void args;
      return baseResponse;
    }),
    addReflectionResponseMock: vi.fn(async (...args: unknown[]) => {
      void args;
      return baseResponse;
    }),
    completeReflectionSessionMock: vi.fn(async (...args: unknown[]) => {
      void args;
      return baseResponse;
    }),
    useSearchParamsMock: vi.fn(() => new URLSearchParams()),
    routerMock: {
      push: vi.fn(),
      back: vi.fn(),
    },
  };
});

vi.mock('next/navigation', () => ({
  useRouter: () => routerMock,
  useSearchParams: () => useSearchParamsMock(),
}));

vi.mock('@/features/reflection/services/reflectionService', () => ({
  createReflectionSession: () => createReflectionSessionMock(),
  getReflectionSession: (sessionId: string) => getReflectionSessionMock(sessionId),
  requestNextQuestion: vi.fn(async () => ({
    data: { done: true },
  })),
  addReflectionResponse: (
    sessionId: string,
    response: SessionResponse,
    metadataPatch?: unknown,
  ) => addReflectionResponseMock(sessionId, response, metadataPatch),
  completeReflectionSession: (
    sessionId: string,
    payload?: { title?: string; metadataPatch?: unknown },
  ) => completeReflectionSessionMock(sessionId, payload),
}));

async function renderWizard() {
  render(<NewSessionPage />);
  return screen.findByPlaceholderText(/write here/i);
}

describe('NewSessionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSearchParamsMock.mockReturnValue(new URLSearchParams());
  });

  it('does not advance from step 1 when the field is empty', async () => {
    const user = userEvent.setup();
    await renderWizard();

    await user.click(screen.getByRole('button', { name: /^next$/i }));

    expect(await screen.findByText(/please describe the situation briefly/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/first thought that crossed your mind/i),
    ).not.toBeInTheDocument();
  });

  it('blocks step 2 when the thought is too short', async () => {
    const user = userEvent.setup();
    await renderWizard();

    await user.type(screen.getByPlaceholderText(/write here/i), 'I argued with my manager.');
    await user.click(screen.getByRole('button', { name: /^next$/i }));

    expect(await screen.findByText(/first thought that crossed your mind/i)).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText(/i told myself that/i), 'no');
    await user.click(screen.getByRole('button', { name: 'Anger' }));
    await user.click(screen.getByRole('button', { name: /^next$/i }));

    expect(
      await screen.findByText(/naming the thought is often the hardest part/i),
    ).toBeInTheDocument();
  });

  it('can save a draft and redirect to the dashboard', async () => {
    const user = userEvent.setup();
    const stepOneInput = await renderWizard();

    await user.type(stepOneInput, 'Draft content for the first step');
    await user.click(screen.getByRole('button', { name: /^next$/i }));
    await screen.findByText(/main emotion/i);

    await user.click(screen.getByRole('button', { name: /pause \/ save draft/i }));

    await waitFor(() => {
      expect(routerMock.push).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('completes the flow and shows the success screen', async () => {
    const user = userEvent.setup();
    await renderWizard();

    await user.type(screen.getByPlaceholderText(/write here/i), 'A difficult work situation');
    await user.click(screen.getByRole('button', { name: /^next$/i }));

    await user.type(
      screen.getByPlaceholderText(/i told myself that/i),
      'I am not good enough',
    );
    await user.click(screen.getByRole('button', { name: 'Sadness' }));
    fireEvent.change(screen.getByRole('slider'), { target: { value: '8' } });
    await user.click(screen.getByRole('button', { name: /^next$/i }));

    await screen.findByText(/purpose do you think that emotion/i);
    await user.type(
      screen.getByPlaceholderText(/i think this emotion was trying to/i),
      'Protect me from failure',
    );
    await user.type(
      screen.getByPlaceholderText(/my actions, my words, my boundaries/i),
      'My effort',
    );
    await user.type(
      screen.getByPlaceholderText(/their reactions, their choices, the context/i),
      'The client opinion',
    );
    await user.click(screen.getByRole('button', { name: /^next$/i }));

    await screen.findByText(/knowing what you know now/i);
    await user.type(
      screen.getByPlaceholderText(/an alternative perspective could be/i),
      'I did the best I could with the information I had.',
    );
    await user.click(screen.getByRole('button', { name: /finish reflection/i }));

    await waitFor(() => {
      expect(screen.getByText(/reflection saved/i)).toBeInTheDocument();
    });
  });

  it('clears the step 1 error as soon as the user types valid content', async () => {
    const user = userEvent.setup();
    await renderWizard();

    await user.click(screen.getByRole('button', { name: /^next$/i }));
    expect(await screen.findByText(/please describe the situation briefly/i)).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText(/write here/i), 'Hello world');

    await waitFor(() => {
      expect(screen.queryByText(/please describe the situation briefly/i)).not.toBeInTheDocument();
    });
  });

  it('does not finish when the alternative perspective is empty', async () => {
    const user = userEvent.setup();
    await renderWizard();

    await user.type(screen.getByPlaceholderText(/write here/i), 'Valid situation');
    await user.click(screen.getByRole('button', { name: /^next$/i }));

    await user.type(screen.getByPlaceholderText(/i told myself that/i), 'Valid thought');
    await user.click(screen.getByRole('button', { name: 'Anger' }));
    await user.click(screen.getByRole('button', { name: /^next$/i }));

    await user.type(
      screen.getByPlaceholderText(/i think this emotion was trying to/i),
      'Valid purpose',
    );
    await user.type(
      screen.getByPlaceholderText(/my actions, my words, my boundaries/i),
      'Valid self control',
    );
    await user.type(
      screen.getByPlaceholderText(/their reactions, their choices, the context/i),
      'Valid others control',
    );
    await user.click(screen.getByRole('button', { name: /^next$/i }));

    expect(await screen.findByText(/knowing what you know now/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /finish reflection/i }));

    expect(await screen.findByText(/describe an alternative perspective/i)).toBeInTheDocument();
    expect(screen.queryByText(/reflection saved/i)).not.toBeInTheDocument();
  });

  it('resumes an existing session without creating a new one', async () => {
    const user = userEvent.setup();
    useSearchParamsMock.mockReturnValue(new URLSearchParams('sessionId=session-1'));
    getReflectionSessionMock.mockResolvedValueOnce({
      data: {
        id: 'session-1',
        title: 'Paused session',
        status: 'draft',
        started_at: '2026-05-07T10:00:00.000Z',
        completed_at: null,
        payload: {
          metadata: {
            version: '1.1',
            started_at: '2026-05-07T10:00:00.000Z',
          },
          responses: [{ id: 'Q1_SIT', text: 'A previously saved situation' }] as SessionResponse[],
        },
        ai_analysis: {
          summary: '',
          recommendation: '',
          encouraging_message: '',
          professional_support_reminder: '',
        },
      },
      message: 'ok',
    } as ReflectionResponseShape);

    render(<NewSessionPage />);

    expect(await screen.findByText(/first thought that crossed your mind/i)).toBeInTheDocument();
    await user.type(
      screen.getByPlaceholderText(/i told myself that/i),
      'A sufficiently clear thought',
    );
    await user.click(screen.getByRole('button', { name: 'Anger' }));
    await user.click(screen.getByRole('button', { name: /^next$/i }));

    await waitFor(() => {
      expect(addReflectionResponseMock).toHaveBeenCalledWith(
        'session-1',
        expect.objectContaining({ id: 'Q2_THO' }),
        undefined,
      );
    });
    expect(createReflectionSessionMock).not.toHaveBeenCalled();
  });

  it('returns to the previous step with rehydrated responses when resuming', async () => {
    const user = userEvent.setup();
    useSearchParamsMock.mockReturnValue(new URLSearchParams('sessionId=session-1'));
    getReflectionSessionMock.mockResolvedValueOnce({
      data: {
        id: 'session-1',
        title: 'Paused session',
        status: 'draft',
        started_at: '2026-05-07T10:00:00.000Z',
        completed_at: null,
        payload: {
          metadata: {
            version: '1.1',
            started_at: '2026-05-07T10:00:00.000Z',
            resume_step: 4,
          },
          responses: [
            { id: 'Q1_SIT', text: 'A previously saved situation' },
            { id: 'Q2_THO', text: 'A previously saved thought' },
            { id: 'Q3_EMO', text: 'Anger', category: 'primary' },
            { id: 'Q4_INT', value: 7 },
          ] as SessionResponse[],
        },
        ai_analysis: {
          summary: '',
          recommendation: '',
          encouraging_message: '',
          professional_support_reminder: '',
        },
      },
      message: 'ok',
    } as ReflectionResponseShape);

    render(<NewSessionPage />);

    expect(await screen.findByText(/purpose do you think that emotion/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /back/i }));

    expect(await screen.findByText(/first thought that crossed your mind/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/i told myself that/i)).toHaveValue(
      'A previously saved thought',
    );
    expect(screen.getByRole('button', { name: 'Anger' })).toHaveClass('bg-indigo-500');
    expect(screen.getByRole('slider')).toHaveValue('7');
  });
});
