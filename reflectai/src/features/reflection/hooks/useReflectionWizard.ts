'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { APP_ROUTES } from '@/core/routing/routes';
import {
  addReflectionResponse,
  completeReflectionSession,
  createReflectionSession,
  getReflectionSession,
  requestNextQuestion,
} from '@/features/reflection/services/reflectionService';
import type { MetadataPatch } from '@/lib/reflection/payload';
import { wizardFormSchema } from '@/features/reflection/schemas/reflection';
import type { QuestionId, SessionResponse } from '@/features/reflection/types/reflection';

import {
  buildCompletionMetadataPatch,
  buildCompletionSummary,
  buildDraftMetadataPatch,
  buildFormValues,
  buildGroundingMetadataPatch,
  buildQuestionPromptMap,
  buildResponsesForStep,
  DEFAULT_FORM_VALUES,
  getDisplayStep,
  getResumeStep,
  getSuccessSummary,
  getTotalSteps,
  getWizardErrorMessage,
  STEP_FIELDS,
  STEP_QUESTION_IDS,
  type CompletionSummary,
  type FormValues,
  type QuestionPrompts,
} from '@/features/reflection/utils/wizardUtils';

interface ResumeState {
  sessionId: string;
  values: FormValues;
  nextStep: number;
  wasGroundingRequired: boolean;
  wasGroundingCompleted: boolean;
  groundingDurationSeconds: number | null;
  nextPromptIds: QuestionId[];
}

interface UseReflectionWizardResult {
  methods: ReturnType<typeof useForm<FormValues>>;
  step: number;
  displayStep: number;
  totalSteps: number;
  isSuccess: boolean;
  isCreatingSession: boolean;
  shouldShowErrors: boolean;
  formError: string | null;
  isSaving: boolean;
  draftMessage: string | null;
  groundingRequired: boolean;
  questionPrompts: QuestionPrompts;
  completionSummary: CompletionSummary | null;
  goToDashboard: () => void;
  nextStep: () => Promise<void>;
  prevStep: () => void;
  handleSaveDraft: () => Promise<void>;
  handleGroundingContinue: () => Promise<void>;
  handleFinalSubmit: () => Promise<void>;
  getResolvedCompletionSummary: () => CompletionSummary;
}

function createEmptyWizardState() {
  return {
    step: 1,
    sessionId: null as string | null,
    groundingRequired: false,
    groundingCompleted: false,
    groundingStartedAt: null as number | null,
    groundingDurationSeconds: null as number | null,
  };
}

function buildResumeState(
  response: Awaited<ReturnType<typeof getReflectionSession>>,
): ResumeState {
  const payload = response.data.payload;
  const values = buildFormValues(payload);
  const nextStep = getResumeStep(payload);
  const wasGroundingRequired = values.intensity >= 9;
  const wasGroundingCompleted = payload.responses.some(
    (responseItem: SessionResponse) => responseItem.id === 'SYS_GROUNDING',
  );

  return {
    sessionId: response.data.id,
    values,
    nextStep,
    wasGroundingRequired,
    wasGroundingCompleted,
    groundingDurationSeconds: payload.metadata.grounding_duration_seconds ?? null,
    nextPromptIds: STEP_QUESTION_IDS[nextStep],
  };
}

