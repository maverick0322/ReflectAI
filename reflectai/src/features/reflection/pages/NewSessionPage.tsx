'use client';

import { Suspense } from 'react';
import { FormProvider } from 'react-hook-form';

import { ValidationContextProvider } from '@/contexts/ValidationContext';
import { WizardLayout } from '@/components/wizard/WizardLayout';
import { WizardLoadingState } from '@/components/wizard/WizardLoadingState';
import { WizardStatusMessages } from '@/components/wizard/WizardStatusMessages';
import { WizardSuccessState } from '@/components/wizard/WizardSuccessState';
import { Step2Evaluacion } from '@/components/wizard/steps/Step2Evaluacion';
import { Step3PropositoControl } from '@/components/wizard/steps/Step3PropositoControl';
import { Step4Reestructuracion } from '@/components/wizard/steps/Step4Reestructuracion';
import { StepContexto } from '@/components/wizard/steps/StepContexto';
import { StepGrounding } from '@/components/wizard/steps/StepGrounding';
import { useReflectionWizard } from '@/components/wizard/useReflectionWizard';

function WizardStepContent() {
  const wizard = useReflectionWizard();

  if (wizard.isSuccess) {
    return (
      <WizardSuccessState
        summary={wizard.getResolvedCompletionSummary()}
        onGoToDashboard={wizard.goToDashboard}
      />
    );
  }

  if (wizard.isCreatingSession) {
    return <WizardLoadingState />;
  }

  return (
    <FormProvider {...wizard.methods}>
      <ValidationContextProvider value={{ shouldShowErrors: wizard.shouldShowErrors }}>
        <WizardLayout
          currentStep={wizard.displayStep}
          totalSteps={wizard.totalSteps}
          onSaveDraft={wizard.handleSaveDraft}
        >
          <WizardStatusMessages
            formError={wizard.formError}
            draftMessage={wizard.draftMessage}
            isSaving={wizard.isSaving}
          />

          <form onSubmit={(event) => event.preventDefault()}>
            {wizard.step === 1 && (
              <StepContexto
                onNext={wizard.nextStep}
                questionText={wizard.questionPrompts.Q1_SIT}
              />
            )}

            {wizard.step === 2 && (
              <Step2Evaluacion
                onNext={wizard.nextStep}
                onPrev={wizard.prevStep}
                thoughtQuestion={wizard.questionPrompts.Q2_THO}
                emotionQuestion={wizard.questionPrompts.Q3_EMO}
                intensityQuestion={wizard.questionPrompts.Q4_INT}
              />
            )}

            {wizard.step === 3 && wizard.groundingRequired && (
              <StepGrounding
                onPrev={wizard.prevStep}
                onContinue={wizard.handleGroundingContinue}
              />
            )}

            {wizard.step === 4 && (
              <Step3PropositoControl
                onNext={wizard.nextStep}
                onPrev={wizard.prevStep}
                purposeQuestion={wizard.questionPrompts.Q5_TEL}
                ownControlQuestion={wizard.questionPrompts.Q6_CON_MINE}
                othersControlQuestion={wizard.questionPrompts.Q6_CON_OTHERS}
              />
            )}

            {wizard.step === 5 && (
              <Step4Reestructuracion
                onPrev={wizard.prevStep}
                onSubmit={wizard.handleFinalSubmit}
                questionText={wizard.questionPrompts.Q7_ALT}
              />
            )}
          </form>
        </WizardLayout>
      </ValidationContextProvider>
    </FormProvider>
  );
}

export function NewSessionPage() {
  return (
    <Suspense fallback={<WizardLoadingState />}>
      <WizardStepContent />
    </Suspense>
  );
}
