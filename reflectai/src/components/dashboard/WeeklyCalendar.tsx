export function WeeklyCalendar({ currentDay }: { currentDay: number }) {
  const days = [
    { label: 'L', num: 13 }, { label: 'M', num: 14 }, { label: 'M', num: 15 },
    { label: 'J', num: 16 }, { label: 'V', num: 17 }, { label: 'S', num: 18 }, { label: 'D', num: 19 }
  ];

  return (
    <div className="flex justify-between items-center py-2" role="list">
      {days.map((day) => (
        <div key={day.num} className="flex flex-col items-center gap-2" role="listitem">
          <span className="text-xs font-medium text-slate-400">{day.label}</span>
          <div className={`
            w-10 h-10 flex items-center justify-center rounded-full transition-all
            ${day.num === currentDay 
              ? "bg-violet-500 text-white shadow-md scale-110" 
              : "text-slate-600 hover:bg-white/20"}
          `}>
            <span className="text-sm font-semibold">{day.num}</span>
          </div>
        </div>
      ))}
    </div>
  );
}