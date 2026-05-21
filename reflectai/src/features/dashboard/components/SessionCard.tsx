import { useId } from 'react';
import GlassCard from '@/shared/ui/GlassCard';
import { CalendarIcon } from '@/shared/icons/CalendarIcon';

export interface SessionSummary {
  id: string;
  title: string;
  date: string;
  mood: string;
}

interface SessionCardProps {
  session: SessionSummary;
}

const sessionCardClassName = [
  'flex cursor-pointer flex-col gap-3 border border-white/20 p-5',
  'transition-colors hover:border-white/40 hover:bg-white/10',
  'focus-within:ring-2 focus-within:ring-white/50',
].join(' ');

const moodBadgeClassName = [
  'rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium',
  'backdrop-blur-sm dark:bg-black/20',
].join(' ');

export function SessionCard({ session }: SessionCardProps) {
  const titleId = useId();

  return (
    <GlassCard
      className={sessionCardClassName}
      aria-labelledby={titleId}
    >
      <h3
        id={titleId}
        className="line-clamp-1 text-lg font-semibold text-slate-800 dark:text-white"
      >
        {session.title}
      </h3>

      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-200">
        <div className="flex items-center gap-1.5">
          <CalendarIcon className="w-4 h-4 opacity-70" aria-hidden="true" />
          <time dateTime={session.date}>{session.date}</time>
        </div>

        {/* Mood badge with the glass visual treatment. */}
        <span className={moodBadgeClassName}>
          {session.mood}
        </span>
      </div>
    </GlassCard>
  );
}
