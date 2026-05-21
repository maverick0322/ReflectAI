import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import NewSessionPage from '@/app/new-session/page';
import type {
  ReflectionSessionPayload,
  SessionResponse,
} from '@/features/reflection/types/reflection';

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
  return screen.findByPlaceholderText(/escribe aqu(?:i|\u00ed)/i);
}

describe('NewSessionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSearchParamsMock.mockReturnValue(new URLSearchParams());
  });

  it('does not advance from step 1 when the field is empty', async () => {
    const user = userEvent.setup();
    await renderWizard();

    await user.click(screen.getByRole('button', { name: /^siguiente$/i }));

    expect(
      await screen.findByText(/describe brevemente la situaci(?:o|\u00f3)n/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/primer pensamiento que cruz(?:o|\u00f3) por tu mente/i),
    ).not.toBeInTheDocument();
  });

  it('blocks step 2 when the thought is too short', async () => {
    const user = userEvent.setup();
    await renderWizard();

    await user.type(
      screen.getByPlaceholderText(/escribe aqu(?:i|\u00ed)/i),
      'I argued with my manager.',
    );
    await user.click(screen.getByRole('button', { name: /^siguiente$/i }));

    expect(
      await screen.findByText(/primer pensamiento que cruz(?:o|\u00f3) por tu mente/i),
    ).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText(/me dije a m(?:i|\u00ed) mismo que/i), 'no');
    await user.click(screen.getByRole('button', { name: 'Enojo' }));
    await user.click(screen.getByRole('button', { name: /^siguiente$/i }));

    expect(
      await screen.findByText(
        /ponerle nombre al pensamiento suele ser la parte m(?:a|\u00e1)s dif(?:i|\u00ed)cil/i,
      ),
    ).toBeInTheDocument();
  });

  it('can save a draft and redirect to the dashboard', async () => {
    const user = userEvent.setup();
    const stepOneInput = await renderWizard();

    await user.type(stepOneInput, 'Draft content for the first step');
    await user.click(screen.getByRole('button', { name: /^siguiente$/i }));
    await screen.findByText(/emoci(?:o|\u00f3)n principal/i);

    await user.click(screen.getByRole('button', { name: /pausar \/ guardar borrador/i }));

    await waitFor(() => {
      expect(routerMock.push).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('completes the flow and shows the success screen', async () => {
    const user = userEvent.setup();
    await renderWizard();

    await user.type(
      screen.getByPlaceholderText(/escribe aqu(?:i|\u00ed)/i),
      'A difficult work situation',
    );
    await user.click(screen.getByRole('button', { name: /^siguiente$/i }));

    await user.type(
      screen.getByPlaceholderText(/me dije a m(?:i|\u00ed) mismo que/i),
      'I am not good enough',
    );
    await user.click(screen.getByRole('button', { name: 'Tristeza' }));
    fireEvent.change(screen.getByRole('slider'), { target: { value: '8' } });
    await user.click(screen.getByRole('button', { name: /^siguiente$/i }));

    await screen.findByText(/prop(?:o|\u00f3)sito crees que esa emoci(?:o|\u00f3)n/i);
    await user.type(
      screen.getByPlaceholderText(/creo que esta emoci(?:o|\u00f3)n estaba intentando/i),
      'Protect me from failure',
    );
    await user.type(
      screen.getByPlaceholderText(/mis acciones, mis palabras, mis l(?:i|\u00ed)mites/i),
      'My effort',
    );
    await user.type(
      screen.getByPlaceholderText(/sus reacciones, sus decisiones, el contexto/i),
      'The client opinion',
    );
    await user.click(screen.getByRole('button', { name: /^siguiente$/i }));

    await screen.findByText(/sabiendo lo que sabes ahora/i);
    await user.type(
      screen.getByPlaceholderText(/una perspectiva alternativa podr(?:i|\u00ed)a ser/i),
      'I did the best I could with the information I had.',
    );
    await user.click(screen.getByRole('button', { name: /finalizar reflexi(?:o|\u00f3)n/i }));

    await waitFor(() => {
      expect(screen.getByText(/guardada/i)).toBeInTheDocument();
    });
  });

  it('clears the step 1 error as soon as the user types valid content', async () => {
    const user = userEvent.setup();
    await renderWizard();

    await user.click(screen.getByRole('button', { name: /^siguiente$/i }));
    expect(
      await screen.findByText(/describe brevemente la situaci(?:o|\u00f3)n/i),
    ).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText(/escribe aqu(?:i|\u00ed)/i), 'Hello world');

    await waitFor(() => {
      expect(
        screen.queryByText(/describe brevemente la situaci(?:o|\u00f3)n/i),
      ).not.toBeInTheDocument();
    });
  });

  it('does not finish when the alternative perspective is empty', async () => {
    const user = userEvent.setup();
    await renderWizard();

    await user.type(screen.getByPlaceholderText(/escribe aqu(?:i|\u00ed)/i), 'Valid situation');
    await user.click(screen.getByRole('button', { name: /^siguiente$/i }));

    await user.type(screen.getByPlaceholderText(/me dije a m(?:i|\u00ed) mismo que/i), 'Valid thought');
    await user.click(screen.getByRole('button', { name: 'Enojo' }));
    await user.click(screen.getByRole('button', { name: /^siguiente$/i }));

    await user.type(
      screen.getByPlaceholderText(/creo que esta emoci(?:o|\u00f3)n estaba intentando/i),
      'Valid purpose',
    );
    await user.type(
      screen.getByPlaceholderText(/mis acciones, mis palabras, mis l(?:i|\u00ed)mites/i),
      'Valid self control',
    );
    await user.type(
      screen.getByPlaceholderText(/sus reacciones, sus decisiones, el contexto/i),
      'Valid others control',
    );
    await user.click(screen.getByRole('button', { name: /^siguiente$/i }));

    expect(await screen.findByText(/sabiendo lo que sabes ahora/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /finalizar reflexi(?:o|\u00f3)n/i }));

    expect(await screen.findByText(/describe una perspectiva alternativa/i)).toBeInTheDocument();
    expect(screen.queryByText(/reflexi(?:o|\u00f3)n guardada/i)).not.toBeInTheDocument();
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

    expect(
      await screen.findByText(/primer pensamiento que cruz(?:o|\u00f3) por tu mente/i),
    ).toBeInTheDocument();
    await user.type(
      screen.getByPlaceholderText(/me dije a m(?:i|\u00ed) mismo que/i),
      'A sufficiently clear thought',
    );
    await user.click(screen.getByRole('button', { name: 'Enojo' }));
    await user.click(screen.getByRole('button', { name: /^siguiente$/i }));

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
            { id: 'Q3_EMO', text: 'Enojo', category: 'primary' },
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

    expect(
      await screen.findByText(/prop(?:o|\u00f3)sito crees que esa emoci(?:o|\u00f3)n/i),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /atr(?:a|\u00e1)s/i }));

    expect(
      await screen.findByText(/primer pensamiento que cruz(?:o|\u00f3) por tu mente/i),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/me dije a m(?:i|\u00ed) mismo que/i)).toHaveValue(
      'A previously saved thought',
    );
    expect(screen.getByRole('button', { name: 'Enojo' })).toHaveClass('bg-indigo-500');
    expect(screen.getByRole('slider')).toHaveValue('7');
  });
});
