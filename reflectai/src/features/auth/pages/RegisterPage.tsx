'use client';

import {
  RegisterFormSection,
  RegisterHeader,
  RegisterSocialSection,
} from '@/components/auth/RegisterPageSections';
import { useRegisterPage } from '@/components/auth/useRegisterPage';
import GlassCard from '@/components/ui/GlassCard';

export function RegisterPage() {
  const page = useRegisterPage();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 py-12">
      <GlassCard className="p-8 gap-6 w-full max-w-md mx-auto">
        <RegisterHeader />
        <RegisterFormSection
          form={page.form}
          isSubmitting={page.isSubmitting}
          formError={page.formError}
          onSubmit={page.handleSubmitForm}
        />
        <RegisterSocialSection />
      </GlassCard>
    </main>
  );
}
