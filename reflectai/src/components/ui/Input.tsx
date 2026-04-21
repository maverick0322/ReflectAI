import React, { forwardRef, useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, ...props }, ref) => {
    const fallbackId = useId();
    const id = props.id ?? fallbackId;
    const errorId = `${id}-error`;

    return (
      <div className="flex flex-col gap-1 w-full">
        <input
          ref={ref}
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`w-full px-4 py-3.5 bg-white/50 border ${
            error ? 'border-red-500 focus:ring-red-400' : 'border-white/80 focus:ring-purple-400'
          } rounded-2xl text-reflect-dark placeholder:text-reflect-dark/50 focus:outline-none focus:ring-2 transition-all ${className}`}
          {...props}
        />
        {error && (
          <span id={errorId} className="text-xs text-red-500 font-medium ml-2 animate-in fade-in slide-in-from-top-1">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;