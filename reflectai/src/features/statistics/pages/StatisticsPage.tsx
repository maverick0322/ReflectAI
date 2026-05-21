'use client';

import { EmotionalEvolutionCard } from '@/features/statistics/components/EmotionalEvolutionCard';
import { EmotionDistributionCard } from '@/features/statistics/components/EmotionDistributionCard';
import { SessionComparisonCard } from '@/features/statistics/components/SessionComparisonCard';
import { ThoughtPatternCard } from '@/features/statistics/components/ThoughtPatternCard';
import { TopicHighlightsCard } from '@/features/statistics/components/TopicHighlightsCard';
import { useStatisticsPage } from '@/features/statistics/hooks/useStatisticsPage';
import GlassCard from '@/shared/ui/GlassCard';

export function StatisticsPage() {
  const {
    dashboardData,
    completedSessionsCount,
    isLoading,
    formError,
  } = useStatisticsPage();

  return (
    <main className="flex-1 w-full max-w-lg mx-auto px-4 py-6">
      <GlassCard className="p-6 pb-32 min-h-[90vh] flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <div>
            <span className="text-sm font-medium text-slate-500 uppercase tracking-widest">
              Panel personal
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Mis estadísticas
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            {completedSessionsCount > 0
              ? `Explora tus tendencias en ${completedSessionsCount} reflexiones completadas`
              : 'Completa algunas reflexiones para desbloquear tus tendencias emocionales'}
          </p>
        </header>

        {isLoading ? (
          <div
            role="status"
            className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/60 px-4 py-6"
          >
            <p className="text-sm text-slate-600">Cargando tus estadísticas...</p>
          </div>
        ) : formError ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6"
          >
            <p className="text-sm font-medium text-red-600">{formError}</p>
          </div>
        ) : (
          <>
            <EmotionalEvolutionCard evolution={dashboardData.evolution} />

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <EmotionDistributionCard emotions={dashboardData.emotions} />
              <TopicHighlightsCard topics={dashboardData.topics} />
            </section>

            <ThoughtPatternCard pattern={dashboardData.pattern} />

            <SessionComparisonCard
              sessionOptions={dashboardData.sessionOptions}
              defaultSelection={dashboardData.defaultSelection}
            />
          </>
        )}
      </GlassCard>
    </main>
  );
}
