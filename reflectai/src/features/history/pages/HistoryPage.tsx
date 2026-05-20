import { useState } from 'react';

import { HistoryMonthGroup } from '@/features/history/components/HistoryMonthGroup';
import { HistorySearchBar } from '@/features/history/components/HistorySearchBar';
import { historySummaryMock } from '@/features/history/data/historyMocks';
import GlassCard from '@/shared/ui/GlassCard';

export function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState(historySummaryMock.searchQuery);

  return (
    <main className="flex-1 w-full max-w-lg mx-auto px-4 py-6">
      <GlassCard className="min-h-[90vh] gap-6 bg-[#f8f7f4]/90 p-6 pb-32 shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
        <header className="flex flex-col gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              My history
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              You have completed {historySummaryMock.completedSessions} reflection sessions
            </p>
          </div>

          <div
            className="rounded-2xl border border-dashed border-slate-200 bg-white/80 px-4 py-3"
            role="note"
          >
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
              Frontend placeholder
            </p>
            <p className="mt-1 text-sm text-slate-500">
              This view uses placeholder data to validate the history layout. Backend
              only needs to connect the real query and preserve this contract.
            </p>
          </div>
        </header>

        <HistorySearchBar
          placeholder={historySummaryMock.searchPlaceholder}
          value={searchQuery}
          onChange={setSearchQuery}
        />

        <div className="flex flex-col gap-6">
          {historySummaryMock.monthGroups.map((group) => (
            <HistoryMonthGroup key={group.id} group={group} />
          ))}
        </div>
      </GlassCard>
    </main>
  );
}
