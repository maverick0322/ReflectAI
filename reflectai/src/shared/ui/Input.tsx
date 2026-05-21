'use client';

import React, { forwardRef, useId, useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  rightElement?: React.ReactNode;
}

function getInputBorderClass(error?: string) {
  return error
    ? 'border-red-500 focus:ring-red-400'
    : 'border-white/80 focus:ring-reflect-dark/30';
}

function getCharacterCounter(charCount: number, maxLength?: number) {
  if (!maxLength || charCount === 0) {
    return null;
  }

  if (charCount >= maxLength) {
    return {
      label: 'Character limit reached',
      className: 'text-red-500 font-bold',
    };
  }

  return {
    label: `${charCount}/${maxLength}`,
    className: 'text-reflect-dark/50',
  };
}

const rightElementWrapperClassName = [
  'absolute right-4 top-1/2 flex -translate-y-1/2 items-center',
  'justify-center',
].join(' ');

function buildInputClassName({
  className,
  error,
  rightElement,
}: {
  className: string;
  error?: string;
  rightElement?: React.ReactNode;
}) {
  return [
    'w-full rounded-2xl bg-white/50 px-4 py-3.5 text-reflect-dark',
    'border placeholder:text-reflect-dark/50 focus:outline-none focus:ring-2 transition-all',
    getInputBorderClass(error),
    rightElement ? 'pr-12' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, onChange, maxLength, rightElement, ...props }, ref) => {
    const fallbackId = useId();
    const id = props.id ?? fallbackId;
    const errorId = `${id}-error`;
    const [charCount, setCharCount] = useState(0);
    const counter = getCharacterCounter(charCount, maxLength);
    const inputClassName = buildInputClassName({
      className,
      error,
      rightElement,
    });

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setCharCount(event.target.value.length);
      onChange?.(event);
    };

    return (
      <div className="flex w-full flex-col">
        <div className="relative w-full">
          <input
            ref={ref}
            id={id}
            maxLength={maxLength}
            onChange={handleChange}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className={inputClassName}
            {...props}
          />

          {rightElement && (
            <div className={rightElementWrapperClassName}>
              {rightElement}
            </div>
          )}
        </div>

        <div className="mt-1 flex min-h-[1.25rem] items-start justify-between px-2">
          <div className="flex-1">
            {error && (
              <span
                id={errorId}
                className="animate-in slide-in-from-top-1 text-xs font-medium text-red-500 fade-in"
              >
                {error}
              </span>
            )}
          </div>
          <div className="pl-2 text-right">
            {counter && (
              <span
                className={`text-[10px] transition-colors animate-in fade-in ${counter.className}`}
              >
                {counter.label}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
