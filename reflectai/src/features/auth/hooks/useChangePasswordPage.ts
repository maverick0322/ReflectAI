'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  changePassword,
  confirmRecovery,
  verifyCurrentPassword,
} from '@/features/auth/services/authService';

import {
  step1Schema,
  step2Schema,
  type Step1FormValues,
  type Step2FormValues,
} from '@/features/auth/components/changePasswordSchemas';
import {
  getAuthFormErrorMessage,
  isRecoveryMode,
} from '@/features/auth/utils/authPageUtils';

interface UseChangePasswordPageResult {
  step: 1 | 2;
  isSubmitting: boolean;
  formError: string | null;
  recoveryReady: boolean;
  isConfirmingRecovery: boolean;
  isRecoveryFlow: boolean;
  form1: ReturnType<typeof useForm<Step1FormValues>>;
  form2: ReturnType<typeof useForm<Step2FormValues>>;
  goToPreviousStep: () => void;
  handleStep1Submit: (data: Step1FormValues) => Promise<void>;
  handleStep2Submit: (data: Step2FormValues) => Promise<void>;
}

export function useChangePasswordPage(): UseChangePasswordPageResult {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<1 | 2>(1);
  const [currentPassword, setCurrentPassword] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [isConfirmingRecovery, setIsConfirmingRecovery] = useState(false);

  const recoveryCode = searchParams.get('code');
  const recoveryMode = searchParams.get('mode');
  const isRecoveryFlow = useMemo(
    () => isRecoveryMode(recoveryMode, recoveryCode),
    [recoveryCode, recoveryMode],
  );

  const form1 = useForm<Step1FormValues>({
    resolver: zodResolver(step1Schema),
    mode: 'all',
    reValidateMode: 'onChange',
    shouldFocusError: true,
  });

  const form2 = useForm<Step2FormValues>({
    resolver: zodResolver(step2Schema),
    mode: 'all',
    reValidateMode: 'onChange',
    shouldFocusError: true,
  });

  const handleStep1Submit = useCallback(
    async (data: Step1FormValues) => {
      setFormError(null);
      setIsSubmitting(true);

      try {
        await verifyCurrentPassword(data.currentPassword);
        setCurrentPassword(data.currentPassword);
        form2.reset({ newPassword: '', confirmNewPassword: '' });
        setStep(2);
      } catch (error) {
        setFormError(
          getAuthFormErrorMessage(
            error,
            'No se pudo validar tu contraseña actual',
          ),
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [form2],
  );

  const handleStep2Submit = useCallback(
    async (data: Step2FormValues) => {
      setFormError(null);
      setIsSubmitting(true);

      try {
        await changePassword({
          currentPassword: isRecoveryFlow ? undefined : currentPassword ?? undefined,
          newPassword: data.newPassword,
          confirmNewPassword: data.confirmNewPassword,
        });
        router.push('/login');
      } catch (error) {
        setFormError(
          getAuthFormErrorMessage(error, 'No se pudo actualizar la contraseña'),
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentPassword, isRecoveryFlow, router],
  );

  useEffect(() => {
    let isMounted = true;

    const runRecoveryConfirmation = async () => {
      if (!recoveryCode) {
        setRecoveryReady(true);
        return;
      }

      setIsConfirmingRecovery(true);

      try {
        await confirmRecovery(recoveryCode);

        if (!isMounted) {
          return;
        }

        setRecoveryReady(true);
        setStep(2);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setFormError(getAuthFormErrorMessage(error, 'No se pudo validar el enlace'));
      } finally {
        if (isMounted) {
          setIsConfirmingRecovery(false);
        }
      }
    };

    void runRecoveryConfirmation();

    return () => {
      isMounted = false;
    };
  }, [recoveryCode]);

  const goToPreviousStep = useCallback(() => {
    setFormError(null);
    setStep(1);
  }, []);

  return {
    step,
    isSubmitting,
    formError,
    recoveryReady,
    isConfirmingRecovery,
    isRecoveryFlow,
    form1,
    form2,
    goToPreviousStep,
    handleStep1Submit,
    handleStep2Submit,
  };
}
