import { LightningIcon } from '@/shared/icons/LightningIcon';
import GlassCard from '@/shared/ui/GlassCard';

interface StreakWidgetProps {
  days: number;
  streakMessage: string;
}

const streakIconClassName = [
  'flex-shrink-0 rounded-full bg-amber-100 p-3 text-amber-500',
  'dark:bg-amber-900/30',
].join(' ');

export function StreakWidget({ days, streakMessage }: StreakWidgetProps) {
  return (
    <GlassCard className="p-4">
      <div className="flex w-full flex-row items-center gap-4">
        <div className={streakIconClassName}>
          <LightningIcon className="h-6 w-6" aria-hidden="true" />
        </div>

        <div className="flex flex-1 flex-col justify-center">
          <span className="text-base font-bold text-slate-800 dark:text-white">
            Racha de {days} días
          </span>
          <span className="text-sm leading-tight text-slate-600 dark:text-slate-300">
            {streakMessage}
          </span>
        </div>
      </div>
    </GlassCard>
  );
}
