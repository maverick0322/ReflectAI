import { describe, expect, it } from 'vitest';

import {
  DEFAULT_FORM_VALUES,
  buildCompletionMetadataPatch,
  buildCompletionSummary,
  buildDraftMetadataPatch,
  buildFormValues,
  buildGroundingMetadataPatch,
  buildQuestionPromptMap,
  buildResponsesForStep,
  getDisplayStep,
  getResumeStep,
  getSuccessSummary,
  getTotalSteps,
  getWizardErrorMessage,
  type CompletionSummary,
  type FormValues,
} from '@/components/wizard/wizardUtils';
import { ApiError } from '@/lib/api/http';
import type { ReflectionSessionPayload, SessionResponse } from '@/types/reflection';

const STARTED_AT = '2026-05-19T10:00:00.000Z';

function payload(
  responses: SessionResponse[] = [],
  metadata: Partial<ReflectionSessionPayload['metadata']> = {},
): ReflectionSessionPayload {
  return {
    metadata: {
      version: '1.1',
      started_at: STARTED_AT,
      ...metadata,
    },
    responses,
  };
}

const completeValues: FormValues = {
  situacion: '  Una junta dificil  ',
  pensamiento: '  No valoran mi trabajo  ',
  emocion: 'Enojo',
  intensidad: 8,
  proposito: '  Proteger mis limites  ',
  controlMio: '  Mi tono  ',
  controlOtros: '  Su reaccion  ',
  alternativa: '  Puedo pedir claridad  ',
};

