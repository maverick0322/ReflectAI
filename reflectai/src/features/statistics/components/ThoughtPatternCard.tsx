import { LightningIcon } from '@/shared/icons/LightningIcon';
import GlassCard from '@/shared/ui/GlassCard';
import type { StatisticsPattern } from '@/features/statistics/types/statistics';

interface ThoughtPatternCardProps {
  pattern: StatisticsPattern;
}

const patternCardClassName = [
  'gap-4 border-l-4 border-l-violet-500 bg-white/25 p-5',
  'shadow-xl shadow-violet-200/20',
].join(' ');

export function ThoughtPatternCard({
  pattern,
}: Readonly<ThoughtPatternCardProps>) {
  return (
    <GlassCard className={patternCardClassName}>
      <div className="flex items-start gap-4">
        <div className="rounded-full bg-violet-100 p-3 text-violet-600">
          <LightningIcon className="h-5 w-5" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Pattern detected
          </span>
          <h2 className="text-base font-semibold text-slate-900">
            {pattern.title}
          </h2>
          <p className="text-sm text-slate-600">{pattern.description}</p>
        </div>
      </div>
    </GlassCard>
  );
}
