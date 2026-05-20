import { EmotionalEvolutionCard } from '@/features/statistics/components/EmotionalEvolutionCard';
import { EmotionDistributionCard } from '@/features/statistics/components/EmotionDistributionCard';
import { SessionComparisonCard } from '@/features/statistics/components/SessionComparisonCard';
import { ThoughtPatternCard } from '@/features/statistics/components/ThoughtPatternCard';
import { TopicHighlightsCard } from '@/features/statistics/components/TopicHighlightsCard';
import { statisticsDashboardMock } from '@/features/statistics/data/statisticsMocks';
import GlassCard from '@/shared/ui/GlassCard';

export function StatisticsPage() {
  return (
    <main className="flex-1 w-full max-w-lg mx-auto px-4 py-6">
      <GlassCard className="p-6 pb-32 min-h-[90vh] flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <div>
            <span className="text-sm font-medium text-slate-500 uppercase tracking-widest">
              Personal dashboard
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              My statistics
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            Explore your recent emotional trends in a compact view that is ready
            to connect to the backend.
          </p>
          <div
            className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/60 px-4 py-3"
            role="note"
          >
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-500">
              Frontend placeholder
            </p>
            <p className="mt-1 text-sm text-slate-600">
              This screen uses placeholder data. The structure and contracts are
              already prepared for backend integration.
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
