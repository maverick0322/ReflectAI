import type { DayRecord } from '@/features/dashboard/types/dashboard';

interface WeeklyCalendarProps {
  weekDays: DayRecord[];
}

function getDayContainerClassName(day: DayRecord) {
  if (day.isToday && !day.hasSessions) {
    return 'border-2 border-violet-500 font-bold text-violet-700 dark:text-violet-400';
  }

  if (day.hasSessions) {
    return 'bg-violet-500 text-white shadow-md shadow-violet-500/30';
  }

  return 'bg-black/5 text-slate-600 dark:bg-white/5 dark:text-slate-400';
}

export function WeeklyCalendar({ weekDays }: WeeklyCalendarProps) {
  return (
    <div className="flex items-center justify-between py-2" role="list">
      {weekDays.map((day) => (
        <div
          key={day.date}
          role="listitem"
          className={`flex flex-col items-center gap-2 ${day.isFuture ? 'opacity-40' : ''}`}
        >
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
            {day.label}
          </span>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${getDayContainerClassName(day)}`}
          >
            <span className="text-sm font-semibold">{day.num}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
