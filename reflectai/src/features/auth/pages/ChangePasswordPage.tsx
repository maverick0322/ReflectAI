'use client';

import { Suspense } from 'react';

import {
  ChangePasswordCardFrame,
  ChangePasswordRecoveryPending,
  IdentityVerificationStep,
  NewPasswordStep,
} from '@/features/auth/components/ChangePasswordPageSections';
import { useChangePasswordPage } from '@/features/auth/hooks/useChangePasswordPage';
import GlassCard from '@/shared/ui/GlassCard';

function ChangePasswordContent() {
  const page = useChangePasswordPage();

  return (
    <ChangePasswordCardFrame>
      <GlassCard className="mx-auto flex w-full max-w-md flex-col gap-6 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-reflect-dark">Change password</h1>
        </div>

        {page.isRecoveryFlow && !page.recoveryReady ? (
          <ChangePasswordRecoveryPending formError={page.formError} />
        ) : page.step === 1 && !page.isRecoveryFlow ? (
          <IdentityVerificationStep
            form={page.form1}
            isSubmitting={page.isSubmitting}
            formError={page.formError}
            onSubmit={page.handleStep1Submit}
          />
        ) : (
          <NewPasswordStep
            form={page.form2}
            isRecoveryFlow={page.isRecoveryFlow}
            isSubmitting={page.isSubmitting}
            isConfirmingRecovery={page.isConfirmingRecovery}
            formError={page.formError}
            onBack={page.goToPreviousStep}
            onSubmit={page.handleStep2Submit}
          />
        )}
      </GlassCard>
    </ChangePasswordCardFrame>
  );
}

function ChangePasswordPageFallback() {
  return (
    <ChangePasswordCardFrame>
      <GlassCard className="mx-auto flex w-full max-w-md flex-col gap-6 p-8">
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-sm text-reflect-dark/70">Loading...</p>
        </div>
      </GlassCard>
    </ChangePasswordCardFrame>
  );
}

export function ChangePasswordPage() {
  return (
    <Suspense fallback={<ChangePasswordPageFallback />}>
      <ChangePasswordContent />
    </Suspense>
  );
}
