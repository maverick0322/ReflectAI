'use client';

import { Suspense } from 'react';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'next/navigation';

import Button from '@/components/ui/Button';
import CustomLink from '@/components/ui/CustomLink';
import GlassCard from '@/components/ui/GlassCard';
import Input from '@/components/ui/Input';
import { ApiError } from '@/lib/api/http';
import { recoverPassword } from '@/lib/api/auth';
import { recoverPasswordSchema, type RecoverPasswordFormValues } from '@/lib/validations/auth';

function getRecoveryErrorMessage(errorCode: string | null) {
  if (errorCode === 'otp_expired') {
    return 'El enlace expiro o ya fue usado. Solicita uno nuevo para restablecer tu contrasena.';
  }

  if (errorCode) {
    return 'El enlace no es valido. Solicita uno nuevo para restablecer tu contrasena.';
  }

  return null;
}

function RecoverPasswordContent() {
  const searchParams = useSearchParams();
  const recoveryError = getRecoveryErrorMessage(searchParams.get('recovery_error'));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [developmentRecoveryLink, setDevelopmentRecoveryLink] = useState<string | null>(null);
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
      const response = await recoverPassword(data.email);
      setDevelopmentRecoveryLink(response.data?.recoveryLink ?? null);
      setIsSuccess(true);
    } catch (error) {
      const message =
        error instanceof ApiError && error.payload?.message
          ? error.payload.message
          : 'No se pudo enviar el enlace';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <GlassCard className="p-8 gap-6 w-full max-w-md mx-auto">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-reflect-dark">
            Recupera tu acceso
          </h1>
          <p className="text-sm font-medium text-reflect-dark/70">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer
            tu contraseña
          </p>
        </header>

        <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
          <Input
            {...register('email')}
            type="email"
            placeholder="Correo electrónico"
            maxLength={254}
            error={errors.email?.message}
          />
          {formError && (
            <p className="text-sm text-red-500 font-semibold" role="alert">
              {formError}
            </p>
          )}
          {recoveryError && !formError && !isSuccess && (
            <p className="text-sm text-red-500 font-semibold" role="alert">
              {recoveryError}
            </p>
          )}
          {isSuccess && (
            <div className="flex flex-col gap-2 text-sm font-semibold text-green-600" role="status">
              <p>
                {developmentRecoveryLink
                  ? 'Se genero un enlace de recuperacion para desarrollo.'
                  : 'Revisa tu correo para continuar con el restablecimiento.'}
              </p>
              {developmentRecoveryLink && (
                <a
                  href={developmentRecoveryLink}
                  className="text-reflect-dark underline underline-offset-4"
                >
                  Abrir enlace de recuperacion
                </a>
              )}
            </div>
          )}
          <Button type="submit" disabled={isSubmitting} className={isSubmitting ? 'opacity-60' : ''}>
            {isSubmitting ? 'Enviando...' : 'Enviar enlace'}
          </Button>
        </form>

        <footer className="mt-4 text-center text-sm text-reflect-dark/70">
          ¿Recordaste tu contraseña?{' '}
          <CustomLink href="/login">Volver a iniciar sesión</CustomLink>
        </footer>
      </GlassCard>
    </main>
  );
}

export default function RecoverPasswordPage() {
  return (
    <Suspense>
      <RecoverPasswordContent />
    </Suspense>
  );
}
