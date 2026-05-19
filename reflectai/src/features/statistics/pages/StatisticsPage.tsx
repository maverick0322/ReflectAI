'use client';

import { useEffect, useState } from 'react';

import { EmotionalEvolutionCard } from '@/components/statistics/EmotionalEvolutionCard';
import { EmotionDistributionCard } from '@/components/statistics/EmotionDistributionCard';
import { SessionComparisonCard } from '@/components/statistics/SessionComparisonCard';
import { ThoughtPatternCard } from '@/components/statistics/ThoughtPatternCard';
import { TopicHighlightsCard } from '@/components/statistics/TopicHighlightsCard';
import GlassCard from '@/components/ui/GlassCard';
import { ApiError } from '@/lib/api/http';
import { listReflectionSessions } from '@/lib/api/reflection';
import { buildStatisticsDashboardData } from '@/lib/statistics/summary';
import type { StatisticsDashboardData } from '@/types/statistics';

function getStatisticsErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.payload?.message) {
    return error.payload.message;
  }

  return 'No se pudieron cargar las estadisticas';
}

export function StatisticsPage() {
  const [data, setData] = useState<StatisticsDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadStatistics = async () => {
      setIsLoading(true);
      setFormError(null);

      try {
        const response = await listReflectionSessions();
        if (isMounted) {
          setData(buildStatisticsDashboardData(response.data));
        }
      } catch (error) {
        if (isMounted) {
          setFormError(getStatisticsErrorMessage(error));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadStatistics();

    return () => {
      isMounted = false;
    };
  }, []);

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
            Explora tus tendencias emocionales recientes a partir de tus sesiones
            completadas.
          </p>
        </header>

        {isLoading ? (
          <p className="rounded-2xl bg-white/60 px-4 py-6 text-center text-sm font-medium text-slate-500">
            Cargando estadisticas...
          </p>
        ) : formError ? (
          <p
            className="rounded-2xl bg-rose-50 px-4 py-6 text-center text-sm font-semibold text-rose-600"
            role="alert"
          >
            {formError}
          </p>
        ) : data && data.sessionOptions.length > 0 ? (
          <>
            <EmotionalEvolutionCard evolution={data.evolution} />

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <EmotionDistributionCard emotions={data.emotions} />
              <TopicHighlightsCard topics={data.topics} />
            </section>

            <ThoughtPatternCard pattern={data.pattern} />

            <SessionComparisonCard
              sessionOptions={data.sessionOptions}
              defaultSelection={data.defaultSelection}
            />
          </>
        ) : (
          <p className="rounded-2xl bg-white/60 px-4 py-6 text-center text-sm font-medium text-slate-500">
            Completa al menos una sesion para generar tus estadisticas.
          </p>
        )}
      </GlassCard>
    </main>
  );
}
