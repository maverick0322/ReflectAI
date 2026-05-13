"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";

import GlassCard from "@/components/ui/GlassCard";
import { WizardLayout } from "@/components/wizard/WizardLayout";
import { Step2Evaluacion } from "@/components/wizard/steps/Step2Evaluacion";
import { Step3PropositoControl } from "@/components/wizard/steps/Step3PropositoControl";
import { Step4Reestructuracion } from "@/components/wizard/steps/Step4Reestructuracion";
import { StepContexto } from "@/components/wizard/steps/StepContexto";
import { StepGrounding } from "@/components/wizard/steps/StepGrounding";
import { ValidationContextProvider } from "@/contexts/ValidationContext";
import { ApiError } from "@/lib/api/http";
import {
  addReflectionResponse,
  completeReflectionSession,
  createReflectionSession,
  getReflectionSession,
  requestNextQuestion,
} from "@/lib/api/reflection";
import type { MetadataPatch } from "@/lib/reflection/payload";
import { wizardFormSchema } from "@/lib/validations/reflection";
import type {
  QuestionId,
  ReflectionSessionPayload,
  SessionResponse,
} from "@/types/reflection";

type FormValues = z.infer<typeof wizardFormSchema>;
type QuestionPrompts = Partial<Record<QuestionId, string>>;
type CompletionSummary = {
  title?: string | null;
  summary: string;
  recommendation: string;
  encouragement: string;
  professionalReminder: string;
};

const STEP_FIELDS: Record<number, (keyof FormValues)[]> = {
  1: ["situacion"],
  2: ["pensamiento", "emocion", "intensidad"],
  4: ["proposito", "controlMio", "controlOtros"],
  5: ["alternativa"],
};

const DEFAULT_FORM_VALUES: FormValues = {
  situacion: "",
  pensamiento: "",
  emocion: "",
  intensidad: 5,
  proposito: "",
  controlMio: "",
  controlOtros: "",
  alternativa: "",
};

const PROFESSIONAL_REMINDER =
  "Este acompanamiento no sustituye la atencion psicologica o medica. Si lo que sientes es intenso, recurrente o afecta tu vida diaria, lo mejor es consultar a un profesional.";

const STEP_QUESTION_IDS: Record<number, QuestionId[]> = {
  1: ["Q1_SIT"],
  2: ["Q2_THO", "Q3_EMO", "Q4_INT"],
  4: ["Q5_TEL", "Q6_CON_MINE", "Q6_CON_OTHERS"],
  5: ["Q7_ALT"],
};

function findResponse(payload: ReflectionSessionPayload, id: QuestionId) {
  return payload.responses.find((response) => response.id === id);
}

function getText(payload: ReflectionSessionPayload, id: QuestionId) {
  return findResponse(payload, id)?.text ?? "";
}

function getValue(payload: ReflectionSessionPayload, id: QuestionId) {
  return findResponse(payload, id)?.value;
}

function buildFormValues(payload: ReflectionSessionPayload): FormValues {
  return {
    situacion: getText(payload, "Q1_SIT"),
    pensamiento: getText(payload, "Q2_THO"),
    emocion: getText(payload, "Q3_EMO"),
    intensidad: getValue(payload, "Q4_INT") ?? 5,
    proposito: getText(payload, "Q5_TEL"),
    controlMio: getText(payload, "Q6_CON_MINE"),
    controlOtros: getText(payload, "Q6_CON_OTHERS"),
    alternativa: getText(payload, "Q7_ALT"),
  };
}

function getResumeStep(payload: ReflectionSessionPayload) {
  const values = buildFormValues(payload);
  const needsGrounding = values.intensidad >= 9;
  const groundingDone = Boolean(findResponse(payload, "SYS_GROUNDING"));
  const savedStep = payload.metadata.resume_step;

  if (
    typeof savedStep === "number" &&
    [1, 2, 3, 4, 5].includes(savedStep) &&
    (savedStep !== 3 || (needsGrounding && !groundingDone))
  ) {
    return savedStep;
  }

  if (!values.situacion) return 1;
  if (!values.pensamiento || !values.emocion || !values.intensidad) return 2;
  if (needsGrounding && !groundingDone) return 3;
  if (!values.proposito || !values.controlMio || !values.controlOtros) return 4;
  return 5;
}

