import type { MetadataPatch } from '@/lib/reflection/payload';
import type {
  requestNextQuestion,
} from '@/features/reflection/services/reflectionService';
import type {
  QuestionId,
  ReflectionSessionPayload,
  SessionResponse,
} from '@/features/reflection/types/reflection';
import type { WizardFormValues } from '@/features/reflection/schemas/reflection';

import { ApiError } from '@/core/api/http';

export type FormValues = WizardFormValues;
export type QuestionPrompts = Partial<Record<QuestionId, string>>;

export interface CompletionSummary {
  title?: string | null;
  summary: string;
  recommendation: string;
  encouragement: string;
  professionalReminder: string;
}

export const STEP_FIELDS: Record<number, (keyof FormValues)[]> = {
  1: ['situation'],
  2: ['thought', 'emotion', 'intensity'],
  4: ['purpose', 'selfControl', 'othersControl'],
  5: ['alternative'],
};

export const DEFAULT_FORM_VALUES: FormValues = {
  situation: '',
  thought: '',
  emotion: '',
  intensity: 5,
  purpose: '',
  selfControl: '',
  othersControl: '',
  alternative: '',
};

export const PROFESSIONAL_REMINDER =
  'This support does not replace psychological or medical care. ' +
  'If what you feel is intense, recurring, or affects your daily life, ' +
  'the best next step is to consult a professional.';

export const STEP_QUESTION_IDS: Record<number, QuestionId[]> = {
  1: ['Q1_SIT'],
  2: ['Q2_THO', 'Q3_EMO', 'Q4_INT'],
  4: ['Q5_TEL', 'Q6_CON_MINE', 'Q6_CON_OTHERS'],
  5: ['Q7_ALT'],
};

const VALID_RESUME_STEPS = new Set([1, 2, 3, 4, 5]);

function findResponse(payload: ReflectionSessionPayload, id: QuestionId) {
  return payload.responses.find((response) => response.id === id);
}

function getText(payload: ReflectionSessionPayload, id: QuestionId) {
  return findResponse(payload, id)?.text ?? '';
}

function getValue(payload: ReflectionSessionPayload, id: QuestionId) {
  return findResponse(payload, id)?.value;
}

function isSavedStepValid(
  savedStep: number,
  needsGrounding: boolean,
  groundingDone: boolean,
) {
  return (
    VALID_RESUME_STEPS.has(savedStep) &&
    (savedStep !== 3 || (needsGrounding && !groundingDone))
  );
}

function getResumeStepFromValues(
  values: FormValues,
  needsGrounding: boolean,
  groundingDone: boolean,
) {
  if (!values.situation) {
    return 1;
  }

  if (!values.thought || !values.emotion || !values.intensity) {
    return 2;
  }

  if (needsGrounding && !groundingDone) {
    return 3;
  }

  if (!values.purpose || !values.selfControl || !values.othersControl) {
    return 4;
  }

  return 5;
}

function buildStepOneResponses(values: FormValues): SessionResponse[] {
  return values.situation.trim()
    ? [{ id: 'Q1_SIT', text: values.situation.trim() }]
    : [];
}

function buildStepTwoResponses(values: FormValues): SessionResponse[] {
  const responses: SessionResponse[] = [];

  if (values.thought.trim()) {
    responses.push({ id: 'Q2_THO', text: values.thought.trim() });
  }

  if (values.emotion) {
    responses.push({ id: 'Q3_EMO', text: values.emotion, category: 'primary' });
  }

  if (typeof values.intensity === 'number') {
    responses.push({ id: 'Q4_INT', value: values.intensity });
  }

  return responses;
}

function buildStepFourResponses(values: FormValues): SessionResponse[] {
  const responses: SessionResponse[] = [];

  if (values.purpose.trim()) {
    responses.push({ id: 'Q5_TEL', text: values.purpose.trim() });
  }

  if (values.selfControl.trim()) {
    responses.push({ id: 'Q6_CON_MINE', text: values.selfControl.trim() });
  }

  if (values.othersControl.trim()) {
    responses.push({ id: 'Q6_CON_OTHERS', text: values.othersControl.trim() });
  }

  return responses;
}

function buildStepFiveResponses(values: FormValues): SessionResponse[] {
  return values.alternative.trim()
    ? [{ id: 'Q7_ALT', text: values.alternative.trim() }]
    : [];
}

