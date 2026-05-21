'use client';

import { HistoryMonthGroup } from '@/features/history/components/HistoryMonthGroup';
import { HistorySearchBar } from '@/features/history/components/HistorySearchBar';
import { useHistoryPage } from '@/features/history/hooks/useHistoryPage';
import GlassCard from '@/shared/ui/GlassCard';

const historyCardClassName = [
  'min-h-[90vh] gap-6 bg-[#f8f7f4]/90 p-6 pb-32',
  'shadow-[0_24px_60px_rgba(15,23,42,0.06)]',
].join(' ');

export function HistoryPage() {
  const {
    summary,
    isLoading,
    formError,
    searchQuery,
    handleSearchChange,
  } = useHistoryPage();
  const hasSearchResults = summary.monthGroups.length > 0;
  const hasActiveSearch = searchQuery.trim().length > 0;

  return (
    <main className="mx-auto flex-1 w-full max-w-lg px-4 py-6">
      <GlassCard className={historyCardClassName}>
        <header className="flex flex-col gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Mi historial
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Has completado {summary.completedSessions} sesiones de reflexión
            </p>
          </div>
        </header>

        <HistorySearchBar
          placeholder={summary.searchPlaceholder}
          value={searchQuery}
          onChange={handleSearchChange}
        />

        {isLoading ? (
          <div
            role="status"
            className="rounded-2xl border border-dashed border-slate-200 bg-white/80 px-4 py-6"
          >
            <p className="text-sm text-slate-500">Cargando tu historial...</p>
          </div>
        ) : formError ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6"
          >
            <p className="text-sm font-medium text-red-600">{formError}</p>
          </div>
        ) : hasSearchResults ? (
          <div className="flex flex-col gap-6">
            {summary.monthGroups.map((group) => (
              <HistoryMonthGroup key={group.id} group={group} />
            ))}
          </div>
        ) : (
          <div
            role="status"
            className="rounded-2xl border border-dashed border-slate-200 bg-white/80 px-4 py-6"
          >
            <p className="text-sm text-slate-500">
              {hasActiveSearch
                ? 'Ninguna reflexión completada coincide con tu búsqueda'
                : 'Completa una reflexión para comenzar a construir tu historial'}
            </p>
          </div>
        )}
      </GlassCard>
    </main>
  );
}
