import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  analyzeReflectionSessionMock,
  buildFallbackAnalysisMock,
  generateDailyQuoteMock,
  generateNextQuestionMock,
  getFallbackQuoteMock,
  loadReflectionSessionPayloadMock,
  saveReflectionSessionAnalysisMock,
} = vi.hoisted(() => ({
  analyzeReflectionSessionMock: vi.fn(async () => null),
  buildFallbackAnalysisMock: vi.fn(() => ({
    primary_emotions: [],
    average_intensity: null,
    key_themes: [],
    cognitive_distortion_detected: null,
    session_title: null,
    summary: null,
    recommendation: null,
    encouraging_message: null,
    professional_support_reminder: null,
  })),
  generateDailyQuoteMock: vi.fn(async (userName?: string) => ({
    text: `Daily quote for ${userName ?? 'anonymous'}`,
    author: 'ReflectAI',
    aiGenerated: true,
  })),
  generateNextQuestionMock: vi.fn(
    async (_payload, questionId: string) => `Pregunta ${questionId}`,
  ),
  getFallbackQuoteMock: vi.fn(() => ({
    text: 'Fallback quote',
    author: 'ReflectAI',
  })),
  loadReflectionSessionPayloadMock: vi.fn(),
  saveReflectionSessionAnalysisMock: vi.fn(),
}));

vi.mock('@/lib/ai/nextQuestion', () => ({
  generateNextQuestion: generateNextQuestionMock,
}));

vi.mock('@/lib/ai/dailyQuote', () => ({
  generateDailyQuote: generateDailyQuoteMock,
  getFallbackQuote: getFallbackQuoteMock,
}));

vi.mock('@/lib/ai/reflectionAnalysis', () => ({
  analyzeReflectionSession: analyzeReflectionSessionMock,
  buildFallbackAnalysis: buildFallbackAnalysisMock,
}));

vi.mock('@/lib/reflection/sessionService', () => ({
  loadReflectionSessionPayload: loadReflectionSessionPayloadMock,
  saveReflectionSessionAnalysis: saveReflectionSessionAnalysisMock,
}));

import { buildInitialPayload } from '@/lib/reflection/payload';
import {
  analyzeOwnedReflectionSession,
  buildDailyQuoteForUser,
  buildNextQuestionsResult,
  buildOwnedNextQuestionsResult,
  generateSessionAnalysis,
} from '@/lib/ai/session';

describe('ai session helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    analyzeReflectionSessionMock.mockResolvedValue(null);
    loadReflectionSessionPayloadMock.mockResolvedValue({
      payload: buildInitialPayload('2026-05-20T10:00:00.000Z'),
      session: { id: 'session-1' },
    });
    saveReflectionSessionAnalysisMock.mockResolvedValue({
      id: 'session-1',
      ai_analysis: { summary: 'saved' },
    });
  });

  it('falls back to the computed next question when the caller passes an empty array', async () => {
    const payload = buildInitialPayload('2026-05-20T10:00:00.000Z');

    const result = await buildNextQuestionsResult(payload, []);

    expect(result).toMatchObject({
      done: false,
      questionId: 'Q1_SIT',
      questionText: 'Pregunta Q1_SIT',
      aiGenerated: true,
    });
    expect(result.questions).toHaveLength(1);
  });

  it('returns done when there are no pending questions and falls back when AI question generation fails', async () => {
    const completePayload = buildInitialPayload('2026-05-20T10:00:00.000Z');
    completePayload.responses.push(
      { id: 'Q1_SIT', text: 'a' },
      { id: 'Q2_THO', text: 'b' },
      { id: 'Q3_EMO', text: 'c' },
      { id: 'Q4_INT', value: 4 },
      { id: 'Q5_TEL', text: 'd' },
      { id: 'Q6_CON_MINE', text: 'e' },
      { id: 'Q6_CON_OTHERS', text: 'f' },
      { id: 'Q7_ALT', text: 'g' },
    );

    await expect(buildNextQuestionsResult(completePayload)).resolves.toEqual({
      done: true,
    });

    generateNextQuestionMock.mockRejectedValueOnce(new Error('groq failed'));
    const fallbackResult = await buildNextQuestionsResult(
      buildInitialPayload('2026-05-20T10:00:00.000Z'),
      ['Q2_THO'],
    );

    expect(fallbackResult).toMatchObject({
      done: false,
      questionId: 'Q2_THO',
      aiGenerated: false,
    });
    expect(fallbackResult.questionText).toMatch(/pensamiento/i);
  });

  it('builds analysis and daily quotes with success and fallback behavior', async () => {
    const payload = buildInitialPayload('2026-05-20T10:00:00.000Z');
    const analysis = { summary: 'AI summary' };
    analyzeReflectionSessionMock.mockResolvedValueOnce(analysis as never);

    await expect(generateSessionAnalysis(payload)).resolves.toEqual(analysis);

    analyzeReflectionSessionMock.mockRejectedValueOnce(new Error('groq failed'));
    await expect(generateSessionAnalysis(payload)).resolves.toEqual(
      buildFallbackAnalysisMock.mock.results[0]?.value ?? buildFallbackAnalysisMock(),
    );

    await expect(
      buildDailyQuoteForUser({
        id: 'user-1',
        user_metadata: { full_name: 'Ana Lopez' },
      } as never),
    ).resolves.toMatchObject({
      aiGenerated: true,
      data: {
        text: 'Daily quote for Ana Lopez',
      },
    });

    generateDailyQuoteMock.mockRejectedValueOnce(new Error('groq failed'));
    await expect(
      buildDailyQuoteForUser({
        id: 'user-1',
        user_metadata: {},
      } as never),
    ).resolves.toEqual({
      aiGenerated: false,
      data: {
        text: 'Fallback quote',
        author: 'ReflectAI',
        aiGenerated: false,
      },
    });
  });

  it('loads and saves owned session helpers through the session service layer', async () => {
    const supabase = { from: vi.fn() };
    const user = { id: 'user-1' };

    const nextQuestions = await buildOwnedNextQuestionsResult(
      supabase as never,
      user as never,
      'session-1',
      ['Q1_SIT'],
    );

    expect(loadReflectionSessionPayloadMock).toHaveBeenCalledWith(
      supabase,
      user,
      'session-1',
    );
    expect(nextQuestions).toMatchObject({
      done: false,
      questionId: 'Q1_SIT',
    });

    analyzeReflectionSessionMock.mockResolvedValueOnce({ summary: 'AI summary' } as never);
    const savedResult = await analyzeOwnedReflectionSession(
      supabase as never,
      user as never,
      'session-1',
    );

    expect(saveReflectionSessionAnalysisMock).toHaveBeenCalledWith(
      supabase,
      user,
      'session-1',
      { summary: 'AI summary' },
    );
    expect(savedResult).toEqual({
      id: 'session-1',
      ai_analysis: { summary: 'saved' },
    });
  });
});