function getAnalysisText(
  analysis: Record<string, unknown>,
  key: string,
  fallback: string,
) {
  const value = analysis[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function buildCompletionSummary(
  analysis: Record<string, unknown>,
  title?: string | null,
): CompletionSummary {
  return {
    title,
    summary: getAnalysisText(
      analysis,
      "summary",
      "Tu reflexion quedo registrada. Identificaste lo que ocurrio, como lo interpretaste y una forma mas util de mirarlo.",
    ),
    recommendation: getAnalysisText(
      analysis,
      "recommendation",
      "Vuelve a leer tu perspectiva alternativa cuando sientas que la emocion sube de intensidad y elige una accion pequena que si dependa de ti.",
    ),
    encouragement: getAnalysisText(
      analysis,
      "encouraging_message",
      "Hacer una pausa para ordenar lo que sientes ya es un paso valioso.",
    ),
    professionalReminder: getAnalysisText(
      analysis,
      "professional_support_reminder",
      PROFESSIONAL_REMINDER,
    ),
  };
}

function NuevaSesionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionIdFromUrl = searchParams.get("sessionId");
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

  const totalSteps = useMemo(() => (groundingRequired ? 5 : 4), [groundingRequired]);
  const displayStep = useMemo(
    () => (groundingRequired ? step : step > 3 ? step - 1 : step),
    [groundingRequired, step],
  );

  const methods = useForm<FormValues>({
    resolver: zodResolver(wizardFormSchema),
    defaultValues: DEFAULT_FORM_VALUES,
    mode: "onChange",
    reValidateMode: "onChange",
    shouldUnregister: false,
  });
  const { reset } = methods;

  const loadQuestionPrompts = useCallback(async (
    activeSessionId: string,
    questionIds?: QuestionId[],
  ) => {
    try {
      const response = await requestNextQuestion(activeSessionId, questionIds);
      const questions = response.data.questions ?? (
        response.data.questionId && response.data.questionText
          ? [
              {
                questionId: response.data.questionId,
                questionText: response.data.questionText,
              },
            ]
          : []
      );

      if (!response.data.done && questions.length > 0) {
        setQuestionPrompts((current) => ({
          ...current,
          ...Object.fromEntries(
            questions.map(({ questionId, questionText }) => [questionId, questionText]),
          ),
        }));
      }
    } catch {
      // The local fallback questions keep the flow usable if Groq is unavailable.
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initSession = async () => {
      setFormError(null);
      setQuestionPrompts({});
      sessionCreationPromiseRef.current = null;

      if (!sessionIdFromUrl) {
        reset(DEFAULT_FORM_VALUES);
        setSessionId(null);
        setStep(1);
        setGroundingRequired(false);
        setGroundingCompleted(false);
        setGroundingDurationSeconds(null);
        setGroundingStartedAt(null);
        setIsCreatingSession(false);
        return;
      }

      setIsCreatingSession(true);

      try {
        const response = await getReflectionSession(sessionIdFromUrl);
        if (!isMounted) return;

        if (response.data.status === "completed") {
          router.push("/dashboard");
          return;
        }

        const payload = response.data.payload;
        const values = buildFormValues(payload);
        const nextStep = sessionIdFromUrl ? getResumeStep(payload) : 1;
        const duration = payload.metadata.grounding_duration_seconds;
        const wasGroundingRequired = values.intensidad >= 9;
        const wasGroundingCompleted = Boolean(findResponse(payload, "SYS_GROUNDING"));

        reset(sessionIdFromUrl ? values : DEFAULT_FORM_VALUES);
        setSessionId(response.data.id);
        setStep(nextStep);
        setGroundingRequired(wasGroundingRequired);
        setGroundingCompleted(wasGroundingCompleted);
        setGroundingDurationSeconds(duration ?? null);
        setGroundingStartedAt(
          wasGroundingRequired && !wasGroundingCompleted ? Date.now() : null,
        );
        await loadQuestionPrompts(response.data.id, STEP_QUESTION_IDS[nextStep]);
      } catch (error) {
        if (!isMounted) return;

        const message =
          error instanceof ApiError && error.payload?.message
            ? error.payload.message
            : "No se pudo iniciar la sesion";
        setFormError(message);
      } finally {
        if (isMounted) {
          setIsCreatingSession(false);
        }
      }
    };

    initSession();

    return () => {
      isMounted = false;
    };
  }, [loadQuestionPrompts, reset, router, sessionIdFromUrl]);

  const buildResponsesForStep = (values: FormValues, stepId: number): SessionResponse[] => {
    switch (stepId) {
      case 1:
        return values.situacion.trim()
          ? [{ id: "Q1_SIT", text: values.situacion.trim() }]
          : [];
      case 2: {
        const responses: SessionResponse[] = [];
        if (values.pensamiento.trim()) {
          responses.push({ id: "Q2_THO", text: values.pensamiento.trim() });
        }
        if (values.emocion) {
          responses.push({ id: "Q3_EMO", text: values.emocion, category: "primary" });
        }
        if (typeof values.intensidad === "number") {
          responses.push({ id: "Q4_INT", value: values.intensidad });
        }
        return responses;
      }
      case 4: {
        const responses: SessionResponse[] = [];
        if (values.proposito.trim()) {
          responses.push({ id: "Q5_TEL", text: values.proposito.trim() });
        }
        if (values.controlMio.trim()) {
          responses.push({ id: "Q6_CON_MINE", text: values.controlMio.trim() });
        }
        if (values.controlOtros.trim()) {
          responses.push({ id: "Q6_CON_OTHERS", text: values.controlOtros.trim() });
        }
        return responses;
      }
      case 5:
        return values.alternativa.trim()
          ? [{ id: "Q7_ALT", text: values.alternativa.trim() }]
          : [];
      default:
        return [];
    }
  };

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

  const saveResponses = async (
    responses: SessionResponse[],
    metadataPatch?: MetadataPatch,
  ) => {
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
  };

  const handleSaveDraft = async () => {
    setDraftMessage(null);
    setFormError(null);

    const values = methods.getValues();
    const responses = [
      ...buildResponsesForStep(values, 1),
      ...buildResponsesForStep(values, 2),
      ...buildResponsesForStep(values, 4),
      ...buildResponsesForStep(values, 5),
    ];

    const metadataPatch: MetadataPatch | undefined = groundingCompleted
      ? {
          resume_step: step,
          flags: ["high_intensity_triggered", "grounding_completed"],
          grounding_duration_seconds: groundingDurationSeconds ?? undefined,
        }
      : { resume_step: step };

    setIsSaving(true);

    try {
      if (responses.length === 0) {
        router.push("/dashboard");
        return;
      }

      await saveResponses(responses, metadataPatch);
      setDraftMessage("Borrador guardado correctamente");
      router.push("/dashboard");
    } catch (error) {
      const message =
        error instanceof ApiError && error.payload?.message
          ? error.payload.message
          : "No se pudo guardar el borrador";
      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const nextStep = async () => {
    const fieldsToValidate = STEP_FIELDS[step] ?? [];
    const isStepValid = await methods.trigger(fieldsToValidate, { shouldFocus: true });

    if (!isStepValid) {
      setShouldShowErrors(true);
      return;
    }

    setShouldShowErrors(false);

    const values = methods.getValues();
    setFormError(null);
    setIsSaving(true);

    try {
      if (step === 1) {
        const activeSessionId = await saveResponses(buildResponsesForStep(values, 1));
        if (activeSessionId) {
          await loadQuestionPrompts(activeSessionId, STEP_QUESTION_IDS[2]);
        }
        setStep(2);
        return;
      }

      if (step === 2) {
        const activeSessionId = await saveResponses(buildResponsesForStep(values, 2));

        const intensityValue = values.intensidad ?? 0;
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
        return;
      }

      if (step === 4) {
        const activeSessionId = await saveResponses(buildResponsesForStep(values, 4));
        if (activeSessionId) {
          await loadQuestionPrompts(activeSessionId, STEP_QUESTION_IDS[5]);
        }
        setStep(5);
        return;
      }

      setStep((current) => Math.min(current + 1, 5));
    } catch (error) {
      const message =
        error instanceof ApiError && error.payload?.message
          ? error.payload.message
          : "No se pudo guardar la respuesta";
      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const prevStep = () => {
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
  };

  const handleGroundingContinue = async () => {
    setIsSaving(true);
    setFormError(null);

    const durationSeconds = groundingStartedAt
      ? Math.max(1, Math.round((Date.now() - groundingStartedAt) / 1000))
      : undefined;

    try {
      const metadataPatch: MetadataPatch = {
        flags: ["high_intensity_triggered", "grounding_completed"],
        grounding_duration_seconds: durationSeconds,
      };

      const activeSessionId = await saveResponses(
        [{ id: "SYS_GROUNDING", status: "acknowledged", method: "box_breathing" }],
        metadataPatch,
      );

      setGroundingDurationSeconds(durationSeconds ?? null);
      setGroundingCompleted(true);
      if (activeSessionId) {
        await loadQuestionPrompts(activeSessionId, STEP_QUESTION_IDS[4]);
      }
      setStep(4);
    } catch (error) {
      const message =
        error instanceof ApiError && error.payload?.message
          ? error.payload.message
          : "No se pudo guardar el aterrizaje";
      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const onStep4Submit = async () => {
    await onSubmit(methods.getValues());
  };

  const onSubmit = async (data: FormValues) => {
    setIsSaving(true);
    setFormError(null);

    try {
      const activeSessionId = await saveResponses(buildResponsesForStep(data, 5));

      if (!activeSessionId) {
        setFormError("No se pudo completar la sesion");
        return;
      }

      const metadataPatch: MetadataPatch | undefined = groundingCompleted
        ? {
            flags: ["high_intensity_triggered", "grounding_completed"],
            grounding_duration_seconds: groundingDurationSeconds ?? undefined,
          }
        : undefined;

      const completedSession = await completeReflectionSession(activeSessionId, { metadataPatch });
      setCompletionSummary(
        buildCompletionSummary(
          completedSession.data.ai_analysis,
          completedSession.data.title,
        ),
      );
      setIsSuccess(true);
    } catch (error) {
      const message =
        error instanceof ApiError && error.payload?.message
          ? error.payload.message
          : "No se pudo completar la sesion";
      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isSuccess) {
    const summary = completionSummary ?? buildCompletionSummary({});

    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg animate-in zoom-in duration-500">
          <GlassCard className="p-8 flex flex-col gap-6">
            <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-indigo-500/30 mx-auto">
              OK
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-800">¡Reflexión guardada!</h2>
              {summary.title && (
                <p className="text-sm text-slate-500 font-semibold mt-1">
                  {summary.title}
                </p>
              )}
            </div>

            <section className="flex flex-col gap-3">
              <div className="rounded-2xl bg-white/35 border border-white/60 p-4">
                <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wide">
                  Resumen
                </h3>
                <p className="text-sm text-slate-600 font-medium mt-2 leading-relaxed">
                  {summary.summary}
                </p>
              </div>

              <div className="rounded-2xl bg-white/35 border border-white/60 p-4">
                <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wide">
                  Recomendación
                </h3>
                <p className="text-sm text-slate-600 font-medium mt-2 leading-relaxed">
                  {summary.recommendation}
                </p>
              </div>

              <p className="text-sm text-slate-600 font-semibold leading-relaxed">
                {summary.encouragement}
              </p>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {summary.professionalReminder}
              </p>
            </section>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="w-full py-4 text-lg font-semibold rounded-2xl transition-transform active:scale-95 flex items-center justify-center bg-gradient-to-r from-orange-300 to-orange-400 text-white shadow-lg shadow-orange-400/30 hover:scale-[1.02]"
            >
              Ir al dashboard
            </button>
          </GlassCard>
        </div>
      </main>
    );
  }

  if (isCreatingSession) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <GlassCard className="p-8 flex flex-col items-center text-center gap-4">
          <p className="text-slate-500 font-medium">Preparando tu sesion...</p>
        </GlassCard>
      </main>
    );
  }

  return (
    <FormProvider {...methods}>
      <ValidationContextProvider value={{ shouldShowErrors }}>
        <WizardLayout
          currentStep={displayStep}
          totalSteps={totalSteps}
          onSaveDraft={handleSaveDraft}
        >
          {formError && (
            <p className="text-sm text-red-500 font-semibold" role="alert">
              {formError}
            </p>
          )}
          {draftMessage && (
            <p className="text-sm text-green-600 font-semibold" role="status">
              {draftMessage}
            </p>
          )}
          {isSaving && (
            <p className="text-sm text-slate-500 font-semibold" role="status">
              Guardando...
            </p>
          )}

          <form onSubmit={(event) => event.preventDefault()}>
            {step === 1 && (
              <StepContexto
                onNext={nextStep}
                questionText={questionPrompts.Q1_SIT}
              />
            )}
            {step === 2 && (
              <Step2Evaluacion
                onNext={nextStep}
                onPrev={prevStep}
                thoughtQuestion={questionPrompts.Q2_THO}
                emotionQuestion={questionPrompts.Q3_EMO}
                intensityQuestion={questionPrompts.Q4_INT}
              />
            )}
            {step === 3 && groundingRequired && (
              <StepGrounding onPrev={prevStep} onContinue={handleGroundingContinue} />
            )}
            {step === 4 && (
              <Step3PropositoControl
                onNext={nextStep}
                onPrev={prevStep}
                purposeQuestion={questionPrompts.Q5_TEL}
                ownControlQuestion={questionPrompts.Q6_CON_MINE}
                othersControlQuestion={questionPrompts.Q6_CON_OTHERS}
              />
            )}
            {step === 5 && (
              <Step4Reestructuracion
                onPrev={prevStep}
                onSubmit={onStep4Submit}
                questionText={questionPrompts.Q7_ALT}
              />
            )}
          </form>
        </WizardLayout>
      </ValidationContextProvider>
    </FormProvider>
  );
}

function NuevaSesionLoading() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="p-8 flex flex-col items-center text-center gap-4">
        <p className="text-slate-500 font-medium">Preparando tu sesion...</p>
      </GlassCard>
    </main>
  );
}

export default function NuevaSesionPage() {
  return (
    <Suspense fallback={<NuevaSesionLoading />}>
      <NuevaSesionContent />
    </Suspense>
  );
}
