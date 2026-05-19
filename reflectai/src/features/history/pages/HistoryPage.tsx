'use client';

import { useEffect, useMemo, useState } from 'react';

import { HistoryMonthGroup } from '@/components/history/HistoryMonthGroup';
import { HistorySearchBar } from '@/components/history/HistorySearchBar';
import GlassCard from '@/components/ui/GlassCard';
import { ApiError } from '@/lib/api/http';
import {
  listReflectionSessions,
  type ReflectionSessionListItem,
} from '@/lib/api/reflection';
import { buildHistorySummary } from '@/lib/history/summary';

function getHistoryErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.payload?.message) {
    return error.payload.message;
  }

  return 'No se pudo cargar el historial';
}

export function HistoryPage() {
  const [sessions, setSessions] = useState<ReflectionSessionListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const historySummary = useMemo(
    () => buildHistorySummary(sessions, searchQuery),
    [sessions, searchQuery],
  );

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      setIsLoading(true);
      setFormError(null);

      try {
        const response = await listReflectionSessions();
        if (isMounted) {
          setSessions(response.data);
        }
      } catch (error) {
        if (isMounted) {
          setFormError(getHistoryErrorMessage(error));
        }
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

  return (
    <main className="flex-1 w-full max-w-lg mx-auto px-4 py-6">
      <GlassCard className="min-h-[90vh] gap-6 bg-[#f8f7f4]/90 p-6 pb-32 shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
        <header className="flex flex-col gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Mi Historial
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Has completado {historySummary.completedSessions} sesiones de reflexion
            </p>
          </div>
        </header>

        <HistorySearchBar
          placeholder={historySummary.searchPlaceholder}
          value={historySummary.searchQuery}
          onChange={setSearchQuery}
        />

        {isLoading ? (
          <p className="rounded-2xl bg-white/70 px-4 py-6 text-center text-sm font-medium text-slate-500">
            Cargando historial...
          </p>
        ) : formError ? (
          <p
            className="rounded-2xl bg-rose-50 px-4 py-6 text-center text-sm font-semibold text-rose-600"
            role="alert"
          >
            {formError}
          </p>
        ) : historySummary.monthGroups.length > 0 ? (
          <div className="flex flex-col gap-6">
            {historySummary.monthGroups.map((group) => (
              <HistoryMonthGroup key={group.id} group={group} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl bg-white/70 px-4 py-6 text-center text-sm font-medium text-slate-500">
            {historySummary.completedSessions === 0
              ? 'Aun no hay sesiones completadas para mostrar.'
              : 'No hay sesiones que coincidan con tu busqueda.'}
          </p>
        )}
      </GlassCard>
    </main>
  );
}
