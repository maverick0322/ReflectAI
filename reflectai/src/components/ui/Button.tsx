import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'ghost';
  size?: 'default' | 'sm';
}

export default function Button({ 
  children, 
  className = "", 
  variant = 'default',
  size = 'default',
  ...props 
}: ButtonProps) {
  
  const baseStyles = "font-semibold rounded-2xl transition-transform active:scale-95 flex items-center justify-center";
  
  const variants = {
    default: "bg-gradient-to-r from-orange-300 to-orange-400 text-white shadow-lg shadow-orange-400/30 hover:scale-[1.02]",
    ghost: "bg-transparent text-gray-500 hover:bg-white/20 hover:text-gray-800 shadow-none",
  };

  const sizes = {
    default: "w-full py-4 text-lg",
    sm: "px-3 py-1.5 text-xs w-auto",
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