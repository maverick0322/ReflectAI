import { EmotionalEvolutionCard } from '@/components/statistics/EmotionalEvolutionCard';
import { EmotionDistributionCard } from '@/components/statistics/EmotionDistributionCard';
import { SessionComparisonCard } from '@/components/statistics/SessionComparisonCard';
import { ThoughtPatternCard } from '@/components/statistics/ThoughtPatternCard';
import { TopicHighlightsCard } from '@/components/statistics/TopicHighlightsCard';
import { statisticsDashboardMock } from '@/components/statistics/statisticsMocks';
import GlassCard from '@/components/ui/GlassCard';

export default function EstadisticasPage() {
  return (
    <main className="flex-1 w-full max-w-lg mx-auto px-4 py-6">
      <GlassCard className="p-6 pb-32 min-h-[90vh] flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <div>
            <span className="text-sm font-medium text-slate-500 uppercase tracking-widest">
              Dashboard personal
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Mis estadisticas
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            Explora tus tendencias emocionales recientes desde una vista compacta y
            preparada para conectar el backend despues.
          </p>
          <div
            className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/60 px-4 py-3"
            role="note"
          >
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-500">
              Frontend placeholder
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Esta pantalla usa datos dummy. La estructura y los contratos ya quedaron
              listos para que backend conecte la informacion real.
            </p>
          </div>
        </header>

        <EmotionalEvolutionCard evolution={statisticsDashboardMock.evolution} />

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <EmotionDistributionCard emotions={statisticsDashboardMock.emotions} />
          <TopicHighlightsCard topics={statisticsDashboardMock.topics} />
        </section>

        <ThoughtPatternCard pattern={statisticsDashboardMock.pattern} />

        <SessionComparisonCard
          sessionOptions={statisticsDashboardMock.sessionOptions}
          defaultSelection={statisticsDashboardMock.defaultSelection}
          comparisonResult={statisticsDashboardMock.comparisonResult}
        />
      </GlassCard>
    </main>
  );
}
