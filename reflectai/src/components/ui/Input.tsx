"use client";
import React, { forwardRef, useId, useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  rightElement?: React.ReactNode; 
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, onChange, maxLength, rightElement, ...props }, ref) => {
    const fallbackId = useId();
    const id = props.id ?? fallbackId;
    const errorId = `${id}-error`;

    const [charCount, setCharCount] = useState(0);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCharCount(e.target.value.length);
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <div className="flex flex-col w-full">
        <div className="relative w-full">
          <input
            ref={ref}
            id={id}
            maxLength={maxLength}
            onChange={handleChange}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            className={`w-full px-4 py-3.5 bg-white/50 border ${
              error ? 'border-red-500 focus:ring-red-400' : 'border-white/80 focus:ring-reflect-primary'
            } rounded-2xl text-reflect-dark placeholder:text-reflect-dark/50 focus:outline-none focus:ring-2 transition-all ${
              rightElement ? 'pr-12' : ''
            } ${className}`}
            {...props}
          />
          
          {rightElement && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
              {rightElement}
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-start mt-1 min-h-[1.25rem] px-2">
          <div className="flex-1">
            {error && (
              <span id={errorId} className="text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1">
                {error}
              </span>
            )}
          </div>
          <div className="text-right pl-2">
            {maxLength && charCount > 0 && (
              <span className={`text-[10px] animate-in fade-in transition-colors ${
                charCount >= maxLength ? 'text-red-500 font-bold' : 'text-reflect-dark/50'
              }`}>
                {charCount >= maxLength ? 'Se alcanzó el límite' : `${charCount}/${maxLength}`}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;