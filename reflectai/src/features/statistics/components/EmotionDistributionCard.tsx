import type { StatisticsEmotionItem } from '@/features/statistics/types/statistics';
import GlassCard from '@/shared/ui/GlassCard';

interface EmotionDistributionCardProps {
  emotions: StatisticsEmotionItem[];
}

function buildDistributionGradient(emotions: StatisticsEmotionItem[]) {
  let currentStop = 0;

  return emotions
    .map((emotion) => {
      const start = currentStop;
      currentStop += emotion.percentage;
      return `${emotion.colorHex} ${start}% ${currentStop}%`;
    })
    .join(', ');
}

export function EmotionDistributionCard({ emotions }: Readonly<EmotionDistributionCardProps>) {
  return (
    <GlassCard className="p-5 gap-4 bg-white/25 shadow-xl shadow-violet-200/20">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-slate-900">Frequent emotions</h2>
        <p className="text-sm text-slate-500">
          Distribution of the emotions that appear most often.
        </p>
      </div>

      {emotions.length > 0 ? (
        <div className="flex flex-col items-center gap-4">
          <div
            aria-label="Emotion distribution"
            className="relative flex h-24 w-24 items-center justify-center rounded-full shadow-inner"
            style={{ background: `conic-gradient(${buildDistributionGradient(emotions)})` }}
          >
            <div className="h-16 w-16 rounded-full bg-white/85 backdrop-blur-md" />
          </div>

          <div className="w-full space-y-2">
            {emotions.map((emotion) => (
              <div key={emotion.id} className="flex items-center gap-2 text-sm text-slate-600">
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: emotion.colorHex }}
                />
                <span className="flex-1">{emotion.label}</span>
                <span className="font-semibold text-slate-700">{emotion.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/60 bg-white/20 p-4">
          <p className="text-sm text-slate-500">
            Complete more reflections to see your emotion distribution.
          </p>
        </div>
      )}
    </GlassCard>
  );
}
