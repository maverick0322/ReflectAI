import GlassCard from '@/components/ui/GlassCard';

interface WizardLoadingStateProps {
  message?: string;
}

export function WizardLoadingState({
  message = 'Preparando tu sesion...',
}: WizardLoadingStateProps) {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="p-8 flex flex-col items-center text-center gap-4">
        <p className="text-slate-500 font-medium">{message}</p>
      </GlassCard>
    </main>
  );
}
