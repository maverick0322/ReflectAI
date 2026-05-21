'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { APP_ROUTES } from '@/core/routing/routes';
import { ApiError } from '@/core/api/http';
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/auth';
import { loginUser } from '@/features/auth/services/authService';
import { FacebookIcon } from '@/shared/icons/FacebookIcon';
import { GoogleIcon } from '@/shared/icons/GoogleIcon';
import Button from '@/shared/ui/Button';
import CustomLink from '@/shared/ui/CustomLink';
import GlassCard from '@/shared/ui/GlassCard';
import Input from '@/shared/ui/Input';
import PasswordInput from '@/shared/ui/PasswordInput';
import SocialButton from '@/shared/ui/SocialButton';

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (data: LoginFormValues) => {
    setFormError(null);
    setIsSubmitting(true);

    try {
      await loginUser(data.email, data.password);
      router.push(APP_ROUTES.dashboard);
    } catch (error) {
      const message =
        error instanceof ApiError && error.payload?.message
          ? error.payload.message
          : 'No se pudo iniciar sesión';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <GlassCard className="mx-auto flex w-full max-w-md flex-col gap-6 p-8">
        <header className="space-y-2 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-reflect-dark">
            ReflectAI
          </h1>
          <p className="text-sm font-medium text-reflect-dark/70">
            Tu espacio seguro para reflexionar
          </p>
        </header>

        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <Input
            {...register('email')}
            type="email"
            placeholder="Correo electrónico"
            maxLength={254}
            error={errors.email?.message}
          />
          <PasswordInput
            {...register('password')}
            placeholder="Contraseña"
            maxLength={64}
            error={errors.password?.message}
          />

          <div className="flex justify-end">
            <CustomLink
              href={APP_ROUTES.recover}
              className="text-sm font-semibold"
            >
              ¿Olvidaste tu contraseña?
            </CustomLink>
          </div>

          {formError && (
            <p className="text-sm font-semibold text-red-500" role="alert">
              {formError}
            </p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className={isSubmitting ? 'opacity-60' : ''}
          >
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </Button>
        </form>

        <div className="relative flex items-center py-2 text-sm font-medium text-reflect-dark/50">
          <div className="flex-grow border-t border-reflect-dark/10" />
          <span className="mx-4">o continúa con</span>
          <div className="flex-grow border-t border-reflect-dark/10" />
        </div>

        <div className="flex flex-col gap-3">
          <SocialButton provider="Google" icon={<GoogleIcon />} disabled />
          <SocialButton provider="Facebook" icon={<FacebookIcon />} disabled />
        </div>

        <p className="text-center text-xs text-reflect-dark/50">
          El inicio de sesión con Google y Facebook estarán disponibles pronto
        </p>

        <footer className="text-center text-sm text-reflect-dark/70">
          ¿Necesitas una cuenta?{' '}
          <CustomLink href={APP_ROUTES.register}>Creala aquí</CustomLink>
        </footer>
      </GlassCard>
    </main>
  );
}
