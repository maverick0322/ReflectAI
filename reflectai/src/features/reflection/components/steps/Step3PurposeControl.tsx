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
  'What purpose do you think that emotion was trying to serve?';
const DEFAULT_OWN_CONTROL_QUESTION =
  'In this situation, what was strictly under your control?';
const DEFAULT_OTHERS_CONTROL_QUESTION =
  'What depended on other people or outside circumstances?';

const SECTION_CONFIG: SectionConfigItem[] = [
  {
    key: 'purpose',
    placeholder: 'I think this emotion was trying to...',
    description: 'For example: protect me, warn me, seek fairness, or keep control.',
  },
  {
    key: 'selfControl',
    placeholder: 'My actions, my words, my boundaries...',
  },
  {
    key: 'othersControl',
    placeholder: 'Their reactions, their choices, the context...',
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

      <WizardStepActions onPrev={onPrev} onNext={onNext} nextLabel="Next" />
    </div>
  );
};
