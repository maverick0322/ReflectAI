'use client';

import { useEffect, useState } from 'react';

import { fetchDailyQuote } from '@/lib/api/ai';
import { fetchProfile } from '@/lib/api/profile';
import { listReflectionSessions } from '@/lib/api/reflection';
import type { SessionSnapshot } from '@/lib/dashboard/metrics';

import {
  DEFAULT_DAILY_QUOTE,
  getDashboardErrorMessage,
} from './dashboardPageUtils';

interface DashboardDataState {
  sessions: SessionSnapshot[];
  isLoading: boolean;
  formError: string | null;
  userProfile: { name: string; avatarUrl: string | null } | null;
  dailyQuote: { text: string; author: string };
}

async function getDailyQuoteOrNull() {
  try {
    return await fetchDailyQuote();
  } catch {
    return null;
  }
}

export function useDashboardData(): DashboardDataState {
  const [sessions, setSessions] = useState<SessionSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{
    name: string;
    avatarUrl: string | null;
  } | null>(null);
  const [dailyQuote, setDailyQuote] = useState(DEFAULT_DAILY_QUOTE);

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      setIsLoading(true);
      setFormError(null);

      try {
        const quoteResponse = await getDailyQuoteOrNull();
        const [sessionResponse, profileResponse] = await Promise.all([
          listReflectionSessions(),
          fetchProfile(),
        ]);

        if (!isMounted) {
          return;
        }

        setSessions(sessionResponse.data);
        setUserProfile({
          name: profileResponse.data.full_name,
          avatarUrl: profileResponse.data.avatar_url,
        });

        if (quoteResponse) {
          setDailyQuote({
            text: quoteResponse.data.text,
            author: quoteResponse.data.author,
          });
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setFormError(getDashboardErrorMessage(error));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    sessions,
    isLoading,
    formError,
    userProfile,
    dailyQuote,
  };
}
