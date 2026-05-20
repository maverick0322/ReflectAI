'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';

import { registerUser } from '@/features/auth/services/authService';
import { registerSchema, type RegisterFormValues } from '@/features/auth/schemas/auth';

import { getAuthFormErrorMessage } from '@/features/auth/utils/authPageUtils';

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
        setFormError(getAuthFormErrorMessage(error, 'Unable to create the account'));
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
