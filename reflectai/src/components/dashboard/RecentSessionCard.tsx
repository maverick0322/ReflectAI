import { useId } from "react";
import GlassCard from "@/components/ui/GlassCard";

interface RecentSessionCardProps {
  title: string;
  date: string;
  intensity: string;
  emotion: string;
}

export function RecentSessionCard({ title, date, intensity, emotion }: RecentSessionCardProps) {
  const cardId = useId();

  return (
    <GlassCard 
      className="w-full p-5 flex flex-col gap-3 text-left hover:bg-white/20 transition-all cursor-pointer group"
      aria-labelledby={cardId}
    >
      <div className="flex justify-between items-start w-full gap-4">
        <h4 id={cardId} className="font-semibold text-lg text-slate-800 dark:text-white line-clamp-2 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors">
          {title}
        </h4>
        {/* Píldora de emoción principal */}
        <div className="px-3 py-1 bg-violet-100 dark:bg-violet-900/30 rounded-full flex-shrink-0 text-violet-700 dark:text-violet-300 text-xs font-bold border border-violet-200 dark:border-violet-800">
          {emotion}
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
        <span>{date}</span>
        <span aria-hidden="true">•</span>
        <span>Intensidad: <span className="font-bold">{intensity}</span></span>
      </div>
    </GlassCard>
  );
}