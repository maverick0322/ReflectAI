import { SearchIcon } from '@/shared/icons/SearchIcon';

interface HistorySearchBarProps {
  placeholder: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
}

const inputClassName = [
  'w-full bg-transparent text-sm text-slate-700 outline-none',
  'placeholder:text-slate-400',
].join(' ');

export function HistorySearchBar({
  placeholder,
  defaultValue,
  value,
  onChange,
}: Readonly<HistorySearchBarProps>) {
  return (
    <div className="flex items-center gap-3 rounded-full bg-slate-100 px-4 py-3">
      <SearchIcon className="h-5 w-5 text-slate-400" />
      <input
        type="search"
        aria-label="Buscar en el historial"
        placeholder={placeholder}
        defaultValue={defaultValue}
        value={value}
        onChange={
          onChange ? (event) => onChange(event.target.value) : undefined
        }
        className={inputClassName}
      />
    </div>
  );
}
