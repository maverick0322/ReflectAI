'use client';

import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { useValidationContext } from '@/features/reflection/contexts/ValidationContext';
import type { WizardFormValues } from '@/features/reflection/schemas/reflection';
import Button from '@/shared/ui/Button';

interface StepProps {
  onNext: () => void;
  questionText?: string;
}

const DEFAULT_QUESTION =
  'What specific situation triggered the need to reflect today?';

export const StepContext = ({
  onNext,
  questionText = DEFAULT_QUESTION,
}: StepProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<WizardFormValues>();

  const { shouldShowErrors } = useValidationContext();
  const textValue = useWatch({ control, name: 'situation' }) ?? '';
  const shouldShowError = Boolean(errors.situation) && shouldShowErrors;

  return (
    <div className="animate-in flex flex-col gap-8 fade-in slide-in-from-right-4 duration-500">
      <h2 className="text-2xl font-bold leading-tight text-slate-800 md:text-3xl">
        {questionText}
      </h2>

      <p className="-mt-4 text-sm font-medium text-slate-500">
        Describe the facts without judgment.
      </p>

      <div className="flex flex-col gap-2">
        <Controller
          name="situation"
          control={control}
          render={({ field }) => (
            <textarea
              {...field}
              value={field.value ?? ''}
              maxLength={3000}
              placeholder="Write here..."
              className={`w-full min-h-[180px] resize-none rounded-2xl bg-white/30 p-4 text-slate-700 outline-none transition-all placeholder:text-slate-400 ${
                shouldShowError
                  ? 'border-2 border-red-400 focus:ring-red-400'
                  : 'border border-white/60 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-300/50'
              }`}
            />
          )}
        />
        <div className="flex items-start justify-between px-2">
          <span className="max-w-[80%] text-xs font-bold text-red-500">
            {shouldShowError ? errors.situation?.message : ''}
          </span>
          <span className="whitespace-nowrap text-xs font-bold text-slate-400">
            {textValue.length}/3000
          </span>
        </div>
      </div>

      <Button type="button" onClick={onNext}>
        Next
      </Button>
    </div>
  );
};
