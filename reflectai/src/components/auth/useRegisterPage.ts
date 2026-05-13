'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';

import { registerUser } from '@/lib/api/auth';
import { registerSchema, type RegisterFormValues } from '@/lib/validations/auth';

import { getAuthFormErrorMessage } from './authPageUtils';

interface UseRegisterPageResult {
  isSubmitting: boolean;
  formError: string | null;
  form: ReturnType<typeof useForm<RegisterFormValues>>;
  handleSubmitForm: (data: RegisterFormValues) => Promise<void>;
}

export function useRegisterPage(): UseRegisterPageResult {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
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
        setFormError(getAuthFormErrorMessage(error, 'No se pudo crear la cuenta'));
      } finally {
        setIsSubmitting(false);
      }
    },
    [router],
  );

  return {
    isSubmitting,
    formError,
    form,
    handleSubmitForm,
  };
}
