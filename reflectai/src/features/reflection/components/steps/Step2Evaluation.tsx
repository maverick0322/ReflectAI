'use client';

import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { useValidationContext } from '@/features/reflection/contexts/ValidationContext';
import type { WizardFormValues } from '@/features/reflection/schemas/reflection';
import { PrimaryEmotion } from '@/features/reflection/types/reflection';
import { WizardStepActions } from '@/features/reflection/components/WizardStepActions';
import { WizardTextAreaField } from '@/features/reflection/components/WizardTextAreaField';

interface StepProps {
  onNext: () => void;
  onPrev: () => void;
  thoughtQuestion?: string;
  emotionQuestion?: string;
  intensityQuestion?: string;
}

interface EmotionSelectorProps {
  title: string;
  currentEmotion: string | undefined;
  shouldShowError: boolean;
  errorMessage?: string;
  onSelectEmotion: (emotion: PrimaryEmotion) => void;
}

const DEFAULT_THOUGHT_QUESTION =
  'What was the first thought that crossed your mind?';
const DEFAULT_EMOTION_QUESTION = 'What was the main emotion you experienced?';
const DEFAULT_INTENSITY_QUESTION = 'Emotional intensity';

function EmotionSelector({
  title,
  currentEmotion,
  shouldShowError,
  errorMessage,
  onSelectEmotion,
}: EmotionSelectorProps) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {Object.values(PrimaryEmotion).map((emotion) => (
          <button
            key={emotion}
            type="button"
            onClick={() => onSelectEmotion(emotion)}
            className={`rounded-xl border px-2 py-3 text-sm font-bold transition-all duration-300 ${
              currentEmotion === emotion
                ? 'scale-105 border-indigo-500 bg-indigo-500 text-white shadow-md shadow-indigo-500/30'
                : 'border-white/60 bg-white/40 text-slate-600 hover:bg-white/60'
            }`}
          >
            {emotion}
          </button>
        ))}
      </div>
      {shouldShowError && (
        <span className="px-2 text-xs font-bold text-red-500">
          {errorMessage ?? ''}
        </span>
      )}
    </section>
  );
}

function IntensitySlider({
  currentIntensity,
  intensityQuestion,
}: {
  currentIntensity: number;
  intensityQuestion: string;
}) {
  const { control } = useFormContext<WizardFormValues>();

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <h3 className="text-lg font-bold text-slate-800">{intensityQuestion}</h3>
        <span className="text-5xl font-black tracking-tighter text-indigo-600 drop-shadow-sm">
          {currentIntensity}{' '}
          <span className="text-xl font-bold text-slate-400">/ 10</span>
        </span>
      </div>

      <div className="relative flex flex-col gap-2">
        <Controller
          name="intensity"
          control={control}
          render={({ field }) => (
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={field.value ?? 5}
              onChange={(event) => field.onChange(Number(event.target.value))}
              className="h-3 w-full cursor-pointer appearance-none rounded-lg bg-white/50 accent-indigo-600"
            />
          )}
        />
        <div className="flex justify-between px-1 text-xs font-bold text-slate-500">
          <span>Low (1)</span>
          <span>Overwhelming (10)</span>
        </div>
      </div>
    </section>
  );
}

export const Step2Evaluation = ({
  onNext,
  onPrev,
  thoughtQuestion = DEFAULT_THOUGHT_QUESTION,
  emotionQuestion = DEFAULT_EMOTION_QUESTION,
  intensityQuestion = DEFAULT_INTENSITY_QUESTION,
}: StepProps) => {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<WizardFormValues>();

  const { shouldShowErrors } = useValidationContext();
  const currentEmotion = useWatch({ control, name: 'emotion' });
  const currentIntensity = useWatch({ control, name: 'intensity' }) ?? 5;
  const thoughtText = useWatch({ control, name: 'thought' }) ?? '';

  return (
    <div className="animate-in flex flex-col gap-8 fade-in slide-in-from-right-4 duration-500">
      <Controller
        name="emotion"
        control={control}
        render={({ field }) => (
          <input type="hidden" {...field} value={field.value ?? ''} />
        )}
      />

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-bold leading-tight text-slate-800 md:text-2xl">
          {thoughtQuestion}
        </h2>
        <WizardTextAreaField
          control={control}
          name="thought"
          value={thoughtText}
          placeholder="I told myself that..."
          shouldShowError={Boolean(errors.thought) && shouldShowErrors}
          errorMessage={errors.thought?.message}
        />
      </section>

      <hr className="border-white/40" />

      <EmotionSelector
        title={emotionQuestion}
        currentEmotion={currentEmotion}
        shouldShowError={Boolean(errors.emotion) && shouldShowErrors}
        errorMessage={errors.emotion?.message}
        onSelectEmotion={(emotion) =>
          setValue('emotion', emotion, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          })
        }
      />

      <hr className="border-white/40" />

      <IntensitySlider
        currentIntensity={currentIntensity}
        intensityQuestion={intensityQuestion}
      />

      <WizardStepActions onPrev={onPrev} onNext={onNext} nextLabel="Next" />
    </div>
  );
};
