'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { ApiError } from '@/core/api/http';
import { APP_ROUTES } from '@/core/routing/routes';
import {
  recoverPasswordSchema,
  type RecoverPasswordFormValues,
} from '@/features/auth/schemas/auth';
import { recoverPassword } from '@/features/auth/services/authService';
import Button from '@/shared/ui/Button';
import CustomLink from '@/shared/ui/CustomLink';
import GlassCard from '@/shared/ui/GlassCard';
import Input from '@/shared/ui/Input';

export function RecoverPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecoverPasswordFormValues>({
    resolver: zodResolver(recoverPasswordSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (data: RecoverPasswordFormValues) => {
    setFormError(null);
    setIsSubmitting(true);

    try {
      await recoverPassword(data.email);
      setIsSuccess(true);
    } catch (error) {
      const message =
        error instanceof ApiError && error.payload?.message
          ? error.payload.message
          : 'Unable to send the reset link';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <GlassCard className="mx-auto flex w-full max-w-md flex-col gap-6 p-8">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-reflect-dark">
            Recover access
          </h1>
          <p className="text-sm font-medium text-reflect-dark/70">
            Enter your email address and we will send you a secure reset link.
          </p>
        </header>

        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="mt-4 flex flex-col gap-4"
        >
          <Input
            {...register('email')}
            type="email"
            placeholder="Email address"
            maxLength={254}
            error={errors.email?.message}
          />
          {formError && (
            <p className="text-sm font-semibold text-red-500" role="alert">
              {formError}
            </p>
          )}
          {isSuccess && (
            <p className="text-sm font-semibold text-green-600" role="status">
              Check your inbox to continue the reset flow.
            </p>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className={isSubmitting ? 'opacity-60' : ''}
          >
            {isSubmitting ? 'Sending...' : 'Send link'}
          </Button>
        </form>

        <footer className="mt-4 text-center text-sm text-reflect-dark/70">
          Remembered your password?{' '}
          <CustomLink href={APP_ROUTES.login}>Back to sign in</CustomLink>
        </footer>
      </GlassCard>
    </main>
  );
}
