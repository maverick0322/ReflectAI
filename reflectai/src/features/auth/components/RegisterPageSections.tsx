'use client';

import { Controller, useFormState, type UseFormReturn } from 'react-hook-form';

import type { RegisterFormValues } from '@/features/auth/schemas/auth';
import { FacebookIcon } from '@/shared/icons/FacebookIcon';
import { GoogleIcon } from '@/shared/icons/GoogleIcon';
import Button from '@/shared/ui/Button';
import CustomLink from '@/shared/ui/CustomLink';
import Input from '@/shared/ui/Input';
import PasswordInput from '@/shared/ui/PasswordInput';
import SocialButton from '@/shared/ui/SocialButton';
import { formatDisplayDateForInput } from '@/shared/utils/date';

interface RegisterFormSectionProps {
  form: UseFormReturn<RegisterFormValues>;
  isSubmitting: boolean;
  formError: string | null;
  onSubmit: (data: RegisterFormValues) => Promise<void>;
}

interface RegisterFieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  confirmEmail?: string;
  password?: string;
  confirmPassword?: string;
  birthDate?: string;
}

function RegisterNameFields({
  register,
  errors,
}: Readonly<{
  register: UseFormReturn<RegisterFormValues>['register'];
  errors: RegisterFieldErrors;
}>) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Input
        {...register('firstName')}
        placeholder="Nombre"
        maxLength={120}
        error={errors.firstName}
      />
      <Input
        {...register('lastName')}
        placeholder="Apellidos (opcional)"
        maxLength={120}
        error={errors.lastName}
      />
    </div>
  );
}

function RegisterEmailFields({
  register,
  errors,
}: Readonly<{
  register: UseFormReturn<RegisterFormValues>['register'];
  errors: RegisterFieldErrors;
}>) {
  return (
    <>
      <Input
        {...register('email')}
        type="email"
        placeholder="Correo electrónico"
        maxLength={254}
        error={errors.email}
      />
      <Input
        {...register('confirmEmail')}
        type="email"
        placeholder="Confirma tu correo"
        maxLength={254}
        error={errors.confirmEmail}
      />
    </>
  );
}

function RegisterPasswordFields({
  register,
  errors,
}: Readonly<{
  register: UseFormReturn<RegisterFormValues>['register'];
  errors: RegisterFieldErrors;
}>) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <PasswordInput
        {...register('password')}
        placeholder="Contraseña"
        maxLength={64}
        error={errors.password}
      />
      <PasswordInput
        {...register('confirmPassword')}
        placeholder="Confirma tu contraseña"
        maxLength={64}
        error={errors.confirmPassword}
      />
    </div>
  );
}

export function RegisterHeader() {
  return (
    <header className="space-y-2 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-reflect-dark">Crear cuenta</h1>
      <p className="text-sm font-medium text-reflect-dark/70">Comienza tu camino de reflexión</p>
    </header>
  );
}

export function RegisterFormSection({
  form,
  isSubmitting,
  formError,
  onSubmit,
}: RegisterFormSectionProps) {
  const { register, handleSubmit, control } = form;
  const { errors, submitCount } = useFormState({ control });
  const fieldErrors: RegisterFieldErrors = {
    firstName: errors.firstName?.message,
    lastName: errors.lastName?.message,
    email: errors.email?.message,
    confirmEmail: errors.confirmEmail?.message,
    password: errors.password?.message,
    confirmPassword: errors.confirmPassword?.message,
    birthDate: errors.birthDate?.message,
  };
  const hasValidationErrors =
    submitCount > 0 && Object.keys(errors).length > 0;

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <RegisterNameFields register={register} errors={fieldErrors} />
      <RegisterEmailFields register={register} errors={fieldErrors} />
      <RegisterPasswordFields register={register} errors={fieldErrors} />

      <Controller
        control={control}
        name="birthDate"
        render={({ field }) => (
          <Input
            id="register-birth-date"
            ref={field.ref}
            name={field.name}
            value={field.value ?? ''}
            onBlur={field.onBlur}
            onChange={(event) => {
              field.onChange(formatDisplayDateForInput(event.target.value));
            }}
            placeholder="dd/mm/yyyy"
            inputMode="numeric"
            autoComplete="bday"
            maxLength={10}
            showCounter={false}
            className="text-reflect-dark/70"
            error={fieldErrors.birthDate}
          />
        )}
      />

      {hasValidationErrors && !formError && (
        <p className="text-sm font-semibold text-red-500" role="alert">
          Revisa los campos marcados
        </p>
      )}

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
          {isSubmitting ? 'Creando cuenta...' : 'Registrarme'}
        </Button>
      </div>

      <p className="text-[11px] text-reflect-dark/60 text-center">
        ReflectAI no es una herramienta clínica, no diagnostica y no sustituye
        la atención psicológica profesional.
      </p>
    </form>
  );
}

export function RegisterSocialSection() {
  return (
    <>
      <div className="relative flex items-center py-2 text-sm font-medium text-reflect-dark/50">
        <div className="flex-grow border-t border-reflect-dark/10" />
        <span className="mx-4">o regístrate con</span>
        <div className="flex-grow border-t border-reflect-dark/10" />
      </div>

      <div className="flex flex-col gap-3">
        <SocialButton provider="Google" icon={<GoogleIcon />} disabled />
        <SocialButton provider="Facebook" icon={<FacebookIcon />} disabled />
      </div>

      <p className="text-xs text-reflect-dark/50 text-center">
        El registro con Google y Facebook estará disponible pronto
      </p>

      <footer className="text-center text-sm text-reflect-dark/70">
        ¿Ya tienes una cuenta? <CustomLink href="/login">Inicia sesión aquí</CustomLink>
      </footer>
    </>
  );
}
