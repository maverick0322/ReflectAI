import { useId } from "react";
import GlassCard from "@/components/ui/GlassCard";
import { CalendarIcon } from "@/components/icons/CalendarIcon";

export interface SessionSummary {
  id: string;
  title: string;
  date: string;
  mood: string;
}

interface SessionCardProps {
  session: SessionSummary;
}

export function SessionCard({ session }: SessionCardProps) {
  const titleId = useId();

  return (
    <GlassCard 
      className="p-5 flex flex-col gap-3 hover:bg-white/10 transition-colors cursor-pointer border border-white/20 hover:border-white/40 focus-within:ring-2 focus-within:ring-white/50"
      aria-labelledby={titleId}
    >
      <h3 id={titleId} className="font-semibold text-lg text-slate-800 dark:text-white line-clamp-1">
        {session.title}
      </h3>
      
      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-200">
        <div className="flex items-center gap-1.5">
          <CalendarIcon className="w-4 h-4 opacity-70" aria-hidden="true" />
          <time dateTime={session.date}>{session.date}</time>
        </div>
        
        {/* Etiqueta de estado de ánimo (Pill) con efecto cristal */}
        <span className="px-2.5 py-1 bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-full text-xs font-medium">
          {session.mood}
        </span>
      </div>
    </GlassCard>
  );
}