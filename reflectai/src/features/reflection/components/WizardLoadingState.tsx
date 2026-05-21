import GlassCard from '@/shared/ui/GlassCard';

interface WizardLoadingStateProps {
  message?: string;
}

export function WizardLoadingState({
  message = 'Preparando tu sesión...',
}: WizardLoadingStateProps) {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="flex flex-col items-center gap-4 p-8 text-center">
        <p className="font-medium text-slate-500">{message}</p>
      </GlassCard>
    </main>
  );
}
