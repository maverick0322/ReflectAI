'use client';

import { useFormContext, useWatch } from 'react-hook-form';

import { WizardStepActions } from '@/components/wizard/WizardStepActions';
import { WizardTextAreaField } from '@/components/wizard/WizardTextAreaField';
import { useValidationContext } from '@/contexts/ValidationContext';
import type { WizardFormValues } from '@/lib/validations/reflection';

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
  name: keyof Pick<WizardFormValues, 'proposito' | 'controlMio' | 'controlOtros'>;
  value: string;
  placeholder: string;
  shouldShowError: boolean;
  errorMessage?: string;
}

interface SectionConfigItem {
  key: keyof Pick<WizardFormValues, 'proposito' | 'controlMio' | 'controlOtros'>;
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
  '¿Cuál crees que era el propósito oculto detrás de esa emoción?';
const DEFAULT_OWN_CONTROL_QUESTION =
  'De esta situación, ¿qué cosas estaban estrictamente bajo tu control?';
const DEFAULT_OTHERS_CONTROL_QUESTION =
  '¿Qué cosas dependían de otras personas o circunstancias externas?';

const SECTION_CONFIG: SectionConfigItem[] = [
  {
    key: 'proposito',
    placeholder: 'Siento que mi emoción intentaba...',
    description: 'Ej. protegerme, alertarme, buscar justicia o mantener el control.',
  },
  {
    key: 'controlMio',
    placeholder: 'Mis acciones, mis palabras, mis límites...',
  },
  {
    key: 'controlOtros',
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
      shouldShowError: Boolean(errors.proposito) && shouldShowErrors,
      errorMessage: errors.proposito?.message as string | undefined,
    },
    {
      ...SECTION_CONFIG[1],
      title: titles[1],
      value: values[1],
      shouldShowError: Boolean(errors.controlMio) && shouldShowErrors,
      errorMessage: errors.controlMio?.message as string | undefined,
    },
    {
      ...SECTION_CONFIG[2],
      title: titles[2],
      value: values[2],
      shouldShowError: Boolean(errors.controlOtros) && shouldShowErrors,
      errorMessage: errors.controlOtros?.message as string | undefined,
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
      <h2 className="text-xl font-sans font-bold leading-tight text-slate-800 md:text-2xl">
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

export const Step3PropositoControl = ({
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
  const purposeValue = useWatch({ control, name: 'proposito' }) ?? '';
  const ownControlValue = useWatch({ control, name: 'controlMio' }) ?? '';
  const othersControlValue = useWatch({ control, name: 'controlOtros' }) ?? '';
  const sectionModels = buildSectionModels(
    [purposeQuestion, ownControlQuestion, othersControlQuestion],
    [purposeValue, ownControlValue, othersControlValue],
    errors,
    shouldShowErrors,
  );

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
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
