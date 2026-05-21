import type { StatisticsEvolutionPoint } from '@/features/statistics/types/statistics';
import GlassCard from '@/shared/ui/GlassCard';

interface EmotionalEvolutionCardProps {
  evolution: StatisticsEvolutionPoint[];
}

const evolutionChartClassName = [
  'flex h-40 items-end justify-between gap-2 rounded-2xl border',
  'border-white/50 bg-white/35 px-4 py-5',
].join(' ');

const evolutionBarClassName = [
  'w-full max-w-4 rounded-t-full bg-violet-400/70 transition-colors',
  'hover:bg-violet-500',
].join(' ');

export function EmotionalEvolutionCard({
  evolution,
}: Readonly<EmotionalEvolutionCardProps>) {
  return (
    <GlassCard className="p-5 gap-4 bg-white/25 shadow-xl shadow-violet-200/20">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-slate-900">
          Evolución emocional
        </h2>
        <p className="text-sm text-slate-500">
          Intensidad emocional reciente en tus reflexiones completadas
        </p>
      </div>

      {evolution.length > 0 ? (
        <div
          aria-label="Gráfica de evolución emocional"
          className={evolutionChartClassName}
        >
          {evolution.map((point) => (
            <div key={point.id} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-24 w-full items-end justify-center">
                <div
                  className={evolutionBarClassName}
                  style={{ height: `${point.intensity}%` }}
                  title={`${point.label}: ${point.intensity}%`}
                />
              </div>
              <span className="text-xs font-medium text-slate-500">
                {point.label}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/60 bg-white/20 p-4">
          <p className="text-sm text-slate-500">
            Completa algunas reflexiones para visualizar tu evolución emocional
          </p>
        </div>
      )}
    </GlassCard>
  );
}
