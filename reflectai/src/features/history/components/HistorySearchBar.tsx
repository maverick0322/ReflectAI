import { SearchIcon } from '@/shared/icons/SearchIcon';

interface HistorySearchBarProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

export function HistorySearchBar({
  placeholder,
  value,
  onChange,
}: Readonly<HistorySearchBarProps>) {
  return (
    <div className="flex items-center gap-3 rounded-full bg-slate-100 px-4 py-3">
      <SearchIcon className="h-5 w-5 text-slate-400" />
      <input
        type="search"
        aria-label="Search history"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
      />
    </div>
  );
}