describe('wizard utils', () => {
  it('hydrates form values from a persisted payload and defaults missing answers', () => {
    const values = buildFormValues(
      payload([
        { id: 'Q1_SIT', text: 'Situacion guardada' },
        { id: 'Q4_INT', value: 9 },
      ]),
    );

    expect(values).toEqual({
      ...DEFAULT_FORM_VALUES,
      situacion: 'Situacion guardada',
      intensidad: 9,
    });
  });

  it('derives resume steps from saved state, answers and grounding status', () => {
    expect(getResumeStep(payload([], { resume_step: 4 }))).toBe(4);
    expect(getResumeStep(payload([], { resume_step: 99 }))).toBe(1);
    expect(
      getResumeStep(
        payload([
          { id: 'Q1_SIT', text: 'Situacion' },
          { id: 'Q2_THO', text: 'Pensamiento' },
          { id: 'Q3_EMO', text: 'Enojo' },
          { id: 'Q4_INT', value: 5 },
        ], { resume_step: 3 }),
      ),
    ).toBe(4);
    expect(
      getResumeStep(
        payload([
          { id: 'Q1_SIT', text: 'Situacion' },
          { id: 'Q2_THO', text: 'Pensamiento' },
          { id: 'Q3_EMO', text: 'Miedo' },
          { id: 'Q4_INT', value: 9 },
        ]),
      ),
    ).toBe(3);
    expect(
      getResumeStep(
        payload([
          { id: 'Q1_SIT', text: 'Situacion' },
          { id: 'Q2_THO', text: 'Pensamiento' },
          { id: 'Q3_EMO', text: 'Miedo' },
          { id: 'Q4_INT', value: 9 },
          { id: 'SYS_GROUNDING', status: 'acknowledged' },
        ]),
      ),
    ).toBe(4);
    expect(
      getResumeStep(
        payload([
          { id: 'Q1_SIT', text: 'Situacion' },
          { id: 'Q2_THO', text: 'Pensamiento' },
          { id: 'Q3_EMO', text: 'Enojo' },
          { id: 'Q4_INT', value: 6 },
          { id: 'Q5_TEL', text: 'Proposito' },
          { id: 'Q6_CON_MINE', text: 'Mi parte' },
          { id: 'Q6_CON_OTHERS', text: 'La otra parte' },
        ]),
      ),
    ).toBe(5);
  });

  it('builds step responses with trimming and skips empty fields', () => {
    expect(buildResponsesForStep(completeValues, 1)).toEqual([
      { id: 'Q1_SIT', text: 'Una junta dificil' },
    ]);
    expect(buildResponsesForStep(completeValues, 2)).toEqual([
      { id: 'Q2_THO', text: 'No valoran mi trabajo' },
      { id: 'Q3_EMO', text: 'Enojo', category: 'primary' },
      { id: 'Q4_INT', value: 8 },
    ]);
    expect(buildResponsesForStep(completeValues, 4)).toEqual([
      { id: 'Q5_TEL', text: 'Proteger mis limites' },
      { id: 'Q6_CON_MINE', text: 'Mi tono' },
      { id: 'Q6_CON_OTHERS', text: 'Su reaccion' },
    ]);
    expect(buildResponsesForStep(completeValues, 5)).toEqual([
      { id: 'Q7_ALT', text: 'Puedo pedir claridad' },
    ]);
    expect(buildResponsesForStep(DEFAULT_FORM_VALUES, 1)).toEqual([]);
    expect(
      buildResponsesForStep(
        { ...DEFAULT_FORM_VALUES, intensidad: undefined as unknown as number },
        2,
      ),
    ).toEqual([]);
    expect(buildResponsesForStep(DEFAULT_FORM_VALUES, 4)).toEqual([]);
    expect(buildResponsesForStep(DEFAULT_FORM_VALUES, 5)).toEqual([]);
    expect(buildResponsesForStep(completeValues, 99)).toEqual([]);
  });

  it('builds draft, grounding and completion metadata patches', () => {
    expect(buildDraftMetadataPatch(2, false, null)).toEqual({ resume_step: 2 });
    expect(buildDraftMetadataPatch(3, true, 42)).toEqual({
      resume_step: 3,
      flags: ['high_intensity_triggered', 'grounding_completed'],
      grounding_duration_seconds: 42,
    });
    expect(buildDraftMetadataPatch(3, true, null)).toMatchObject({
      resume_step: 3,
      flags: ['high_intensity_triggered', 'grounding_completed'],
    });
    expect(buildGroundingMetadataPatch(12)).toEqual({
      flags: ['high_intensity_triggered', 'grounding_completed'],
      grounding_duration_seconds: 12,
    });
    expect(buildCompletionMetadataPatch(false, null)).toBeUndefined();
    expect(buildCompletionMetadataPatch(true, 18)).toEqual({
      flags: ['high_intensity_triggered', 'grounding_completed'],
      grounding_duration_seconds: 18,
    });
  });

  it('maps AI question prompts from batch, single and terminal responses', () => {
    expect(
      buildQuestionPromptMap({
        data: {
          questions: [
            { questionId: 'Q2_THO', questionText: 'Que pensamiento aparecio?' },
            { questionId: 'Q3_EMO', questionText: 'Que emocion notas?' },
          ],
        },
      } as never),
    ).toEqual({
      Q2_THO: 'Que pensamiento aparecio?',
      Q3_EMO: 'Que emocion notas?',
    });
    expect(
      buildQuestionPromptMap({
        data: {
          questionId: 'Q7_ALT',
          questionText: 'Que alternativa puedes intentar?',
        },
      } as never),
    ).toEqual({
      Q7_ALT: 'Que alternativa puedes intentar?',
    });
    expect(buildQuestionPromptMap({ data: { done: true } } as never)).toBeNull();
    expect(buildQuestionPromptMap({ data: {} } as never)).toBeNull();
  });

  it('summarizes completion data and resolves display helpers', () => {
    const summary = buildCompletionSummary(
      {
        summary: '  Resumen  ',
        recommendation: '   ',
        encouraging_message: 123,
        professional_support_reminder: '  Busca apoyo si lo necesitas  ',
      },
      'Titulo',
    );
    const existingSummary: CompletionSummary = {
      title: 'Guardado',
      summary: 'Resumen guardado',
      recommendation: null,
      encouragement: null,
      professionalReminder: null,
    };

    expect(summary).toEqual({
      title: 'Titulo',
      summary: 'Resumen',
      recommendation: null,
      encouragement: null,
      professionalReminder: 'Busca apoyo si lo necesitas',
    });
    expect(getWizardErrorMessage(
      new ApiError('bad request', 400, { message: 'Mensaje de API' }),
      'Fallback',
    )).toBe('Mensaje de API');
    expect(getWizardErrorMessage(new Error('boom'), 'Fallback')).toBe('Fallback');
    expect(getDisplayStep(4, false)).toBe(3);
    expect(getDisplayStep(3, false)).toBe(3);
    expect(getDisplayStep(4, true)).toBe(4);
    expect(getTotalSteps(false)).toBe(4);
    expect(getTotalSteps(true)).toBe(5);
    expect(getSuccessSummary(existingSummary)).toBe(existingSummary);
    expect(getSuccessSummary(null).summary).toBeNull();
  });
});
