'use client';

import { Suspense } from 'react';

import {
  ChangePasswordCardFrame,
  ChangePasswordRecoveryPending,
  IdentityVerificationStep,
  NewPasswordStep,
} from '@/components/auth/ChangePasswordPageSections';
import { useChangePasswordPage } from '@/components/auth/useChangePasswordPage';
import GlassCard from '@/components/ui/GlassCard';

function ChangePasswordContent() {
  const page = useChangePasswordPage();

  return (
    <ChangePasswordCardFrame>
      <GlassCard className="max-w-lg w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-reflect-dark">Cambiar Contraseña</h1>
        </div>

        {page.isRecoveryFlow && !page.recoveryReady ? (
          <ChangePasswordRecoveryPending />
        ) : page.step === 1 && !page.isRecoveryFlow ? (
          <IdentityVerificationStep
            form={page.form1}
            isSubmitting={page.isSubmitting}
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
      <GlassCard className="max-w-lg w-full">
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-sm text-reflect-dark/70">Cargando...</p>
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
