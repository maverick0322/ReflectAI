import type { HistoryEntry } from '@/types/history';

interface HistorySessionCardProps {
  entry: HistoryEntry;
}

export function HistorySessionCard({ entry }: Readonly<HistorySessionCardProps>) {
  return (
    <article className="rounded-[1.75rem] bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <h3 className="max-w-[15rem] text-base font-semibold leading-6 text-slate-900">
          {entry.title}
        </h3>
        <time
          dateTime={entry.sessionDateTime}
          className="shrink-0 text-xs font-medium text-slate-400"
        >
          {entry.shortDate}
        </time>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-500">{entry.triggerPreview}</p>

      <div className="mt-4">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${entry.emotion.toneClassName}`}
        >
          {entry.emotion.label}
        </span>
      </div>
    </article>
  );
}
