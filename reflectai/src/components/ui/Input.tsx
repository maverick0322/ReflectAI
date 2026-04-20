import React, { forwardRef } from 'react';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        <input
          ref={ref}
          className={`w-full px-4 py-3.5 bg-white/50 border ${
            error ? 'border-red-500 focus:ring-red-400' : 'border-white/80 focus:ring-purple-400'
          } rounded-2xl text-reflect-dark placeholder:text-reflect-dark/50 focus:outline-none focus:ring-2 transition-all ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-red-500 font-medium ml-2">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;