'use client';

import type { Control, FieldPath } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import type { WizardFormValues } from '@/features/reflection/schemas/reflection';

interface WizardTextAreaFieldProps {
  control: Control<WizardFormValues>;
  name: FieldPath<WizardFormValues>;
  value: string;
  maxLength?: number;
  placeholder: string;
  shouldShowError: boolean;
  errorMessage?: string;
  minHeightClassName?: string;
  className?: string;
  marginTopClassName?: string;
}

function buildTextAreaClassName(
  minHeightClassName: string,
  marginTopClassName: string,
  borderClassName: string,
  className: string,
) {
  return [
    'w-full resize-none rounded-2xl bg-white/30 p-4 text-slate-700',
    'outline-none backdrop-blur-sm transition-all placeholder:text-slate-400',
    minHeightClassName,
    marginTopClassName,
    borderClassName,
    className,
  ].join(' ').trim();
}

export function WizardTextAreaField({
  control,
  name,
  value,
  maxLength = 3000,
  placeholder,
  shouldShowError,
  errorMessage,
  minHeightClassName = 'min-h-[100px]',
  className = '',
  marginTopClassName = 'mt-2',
}: WizardTextAreaFieldProps) {
  const borderClassName = shouldShowError
    ? 'border-2 border-red-400'
    : 'border border-white/60 focus:ring-2 focus:ring-indigo-300/50';

  return (
    <>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <textarea
            {...field}
            value={field.value ?? ''}
            maxLength={maxLength}
            placeholder={placeholder}
            className={buildTextAreaClassName(
              minHeightClassName,
              marginTopClassName,
              borderClassName,
              className,
            )}
          />
        )}
      />
      <div className="flex items-start justify-between px-2">
        <span className="max-w-[80%] text-xs font-bold text-red-500">
          {shouldShowError ? errorMessage ?? '' : ''}
        </span>
        <span className="text-xs font-bold text-slate-400">
          {value.length}/{maxLength}
        </span>
      </div>
    </>
  );
}
