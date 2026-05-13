'use client';

import { Controller, useFormContext, useWatch } from 'react-hook-form';

import Button from '@/components/ui/Button';
import { useValidationContext } from '@/contexts/ValidationContext';
import { WizardFormValues } from '@/lib/validations/reflection';

interface StepProps {
  onNext: () => void;
  questionText?: string;
}

const DEFAULT_QUESTION =
  '¿Qué situación específica detonó la necesidad de reflexionar hoy?';

export const StepContexto = ({
  onNext,
  questionText = DEFAULT_QUESTION,
}: StepProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<WizardFormValues>();

  const { shouldShowErrors } = useValidationContext();
  const textValue = useWatch({ control, name: 'situacion' }) ?? '';

  const shouldShowError = !!errors.situacion && shouldShowErrors;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <h2 className="text-2xl md:text-3xl font-sans font-bold text-slate-800 leading-tight">
        {questionText}
      </h2>

      <p className="text-sm text-slate-500 font-medium -mt-4">
        Describe los hechos, sin juicios.
      </p>

      <div className="flex flex-col gap-2">
        <Controller
          name="situacion"
          control={control}
          render={({ field }) => (
            <textarea
              {...field}
              value={field.value ?? ''}
              maxLength={3000}
              placeholder="Escribe aquí..."
              className={`w-full min-h-[180px] p-4 bg-white/30 backdrop-blur-sm rounded-2xl outline-none transition-all resize-none text-slate-700 placeholder:text-slate-400 ${
                shouldShowError
                  ? 'border-2 border-red-400 focus:ring-red-400'
                  : 'border border-white/60 focus:ring-2 focus:ring-indigo-300/50 focus:border-indigo-400'
              }`}
            />
          )}
        />
        <div className="flex justify-between items-start px-2">
          <span className="text-xs font-bold text-red-500 max-w-[80%]">
            {shouldShowError ? (errors.situacion?.message as string) : ''}
          </span>
          <span className="text-xs font-bold text-slate-400 whitespace-nowrap">
            {textValue.length}/3000
          </span>
        </div>
      </div>

      <Button type="button" onClick={onNext}>
        Siguiente
      </Button>
    </div>
  );
};
