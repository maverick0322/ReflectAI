'use client';

import { useMemo } from 'react';

import { DailyQuote } from '@/components/dashboard/DailyQuote';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { EmptyReflectionState } from '@/components/dashboard/EmptyReflectionState';
import { PausedSessionAlert } from '@/components/dashboard/PausedSessionAlert';
import { RecentSessionCard } from '@/components/dashboard/RecentSessionCard';
import { StreakWidget } from '@/components/dashboard/StreakWidget';
import { WeeklyCalendar } from '@/components/dashboard/WeeklyCalendar';
import {
  buildDashboardViewModel,
  getAverageIntensity,
  getPrimaryEmotion,
} from '@/components/dashboard/dashboardPageUtils';
import { useDashboardData } from '@/components/dashboard/useDashboardData';
import GlassCard from '@/components/ui/GlassCard';
import { formatDisplayDate, formatTimeAgo } from '@/lib/dashboard/metrics';

export function DashboardPage() {
  const { sessions, isLoading, formError, userProfile, dailyQuote } = useDashboardData();
  const today = useMemo(() => new Date(), []);
  const viewModel = useMemo(
    () => buildDashboardViewModel(sessions, today),
    [sessions, today],
  );

  return (
    <main className="mx-auto flex-1 w-full max-w-lg px-4 py-6">
      <GlassCard className="min-h-[90vh] flex flex-col gap-8 p-6 pb-32">
        <DashboardHeader
          isLoading={isLoading}
          userName={userProfile?.name ?? null}
          avatarUrl={userProfile?.avatarUrl ?? null}
        />

        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-medium uppercase tracking-widest text-slate-500">
              Hoy
            </h2>
            <p className="text-xl font-semibold text-slate-900 dark:text-white">
              {formatDisplayDate(today)}
            </p>
          </div>
          <WeeklyCalendar weekDays={viewModel.weekDays} />
        </section>

        {viewModel.pausedSession && (
          <PausedSessionAlert
            sessionId={viewModel.pausedSession.id}
            timeAgo={formatTimeAgo(viewModel.pausedSession.started_at)}
          />
        )}

        <DailyQuote text={dailyQuote.text} author={dailyQuote.author} />

        <StreakWidget
          days={viewModel.streak}
          streakMessage={viewModel.streakMessage}
        />

        <section className="flex flex-col gap-4">
          <h3 className="text-sm font-bold uppercase tracking-tighter text-slate-900/40 dark:text-white/40">
            Tu última reflexión
          </h3>

          {viewModel.lastCompletedSession ? (
            <RecentSessionCard
              title={viewModel.lastCompletedSession.title ?? 'Sesion completada'}
              date={formatDisplayDate(
                new Date(
                  viewModel.lastCompletedSession.completed_at ??
                    viewModel.lastCompletedSession.started_at,
                ),
              )}
              intensity={getAverageIntensity(viewModel.lastCompletedSession.ai_analysis)}
              emotion={getPrimaryEmotion(viewModel.lastCompletedSession.ai_analysis)}
            />
          ) : (
            <EmptyReflectionState />
          )}
        </section>

        {formError && (
          <p role="alert" className="mt-4 text-center text-sm font-semibold text-red-500">
            {formError}
          </p>
        )}
      </GlassCard>
    </main>
  );
}
