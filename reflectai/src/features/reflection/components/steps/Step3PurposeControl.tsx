'use client';

import { useFormContext, useWatch } from 'react-hook-form';

import { useValidationContext } from '@/features/reflection/contexts/ValidationContext';
import type { WizardFormValues } from '@/features/reflection/schemas/reflection';
import { WizardStepActions } from '@/features/reflection/components/WizardStepActions';
import { WizardTextAreaField } from '@/features/reflection/components/WizardTextAreaField';

interface StepProps {
  onNext: () => void;
  onPrev: () => void;
  purposeQuestion?: string;
  ownControlQuestion?: string;
  othersControlQuestion?: string;
}

interface QuestionSectionProps {
  title: string;
  description?: string;
  name: 'purpose' | 'selfControl' | 'othersControl';
  value: string;
  placeholder: string;
  shouldShowError: boolean;
  errorMessage?: string;
}

interface SectionConfigItem {
  key: 'purpose' | 'selfControl' | 'othersControl';
  placeholder: string;
  description?: string;
}

interface SectionModel extends SectionConfigItem {
  title: string;
  value: string;
  shouldShowError: boolean;
  errorMessage?: string;
}

const DEFAULT_PURPOSE_QUESTION =
  '¿Qué propósito crees que esa emoción estaba intentando cumplir?';
const DEFAULT_OWN_CONTROL_QUESTION =
  'En esta situación, ¿qué estaba estrictamente bajo tu control?';
const DEFAULT_OTHERS_CONTROL_QUESTION =
  '¿Qué dependía de otras personas o de circunstancias externas?';

const SECTION_CONFIG: SectionConfigItem[] = [
  {
    key: 'purpose',
    placeholder: 'Creo que esta emoción estaba intentando...',
    description: 'Por ejemplo: protegerme, advertirme, buscar justicia o mantener el control.',
  },
  {
    key: 'selfControl',
    placeholder: 'Mis acciones, mis palabras, mis límites...',
  },
  {
    key: 'othersControl',
    placeholder: 'Sus reacciones, sus decisiones, el contexto...',
  },
];

function buildSectionModels(
  titles: [string, string, string],
  values: [string, string, string],
  errors: ReturnType<typeof useFormContext<WizardFormValues>>['formState']['errors'],
  shouldShowErrors: boolean,
): SectionModel[] {
  return [
    {
      ...SECTION_CONFIG[0],
      title: titles[0],
      value: values[0],
      shouldShowError: Boolean(errors.purpose) && shouldShowErrors,
      errorMessage: errors.purpose?.message,
    },
    {
      ...SECTION_CONFIG[1],
      title: titles[1],
      value: values[1],
      shouldShowError: Boolean(errors.selfControl) && shouldShowErrors,
      errorMessage: errors.selfControl?.message,
    },
    {
      ...SECTION_CONFIG[2],
      title: titles[2],
      value: values[2],
      shouldShowError: Boolean(errors.othersControl) && shouldShowErrors,
      errorMessage: errors.othersControl?.message,
    },
  ];
}

function QuestionSection({
  title,
  description,
  name,
  value,
  placeholder,
  shouldShowError,
  errorMessage,
}: QuestionSectionProps) {
  const { control } = useFormContext<WizardFormValues>();

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xl font-bold leading-tight text-slate-800 md:text-2xl">
        {title}
      </h2>
      {description && (
        <p className="text-sm font-medium text-slate-500">{description}</p>
      )}
      <WizardTextAreaField
        control={control}
        name={name}
        value={value}
        placeholder={placeholder}
        shouldShowError={shouldShowError}
        errorMessage={errorMessage}
      />
    </section>
  );
}

export const Step3PurposeControl = ({
  onNext,
  onPrev,
  purposeQuestion = DEFAULT_PURPOSE_QUESTION,
  ownControlQuestion = DEFAULT_OWN_CONTROL_QUESTION,
  othersControlQuestion = DEFAULT_OTHERS_CONTROL_QUESTION,
}: StepProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<WizardFormValues>();

  const { shouldShowErrors } = useValidationContext();
  const purposeValue = useWatch({ control, name: 'purpose' }) ?? '';
  const selfControlValue = useWatch({ control, name: 'selfControl' }) ?? '';
  const othersControlValue = useWatch({ control, name: 'othersControl' }) ?? '';
  const sectionModels = buildSectionModels(
    [purposeQuestion, ownControlQuestion, othersControlQuestion],
    [purposeValue, selfControlValue, othersControlValue],
    errors,
    shouldShowErrors,
  );

  return (
    <div className="animate-in flex flex-col gap-8 fade-in slide-in-from-right-4 duration-500">
      {sectionModels.map((section, index) => (
        <div key={section.key} className="contents">
          {index > 0 && <hr className="border-white/40" />}
          <QuestionSection
            title={section.title}
            description={section.description}
            name={section.key}
            value={section.value}
            placeholder={section.placeholder}
            shouldShowError={section.shouldShowError}
            errorMessage={section.errorMessage}
          />
        </div>
      ))}

      <WizardStepActions onPrev={onPrev} onNext={onNext} nextLabel="Siguiente" />
    </div>
  );
};
