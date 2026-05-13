import GlassCard from '@/components/ui/GlassCard';
import type { StatisticsTopicItem } from '@/types/statistics';

interface TopicHighlightsCardProps {
  topics: StatisticsTopicItem[];
}

export function TopicHighlightsCard({ topics }: Readonly<TopicHighlightsCardProps>) {
  return (
    <GlassCard className="p-5 gap-4 bg-white/25 shadow-xl shadow-violet-200/20">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-slate-900">Temas frecuentes</h2>
        <p className="text-sm text-slate-500">
          Etiquetas front-only preparadas para un conteo real por backend.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <span
            key={topic.id}
            className="rounded-full border border-violet-200 bg-white/55 px-3 py-1.5 text-xs font-semibold text-violet-700"
          >
            {topic.label} ({topic.sessionCount})
          </span>
        ))}
      </div>
    </GlassCard>
  );
}
