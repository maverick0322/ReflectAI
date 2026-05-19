'use client';

import type { ReactNode } from 'react';
import { useWatch, type UseFormReturn } from 'react-hook-form';
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

function ChangePasswordErrorNotice({ message }: Readonly<{ message: string }>) {
  return (
    <div
      className="rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm font-semibold text-red-700 shadow-sm"
      role="alert"
    >
      {message}
    </div>
  );
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
    <header className="mb-6 space-y-2 text-center animate-in slide-in-from-right-4 fade-in duration-300">
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
  const currentPasswordError = form.formState.errors.currentPassword?.message;

  return (
    <>
      <ChangePasswordSectionHeader
        eyebrow="Paso 1 de 2"
        title="Verifica tu identidad"
        description="Por tu seguridad, ingresa tu contrasena actual."
      />

      <form
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <PasswordInput
          {...form.register('currentPassword')}
          placeholder="Contrasena actual"
          maxLength={64}
          error={currentPasswordError}
          autoComplete="current-password"
        />

        {currentPasswordError && <ChangePasswordErrorNotice message={currentPasswordError} />}

        <div className="px-1 -mt-2 text-right">
          <CustomLink href="/recuperar" className="text-[10px]">
            Olvidaste tu contrasena?
          </CustomLink>
        </div>

        <div className="flex gap-3 pt-2">
          <Link
            href="/perfil"
            className="flex flex-1 items-center justify-center rounded-2xl border-2 border-slate-300 py-4 text-lg font-bold text-slate-700 transition-all duration-300 hover:bg-white/50"
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
  const newPasswordValue = useWatch({
    control: form.control,
    name: 'newPassword',
  });
  const confirmNewPasswordValue = useWatch({
    control: form.control,
    name: 'confirmNewPassword',
  });
  const newPasswordError = form.formState.errors.newPassword?.message;
  const confirmNewPasswordError = form.formState.errors.confirmNewPassword?.message;
  const formatErrorMessage =
    'Debe tener al menos 8 caracteres, una mayuscula, una minuscula, un numero y un caracter especial';
  const hasNewPasswordFormatError = newPasswordError === formatErrorMessage;
  const hasConfirmPasswordFormatError = confirmNewPasswordError === formatErrorMessage;
  const mismatchErrorMessage =
    newPasswordValue &&
    confirmNewPasswordValue &&
    newPasswordValue !== confirmNewPasswordValue &&
    !hasNewPasswordFormatError &&
    !hasConfirmPasswordFormatError
      ? 'Las contrasenas no coinciden'
      : null;
  const validateBeforeSubmit = async () => {
    await form.trigger(['newPassword', 'confirmNewPassword'], { shouldFocus: true });
  };

  return (
    <>
      <ChangePasswordSectionHeader
        eyebrow={isRecoveryFlow ? 'Restablecer contrasena' : 'Paso 2 de 2'}
        title="Nueva contrasena"
        description="Ingresa tu nueva contrasena y confirmala."
      />

      <form
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <PasswordInput
          {...form.register('newPassword')}
          placeholder="Nueva contrasena"
          maxLength={64}
          error={newPasswordError ?? mismatchErrorMessage ?? undefined}
          hideErrorMessage={mismatchErrorMessage !== null}
          autoComplete="new-password"
        />

        <PasswordInput
          {...form.register('confirmNewPassword')}
          placeholder="Confirmar nueva contrasena"
          maxLength={64}
          error={confirmNewPasswordError ?? mismatchErrorMessage ?? undefined}
          hideErrorMessage={mismatchErrorMessage !== null}
          autoComplete="new-password"
        />

        {mismatchErrorMessage && (
          <ChangePasswordErrorNotice message={mismatchErrorMessage} />
        )}

        {formError && <ChangePasswordErrorNotice message={formError} />}

        <div className="flex gap-3 pt-2">
          {!isRecoveryFlow && (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1"
            >
              Atras
            </Button>
          )}
          <Button
            type="submit"
            className="flex-1"
            onClick={validateBeforeSubmit}
            disabled={isSubmitting || isConfirmingRecovery}
          >
            {isSubmitting ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </div>
      </form>
    </>
  );
}
