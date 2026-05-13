import { HistoryMonthGroup } from '@/components/history/HistoryMonthGroup';
import { HistorySearchBar } from '@/components/history/HistorySearchBar';
import { historySummaryMock } from '@/components/history/historyMocks';
import GlassCard from '@/components/ui/GlassCard';

export function HistoryPage() {
  return (
    <main className="flex-1 w-full max-w-lg mx-auto px-4 py-6">
      <GlassCard className="min-h-[90vh] gap-6 bg-[#f8f7f4]/90 p-6 pb-32 shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
        <header className="flex flex-col gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Mi Historial
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Has completado {historySummaryMock.completedSessions} sesiones de reflexion
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
              Esta vista usa datos dummy para maquetar correctamente el historial. Backend
              solo tendra que conectar la consulta real y mantener este contrato.
            </p>
          </div>
        </header>

        <HistorySearchBar
          placeholder={historySummaryMock.searchPlaceholder}
          defaultValue={historySummaryMock.searchQuery}
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
