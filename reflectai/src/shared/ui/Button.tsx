import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  // Keep the existing button API and extend it with the outline variant.
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm';
}

export default function Button({
  children,
  className = '',
  variant = 'default',
  size = 'default',
  ...props
}: ButtonProps) {
  const baseStyles =
    'flex items-center justify-center rounded-2xl font-semibold ' +
    'transition-transform active:scale-95';

  const variants = {
    default:
      'bg-gradient-to-r from-orange-300 to-orange-400 text-white ' +
      'shadow-lg shadow-orange-400/30 hover:scale-[1.02]',
    ghost:
      'bg-transparent text-gray-500 hover:bg-white/20 ' +
      'hover:text-gray-800 shadow-none',
    outline:
      'bg-transparent border-2 border-slate-300 text-slate-700 hover:bg-white/50 shadow-none',
  };

  const sizes = {
    default: 'w-full py-4 text-lg',
    sm: 'w-auto px-3 py-1.5 text-xs',
  };

  return (
    <button
      {...props}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}