export function useReflectionWizard(): UseReflectionWizardResult {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionIdFromUrl = searchParams.get('sessionId');
  const sessionCreationPromiseRef = useRef<
    Promise<Awaited<ReturnType<typeof createReflectionSession>>> | null
  >(null);

  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shouldShowErrors, setShouldShowErrors] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(Boolean(sessionIdFromUrl));
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [draftMessage, setDraftMessage] = useState<string | null>(null);
  const [groundingRequired, setGroundingRequired] = useState(false);
  const [groundingCompleted, setGroundingCompleted] = useState(false);
  const [groundingStartedAt, setGroundingStartedAt] = useState<number | null>(null);
  const [groundingDurationSeconds, setGroundingDurationSeconds] = useState<number | null>(null);
  const [questionPrompts, setQuestionPrompts] = useState<QuestionPrompts>({});
  const [completionSummary, setCompletionSummary] = useState<CompletionSummary | null>(null);

  const methods = useForm<FormValues>({
    resolver: zodResolver(wizardFormSchema),
    defaultValues: DEFAULT_FORM_VALUES,
    mode: 'onChange',
    reValidateMode: 'onChange',
    shouldUnregister: false,
  });
  const { reset } = methods;

  const totalSteps = useMemo(() => getTotalSteps(groundingRequired), [groundingRequired]);
  const displayStep = useMemo(
    () => getDisplayStep(step, groundingRequired),
    [groundingRequired, step],
  );

  const goToDashboard = useCallback(() => {
    router.push(APP_ROUTES.dashboard);
  }, [router]);

  const resetSessionState = useCallback(() => {
    const emptyState = createEmptyWizardState();
    reset(DEFAULT_FORM_VALUES);
    setSessionId(emptyState.sessionId);
    setStep(emptyState.step);
    setGroundingRequired(emptyState.groundingRequired);
    setGroundingCompleted(emptyState.groundingCompleted);
    setGroundingDurationSeconds(emptyState.groundingDurationSeconds);
    setGroundingStartedAt(emptyState.groundingStartedAt);
    setIsCreatingSession(false);
  }, [reset]);

  const loadQuestionPrompts = useCallback(
    async (activeSessionId: string, questionIds?: QuestionId[]) => {
      try {
        const response = await requestNextQuestion(activeSessionId, questionIds);
        const promptMap = buildQuestionPromptMap(response);

        if (promptMap) {
          setQuestionPrompts((current: QuestionPrompts) => ({
            ...current,
            ...promptMap,
          }));
        }
      } catch (error: unknown) {
        void error;
        // Local fallback questions keep the flow usable if Groq is unavailable.
      }
    },
    [],
  );

  const hydrateExistingSession = useCallback(
    async (activeSessionId: string) => {
      const response = await getReflectionSession(activeSessionId);

      if (response.data.status === 'completed') {
        goToDashboard();
        return;
      }

      const resumeState = buildResumeState(response);
      reset(resumeState.values);
      setSessionId(resumeState.sessionId);
      setStep(resumeState.nextStep);
      setGroundingRequired(resumeState.wasGroundingRequired);
      setGroundingCompleted(resumeState.wasGroundingCompleted);
      setGroundingDurationSeconds(resumeState.groundingDurationSeconds);
      setGroundingStartedAt(
        resumeState.wasGroundingRequired && !resumeState.wasGroundingCompleted
          ? Date.now()
          : null,
      );
      await loadQuestionPrompts(response.data.id, resumeState.nextPromptIds);
    },
    [goToDashboard, loadQuestionPrompts, reset],
  );

  useEffect(() => {
    let isMounted = true;

    const initSession = async () => {
      setFormError(null);
      setQuestionPrompts({});
      sessionCreationPromiseRef.current = null;

      if (!sessionIdFromUrl) {
        resetSessionState();
        return;
      }

      setIsCreatingSession(true);

      try {
        await hydrateExistingSession(sessionIdFromUrl);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setFormError(getWizardErrorMessage(error, 'No se pudo iniciar la sesión'));
      } finally {
        if (isMounted) {
          setIsCreatingSession(false);
        }
      }
    };

    void initSession();

    return () => {
      isMounted = false;
    };
  }, [hydrateExistingSession, resetSessionState, sessionIdFromUrl]);

  const ensureSessionId = useCallback(async () => {
    if (sessionId) {
      return sessionId;
    }

    if (!sessionCreationPromiseRef.current) {
      sessionCreationPromiseRef.current = createReflectionSession();
    }

    const response = await sessionCreationPromiseRef.current;
    setSessionId(response.data.id);
    return response.data.id;
  }, [sessionId]);

  const saveResponses = useCallback(
    async (responses: SessionResponse[], metadataPatch?: MetadataPatch) => {
      if (responses.length === 0) {
        return null;
      }

      const activeSessionId = await ensureSessionId();

      for (let index = 0; index < responses.length; index += 1) {
        await addReflectionResponse(
          activeSessionId,
          responses[index],
          index === 0 ? metadataPatch : undefined,
        );
      }

      return activeSessionId;
    },
    [ensureSessionId],
  );

  const validateCurrentStep = useCallback(async () => {
    const fieldsToValidate = STEP_FIELDS[step] ?? [];
    const isStepValid = await methods.trigger(fieldsToValidate, { shouldFocus: true });

    if (!isStepValid) {
      setShouldShowErrors(true);
      return false;
    }

    setShouldShowErrors(false);
    return true;
  }, [methods, step]);

  const handleStepOneAdvance = useCallback(
    async (values: FormValues) => {
      const activeSessionId = await saveResponses(buildResponsesForStep(values, 1));
      if (activeSessionId) {
        await loadQuestionPrompts(activeSessionId, STEP_QUESTION_IDS[2]);
      }
      setStep(2);
    },
    [loadQuestionPrompts, saveResponses],
  );

  const handleStepTwoAdvance = useCallback(
    async (values: FormValues) => {
      const activeSessionId = await saveResponses(buildResponsesForStep(values, 2));
      const intensityValue = values.intensity ?? 0;

      if (intensityValue >= 9 && !groundingCompleted) {
        setGroundingRequired(true);
        setGroundingStartedAt((current) => current ?? Date.now());
        setStep(3);
        return;
      }

      setGroundingRequired(false);
      setGroundingStartedAt(null);
      if (activeSessionId) {
        await loadQuestionPrompts(activeSessionId, STEP_QUESTION_IDS[4]);
      }
      setStep(4);
    },
    [groundingCompleted, loadQuestionPrompts, saveResponses],
  );

  const handleStepFourAdvance = useCallback(
    async (values: FormValues) => {
      const activeSessionId = await saveResponses(buildResponsesForStep(values, 4));
      if (activeSessionId) {
        await loadQuestionPrompts(activeSessionId, STEP_QUESTION_IDS[5]);
      }
      setStep(5);
    },
    [loadQuestionPrompts, saveResponses],
  );

  const nextStep = useCallback(async () => {
    const isStepValid = await validateCurrentStep();
    if (!isStepValid) {
      return;
    }

    const values = methods.getValues();
    setFormError(null);
    setIsSaving(true);

    try {
      if (step === 1) {
        await handleStepOneAdvance(values);
        return;
      }

      if (step === 2) {
        await handleStepTwoAdvance(values);
        return;
      }

      if (step === 4) {
        await handleStepFourAdvance(values);
        return;
      }

      setStep((current) => Math.min(current + 1, 5));
    } catch (error) {
      setFormError(getWizardErrorMessage(error, 'No se pudo guardar la respuesta'));
    } finally {
      setIsSaving(false);
    }
  }, [
    handleStepFourAdvance,
    handleStepOneAdvance,
    handleStepTwoAdvance,
    methods,
    step,
    validateCurrentStep,
  ]);

  const prevStep = useCallback(() => {
    setShouldShowErrors(false);

    if (step === 3) {
      setStep(2);
      return;
    }

    if (step === 4 && !groundingRequired) {
      setStep(2);
      return;
    }

    setStep((current) => Math.max(current - 1, 1));
  }, [groundingRequired, step]);

  const handleSaveDraft = useCallback(async () => {
    setDraftMessage(null);
    setFormError(null);

    const values = methods.getValues();
    const responses = [
      ...buildResponsesForStep(values, 1),
      ...buildResponsesForStep(values, 2),
      ...buildResponsesForStep(values, 4),
      ...buildResponsesForStep(values, 5),
    ];
    const metadataPatch = buildDraftMetadataPatch(
      step,
      groundingCompleted,
      groundingDurationSeconds,
    );

    setIsSaving(true);

    try {
      if (responses.length === 0) {
        goToDashboard();
        return;
      }

      await saveResponses(responses, metadataPatch);
      setDraftMessage('Borrador guardado correctamente');
      goToDashboard();
    } catch (error) {
      setFormError(getWizardErrorMessage(error, 'No se pudo guardar el borrador'));
    } finally {
      setIsSaving(false);
    }
  }, [
    goToDashboard,
    groundingCompleted,
    groundingDurationSeconds,
    methods,
    saveResponses,
    step,
  ]);

  const handleGroundingContinue = useCallback(async () => {
    setIsSaving(true);
    setFormError(null);

    const durationSeconds = groundingStartedAt
      ? Math.max(1, Math.round((Date.now() - groundingStartedAt) / 1000))
      : undefined;

    try {
      const activeSessionId = await saveResponses(
        [{ id: 'SYS_GROUNDING', status: 'acknowledged', method: 'box_breathing' }],
        buildGroundingMetadataPatch(durationSeconds),
      );

      setGroundingDurationSeconds(durationSeconds ?? null);
      setGroundingCompleted(true);
      if (activeSessionId) {
        await loadQuestionPrompts(activeSessionId, STEP_QUESTION_IDS[4]);
      }
      setStep(4);
    } catch (error) {
      setFormError(getWizardErrorMessage(error, 'No se pudo guardar el paso de regulación'));
    } finally {
      setIsSaving(false);
    }
  }, [groundingStartedAt, loadQuestionPrompts, saveResponses]);

  const handleFinalSubmit = useCallback(async () => {
    setIsSaving(true);
    setFormError(null);

    try {
      const values = methods.getValues();
      const activeSessionId = await saveResponses(buildResponsesForStep(values, 5));

      if (!activeSessionId) {
        setFormError('No se pudo completar la sesión');
        return;
      }

      const completedSession = await completeReflectionSession(activeSessionId, {
        metadataPatch: buildCompletionMetadataPatch(
          groundingCompleted,
          groundingDurationSeconds,
        ),
      });

      setCompletionSummary(
        buildCompletionSummary(
          completedSession.data.ai_analysis,
          completedSession.data.title,
        ),
      );
      setIsSuccess(true);
    } catch (error) {
      setFormError(getWizardErrorMessage(error, 'No se pudo completar la sesión'));
    } finally {
      setIsSaving(false);
    }
  }, [groundingCompleted, groundingDurationSeconds, methods, saveResponses]);

  return {
    methods,
    step,
    displayStep,
    totalSteps,
    isSuccess,
    isCreatingSession,
    shouldShowErrors,
    formError,
    isSaving,
    draftMessage,
    groundingRequired,
    questionPrompts,
    completionSummary,
    goToDashboard,
    nextStep,
    prevStep,
    handleSaveDraft,
    handleGroundingContinue,
    handleFinalSubmit,
    getResolvedCompletionSummary: () => getSuccessSummary(completionSummary),
  };
}
