import { SearchIcon } from '@/shared/icons/SearchIcon';

interface HistorySearchBarProps {
  placeholder: string;
  defaultValue: string;
}

export function HistorySearchBar({ placeholder, defaultValue }: Readonly<HistorySearchBarProps>) {
  return (
    <div className="flex items-center gap-3 rounded-full bg-slate-100 px-4 py-3">
      <SearchIcon className="h-5 w-5 text-slate-400" />
      <input
        type="search"
        aria-label="Search history"
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
      />
    </div>
  );
}
