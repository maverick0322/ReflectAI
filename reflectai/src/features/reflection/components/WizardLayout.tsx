'use client';

import { ReactNode } from 'react';

import { useRouter } from 'next/navigation';

import Button from '@/shared/ui/Button';
import GlassCard from '@/shared/ui/GlassCard';

interface WizardLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  onSaveDraft: () => void;
}

export const WizardLayout = ({
  children,
  currentStep,
  totalSteps,
  onSaveDraft,
}: WizardLayoutProps) => {
  const router = useRouter();
  const progress = (currentStep / totalSteps) * 100;

  return (
    <main className="min-h-screen flex flex-col items-center p-4 pt-8 md:pt-12">
      <div className="mb-8 flex w-full max-w-lg flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-800"
            aria-label="Salir de la sesión"
          >
            Cerrar
          </button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onSaveDraft}
            className="text-xs text-gray-500"
          >
            Pausar / Guardar borrador
          </Button>
        </div>

        <div className="h-1 w-full overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full bg-indigo-400/60 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
        <GlassCard className="flex flex-col gap-8 p-8">
          {children}
        </GlassCard>
      </div>
    </main>
  );
};