function getAnalysisText(
  analysis: Record<string, unknown>,
  key: string,
  fallback: string,
) {
  const value = analysis[key];
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

export function buildFormValues(payload: ReflectionSessionPayload): FormValues {
  return {
    situation: getText(payload, 'Q1_SIT'),
    thought: getText(payload, 'Q2_THO'),
    emotion: getText(payload, 'Q3_EMO'),
    intensity: getValue(payload, 'Q4_INT') ?? 5,
    purpose: getText(payload, 'Q5_TEL'),
    selfControl: getText(payload, 'Q6_CON_MINE'),
    othersControl: getText(payload, 'Q6_CON_OTHERS'),
    alternative: getText(payload, 'Q7_ALT'),
  };
}

export function getResumeStep(payload: ReflectionSessionPayload) {
  const values = buildFormValues(payload);
  const needsGrounding = values.intensity >= 9;
  const groundingDone = Boolean(findResponse(payload, 'SYS_GROUNDING'));
  const savedStep = payload.metadata.resume_step;

  if (
    typeof savedStep === 'number' &&
    isSavedStepValid(savedStep, needsGrounding, groundingDone)
  ) {
    return savedStep;
  }

  return getResumeStepFromValues(values, needsGrounding, groundingDone);
}

export function buildCompletionSummary(
  analysis: Record<string, unknown>,
  title?: string | null,
): CompletionSummary {
  return {
    title,
    summary: getAnalysisText(
      analysis,
      'summary',
      'Your reflection has been saved. You identified what happened, how you interpreted it, ' +
        'and a more useful way to look at it.',
    ),
    recommendation: getAnalysisText(
      analysis,
      'recommendation',
      'Read your alternative perspective again when the emotion starts to rise, ' +
        'and choose one small action that is still under your control.',
    ),
    encouragement: getAnalysisText(
      analysis,
      'encouraging_message',
      'Taking a pause to organize what you feel is already a valuable step.',
    ),
    professionalReminder: getAnalysisText(
      analysis,
      'professional_support_reminder',
      PROFESSIONAL_REMINDER,
    ),
  };
}

export function buildResponsesForStep(values: FormValues, stepId: number) {
  switch (stepId) {
    case 1:
      return buildStepOneResponses(values);
    case 2:
      return buildStepTwoResponses(values);
    case 4:
      return buildStepFourResponses(values);
    case 5:
      return buildStepFiveResponses(values);
    default:
      return [];
  }
}

export function buildDraftMetadataPatch(
  step: number,
  groundingCompleted: boolean,
  groundingDurationSeconds: number | null,
): MetadataPatch {
  if (!groundingCompleted) {
    return { resume_step: step };
  }

  return {
    resume_step: step,
    flags: ['high_intensity_triggered', 'grounding_completed'],
    grounding_duration_seconds: groundingDurationSeconds ?? undefined,
  };
}

export function buildGroundingMetadataPatch(
  durationSeconds?: number,
): MetadataPatch {
  return {
    flags: ['high_intensity_triggered', 'grounding_completed'],
    grounding_duration_seconds: durationSeconds,
  };
}

export function buildCompletionMetadataPatch(
  groundingCompleted: boolean,
  groundingDurationSeconds: number | null,
): MetadataPatch | undefined {
  if (!groundingCompleted) {
    return undefined;
  }

  return {
    flags: ['high_intensity_triggered', 'grounding_completed'],
    grounding_duration_seconds: groundingDurationSeconds ?? undefined,
  };
}

export function buildQuestionPromptMap(
  response: Awaited<ReturnType<typeof requestNextQuestion>>,
) {
  const questions =
    response.data.questions ??
    (response.data.questionId && response.data.questionText
      ? [
          {
            questionId: response.data.questionId,
            questionText: response.data.questionText,
          },
        ]
      : []);

  if (response.data.done || questions.length === 0) {
    return null;
  }

  return Object.fromEntries(
    questions.map(
      ({
        questionId,
        questionText,
      }: {
        questionId: string;
        questionText: string;
      }) => [questionId, questionText],
    ),
  ) as QuestionPrompts;
}

export function getWizardErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof ApiError && error.payload?.message) {
    return error.payload.message;
  }

  return fallbackMessage;
}

export function getDisplayStep(step: number, groundingRequired: boolean) {
  return groundingRequired ? step : step > 3 ? step - 1 : step;
}

export function getTotalSteps(groundingRequired: boolean) {
  return groundingRequired ? 5 : 4;
}

export function getSuccessSummary(
  completionSummary: CompletionSummary | null,
) {
  return completionSummary ?? buildCompletionSummary({});
}
