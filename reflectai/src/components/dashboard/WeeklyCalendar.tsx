import type { DayRecord } from "@/types/dashboard";

interface WeeklyCalendarProps {
  weekDays: DayRecord[];
}

export function WeeklyCalendar({ weekDays }: WeeklyCalendarProps) {
  return (
    <div className="flex justify-between items-center py-2" role="list">
      {weekDays.map((day) => (
        <div 
          key={day.date} 
          className={`flex flex-col items-center gap-2 ${day.isFuture ? 'opacity-40' : ''}`} 
          role="listitem"
        >
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
            {day.label}
          </span>
          <div className={`
            w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300
            ${day.isToday && !day.hasSessions ? 'border-2 border-violet-500 text-violet-700 dark:text-violet-400 font-bold' : ''}
            ${day.hasSessions ? 'bg-violet-500 text-white shadow-md shadow-violet-500/30' : ''}
            ${!day.hasSessions && !day.isToday ? 'text-slate-600 dark:text-slate-400 bg-black/5 dark:bg-white/5' : ''}
          `}>
            <span className="text-sm font-semibold">{day.num}</span>
          </div>
        </div>
      ))}
    </div>
  );
}