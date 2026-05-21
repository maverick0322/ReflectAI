'use client';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';

import { ApiError } from '@/core/api/http';
import type { HistorySummary } from '@/features/history/types/history';
import { listReflectionSessions } from '@/features/reflection/services/reflectionService';
import { buildHistorySummary } from '@/lib/history/summary';

interface UseHistoryPageResult {
  summary: HistorySummary;
  isLoading: boolean;
  formError: string | null;
  searchQuery: string;
  handleSearchChange: (value: string) => void;
}

function getHistoryErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.payload?.message) {
    return error.payload.message;
  }

  return 'Unable to load your history.';
}

export function useHistoryPage(): UseHistoryPageResult {
  const [sessions, setSessions] = useState<
    Awaited<ReturnType<typeof listReflectionSessions>>['data']
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
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

        setFormError(getHistoryErrorMessage(error));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  const summary = useMemo(
    () => buildHistorySummary(sessions, deferredSearchQuery),
    [deferredSearchQuery, sessions],
  );

  return {
    summary,
    isLoading,
    formError,
    searchQuery,
    handleSearchChange: setSearchQuery,
  };
}
