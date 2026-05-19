import GlassCard from '@/components/ui/GlassCard';

import type { CompletionSummary } from './wizardUtils';

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
        <GlassCard className="p-8 flex flex-col gap-6">
          <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-indigo-500/30 mx-auto">
            OK
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800">¡Reflexión guardada!</h2>
            {summary.title && (
              <p className="text-sm text-slate-500 font-semibold mt-1">
                {summary.title}
              </p>
            )}
          </div>

          <section className="flex flex-col gap-3">
            {summary.summary && (
              <div className="rounded-2xl bg-white/35 border border-white/60 p-4">
                <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wide">
                  Resumen
                </h3>
                <p className="text-sm text-slate-600 font-medium mt-2 leading-relaxed">
                  {summary.summary}
                </p>
              </div>
            )}

            {summary.recommendation && (
              <div className="rounded-2xl bg-white/35 border border-white/60 p-4">
                <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wide">
                  Recomendación
                </h3>
                <p className="text-sm text-slate-600 font-medium mt-2 leading-relaxed">
                  {summary.recommendation}
                </p>
              </div>
            )}

            {summary.encouragement && (
              <p className="text-sm text-slate-600 font-semibold leading-relaxed">
                {summary.encouragement}
              </p>
            )}
            {summary.professionalReminder && (
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {summary.professionalReminder}
              </p>
            )}
          </section>

          <button
            type="button"
            onClick={onGoToDashboard}
            className="w-full py-4 text-lg font-semibold rounded-2xl transition-transform active:scale-95 flex items-center justify-center bg-gradient-to-r from-orange-300 to-orange-400 text-white shadow-lg shadow-orange-400/30 hover:scale-[1.02]"
          >
            Ir al dashboard
          </button>
        </GlassCard>
      </div>
    </main>
  );
}
