import { describe, expect, it } from 'vitest';

import { ApiError } from '@/core/api/http';
import type { ReflectionSessionPayload } from '@/features/reflection/types/reflection';
import {
  buildCompletionMetadataPatch,
  buildFormValues,
  buildQuestionPromptMap,
  buildResponsesForStep,
  DEFAULT_FORM_VALUES,
  getResumeStep,
  getSuccessSummary,
  getWizardErrorMessage,
} from '@/features/reflection/utils/wizardUtils';

function buildPayload(
  payload: Partial<ReflectionSessionPayload> = {},
): ReflectionSessionPayload {
  return {
    metadata: {
      version: '1.1',
      started_at: '2026-05-20T10:00:00.000Z',
      ...payload.metadata,
    },
    responses: payload.responses ?? [],
  };
}

describe('wizardUtils', () => {
  it('maps a persisted payload into English-first form values', () => {
    const payload = buildPayload({
      responses: [
        { id: 'Q1_SIT', text: 'Saved situation' },
        { id: 'Q2_THO', text: 'Saved thought' },
        { id: 'Q3_EMO', text: 'Anger' },
        { id: 'Q4_INT', value: 8 },
        { id: 'Q5_TEL', text: 'Saved purpose' },
        { id: 'Q6_CON_MINE', text: 'What depends on me' },
        { id: 'Q6_CON_OTHERS', text: 'What depends on others' },
        { id: 'Q7_ALT', text: 'Saved alternative' },
      ],
    });

    expect(buildFormValues(payload)).toEqual({
      situation: 'Saved situation',
      thought: 'Saved thought',
      emotion: 'Anger',
      intensity: 8,
      purpose: 'Saved purpose',
      selfControl: 'What depends on me',
      othersControl: 'What depends on others',
      alternative: 'Saved alternative',
    });
  });

  it('restores the saved resume step only when it is still valid', () => {
    const savedStepPayload = buildPayload({
      metadata: {
        version: '1.1',
        started_at: '2026-05-20T10:00:00.000Z',
        resume_step: 4,
      },
      responses: [
        { id: 'Q1_SIT', text: 'Saved situation' },
        { id: 'Q2_THO', text: 'Saved thought' },
        { id: 'Q3_EMO', text: 'Anger' },
        { id: 'Q4_INT', value: 7 },
      ],
    });

    const invalidSavedStepPayload = buildPayload({
      metadata: {
        version: '1.1',
        started_at: '2026-05-20T10:00:00.000Z',
        resume_step: 3,
      },
      responses: [
        { id: 'Q1_SIT', text: 'Saved situation' },
        { id: 'Q2_THO', text: 'Saved thought' },
        { id: 'Q3_EMO', text: 'Anger' },
        { id: 'Q4_INT', value: 4 },
      ],
    });

    expect(getResumeStep(savedStepPayload)).toBe(4);
    expect(getResumeStep(invalidSavedStepPayload)).toBe(4);
  });

  it('builds responses only for the fields that belong to each step', () => {
    expect(buildResponsesForStep(DEFAULT_FORM_VALUES, 1)).toEqual([]);

    const values = {
      ...DEFAULT_FORM_VALUES,
      situation: 'Situation',
      thought: 'Thought',
      emotion: 'Anger',
      intensity: 9,
      purpose: 'Purpose',
      selfControl: 'My response',
      othersControl: 'Their response',
      alternative: 'Another way to see it',
    };

    expect(buildResponsesForStep(values, 1)).toEqual([{ id: 'Q1_SIT', text: 'Situation' }]);
    expect(buildResponsesForStep(values, 2)).toHaveLength(3);
    expect(buildResponsesForStep(values, 4)).toHaveLength(3);
    expect(buildResponsesForStep(values, 5)).toEqual([
      { id: 'Q7_ALT', text: 'Another way to see it' },
    ]);
    expect(buildResponsesForStep(values, 99)).toEqual([]);
  });

  it('returns null prompt maps when the AI flow is complete and maps legacy responses otherwise', () => {
    const completeResponse = {
      data: { done: true },
    } as Awaited<
      ReturnType<
        typeof import('@/features/reflection/services/reflectionService').requestNextQuestion
      >
    >;

    const legacyResponse = {
      data: {
        done: false,
        questionId: 'Q2_THO',
        questionText: 'What did you think in that moment?',
      },
    } as Awaited<
      ReturnType<
        typeof import('@/features/reflection/services/reflectionService').requestNextQuestion
      >
    >;

    expect(buildQuestionPromptMap(completeResponse)).toBeNull();
    expect(buildQuestionPromptMap(legacyResponse)).toEqual({
      Q2_THO: 'What did you think in that moment?',
    });
  });

  it('builds completion metadata only when grounding was completed', () => {
    expect(buildCompletionMetadataPatch(false, null)).toBeUndefined();
    expect(buildCompletionMetadataPatch(true, 12)).toEqual({
      flags: ['high_intensity_triggered', 'grounding_completed'],
      grounding_duration_seconds: 12,
    });
  });

  it('uses api error payloads when available and falls back otherwise', () => {
    const apiError = new ApiError('fail', 400, {
      message: 'Backend message',
    });

    expect(getWizardErrorMessage(apiError, 'Fallback message')).toBe('Backend message');
    expect(getWizardErrorMessage(new Error('oops'), 'Fallback message')).toBe('Fallback message');
    expect(getSuccessSummary(null)).toMatchObject({
      summary: expect.any(String),
      recommendation: expect.any(String),
    });
  });
});
