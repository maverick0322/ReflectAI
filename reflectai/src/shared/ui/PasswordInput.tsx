'use client';

import { forwardRef, useState } from 'react';

import { EyeIcon } from '@/shared/icons/EyeIcon';
import { EyeOffIcon } from '@/shared/icons/EyeOffIcon';

import Input from './Input';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const visibilityButtonClassName = [
  'text-reflect-dark/50 transition-colors hover:text-reflect-dark/90',
  'focus:outline-none focus-visible:rounded-sm focus-visible:ring-2',
  'focus-visible:ring-reflect-dark/40 focus-visible:ring-offset-2',
].join(' ');

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ placeholder, error, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const eyeButton = (
      <button
        type="button"
        onClick={() => setShowPassword((currentValue) => !currentValue)}
        className={visibilityButtonClassName}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    );

    return (
      <Input
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        error={error}
        rightElement={eyeButton}
        className={`[&::-ms-reveal]:hidden [&::-ms-clear]:hidden ${className ?? ''}`}
        {...props}
      />
    );
  },
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
