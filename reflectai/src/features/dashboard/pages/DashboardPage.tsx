'use client';

import { useMemo } from 'react';

import { DailyQuote } from '@/features/dashboard/components/DailyQuote';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { EmptyReflectionState } from '@/features/dashboard/components/EmptyReflectionState';
import { PausedSessionAlert } from '@/features/dashboard/components/PausedSessionAlert';
import { RecentSessionCard } from '@/features/dashboard/components/RecentSessionCard';
import { StreakWidget } from '@/features/dashboard/components/StreakWidget';
import { WeeklyCalendar } from '@/features/dashboard/components/WeeklyCalendar';
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData';
import {
  buildDashboardViewModel,
  getAverageIntensity,
  getPrimaryEmotion,
} from '@/features/dashboard/utils/dashboardPageUtils';
import { formatDisplayDate, formatTimeAgo } from '@/features/dashboard/utils/metrics';
import GlassCard from '@/shared/ui/GlassCard';

const latestReflectionHeadingClassName = [
  'text-sm font-bold uppercase tracking-tighter text-slate-900/40',
  'dark:text-white/40',
].join(' ');

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
          <h3 className={latestReflectionHeadingClassName}>
            Tu reflexión más reciente
          </h3>

          {viewModel.lastCompletedSession ? (
            <RecentSessionCard
              title={viewModel.lastCompletedSession.title ?? 'Sesión completada'}
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
