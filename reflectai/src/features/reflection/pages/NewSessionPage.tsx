'use client';

import { Suspense } from 'react';
import { FormProvider } from 'react-hook-form';

import { ValidationContextProvider } from '@/features/reflection/contexts/ValidationContext';
import { Step2Evaluation } from '@/features/reflection/components/steps/Step2Evaluation';
import { Step3PurposeControl } from '@/features/reflection/components/steps/Step3PurposeControl';
import { Step4Reframing } from '@/features/reflection/components/steps/Step4Reframing';
import { StepContext } from '@/features/reflection/components/steps/StepContext';
import { StepGrounding } from '@/features/reflection/components/steps/StepGrounding';
import { WizardLayout } from '@/features/reflection/components/WizardLayout';
import { WizardLoadingState } from '@/features/reflection/components/WizardLoadingState';
import { WizardStatusMessages } from '@/features/reflection/components/WizardStatusMessages';
import { WizardSuccessState } from '@/features/reflection/components/WizardSuccessState';
import { useReflectionWizard } from '@/features/reflection/hooks/useReflectionWizard';

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
              <StepContext
                onNext={wizard.nextStep}
                questionText={wizard.questionPrompts.Q1_SIT}
              />
            )}

            {wizard.step === 2 && (
              <Step2Evaluation
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
              <Step3PurposeControl
                onNext={wizard.nextStep}
                onPrev={wizard.prevStep}
                purposeQuestion={wizard.questionPrompts.Q5_TEL}
                ownControlQuestion={wizard.questionPrompts.Q6_CON_MINE}
                othersControlQuestion={wizard.questionPrompts.Q6_CON_OTHERS}
              />
            )}

            {wizard.step === 5 && (
              <Step4Reframing
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
