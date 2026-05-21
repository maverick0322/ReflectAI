'use client';

import type { ReactNode } from 'react';
import { useFormState, type UseFormReturn } from 'react-hook-form';

import Link from 'next/link';

import { APP_ROUTES } from '@/core/routing/routes';
import Button from '@/shared/ui/Button';
import CustomLink from '@/shared/ui/CustomLink';
import PasswordInput from '@/shared/ui/PasswordInput';

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
  formError: string | null;
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

const sectionHeaderClassName = [
  'animate-in mb-6 space-y-2 text-center slide-in-from-right-4',
  'fade-in duration-300',
].join(' ');

const cancelLinkClassName = [
  'flex w-full flex-1 items-center justify-center rounded-2xl',
  'border-2 border-slate-300 py-4 text-lg font-bold text-slate-700',
  'transition-all duration-300 hover:bg-white/50',
].join(' ');

function getNewPasswordEyebrow(isRecoveryFlow: boolean) {
  return isRecoveryFlow ? 'Reset password' : 'Step 2 of 2';
}

function getSubmitLabel(
  isSubmitting: boolean,
  isConfirmingRecovery: boolean,
) {
  if (isConfirmingRecovery) {
    return 'Validating link...';
  }

  return isSubmitting ? 'Updating...' : 'Update password';
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
    <header className={sectionHeaderClassName}>
      <p className="text-sm font-medium text-reflect-dark/70">{eyebrow}</p>
      <h2 className="text-xl font-bold text-reflect-dark">{title}</h2>
      <p className="text-xs text-reflect-dark/60">{description}</p>
    </header>
  );
}

export function ChangePasswordRecoveryPending({
  formError,
}: Readonly<{ formError?: string | null }>) {
  return (
    <div className="animate-in flex flex-col items-center justify-center py-8 fade-in duration-300">
      <p className="text-sm text-reflect-dark/70">Validating link...</p>
      {formError ? (
        <p className="mt-3 text-sm font-semibold text-red-500" role="alert">
          {formError}
        </p>
      ) : null}
    </div>
  );
}

export function IdentityVerificationStep({
  form,
  isSubmitting,
  formError,
  onSubmit,
}: IdentityVerificationStepProps) {
  const { errors, submitCount } = useFormState({ control: form.control });
  const hasValidationErrors =
    submitCount > 0 && Object.keys(errors).length > 0;

  return (
    <>
      <ChangePasswordSectionHeader
        eyebrow="Step 1 of 2"
        title="Verify your identity"
        description="For security, enter your current password."
      />

      <form
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <PasswordInput
          {...form.register('currentPassword')}
          placeholder="Current password"
          maxLength={64}
          error={errors.currentPassword?.message}
          autoComplete="current-password"
        />

        <div className="-mt-2 px-1 text-right">
          <CustomLink href={APP_ROUTES.recover} className="text-[10px]">
            Forgot your password?
          </CustomLink>
        </div>

        {hasValidationErrors && !formError && (
          <p className="text-sm font-semibold text-red-500" role="alert">
            Please review the highlighted fields.
          </p>
        )}

        {formError && (
          <p className="text-sm font-semibold text-red-500" role="alert">
            {formError}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <Link
            href={APP_ROUTES.profile}
            className={cancelLinkClassName}
          >
            Cancel
          </Link>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? 'Validating...' : 'Continue'}
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
  const { errors, submitCount } = useFormState({ control: form.control });
  const hasValidationErrors =
    submitCount > 0 && Object.keys(errors).length > 0;

  return (
    <>
      <ChangePasswordSectionHeader
        eyebrow={getNewPasswordEyebrow(isRecoveryFlow)}
        title="New password"
        description="Enter and confirm your new password."
      />

      <form
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <PasswordInput
          {...form.register('newPassword')}
          placeholder="New password"
          maxLength={64}
          error={errors.newPassword?.message}
          autoComplete="new-password"
        />

        <PasswordInput
          {...form.register('confirmNewPassword')}
          placeholder="Confirm new password"
          maxLength={64}
          error={errors.confirmNewPassword?.message}
          autoComplete="new-password"
        />

        {hasValidationErrors && !formError && (
          <p className="text-sm font-semibold text-red-500" role="alert">
            Please review the highlighted fields.
          </p>
        )}

        {formError && (
          <p className="text-sm font-semibold text-red-500" role="alert">
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
              Back
            </Button>
          )}
          <Button
            type="submit"
            className="flex-1"
            disabled={isSubmitting || isConfirmingRecovery}
          >
            {getSubmitLabel(isSubmitting, isConfirmingRecovery)}
          </Button>
        </div>
      </form>
    </>
  );
}
