import { HistorySessionCard } from '@/components/history/HistorySessionCard';
import type { HistoryMonthGroup as HistoryMonthGroupType } from '@/types/history';

interface HistoryMonthGroupProps {
  group: HistoryMonthGroupType;
}

export function HistoryMonthGroup({ group }: HistoryMonthGroupProps) {
  return (
    <section className="flex flex-col gap-4" aria-labelledby={`month-${group.id}`}>
      <h2
        id={`month-${group.id}`}
        className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400"
      >
        {group.label}
      </h2>

      <div className="flex flex-col gap-3">
        {group.entries.map((entry) => (
          <HistorySessionCard key={entry.id} entry={entry} />
        ))}
      </div>
    </section>
  );
}
