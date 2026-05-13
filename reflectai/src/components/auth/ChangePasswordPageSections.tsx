'use client';

import type { ReactNode } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import Link from 'next/link';

import Button from '@/components/ui/Button';
import CustomLink from '@/components/ui/CustomLink';
import PasswordInput from '@/components/ui/PasswordInput';

import type {
  Step1FormValues,
  Step2FormValues,
} from './changePasswordSchemas';

interface ChangePasswordSectionHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
}

interface IdentityVerificationStepProps {
  form: UseFormReturn<Step1FormValues>;
  isSubmitting: boolean;
  onSubmit: (data: Step1FormValues) => Promise<void>;
}

interface NewPasswordStepProps {
  form: UseFormReturn<Step2FormValues>;
  isRecoveryFlow: boolean;
  isSubmitting: boolean;
  isConfirmingRecovery: boolean;
  formError: string | null;
  onBack: () => void;
  onSubmit: (data: Step2FormValues) => Promise<void>;
}

export function ChangePasswordCardFrame({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 py-12">
      {children}
    </main>
  );
}

export function ChangePasswordSectionHeader({
  eyebrow,
  title,
  description,
}: ChangePasswordSectionHeaderProps) {
  return (
    <header className="space-y-2 text-center mb-6 animate-in slide-in-from-right-4 fade-in duration-300">
      <p className="text-sm font-medium text-reflect-dark/70">{eyebrow}</p>
      <h2 className="text-xl font-bold text-reflect-dark">{title}</h2>
      <p className="text-xs text-reflect-dark/60">{description}</p>
    </header>
  );
}

export function ChangePasswordRecoveryPending() {
  return (
    <div className="flex flex-col items-center justify-center py-8 animate-in fade-in duration-300">
      <p className="text-sm text-reflect-dark/70">Validando enlace...</p>
    </div>
  );
}

export function IdentityVerificationStep({
  form,
  isSubmitting,
  onSubmit,
}: IdentityVerificationStepProps) {
  return (
    <>
      <ChangePasswordSectionHeader
        eyebrow="Paso 1 de 2"
        title="Verifica tu identidad"
        description="Por tu seguridad, ingresa tu contraseña actual."
      />

      <form
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <PasswordInput
          {...form.register('currentPassword')}
          placeholder="Contraseña actual"
          maxLength={64}
          error={form.formState.errors.currentPassword?.message}
          autoComplete="current-password"
        />

        <div className="text-right px-1 -mt-2">
          <CustomLink href="/recuperar" className="text-[10px]">
            ¿Olvidaste tu contraseña?
          </CustomLink>
        </div>

        <div className="flex gap-3 pt-2">
          <Link
            href="/perfil"
            className="flex-1 w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 border-2 border-slate-300 text-slate-700 hover:bg-white/50 flex items-center justify-center"
          >
            Cancelar
          </Link>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? 'Validando...' : 'Continuar'}
          </Button>
        </div>
      </form>
    </>
  );
}

export function NewPasswordStep({
  form,
  isRecoveryFlow,
  isSubmitting,
  isConfirmingRecovery,
  formError,
  onBack,
  onSubmit,
}: NewPasswordStepProps) {
  return (
    <>
      <ChangePasswordSectionHeader
        eyebrow={isRecoveryFlow ? 'Restablecer contraseña' : 'Paso 2 de 2'}
        title="Nueva contraseña"
        description="Ingresa tu nueva contraseña y confírmala."
      />

      <form
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <PasswordInput
          {...form.register('newPassword')}
          placeholder="Nueva contraseña"
          maxLength={64}
          error={form.formState.errors.newPassword?.message}
          autoComplete="new-password"
        />

        <PasswordInput
          {...form.register('confirmNewPassword')}
          placeholder="Confirmar nueva contraseña"
          maxLength={64}
          error={form.formState.errors.confirmNewPassword?.message}
          autoComplete="new-password"
        />

        {formError && (
          <p className="text-sm text-red-500 font-semibold" role="alert">
            {formError}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          {!isRecoveryFlow && (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1"
            >
              Atrás
            </Button>
          )}
          <Button
            type="submit"
            className="flex-1"
            disabled={isSubmitting || isConfirmingRecovery}
          >
            {isSubmitting ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </div>
      </form>
    </>
  );
}
