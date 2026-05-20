'use client';

import { useState } from 'react';

import { useFormContext, useWatch } from 'react-hook-form';

import { useValidationContext } from '@/features/reflection/contexts/ValidationContext';
import type { WizardFormValues } from '@/features/reflection/schemas/reflection';
import { WizardStepActions } from '@/features/reflection/components/WizardStepActions';
import { WizardTextAreaField } from '@/features/reflection/components/WizardTextAreaField';

interface StepProps {
  onPrev: () => void;
  onSubmit: () => void;
  questionText?: string;
}

const DEFAULT_QUESTION =
  'Knowing what you know now, how could you interpret this situation in a more useful or compassionate way?';

export const Step4Reframing = ({
  onPrev,
  onSubmit,
  questionText = DEFAULT_QUESTION,
}: StepProps) => {
  const {
    control,
    trigger,
    formState: { errors },
  } = useFormContext<WizardFormValues>();

  const { shouldShowErrors: contextShouldShowErrors } = useValidationContext();
  const [localShouldShowErrors, setLocalShouldShowErrors] = useState(false);
  const alternativeValue = useWatch({ control, name: 'alternative' }) ?? '';
  const shouldShowError =
    Boolean(errors.alternative) &&
    (contextShouldShowErrors || localShouldShowErrors);

  const handleFinalize = async () => {
    const isValid = await trigger(['alternative'], { shouldFocus: true });
    if (!isValid) {
      setLocalShouldShowErrors(true);
      return;
    }

    onSubmit();
  };

  return (
    <div className="animate-in flex flex-col gap-8 fade-in slide-in-from-right-4 duration-500">
      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-bold leading-tight text-slate-800 md:text-2xl">
          {questionText}
        </h2>
        <p className="mt-1 text-sm font-medium text-slate-500">
          For example: instead of assuming everything went wrong, I can recognize
          that I learned something useful.
        </p>

        <WizardTextAreaField
          control={control}
          name="alternative"
          value={alternativeValue}
          placeholder="An alternative perspective could be..."
          shouldShowError={shouldShowError}
          errorMessage={errors.alternative?.message}
          minHeightClassName="min-h-[180px]"
          marginTopClassName="mt-4"
        />
      </section>

      <WizardStepActions
        onPrev={onPrev}
        onNext={handleFinalize}
        nextLabel="Finish reflection"
      />
    </div>
  );
};
