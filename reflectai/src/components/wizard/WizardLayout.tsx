"use client";

import { ReactNode } from "react";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

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
  onSaveDraft 
}: WizardLayoutProps) => {
  const router = useRouter();
  const progress = (currentStep / totalSteps) * 100;

  return (
    <main className="min-h-screen flex flex-col items-center p-4 pt-8 md:pt-12">
      <div className="w-full max-w-lg mb-8 flex flex-col gap-4">
        <div className="flex justify-between items-center px-2">
          <button 
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium"
            aria-label="Salir de la sesión"
          >
            ✕ Salir
          </button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onSaveDraft}
            className="text-xs text-gray-500"
          >
            Pausar / Guardar borrador
          </Button>
        </div>

        <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-400/60 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
        <GlassCard className="p-8 flex flex-col gap-8">
          {children}
        </GlassCard>
      </div>
    </main>
  );
};