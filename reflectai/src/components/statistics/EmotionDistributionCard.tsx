import GlassCard from '@/components/ui/GlassCard';
import type { StatisticsEmotionItem } from '@/types/statistics';

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

export function EmotionDistributionCard({ emotions }: EmotionDistributionCardProps) {
  return (
    <GlassCard className="p-5 gap-4 bg-white/25 shadow-xl shadow-violet-200/20">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-slate-900">Emociones frecuentes</h2>
        <p className="text-sm text-slate-500">Resumen visual listo para datos reales.</p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div
          aria-label="Distribucion de emociones"
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
    </GlassCard>
  );
}
