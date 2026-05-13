'use client';

import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { WizardStepActions } from '@/components/wizard/WizardStepActions';
import { WizardTextAreaField } from '@/components/wizard/WizardTextAreaField';
import { useValidationContext } from '@/contexts/ValidationContext';
import type { WizardFormValues } from '@/lib/validations/reflection';

interface StepProps {
  onPrev: () => void;
  onSubmit: () => void;
  questionText?: string;
}

const DEFAULT_QUESTION =
  'Sabiendo lo que sabes ahora, ¿cómo podrías interpretar esta situación de una manera más útil o compasiva?';

export const Step4Reestructuracion = ({
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
  const alternativeValue = useWatch({ control, name: 'alternativa' }) ?? '';
  const shouldShowError =
    Boolean(errors.alternativa) && (contextShouldShowErrors || localShouldShowErrors);

  const handleFinalize = async () => {
    const isValid = await trigger(['alternativa'], { shouldFocus: true });
    if (!isValid) {
      setLocalShouldShowErrors(true);
      return;
    }

    onSubmit();
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-sans font-bold leading-tight text-slate-800 md:text-2xl">
          {questionText}
        </h2>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Ej. En lugar de pensar que todo salio mal, puedo ver que aprendi algo nuevo.
        </p>

        <WizardTextAreaField
          control={control}
          name="alternativa"
          value={alternativeValue}
          placeholder="Una perspectiva alternativa es..."
          shouldShowError={shouldShowError}
          errorMessage={errors.alternativa?.message as string | undefined}
          minHeightClassName="min-h-[180px]"
          marginTopClassName="mt-4"
        />
      </section>

      <WizardStepActions
        onPrev={onPrev}
        onNext={handleFinalize}
        nextLabel="Finalizar Reflexión"
      />
    </div>
  );
};
