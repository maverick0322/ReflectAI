import GlassCard from '@/shared/ui/GlassCard';
import type { StatisticsTopicItem } from '@/features/statistics/types/statistics';

interface TopicHighlightsCardProps {
  topics: StatisticsTopicItem[];
}

const topicBadgeClassName = [
  'rounded-full border border-violet-200 bg-white/55 px-3 py-1.5',
  'text-xs font-semibold text-violet-700',
].join(' ');

export function TopicHighlightsCard({
  topics,
}: Readonly<TopicHighlightsCardProps>) {
  return (
    <GlassCard className="p-5 gap-4 bg-white/25 shadow-xl shadow-violet-200/20">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-slate-900">Temas frecuentes</h2>
        <p className="text-sm text-slate-500">
          Temas que aparecen con mayor frecuencia en tus sesiones completadas
        </p>
      </div>

      {topics.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <span
              key={topic.id}
              className={topicBadgeClassName}
            >
              {topic.label} ({topic.sessionCount})
            </span>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/60 bg-white/20 p-4">
          <p className="text-sm text-slate-500">
            Completa más reflexiones para descubrir temas recurrentes
          </p>
        </div>
      )}
    </GlassCard>
  );
}
