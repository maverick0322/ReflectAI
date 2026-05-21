import { useId } from 'react';

import GlassCard from '@/shared/ui/GlassCard';

interface RecentSessionCardProps {
  title: string;
  date: string;
  intensity: string;
  emotion: string;
}

const recentSessionCardClassName = [
  'group flex w-full cursor-pointer flex-col gap-3 p-5 text-left',
  'transition-all hover:bg-white/20',
].join(' ');

const recentSessionTitleClassName = [
  'line-clamp-2 text-lg font-semibold text-slate-800 transition-colors',
  'group-hover:text-violet-700 dark:text-white',
  'dark:group-hover:text-violet-300',
].join(' ');

const emotionBadgeClassName = [
  'flex-shrink-0 rounded-full border border-violet-200 bg-violet-100',
  'px-3 py-1 text-xs font-bold text-violet-700 dark:border-violet-800',
  'dark:bg-violet-900/30 dark:text-violet-300',
].join(' ');

export function RecentSessionCard({
  title,
  date,
  intensity,
  emotion,
}: RecentSessionCardProps) {
  const cardId = useId();

  return (
    <GlassCard
      aria-labelledby={cardId}
      className={recentSessionCardClassName}
    >
      <div className="flex w-full items-start justify-between gap-4">
        <h4
          id={cardId}
          className={recentSessionTitleClassName}
        >
          {title}
        </h4>
        <div className={emotionBadgeClassName}>
          {emotion}
        </div>
      </div>
      <div
        className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400"
      >
        <span>{date}</span>
        <span aria-hidden="true">&bull;</span>
        <span>
          Intensidad: <span className="font-bold">{intensity}</span>
        </span>
      </div>
    </GlassCard>
  );
}
