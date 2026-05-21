import type { ReactNode } from 'react';

interface SwitchProps {
  enabled: boolean;
  onChange: () => void;
  ariaLabel: string;
}

function getSwitchClassName(enabled: boolean) {
  return [
    'relative inline-flex h-6 w-11 items-center rounded-full',
    'transition-colors duration-300',
    enabled ? 'bg-indigo-500' : 'bg-slate-300/50',
  ].join(' ');
}

export function Switch({ enabled, onChange, ariaLabel }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={ariaLabel}
      onClick={onChange}
      className={getSwitchClassName(enabled)}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-300 ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

interface SectionTitleProps {
  children: string;
}

export function SectionTitle({ children }: SectionTitleProps) {
  return (
    <h3 className="px-1 text-xs font-bold uppercase tracking-widest text-slate-400">
      {children}
    </h3>
  );
}

interface DataRowProps {
  label: string;
  value: string;
}

export function DataRow({ label, value }: DataRowProps) {
  return (
    <div className="flex flex-col px-1">
      <span className="text-[10px] font-bold uppercase text-slate-400">
        {label}
      </span>
      <span className="mt-1 font-medium text-slate-700">{value}</span>
    </div>
  );
}

interface PreferenceRowProps {
  icon: ReactNode;
  label: string;
  enabled: boolean;
  onChange: () => void;
}

export function PreferenceRow({
  icon,
  label,
  enabled,
  onChange,
}: PreferenceRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-bold text-slate-700">{label}</span>
      </div>
      <Switch enabled={enabled} onChange={onChange} ariaLabel={label} />
    </div>
  );
}
