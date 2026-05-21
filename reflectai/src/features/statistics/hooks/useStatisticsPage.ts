'use client';

import { useEffect, useMemo, useState } from 'react';

import { ApiError } from '@/core/api/http';
import type { StatisticsDashboardData } from '@/features/statistics/types/statistics';
import { listReflectionSessions } from '@/features/reflection/services/reflectionService';
import { buildStatisticsDashboardData } from '@/lib/statistics/summary';

interface UseStatisticsPageResult {
  dashboardData: StatisticsDashboardData;
  completedSessionsCount: number;
  isLoading: boolean;
  formError: string | null;
}

function getStatisticsErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.payload?.message) {
    return error.payload.message;
  }

  return 'Unable to load your statistics.';
}

export function useStatisticsPage(): UseStatisticsPageResult {
  const [sessions, setSessions] = useState<
    Awaited<ReturnType<typeof listReflectionSessions>>['data']
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadStatistics = async () => {
      setIsLoading(true);
      setFormError(null);

      try {
        const response = await listReflectionSessions();

        if (!isMounted) {
          return;
        }

        setSessions(response.data);
      } catch (error: unknown) {
        if (!isMounted) {
          return;
        }

        setFormError(getStatisticsErrorMessage(error));
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

  const dashboardData = useMemo(
    () => buildStatisticsDashboardData(sessions),
    [sessions],
  );

  return {
    dashboardData,
    completedSessionsCount: dashboardData.sessionOptions.length,
    isLoading,
    formError,
  };
}
