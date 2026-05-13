import type { MetadataPatch } from '@/lib/reflection/payload';
import type {
  QuestionId,
  ReflectionSessionPayload,
  SessionResponse,
} from '@/types/reflection';
import type { WizardFormValues } from '@/lib/validations/reflection';

import { ApiError } from '@/lib/api/http';

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
  1: ['situacion'],
  2: ['pensamiento', 'emocion', 'intensidad'],
  4: ['proposito', 'controlMio', 'controlOtros'],
  5: ['alternativa'],
};

export const DEFAULT_FORM_VALUES: FormValues = {
  situacion: '',
  pensamiento: '',
  emocion: '',
  intensidad: 5,
  proposito: '',
  controlMio: '',
  controlOtros: '',
  alternativa: '',
};

export const PROFESSIONAL_REMINDER =
  'Este acompanamiento no sustituye la atencion psicologica o medica. ' +
  'Si lo que sientes es intenso, recurrente o afecta tu vida diaria, ' +
  'lo mejor es consultar a un profesional.';

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
  if (!values.situacion) {
    return 1;
  }

  if (!values.pensamiento || !values.emocion || !values.intensidad) {
    return 2;
  }

  if (needsGrounding && !groundingDone) {
    return 3;
  }

  if (!values.proposito || !values.controlMio || !values.controlOtros) {
    return 4;
  }

  return 5;
}

function buildStepOneResponses(values: FormValues): SessionResponse[] {
  return values.situacion.trim()
    ? [{ id: 'Q1_SIT', text: values.situacion.trim() }]
    : [];
}

function buildStepTwoResponses(values: FormValues): SessionResponse[] {
  const responses: SessionResponse[] = [];

  if (values.pensamiento.trim()) {
    responses.push({ id: 'Q2_THO', text: values.pensamiento.trim() });
  }

  if (values.emocion) {
    responses.push({ id: 'Q3_EMO', text: values.emocion, category: 'primary' });
  }

  if (typeof values.intensidad === 'number') {
    responses.push({ id: 'Q4_INT', value: values.intensidad });
  }

  return responses;
}

function buildStepFourResponses(values: FormValues): SessionResponse[] {
  const responses: SessionResponse[] = [];

  if (values.proposito.trim()) {
    responses.push({ id: 'Q5_TEL', text: values.proposito.trim() });
  }

  if (values.controlMio.trim()) {
    responses.push({ id: 'Q6_CON_MINE', text: values.controlMio.trim() });
  }

  if (values.controlOtros.trim()) {
    responses.push({ id: 'Q6_CON_OTHERS', text: values.controlOtros.trim() });
  }

  return responses;
}

function buildStepFiveResponses(values: FormValues): SessionResponse[] {
  return values.alternativa.trim()
    ? [{ id: 'Q7_ALT', text: values.alternativa.trim() }]
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
    situacion: getText(payload, 'Q1_SIT'),
    pensamiento: getText(payload, 'Q2_THO'),
    emocion: getText(payload, 'Q3_EMO'),
    intensidad: getValue(payload, 'Q4_INT') ?? 5,
    proposito: getText(payload, 'Q5_TEL'),
    controlMio: getText(payload, 'Q6_CON_MINE'),
    controlOtros: getText(payload, 'Q6_CON_OTHERS'),
    alternativa: getText(payload, 'Q7_ALT'),
  };
}

export function getResumeStep(payload: ReflectionSessionPayload) {
  const values = buildFormValues(payload);
  const needsGrounding = values.intensidad >= 9;
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
      'Tu reflexion quedo registrada. Identificaste lo que ocurrio, ' +
        'como lo interpretaste y una forma mas util de mirarlo.',
    ),
    recommendation: getAnalysisText(
      analysis,
      'recommendation',
      'Vuelve a leer tu perspectiva alternativa cuando sientas que la emocion ' +
        'sube de intensidad y elige una accion pequena que si dependa de ti.',
    ),
    encouragement: getAnalysisText(
      analysis,
      'encouraging_message',
      'Hacer una pausa para ordenar lo que sientes ya es un paso valioso.',
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

export function buildGroundingMetadataPatch(durationSeconds?: number): MetadataPatch {
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
  response: Awaited<ReturnType<typeof import('@/lib/api/reflection').requestNextQuestion>>,
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
    questions.map(({ questionId, questionText }) => [questionId, questionText]),
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
