'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';

import { ApiError } from '@/lib/api/http';
import { registerUser } from '@/lib/api/auth';
import { registerSchema, type RegisterFormValues } from '@/lib/validations/auth';

import { getAuthFormErrorMessage } from './authPageUtils';

interface UseRegisterPageResult {
  isSubmitting: boolean;
  formError: string | null;
  form: ReturnType<typeof useForm<RegisterFormValues>>;
  handleSubmitForm: (data: RegisterFormValues) => Promise<void>;
}

function getRegisteredEmailError(error: unknown) {
  if (!(error instanceof ApiError)) {
    return null;
  }

  const message = error.payload?.message ?? '';
  return error.payload?.field === 'email' || message.toLowerCase().includes('correo')
    ? message
    : null;
}

export function useRegisterPage(): UseRegisterPageResult {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      confirmEmail: '',
      password: '',
      confirmPassword: '',
      birthDate: '',
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const handleSubmitForm = useCallback(
    async (data: RegisterFormValues) => {
      setFormError(null);
      setIsSubmitting(true);

      try {
        await registerUser({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          birthDate: data.birthDate,
        });
        router.push('/login');
      } catch (error) {
        const registeredEmailError = getRegisteredEmailError(error);
        if (registeredEmailError) {
          setFormError(registeredEmailError);
          form.setError('email', {
            type: 'server',
            message: registeredEmailError,
          });
          form.setError('confirmEmail', {
            type: 'server',
            message: registeredEmailError,
          });
          form.setFocus('email');
          return;
        }

        setFormError(getAuthFormErrorMessage(error, 'No se pudo crear la cuenta'));
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, router],
  );

  return {
    isSubmitting,
    formError,
    form,
    handleSubmitForm,
  };
}
