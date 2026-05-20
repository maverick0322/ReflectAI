import type { CompletionSummary } from '@/features/reflection/utils/wizardUtils';
import GlassCard from '@/shared/ui/GlassCard';

interface WizardSuccessStateProps {
  summary: CompletionSummary;
  onGoToDashboard: () => void;
}

export function WizardSuccessState({
  summary,
  onGoToDashboard,
}: WizardSuccessStateProps) {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-in zoom-in duration-500">
        <GlassCard className="flex flex-col gap-6 p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500 text-3xl font-bold text-white shadow-lg shadow-indigo-500/30">
            OK
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800">Reflection saved</h2>
            {summary.title && (
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {summary.title}
              </p>
            )}
          </div>

          <section className="flex flex-col gap-3">
            <div className="rounded-2xl border border-white/60 bg-white/35 p-4">
              <h3 className="text-sm font-bold uppercase tracking-wide text-indigo-600">
                Summary
              </h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
                {summary.summary}
              </p>
            </div>

            <div className="rounded-2xl border border-white/60 bg-white/35 p-4">
              <h3 className="text-sm font-bold uppercase tracking-wide text-indigo-600">
                Recommendation
              </h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
                {summary.recommendation}
              </p>
            </div>

            <p className="text-sm font-semibold leading-relaxed text-slate-600">
              {summary.encouragement}
            </p>
            <p className="text-xs font-medium leading-relaxed text-slate-500">
              {summary.professionalReminder}
            </p>
          </section>

          <button
            type="button"
            onClick={onGoToDashboard}
            className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-orange-300 to-orange-400 py-4 text-lg font-semibold text-white shadow-lg shadow-orange-400/30 transition-transform hover:scale-[1.02] active:scale-95"
          >
            Go to dashboard
          </button>
        </GlassCard>
      </div>
    </main>
  );
}
