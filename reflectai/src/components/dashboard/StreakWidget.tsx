import GlassCard from "@/components/ui/GlassCard";
import { LightningIcon } from "@/components/icons/LightningIcon";

interface StreakWidgetProps {
  days: number;
  streakMessage: string;
}

export function StreakWidget({ days, streakMessage }: StreakWidgetProps) {
  return (
    <GlassCard className="p-4">
      {/* Contenedor forzado a FILA (flex-row) para hacer las 2 columnas */}
      <div className="flex flex-row items-center gap-4 w-full">
        
        {/* Columna 1: Icono de rayo */}
        <div className="flex-shrink-0 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-500">
          <LightningIcon className="w-6 h-6" aria-hidden="true" />
        </div>
        
        {/* Columna 2: Textos */}
        <div className="flex flex-col flex-1 justify-center">
          <span className="text-base font-bold text-slate-800 dark:text-white">
            Racha de {days} {days === 1 ? 'día' : 'días'}
          </span>
          <span className="text-sm text-slate-600 dark:text-slate-300 leading-tight">
            {streakMessage}
          </span>
        </div>
        
      </div>
    </GlassCard>
  );
}