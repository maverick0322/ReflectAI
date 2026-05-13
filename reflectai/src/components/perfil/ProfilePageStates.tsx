import GlassCard from '@/components/ui/GlassCard';

interface ProfileMessageStateProps {
  message: string;
  tone: 'default' | 'error';
}

export function ProfileMessageState({
  message,
  tone,
}: ProfileMessageStateProps) {
  const textClassName =
    tone === 'error' ? 'text-red-500' : 'text-slate-500';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 py-12">
      <GlassCard className="w-full max-w-md p-6 text-center">
        <p className={`text-sm ${textClassName}`}>{message}</p>
      </GlassCard>
    </main>
  );
}
