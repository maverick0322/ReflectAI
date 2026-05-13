'use client';

import type { UseFormReturn } from 'react-hook-form';

import { FacebookIcon } from '@/components/icons/FacebookIcon';
import { GoogleIcon } from '@/components/icons/GoogleIcon';
import Button from '@/components/ui/Button';
import CustomLink from '@/components/ui/CustomLink';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import SocialButton from '@/components/ui/SocialButton';
import type { RegisterFormValues } from '@/lib/validations/auth';

interface RegisterFormSectionProps {
  form: UseFormReturn<RegisterFormValues>;
  isSubmitting: boolean;
  formError: string | null;
  onSubmit: (data: RegisterFormValues) => Promise<void>;
}

function RegisterNameFields({
  form,
}: Readonly<{ form: UseFormReturn<RegisterFormValues> }>) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Input
        {...register('firstName')}
        placeholder="Nombre(s)"
        maxLength={120}
        error={errors.firstName?.message}
      />
      <Input
        {...register('lastName')}
        placeholder="Apellido(s) (Opcional)"
        maxLength={120}
        error={errors.lastName?.message}
      />
    </div>
  );
}

function RegisterEmailFields({
  form,
}: Readonly<{ form: UseFormReturn<RegisterFormValues> }>) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <>
      <Input
        {...register('email')}
        type="email"
        placeholder="Correo electrónico"
        maxLength={254}
        error={errors.email?.message}
      />
      <Input
        {...register('confirmEmail')}
        type="email"
        placeholder="Confirmar correo electrónico"
        maxLength={254}
        error={errors.confirmEmail?.message}
      />
    </>
  );
}

function RegisterPasswordFields({
  form,
}: Readonly<{ form: UseFormReturn<RegisterFormValues> }>) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <PasswordInput
        {...register('password')}
        placeholder="Contraseña"
        maxLength={64}
        error={errors.password?.message}
      />
      <PasswordInput
        {...register('confirmPassword')}
        placeholder="Confirmar contraseña"
        maxLength={64}
        error={errors.confirmPassword?.message}
      />
    </div>
  );
}

export function RegisterHeader() {
  return (
    <header className="space-y-2 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-reflect-dark">Crear cuenta</h1>
      <p className="text-sm font-medium text-reflect-dark/70">Comienza tu viaje</p>
    </header>
  );
}

export function RegisterFormSection({
  form,
  isSubmitting,
  formError,
  onSubmit,
}: RegisterFormSectionProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <RegisterNameFields form={form} />
      <RegisterEmailFields form={form} />
      <RegisterPasswordFields form={form} />

      <Input
        {...register('birthDate')}
        type="date"
        placeholder="Fecha de nacimiento"
        className="text-reflect-dark/70"
        error={errors.birthDate?.message}
      />

      {formError && (
        <p className="text-sm text-red-500 font-semibold" role="alert">
          {formError}
        </p>
      )}

      <div className="mt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className={isSubmitting ? 'opacity-60' : ''}
        >
          {isSubmitting ? 'Creando cuenta...' : 'Registrarse'}
        </Button>
      </div>

      <p className="text-[11px] text-reflect-dark/60 text-center">
        ReflectAI no es una herramienta clinica, no diagnostica y no sustituye
        atencion psicologica profesional.
      </p>
    </form>
  );
}

export function RegisterSocialSection() {
  return (
    <>
      <div className="relative flex items-center py-2 text-sm font-medium text-reflect-dark/50">
        <div className="flex-grow border-t border-reflect-dark/10"></div>
        <span className="mx-4">o regístrate con</span>
        <div className="flex-grow border-t border-reflect-dark/10"></div>
      </div>

      <div className="flex flex-col gap-3">
        <SocialButton provider="Google" icon={<GoogleIcon />} disabled />
        <SocialButton provider="Facebook" icon={<FacebookIcon />} disabled />
      </div>

      <p className="text-xs text-reflect-dark/50 text-center">
        Registro con Google y Facebook estara disponible pronto.
      </p>

      <footer className="text-center text-sm text-reflect-dark/70">
        ¿Ya tienes cuenta? <CustomLink href="/login">Inicia sesión aquí</CustomLink>
      </footer>
    </>
  );
}
